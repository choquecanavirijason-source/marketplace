import { Exclude, Expose } from 'class-transformer';

export interface CategoryProps {
  id: number;
  name: string;
  slug: string;
  parentId?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  productsCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CategoryModel {
  id: number;
  name: string;
  slug: string;

  @Expose({ name: 'products_count' })
  productsCount: number;

  @Expose({ name: 'parent_id' })
  parentId: number | null;

  description: string | null;

  @Expose({ name: 'image_url' })
  imageUrl: string | null;

  @Expose({ name: 'is_active' })
  isActive: boolean;

  @Expose({ name: 'sort_order' })
  sortOrder: number;

  @Exclude()
  createdAt?: Date;

  @Exclude()
  updatedAt?: Date;

  constructor(props?: Partial<CategoryProps>) {
    if (props) {
      this.id = props.id!;
      this.name = props.name!;
      this.slug = props.slug!;
      this.parentId = props.parentId ?? null;
      this.description = props.description ?? null;
      this.imageUrl = props.imageUrl ?? null;
      this.sortOrder = props.sortOrder ?? 0;
      this.isActive = props.isActive ?? true;
      this.productsCount = props.productsCount ?? 0;
      this.createdAt = props.createdAt;
      this.updatedAt = props.updatedAt;
    }
  }
}
