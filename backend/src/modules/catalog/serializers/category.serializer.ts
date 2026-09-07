import { plainToInstance, instanceToPlain } from 'class-transformer';
import { CategoryModel } from '../models/category.model';
import { CategoryWithCount } from '../repositories/category.repository';

export interface CategoryResponseDto {
  id: number;
  name: string;
  slug: string;
  products_count: number;
  parent_id: number | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export class CategorySerializer {
  static serialize = (model: CategoryModel | CategoryWithCount): CategoryResponseDto => {
    const instance = model instanceof CategoryModel
      ? model
      : plainToInstance(CategoryModel, {
          id: model.id,
          name: model.name,
          slug: model.slug,
          productsCount: (model as any).productsCount ?? (model as any).products_count ?? 0,
          parentId: (model as any).parentId ?? (model as any).parent_id ?? null,
          description: model.description ?? null,
          imageUrl: (model as any).imageUrl ?? (model as any).image_url ?? null,
          isActive: (model as any).isActive ?? (model as any).is_active ?? true,
          sortOrder: (model as any).sortOrder ?? (model as any).sort_order ?? 0,
        });

    return instanceToPlain(instance) as CategoryResponseDto;
  };

  static serializeMany = (models: (CategoryModel | CategoryWithCount)[]): CategoryResponseDto[] =>
    models.map(CategorySerializer.serialize);
}
