import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CategoryRepository } from '../repositories/category.repository';
import { EntityNotFoundException } from '../../../../shared';
import { CategoryModel } from '../models/category.model';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  listActive = async (): Promise<CategoryModel[]> => {
    const rows = await this.categoryRepository.listActive();
    return rows.map((row) => plainToInstance(CategoryModel, row));
  };

  findBySlug = async (slug: string): Promise<CategoryModel> => {
    const category = await this.categoryRepository.findBySlug(slug);
    if (!category) {
      throw new EntityNotFoundException('Categoría', slug);
    }
    return plainToInstance(CategoryModel, category);
  };
}
