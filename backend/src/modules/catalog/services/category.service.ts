import { Injectable } from '@nestjs/common';
import { CategoryRepository, CategoryWithCount } from '../repositories/category.repository';
import { EntityNotFoundException } from '../../../shared';

export interface CategoryApiOutput {
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

const toApiCategory = (c: CategoryWithCount): CategoryApiOutput => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  products_count: c.productsCount,
  parent_id: c.parentId,
  description: c.description,
  image_url: c.imageUrl,
  is_active: c.isActive,
  sort_order: c.sortOrder,
});

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async listActive() {
    const rows = await this.categoryRepository.listActive();
    return rows.map(toApiCategory);
  }

  async findBySlug(slug: string) {
    const category = await this.categoryRepository.findBySlug(slug);
    if (!category) {
      throw new EntityNotFoundException('Categoría', slug);
    }
    return toApiCategory(category);
  }

  async adminList(query: any) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const { items, total } = await this.categoryRepository.adminList({
      page,
      limit,
      search: query.search,
    });
    return {
      items: items.map(toApiCategory),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(dto: any) {
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
    return toApiCategory(category);
  }

  async update(id: number, dto: any) {
    const category = await this.categoryRepository.update(id, dto);
    if (!category) {
      throw new EntityNotFoundException('Categoría', String(id));
    }
    return toApiCategory(category);
  }

  async remove(id: number) {
    const deleted = await this.categoryRepository.softDelete(id);
    if (!deleted) {
      throw new EntityNotFoundException('Categoría', String(id));
    }
  }
}
