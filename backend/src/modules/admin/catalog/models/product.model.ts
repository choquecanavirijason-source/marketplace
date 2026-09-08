import { Exclude, Expose, Transform } from 'class-transformer';
import { ProductStatus } from '../enums/catalog-status.enum';

export class ProductModel {
  id: number;
  slug: string;
  name: string;

  @Transform(({ value }) => Number(value))
  price: number;

  @Expose({ name: 'price_raw' })
  priceRaw: string;

  @Expose({ name: 'original_price' })
  @Transform(({ value }) => (value !== null && value !== undefined ? Number(value) : null))
  originalPrice: number | null;

  tag: string | null;
  sku: string | null;
  stock: number;

  @Expose({ name: 'in_stock' })
  get inStock(): boolean {
    return (this.stock ?? 0) > 0;
  }

  @Expose({ name: 'is_active' })
  get isActive(): boolean {
    return this.status === ProductStatus.PUBLISHED;
  }

  @Exclude()
  status: ProductStatus;

  description: string | null;

  @Expose({ name: 'long_description' })
  longDescription: string | null;

  details: string[] | null = null;
  sizes: string[] | null = null;
  colors: string[] | null = null;
  tags: string[] | null = null;
  weight: string | null;
  warranty: string | null;
  image: string | null;
  images: string[];

  @Expose({ name: 'category_id' })
  categoryId: number;

  @Expose({ name: 'category' })
  categoryName: string | null;

  @Expose({ name: 'category_slug' })
  categorySlug: string | null;

  rating: number;

  @Expose({ name: 'reviews_count' })
  reviewsCount: number;

  @Expose({ name: 'created_at' })
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  createdAt?: Date | string;

  @Expose({ name: 'updated_at' })
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  updatedAt?: Date | string;
}
