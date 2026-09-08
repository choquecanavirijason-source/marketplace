import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CategoryRepository } from '../repositories/category.repository';
import { EntityNotFoundException } from '../../../../shared';
import { CategoryModel } from '../models/category.model';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  adminList = async (query: any) => {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const { items, total } = await this.categoryRepository.adminList({
      page,
      limit,
      search: query.search,
    });

    return {
      items: items.map((item) => plainToInstance(CategoryModel, item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  };

  create = async (dto: any): Promise<CategoryModel> => {
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
    return plainToInstance(CategoryModel, category);
  };

  update = async (id: number, dto: any): Promise<CategoryModel> => {
    const category = await this.categoryRepository.update(id, dto);
    if (!category) {
      throw new EntityNotFoundException('Categoría', String(id));
    }
    return plainToInstance(CategoryModel, category);
  };

  remove = async (id: number): Promise<void> => {
    const deleted = await this.categoryRepository.softDelete(id);
    if (!deleted) {
      throw new EntityNotFoundException('Categoría', String(id));
    }
  };
}
