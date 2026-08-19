import { apiRequest } from "@/infrastructure/http/client";
import type { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import type { Category } from "@/domain/entities/Category";
import { Package } from "lucide-react";
import { categoriesSeed } from "@/infrastructure/data/categories.data";

interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  products_count: number;
}

const DEFAULT_COLOR = "#f3f4f6";

function mapCategory(c: ApiCategory): Category {
  const seed = categoriesSeed.find((s) => s.name === c.name);
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    icon: seed?.icon ?? Package,
    count: c.products_count,
    color: seed?.color ?? DEFAULT_COLOR,
  };
}

export class HttpCategoryRepository implements CategoryRepository {
  async list(): Promise<Category[]> {
    const payload = await apiRequest<{ data: ApiCategory[] }>("/categories?limit=100");
    return payload.data.map(mapCategory);
  }

  async getBySlug(slug: string): Promise<Category | null> {
    try {
      const payload = await apiRequest<{ data: ApiCategory }>(`/categories/${slug}`);
      return mapCategory(payload.data);
    } catch {
      return null;
    }
  }

  async create(name: string): Promise<Category> {
    const payload = await apiRequest<{ data: ApiCategory }>("/categories", {
      method: "POST",
      auth: true,
      body: { name },
    });
    return mapCategory(payload.data);
  }

  async update(id: number, name: string): Promise<Category> {
    const payload = await apiRequest<{ data: ApiCategory }>(`/categories/${id}`, {
      method: "PUT",
      auth: true,
      body: { name },
    });
    return mapCategory(payload.data);
  }

  async delete(id: number): Promise<void> {
    await apiRequest(`/categories/${id}`, { method: "DELETE", auth: true });
  }
}