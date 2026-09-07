import { Exclude, Expose, Transform } from 'class-transformer';
import { ProductStatus } from '../enums/catalog-status.enum';

export interface ProductProps {
  id: number;
  slug: string;
  name: string;
  price: number | string;
  priceRaw?: string;
  originalPrice?: number | null;
  tag?: string | null;
  sku?: string | null;
  stock?: number;
  status?: ProductStatus;
  description?: string | null;
  longDescription?: string | null;
  weight?: string | null;
  warranty?: string | null;
  image?: string | null;
  images?: string[];
  categoryId?: number;
  categoryName?: string | null;
  categorySlug?: string | null;
  rating?: number;
  reviewsCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

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

  constructor(props?: Partial<ProductProps>) {
    if (props) {
      Object.assign(this, props);
      this.price = Number(props.price ?? 0);
      this.priceRaw = props.priceRaw ?? String(props.price ?? 0);
      this.originalPrice = props.originalPrice !== undefined ? props.originalPrice : null;
      this.status = props.status ?? ProductStatus.DRAFT;
      this.stock = props.stock ?? 0;
      this.images = props.images ?? [];
      this.categoryId = props.categoryId ?? 0;
      this.categoryName = props.categoryName ?? null;
      this.categorySlug = props.categorySlug ?? null;
      this.rating = props.rating ?? 0;
      this.reviewsCount = props.reviewsCount ?? 0;
    }
  }
}
