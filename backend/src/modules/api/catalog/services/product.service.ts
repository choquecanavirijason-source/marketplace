import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ProductRepository, ProductRow } from '../repositories/product.repository';
import { EntityNotFoundException } from '../../../../shared';
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

  publicById = async (id: number): Promise<ProductModel> => {
    const product = await this.productRepository.findById(id);
    if (!product || product.status !== 'published') {
      throw new EntityNotFoundException('Producto', String(id));
    }
    return toProductInstance(product);
  };
}
