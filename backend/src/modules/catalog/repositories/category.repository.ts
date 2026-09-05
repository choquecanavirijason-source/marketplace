import { Injectable } from '@nestjs/common';
import { and, asc, eq, ilike, inArray, isNull, or, sql } from 'drizzle-orm';
import { DrizzleService } from '../../../infrastructure/database/drizzle.service';
import {
  categoriesTable,
  productsTable,
  CategoryDb,
  NewCategoryDb,
} from '../../../infrastructure/database/schema';
import { slugify, randomSuffix } from '../validators';

export interface CategoryWithCount {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  productsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryListFilters {
  search?: string;
  page?: number;
  limit?: number;
}

const toCategoryWithCount = (row: CategoryDb, productsCount = 0): CategoryWithCount => ({
  id: row.id,
  parentId: row.parentId,
  name: row.name,
  slug: row.slug,
  description: row.description,
  imageUrl: row.imageUrl,
  sortOrder: row.sortOrder,
  isActive: row.isActive,
  productsCount,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

@Injectable()
export class CategoryRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  private async countsFor(categoryIds: number[]): Promise<Map<number, number>> {
    const map = new Map<number, number>();
    if (categoryIds.length === 0) return map;
    const rows = await this.drizzle.db
      .select({
        categoryId: productsTable.categoryId,
        total: sql<number>`count(*)::int`,
      })
      .from(productsTable)
      .where(
        and(
          eq(productsTable.status, 'published'),
          isNull(productsTable.deletedAt),
          inArray(productsTable.categoryId, categoryIds),
        ),
      )
      .groupBy(productsTable.categoryId);
    for (const r of rows) map.set(r.categoryId, Number(r.total));
    return map;
  }

  private async decorate(rows: CategoryDb[]): Promise<CategoryWithCount[]> {
    const counts = await this.countsFor(rows.map((r) => r.id));
    return rows.map((r) => toCategoryWithCount(r, counts.get(r.id) ?? 0));
  }

  async ensureUniqueSlug(base: string, excludeId?: number): Promise<string> {
    const candidate = slugify(base) || `categoria-${randomSuffix(4)}`;
    const taken = new Set<string>();
    const existing = await this.drizzle.db
      .select({ slug: categoriesTable.slug })
      .from(categoriesTable)
      .where(
        excludeId
          ? and(ilike(categoriesTable.slug, `${candidate}%`), sql`${categoriesTable.id} <> ${excludeId}`)
          : ilike(categoriesTable.slug, `${candidate}%`),
      );
    for (const e of existing) taken.add(e.slug);
    if (!taken.has(candidate)) return candidate;
    for (let i = 0; i < 40; i += 1) {
      const candidateWithSuffix = `${candidate}-${randomSuffix(4)}`;
      if (!taken.has(candidateWithSuffix)) return candidateWithSuffix;
    }
    return `${candidate}-${Date.now().toString(36)}`;
  }

  async listActive(): Promise<CategoryWithCount[]> {
    const rows = await this.drizzle.db
      .select()
      .from(categoriesTable)
      .where(and(eq(categoriesTable.isActive, true), isNull(categoriesTable.deletedAt)))
      .orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.name));
    return this.decorate(rows);
  }

  async findBySlug(slug: string): Promise<CategoryWithCount | null> {
    const rows = await this.drizzle.db
      .select()
      .from(categoriesTable)
      .where(and(eq(categoriesTable.slug, slug), eq(categoriesTable.isActive, true), isNull(categoriesTable.deletedAt)))
      .limit(1);
    if (!rows[0]) return null;
    const [decorated] = await this.decorate([rows[0]]);
    return decorated;
  }

  async findById(id: number): Promise<CategoryWithCount | null> {
    const rows = await this.drizzle.db
      .select()
      .from(categoriesTable)
      .where(and(eq(categoriesTable.id, id), isNull(categoriesTable.deletedAt)))
      .limit(1);
    if (!rows[0]) return null;
    const [decorated] = await this.decorate([rows[0]]);
    return decorated;
  }

  async adminList(filters: CategoryListFilters): Promise<{ items: CategoryWithCount[]; total: number }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const offset = (page - 1) * limit;

    const conditions = [isNull(categoriesTable.deletedAt)];
    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim().toLowerCase()}%`;
      conditions.push(or(ilike(categoriesTable.name, term), ilike(categoriesTable.slug, term)) as any);
    }

    const whereClause = and(...conditions);
    const [countRows, rows] = await Promise.all([
      this.drizzle.db
        .select({ total: sql<number>`count(*)::int` })
        .from(categoriesTable)
        .where(whereClause),
      this.drizzle.db
        .select()
        .from(categoriesTable)
        .where(whereClause)
        .orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.name))
        .offset(offset)
        .limit(limit),
    ]);

    return {
      items: await this.decorate(rows),
      total: Number(countRows[0]?.total ?? 0),
    };
  }

  async create(data: NewCategoryDb & { name: string }): Promise<CategoryWithCount> {
    const slug = await this.ensureUniqueSlug(data.name);
    const [row] = await this.drizzle.db
      .insert(categoriesTable)
      .values({
        name: data.name,
        slug: data.slug || slug,
        parentId: data.parentId ?? null,
        description: data.description ?? null,
        imageUrl: data.imageUrl ?? null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return toCategoryWithCount(row, 0);
  }

  async update(
    id: number,
    patch: Partial<Pick<CategoryDb, 'name' | 'parentId' | 'description' | 'imageUrl' | 'sortOrder' | 'isActive'>>,
  ): Promise<CategoryWithCount | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    let slug = existing.slug;
    if (patch.name && patch.name !== existing.name) {
      slug = await this.ensureUniqueSlug(patch.name, id);
    }

    const [row] = await this.drizzle.db
      .update(categoriesTable)
      .set({
        name: patch.name ?? existing.name,
        slug,
        parentId: patch.parentId !== undefined ? patch.parentId : existing.parentId,
        description: patch.description !== undefined ? patch.description : existing.description,
        imageUrl: patch.imageUrl !== undefined ? patch.imageUrl : existing.imageUrl,
        sortOrder: patch.sortOrder ?? existing.sortOrder,
        isActive: patch.isActive ?? existing.isActive,
        updatedAt: new Date(),
      })
      .where(eq(categoriesTable.id, id))
      .returning();

    const [decorated] = await this.decorate([row]);
    return decorated;
  }

  async softDelete(id: number): Promise<boolean> {
    const existing = await this.drizzle.db
      .select({ id: categoriesTable.id })
      .from(categoriesTable)
      .where(and(eq(categoriesTable.id, id), isNull(categoriesTable.deletedAt)))
      .limit(1);
    if (!existing[0]) return false;
    await this.drizzle.db
      .update(categoriesTable)
      .set({ isActive: false, deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(categoriesTable.id, id));
    return true;
  }
}
