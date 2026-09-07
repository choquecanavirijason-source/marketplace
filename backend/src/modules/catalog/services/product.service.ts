import { Injectable } from '@nestjs/common';
import { ProductRepository, ProductRow } from '../repositories/product.repository';
import { EntityNotFoundException, DomainException } from '../../../shared';
import { ProductStatus } from '../enums';
import { ProductSerializer, ProductResponseDto } from '../serializers';

export type ProductApiOutput = ProductResponseDto;
export const toApiProduct = ProductSerializer.serialize;

const paginateOutput = (rows: ProductRow[], total: number, page: number, limit: number) => ({
  items: ProductSerializer.serializeMany(rows),
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  publicList = async (query: any) => {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 12);
    const { items, total } = await this.productRepository.paginate({
      page,
      limit,
      search: query.search,
      category: query.category,
      tag: query.tag,
      sortBy: query.sort_by,
      sortOrder: query.sort_order,
      includeNonPublished: false,
    });
    return paginateOutput(items, total, page, limit);
  };

  publicById = async (id: number): Promise<ProductResponseDto> => {
    const product = await this.productRepository.findById(id);
    if (!product || product.status !== ProductStatus.PUBLISHED) {
      throw new EntityNotFoundException('Producto', String(id));
    }
    return ProductSerializer.serialize(product);
  };

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

  getById = async (id: number): Promise<ProductResponseDto> => {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new EntityNotFoundException('Producto', String(id));
    }
    return ProductSerializer.serialize(product);
  };

  create = async (dto: any, sellerId?: string | null): Promise<ProductResponseDto> => {
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
    return ProductSerializer.serialize(product);
  };

  update = async (id: number, dto: any): Promise<ProductResponseDto> => {
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
    return ProductSerializer.serialize(product);
  };

  setActive = async (id: number, isActive: boolean): Promise<ProductResponseDto> => {
    const product = await this.productRepository.setStatus(id, isActive ? ProductStatus.PUBLISHED : ProductStatus.PAUSED);
    if (!product) {
      throw new EntityNotFoundException('Producto', String(id));
    }
    return ProductSerializer.serialize(product);
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
