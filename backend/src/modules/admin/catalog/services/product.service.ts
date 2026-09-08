import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ProductRepository, ProductRow } from '../repositories/product.repository';
import { EntityNotFoundException, DomainException } from '../../../../shared';
import { ProductModel } from '../models/product.model';

const toProductInstance = (row: ProductRow): ProductModel => {
  const sorted = [...row.images].sort((a, b) => {
    if (Boolean(a.isPrimary) !== Boolean(b.isPrimary)) return a.isPrimary ? -1 : 1;
    return (a.position ?? 0) - (b.position ?? 0);
  });
  const image = sorted[0]?.url ?? null;
  const images = sorted.map((i) => i.url);

  return plainToInstance(ProductModel, {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: Number(row.price),
    priceRaw: row.price,
    originalPrice: row.originalPrice,
    tag: row.tag,
    sku: row.sku,
    stock: row.stock,
    status: row.status,
    description: row.description,
    longDescription: row.longDescription,
    weight: row.weight,
    warranty: row.warranty,
    image,
    images,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    categorySlug: row.categorySlug,
    rating: row.rating,
    reviewsCount: row.reviewsCount,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
};

const paginateOutput = (rows: ProductRow[], total: number, page: number, limit: number) => ({
  items: rows.map(toProductInstance),
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  adminList = async (query: any) => {
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
  };

  getById = async (id: number): Promise<ProductModel> => {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new EntityNotFoundException('Producto', String(id));
    }
    return toProductInstance(product);
  };

  create = async (dto: any, sellerId?: string | null): Promise<ProductModel> => {
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
    return toProductInstance(product);
  };

  update = async (id: number, dto: any): Promise<ProductModel> => {
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
    return toProductInstance(product);
  };

  setActive = async (id: number, isActive: boolean): Promise<ProductModel> => {
    const product = await this.productRepository.setStatus(id, isActive ? 'published' : 'paused');
    if (!product) {
      throw new EntityNotFoundException('Producto', String(id));
    }
    return toProductInstance(product);
  };

  remove = async (id: number): Promise<void> => {
    const deleted = await this.productRepository.softDelete(id);
    if (!deleted) {
      throw new EntityNotFoundException('Producto', String(id));
    }
  };

  private normalizeImages = (image: string | null | undefined, images: any): any => {
    const list = Array.isArray(images) && images.length > 0
      ? images
          .filter((i: any) => i && i.url)
          .map((i: any) => ({ url: i.url, alt: i.alt ?? null }))
      : image
        ? [{ url: image, alt: null }]
        : [];
    return list;
  };
}
