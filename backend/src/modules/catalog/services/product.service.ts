import { Injectable } from '@nestjs/common';
import { ProductRepository, ProductRow } from '../repositories/product.repository';
import { EntityNotFoundException, DomainException } from '../../../shared';
import { ProductStatus } from '../enums';

export interface ProductApiOutput {
  id: number;
  slug: string;
  name: string;
  price: number;
  price_raw: string;
  original_price: number | null;
  tag: string | null;
  sku: string | null;
  stock: number;
  in_stock: boolean;
  is_active: boolean;
  description: string | null;
  long_description: string | null;
  details: string[] | null;
  sizes: string[] | null;
  colors: string[] | null;
  tags: string[] | null;
  weight: string | null;
  warranty: string | null;
  image: string | null;
  images: string[];
  category_id: number;
  category: string | null;
  category_slug: string | null;
  rating: number;
  reviews_count: number;
  created_at: string;
  updated_at: string;
}

export const toApiProduct = (p: ProductRow): ProductApiOutput => {
  const sorted = [...p.images].sort((a, b) => {
    if (Boolean(a.isPrimary) !== Boolean(b.isPrimary)) return a.isPrimary ? -1 : 1;
    return (a.position ?? 0) - (b.position ?? 0);
  });
  const image = sorted[0]?.url ?? null;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: Number(p.price),
    price_raw: p.price,
    original_price: p.originalPrice !== null ? Number(p.originalPrice) : null,
    tag: p.tag,
    sku: p.sku,
    stock: p.stock,
    in_stock: p.stock > 0,
    is_active: p.status === ProductStatus.PUBLISHED,
    description: p.description,
    long_description: p.longDescription,
    details: null,
    sizes: null,
    colors: null,
    tags: null,
    weight: p.weight,
    warranty: p.warranty,
    image,
    images: sorted.map((i) => i.url),
    category_id: p.categoryId,
    category: p.categoryName,
    category_slug: p.categorySlug,
    rating: p.rating,
    reviews_count: p.reviewsCount,
    created_at: p.createdAt.toISOString(),
    updated_at: p.updatedAt.toISOString(),
  };
};

const paginateOutput = (rows: ProductRow[], total: number, page: number, limit: number) => ({
  items: rows.map(toApiProduct),
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async publicList(query: any) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 12);
    const { items, total } = await this.productRepository.paginate({
      page,
      limit,
      search: query.search,
      category: query.category,
      tag: query.tag,
      includeNonPublished: false,
    });
    return paginateOutput(items, total, page, limit);
  }

  async publicById(id: number) {
    const product = await this.productRepository.findById(id);
    if (!product || product.status !== ProductStatus.PUBLISHED) {
      throw new EntityNotFoundException('Producto', String(id));
    }
    return toApiProduct(product);
  }

  async adminList(query: any) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const { items, total } = await this.productRepository.paginate({
      page,
      limit,
      search: query.search,
      category: query.category,
      isActive: query.is_active !== undefined ? Boolean(query.is_active) : undefined,
      sortBy: query.sort_by,
      sortOrder: query.sort_order,
      includeNonPublished: true,
    });
    return paginateOutput(items, total, page, limit);
  }

  async getById(id: number) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new EntityNotFoundException('Producto', String(id));
    }
    return toApiProduct(product);
  }

  async create(dto: any, sellerId?: string | null) {
    const category = await this.productRepository.categoryNameOf(dto.categoryId);
    if (!category) {
      throw new DomainException('La categoría seleccionada no existe.');
    }
    const images = this.normalizeImages(dto.image, dto.images);
    const tag = dto.tag !== undefined ? dto.tag : dto.badge;
    const product = await this.productRepository.create({
      sellerId,
      categoryId: dto.categoryId,
      name: dto.name,
      price: String(dto.price),
      originalPrice: dto.originalPrice !== undefined && dto.originalPrice !== null ? String(dto.originalPrice) : null,
      tag: tag ?? null,
      sku: dto.sku ?? null,
      stock: dto.stock ?? 0,
      isActive: dto.isActive,
      status: dto.status,
      description: dto.description ?? null,
      longDescription: dto.longDescription ?? null,
      weight: dto.weight ?? null,
      warranty: dto.warranty ?? null,
      images,
    });
    return toApiProduct(product);
  }

  async update(id: number, dto: any) {
    if (dto.categoryId !== undefined) {
      const category = await this.productRepository.categoryNameOf(dto.categoryId);
      if (!category) {
        throw new DomainException('La categoría seleccionada no existe.');
      }
    }
    const tag = dto.tag !== undefined ? dto.tag : dto.badge;
    const images = dto.image !== undefined || dto.images !== undefined ? this.normalizeImages(dto.image, dto.images) : undefined;
    const product = await this.productRepository.update(id, {
      name: dto.name,
      categoryId: dto.categoryId,
      price: dto.price !== undefined ? String(dto.price) : undefined,
      originalPrice: dto.originalPrice !== undefined ? (dto.originalPrice ? String(dto.originalPrice) : null) : undefined,
      tag,
      sku: dto.sku,
      stock: dto.stock,
      isActive: dto.isActive,
      status: dto.status,
      description: dto.description,
      longDescription: dto.longDescription,
      weight: dto.weight,
      warranty: dto.warranty,
      images,
    });
    if (!product) {
      throw new EntityNotFoundException('Producto', String(id));
    }
    return toApiProduct(product);
  }

  async setActive(id: number, isActive: boolean) {
    const product = await this.productRepository.setStatus(id, isActive ? ProductStatus.PUBLISHED : ProductStatus.PAUSED);
    if (!product) {
      throw new EntityNotFoundException('Producto', String(id));
    }
    return toApiProduct(product);
  }

  async remove(id: number) {
    const deleted = await this.productRepository.softDelete(id);
    if (!deleted) {
      throw new EntityNotFoundException('Producto', String(id));
    }
  }

  private normalizeImages(image: string | null | undefined, images: any): any {
    const list = Array.isArray(images) && images.length > 0
      ? images
          .filter((i: any) => i && i.url)
          .map((i: any) => ({ url: i.url, alt: i.alt ?? null }))
      : image
        ? [{ url: image, alt: null }]
        : [];
    return list;
  }
}
