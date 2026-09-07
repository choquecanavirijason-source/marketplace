import { plainToInstance, instanceToPlain } from 'class-transformer';
import { ProductModel } from '../models/product.model';
import { ProductRow } from '../repositories/product.repository';

export interface ProductResponseDto {
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

export class ProductSerializer {
  static serialize = (p: ProductModel | ProductRow): ProductResponseDto => {
    if (p instanceof ProductModel) {
      return instanceToPlain(p) as ProductResponseDto;
    }

    const sorted = [...p.images].sort((a, b) => {
      if (Boolean(a.isPrimary) !== Boolean(b.isPrimary)) return a.isPrimary ? -1 : 1;
      return (a.position ?? 0) - (b.position ?? 0);
    });
    const image = sorted[0]?.url ?? null;
    const images = sorted.map((i) => i.url);

    const instance = plainToInstance(ProductModel, {
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      priceRaw: p.price,
      originalPrice: p.originalPrice,
      tag: p.tag,
      sku: p.sku,
      stock: p.stock,
      status: p.status,
      description: p.description,
      longDescription: p.longDescription,
      weight: p.weight,
      warranty: p.warranty,
      image,
      images,
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      categorySlug: p.categorySlug,
      rating: p.rating,
      reviewsCount: p.reviewsCount,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    });

    return instanceToPlain(instance) as ProductResponseDto;
  };

  static serializeMany = (products: (ProductModel | ProductRow)[]): ProductResponseDto[] =>
    products.map(ProductSerializer.serialize);
}
