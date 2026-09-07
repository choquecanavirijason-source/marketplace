import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { EntityNotFoundException } from '../../../shared';
import { CategorySerializer, CategoryResponseDto } from '../serializers';

export type CategoryApiOutput = CategoryResponseDto;

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  listActive = async (): Promise<CategoryResponseDto[]> => {
    const rows = await this.categoryRepository.listActive();
    return CategorySerializer.serializeMany(rows);
  };

  findBySlug = async (slug: string): Promise<CategoryResponseDto> => {
    const category = await this.categoryRepository.findBySlug(slug);
    if (!category) {
      throw new EntityNotFoundException('Categoría', slug);
    }
    return CategorySerializer.serialize(category);
  };

  adminList = async (query: any) => {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const { items, total } = await this.categoryRepository.adminList({
      page,
      limit,
      search: query.search,
    });
    return {
      items: CategorySerializer.serializeMany(items),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  };

  create = async (dto: any): Promise<CategoryResponseDto> => {
    const slug = await this.categoryRepository.ensureUniqueSlug(dto.name);
    const category = await this.categoryRepository.create({
      name: dto.name,
      parentId: dto.parentId ?? null,
      description: dto.description ?? null,
      imageUrl: dto.imageUrl ?? null,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
      slug,
    });
    return CategorySerializer.serialize(category);
  };

  update = async (id: number, dto: any): Promise<CategoryResponseDto> => {
    const category = await this.categoryRepository.update(id, dto);
    if (!category) {
      throw new EntityNotFoundException('Categoría', String(id));
    }
    return CategorySerializer.serialize(category);
  };

  remove = async (id: number): Promise<void> => {
    const deleted = await this.categoryRepository.softDelete(id);
    if (!deleted) {
      throw new EntityNotFoundException('Categoría', String(id));
    }
  };
}
