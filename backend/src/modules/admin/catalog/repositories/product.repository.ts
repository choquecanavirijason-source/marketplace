import { Injectable } from '@nestjs/common';
import { and, asc, desc, eq, ilike, inArray, isNull, or, sql } from 'drizzle-orm';
import { DrizzleService } from '../../../../infrastructure/database/drizzle.service';
import {
  categoriesTable,
  productsTable,
  productImagesTable,
} from '../../../../infrastructure/database/schema';
import { ProductStatus } from '../enums';
import { slugify, randomSuffix } from '../validators';

export interface ProductImageRef {
  url: string;
  alt?: string | null;
  position?: number;
  isPrimary?: boolean;
}

export interface ProductRow {
  id: number;
  sellerId: string | null;
  categoryId: number;
  categoryName: string | null;
  categorySlug: string | null;
  name: string;
  slug: string;
  description: string | null;
  longDescription: string | null;
  price: string;
  originalPrice: string | null;
  tag: string | null;
  sku: string | null;
  stock: number;
  rating: number;
  reviewsCount: number;
  status: string;
  weight: string | null;
  warranty: string | null;
  details: string | null;
  createdAt: Date;
  updatedAt: Date;
  images: ProductImageRef[];
}

export interface ProductFilters {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  tag?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeNonPublished?: boolean;
}

export interface ProductCreateInput {
  sellerId?: string | null;
  categoryId: number;
  name: string;
  price: string;
  originalPrice?: string | null;
  tag?: string | null;
  sku?: string | null;
  stock?: number;
  status?: string;
  description?: string | null;
  longDescription?: string | null;
  weight?: string | null;
  warranty?: string | null;
  images?: ProductImageRef[];
}

const numeric = (value: string | null): string | null => (value === null || value === undefined ? null : String(value));

@Injectable()
export class ProductRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  ensureUniqueSlug = async (name: string, excludeId?: number): Promise<string> => {
    const candidate = slugify(name) || `producto-${randomSuffix(4)}`;
    const taken = new Set<string>();
    const existing = await this.drizzle.db
      .select({ slug: productsTable.slug })
      .from(productsTable)
      .where(
        excludeId
          ? and(ilike(productsTable.slug, `${candidate}%`), sql`${productsTable.id} <> ${excludeId}`)
          : ilike(productsTable.slug, `${candidate}%`),
      );
    for (const e of existing) taken.add(e.slug);
    if (!taken.has(candidate)) return candidate;
    for (let i = 0; i < 40; i += 1) {
      const candidateWithSuffix = `${candidate}-${randomSuffix(4)}`;
      if (!taken.has(candidateWithSuffix)) return candidateWithSuffix;
    }
    return `${candidate}-${Date.now().toString(36)}`;
  };

  private fetchImages = async (productIds: number[]): Promise<Map<number, ProductImageRef[]>> => {
    const map = new Map<number, ProductImageRef[]>();
    if (productIds.length === 0) return map;
    const rows = await this.drizzle.db
      .select()
      .from(productImagesTable)
      .where(inArray(productImagesTable.productId, productIds))
      .orderBy(asc(productImagesTable.position));
    for (const img of rows) {
      const list = map.get(img.productId) ?? [];
      list.push({ url: img.url, alt: img.altText, position: img.position, isPrimary: img.isPrimary });
      map.set(img.productId, list);
    }
    return map;
  };

  private mapRow = (row: any, images: ProductImageRef[]): ProductRow => ({
    id: row.id,
    sellerId: row.sellerId ?? null,
    categoryId: row.categoryId,
    categoryName: row.categoryName ?? null,
    categorySlug: row.categorySlug ?? null,
    name: row.name,
    slug: row.slug,
    description: row.description ?? null,
    longDescription: row.longDescription ?? null,
    price: String(row.price ?? '0'),
    originalPrice: numeric(row.originalPrice),
    tag: row.tag ?? null,
    sku: row.sku ?? null,
    stock: row.stock ?? 0,
    rating: Number(row.rating ?? 0),
    reviewsCount: row.reviewsCount ?? 0,
    status: row.status ?? ProductStatus.PUBLISHED,
    weight: row.weight ?? null,
    warranty: row.warranty ?? null,
    details: row.details ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    images,
  });

  private buildConditions = (filters: ProductFilters, includeCategoryJoin = true) => {
    const conditions: any[] = [isNull(productsTable.deletedAt)];

    if (filters.includeNonPublished) {
      if (filters.isActive !== undefined) {
        conditions.push(filters.isActive ? eq(productsTable.status, ProductStatus.PUBLISHED) : sql`${productsTable.status} <> ${ProductStatus.PUBLISHED}`);
      }
    } else {
      conditions.push(eq(productsTable.status, ProductStatus.PUBLISHED));
    }

    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim().toLowerCase()}%`;
      const searchConds = [
        ilike(productsTable.name, term),
        ilike(productsTable.description, term),
        ilike(productsTable.longDescription, term),
        ilike(productsTable.sku, term),
      ];
      if (includeCategoryJoin) searchConds.push(ilike(categoriesTable.name, term));
      conditions.push(or(...searchConds));
    }

    if (filters.category && filters.category.trim() && filters.category !== 'Todos') {
      const cat = filters.category.trim();
      const numId = /^\d+$/.test(cat) ? Number(cat) : null;
      const catConds = [
        ilike(categoriesTable.name, cat),
        eq(categoriesTable.slug, cat.toLowerCase()),
      ];
      if (numId) catConds.push(eq(productsTable.categoryId, numId));
      conditions.push(or(...catConds));
    }

    if (filters.tag && filters.tag.trim()) {
      const tags = filters.tag
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      if (tags.length > 0) {
        conditions.push(sql`lower(${productsTable.tag}) in (${sql.join(tags.map((t) => sql`${t}`), sql`, `)})`);
      }
    }

    return and(...conditions);
  };

  paginate = async (filters: ProductFilters): Promise<{ items: ProductRow[]; total: number }> => {
    const offset = (filters.page - 1) * filters.limit;
    const whereClause = this.buildConditions(filters);

    const orderByClause: any[] = [];
    const sortBy = filters.sortBy;
    const isAsc = filters.sortOrder === 'asc';
    switch (sortBy) {
      case 'name':
        orderByClause.push(isAsc ? asc(productsTable.name) : desc(productsTable.name));
        break;
      case 'category':
        orderByClause.push(isAsc ? asc(categoriesTable.name) : desc(categoriesTable.name));
        break;
      case 'price':
        orderByClause.push(isAsc ? asc(productsTable.price) : desc(productsTable.price));
        break;
      case 'stock':
        orderByClause.push(isAsc ? asc(productsTable.stock) : desc(productsTable.stock));
        break;
      case 'isActive':
        orderByClause.push(isAsc ? asc(productsTable.status) : desc(productsTable.status));
        break;
      case 'createdAt':
      default:
        orderByClause.push(isAsc ? asc(productsTable.createdAt) : desc(productsTable.createdAt));
        break;
    }
    orderByClause.push(desc(productsTable.id));

    const [countRows, rows] = await Promise.all([
      this.drizzle.db
        .select({ total: sql<number>`count(${productsTable.id})::int` })
        .from(productsTable)
        .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .where(whereClause),
      this.drizzle.db
        .select({
          id: productsTable.id,
          sellerId: productsTable.sellerId,
          categoryId: productsTable.categoryId,
          categoryName: categoriesTable.name,
          categorySlug: categoriesTable.slug,
          name: productsTable.name,
          slug: productsTable.slug,
          description: productsTable.description,
          longDescription: productsTable.longDescription,
          price: productsTable.price,
          originalPrice: productsTable.originalPrice,
          tag: productsTable.tag,
          sku: productsTable.sku,
          stock: productsTable.stock,
          rating: productsTable.rating,
          reviewsCount: productsTable.reviewsCount,
          status: productsTable.status,
          weight: productsTable.weight,
          warranty: productsTable.warranty,
          details: productsTable.details,
          createdAt: productsTable.createdAt,
          updatedAt: productsTable.updatedAt,
        })
        .from(productsTable)
        .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .where(whereClause)
        .orderBy(...orderByClause)
        .offset(offset)
        .limit(filters.limit),
    ]);

    const images = await this.fetchImages(rows.map((r) => r.id));
    return {
      items: rows.map((r) => this.mapRow(r, images.get(r.id) ?? [])),
      total: Number(countRows[0]?.total ?? 0),
    };
  };

  findById = async (id: number): Promise<ProductRow | null> => {
    const rows = await this.drizzle.db
      .select({
        id: productsTable.id,
        sellerId: productsTable.sellerId,
        categoryId: productsTable.categoryId,
        categoryName: categoriesTable.name,
        categorySlug: categoriesTable.slug,
        name: productsTable.name,
        slug: productsTable.slug,
        description: productsTable.description,
        longDescription: productsTable.longDescription,
        price: productsTable.price,
        originalPrice: productsTable.originalPrice,
        tag: productsTable.tag,
        sku: productsTable.sku,
        stock: productsTable.stock,
        rating: productsTable.rating,
        reviewsCount: productsTable.reviewsCount,
        status: productsTable.status,
        weight: productsTable.weight,
        warranty: productsTable.warranty,
        details: productsTable.details,
        createdAt: productsTable.createdAt,
        updatedAt: productsTable.updatedAt,
      })
      .from(productsTable)
      .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(and(eq(productsTable.id, id), isNull(productsTable.deletedAt)))
      .limit(1);
    if (!rows[0]) return null;
    const images = await this.fetchImages([id]);
    return this.mapRow(rows[0], images.get(id) ?? []);
  };

  private resolveStatus = (input: ProductCreateInput & { isActive?: boolean }): string => {
    if (input.status) return input.status;
    return input.isActive === false ? ProductStatus.PAUSED : ProductStatus.PUBLISHED;
  };

  create = async (input: ProductCreateInput & { isActive?: boolean }): Promise<ProductRow> => {
    const slug = await this.ensureUniqueSlug(input.name);
    const status = this.resolveStatus(input);

    const [row] = await this.drizzle.db
      .insert(productsTable)
      .values({
        sellerId: input.sellerId ?? null,
        categoryId: input.categoryId,
        name: input.name,
        slug,
        description: input.description ?? null,
        longDescription: input.longDescription ?? null,
        price: String(input.price ?? '0'),
        originalPrice: input.originalPrice !== undefined ? String(input.originalPrice) : null,
        tag: input.tag ?? null,
        sku: input.sku ? input.sku.trim() : null,
        stock: input.stock ?? 0,
        status,
        weight: input.weight ?? null,
        warranty: input.warranty ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await this.replaceImages(row.id, input.images ?? []);
    const product = await this.findById(row.id);
    return product as ProductRow;
  };

  private replaceImages = async (productId: number, images: ProductImageRef[]): Promise<void> => {
    await this.drizzle.db.delete(productImagesTable).where(eq(productImagesTable.productId, productId));
    if (images.length === 0) return;
    const toInsert = images
      .slice()
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((img, index) => ({
        productId,
        url: img.url,
        altText: img.alt ?? null,
        position: index,
        isPrimary: index === 0,
      }));
    await this.drizzle.db.insert(productImagesTable).values(toInsert);
  };

  update = async (id: number, patch: Partial<ProductCreateInput> & { isActive?: boolean }): Promise<ProductRow | null> => {
    const existing = await this.drizzle.db
      .select()
      .from(productsTable)
      .where(and(eq(productsTable.id, id), isNull(productsTable.deletedAt)))
      .limit(1);
    if (!existing[0]) return null;

    let slug = existing[0].slug;
    if (patch.name && patch.name !== existing[0].name) {
      slug = await this.ensureUniqueSlug(patch.name, id);
    }

    const status =
      patch.status ??
      (patch.isActive !== undefined
        ? patch.isActive
          ? ProductStatus.PUBLISHED
          : ProductStatus.PAUSED
        : existing[0].status);

    await this.drizzle.db
      .update(productsTable)
      .set({
        name: patch.name ?? existing[0].name,
        slug,
        categoryId: patch.categoryId ?? existing[0].categoryId,
        description: patch.description !== undefined ? patch.description : existing[0].description,
        longDescription: patch.longDescription !== undefined ? patch.longDescription : existing[0].longDescription,
        price: patch.price !== undefined ? String(patch.price) : existing[0].price,
        originalPrice:
          patch.originalPrice !== undefined ? (patch.originalPrice ? String(patch.originalPrice) : null) : existing[0].originalPrice,
        tag: patch.tag !== undefined ? patch.tag : existing[0].tag,
        sku: patch.sku !== undefined ? (patch.sku ? patch.sku.trim() : null) : existing[0].sku,
        stock: patch.stock ?? existing[0].stock,
        status,
        weight: patch.weight !== undefined ? patch.weight : existing[0].weight,
        warranty: patch.warranty !== undefined ? patch.warranty : existing[0].warranty,
        updatedAt: new Date(),
      })
      .where(eq(productsTable.id, id));

    if (patch.images) {
      await this.replaceImages(id, patch.images);
    }

    return this.findById(id);
  };

  setStatus = async (id: number, status: string): Promise<ProductRow | null> => {
    const existing = await this.drizzle.db
      .select({ id: productsTable.id })
      .from(productsTable)
      .where(and(eq(productsTable.id, id), isNull(productsTable.deletedAt)))
      .limit(1);
    if (!existing[0]) return null;
    await this.drizzle.db
      .update(productsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(productsTable.id, id));
    return this.findById(id);
  };

  softDelete = async (id: number): Promise<boolean> => {
    const existing = await this.drizzle.db
      .select({ id: productsTable.id })
      .from(productsTable)
      .where(and(eq(productsTable.id, id), isNull(productsTable.deletedAt)))
      .limit(1);
    if (!existing[0]) return false;
    await this.drizzle.db
      .update(productsTable)
      .set({ status: ProductStatus.ARCHIVED, deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(productsTable.id, id));
    return true;
  };

  categoryNameOf = async (id: number): Promise<string | null> => {
    const rows = await this.drizzle.db
      .select({ name: categoriesTable.name })
      .from(categoriesTable)
      .where(eq(categoriesTable.id, id))
      .limit(1);
    return rows[0]?.name ?? null;
  };
}
