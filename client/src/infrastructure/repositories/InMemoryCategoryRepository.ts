import type { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import type { Category } from "@/domain/entities/Category";
import { categoriesSeed } from "@/infrastructure/data/categories.data";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

let nextId = 1000;

export class InMemoryCategoryRepository implements CategoryRepository {
  async list(): Promise<Category[]> {
    return categoriesSeed;
  }

  async getBySlug(slug: string): Promise<Category | null> {
    return categoriesSeed.find((c) => c.slug === slug) ?? null;
  }

  async create(name: string): Promise<Category> {
    const category: Category = {
      id: nextId++,
      slug: slugify(name),
      name,
      icon: categoriesSeed[0].icon,
      count: 0,
      color: "#f3f4f6",
    };
    categoriesSeed.push(category);
    return category;
  }

  async update(id: number, name: string): Promise<Category> {
    const category = categoriesSeed.find((c) => c.id === id);
    if (!category) {
      throw new Error("Categoría no encontrada");
    }
    category.name = name;
    category.slug = slugify(name);
    return category;
  }

  async delete(id: number): Promise<void> {
    const index = categoriesSeed.findIndex((c) => c.id === id);
    if (index >= 0) {
      categoriesSeed.splice(index, 1);
    }
  }
}