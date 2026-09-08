import { Exclude, Expose, Transform } from 'class-transformer';

export class CategoryModel {
  id: number;
  name: string;
  slug: string;

  @Expose({ name: 'products_count' })
  @Transform(({ value }) => value ?? 0)
  productsCount: number;

  @Expose({ name: 'parent_id' })
  @Transform(({ value }) => value ?? null)
  parentId: number | null;

  @Expose({ name: 'image_url' })
  @Transform(({ value }) => value ?? null)
  imageUrl: string | null;

  @Expose({ name: 'is_active' })
  @Transform(({ value }) => value ?? true)
  isActive: boolean;

  @Expose({ name: 'sort_order' })
  @Transform(({ value }) => value ?? 0)
  sortOrder: number;

  description: string | null;

  @Exclude()
  createdAt?: Date;

  @Exclude()
  updatedAt?: Date;

  @Expose()
  get fullPath(): string {
    return `/c/${this.slug}`;
  }

  @Expose()
  get displayName(): string {
    return this.parentId ? `↳ ${this.name}` : this.name;
  }

  @Expose()
  get isRoot(): boolean {
    return this.parentId === null;
  }

  @Expose()
  get hasProducts(): boolean {
    return this.productsCount > 0;
  }

  isSubcategory = (): boolean => this.parentId !== null;

  getProductCountLabel = (): string =>
    this.productsCount === 0 ? 'Sin productos' : `${this.productsCount} productos`;
}
