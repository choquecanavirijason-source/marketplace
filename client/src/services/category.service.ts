import type { Category, Paginated } from "@/types";
import { paginated } from "@/types";
import { apiRequest } from "@/config/axios";
import { categoriesSeed } from "@/infrastructure/data/categories.data";
import { Package } from "lucide-react";

export interface AdminListCategoriesParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CategoryService {
  list(): Promise<Category[]>;
  getBySlug(slug: string): Promise<Category | null>;
  adminList(params?: AdminListCategoriesParams): Promise<Paginated<Category>>;
  create(name: string): Promise<Category>;
  update(id: number, name: string): Promise<Category>;
  delete(id: number): Promise<void>;
}

export type CategoryRepository = CategoryService;

const slugify = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

let nextId = 1000;

export class InMemoryCategoryService implements CategoryService {
  async list(): Promise<Category[]> {
    return categoriesSeed;
  }

  async getBySlug(slug: string): Promise<Category | null> {
    return categoriesSeed.find((c) => c.slug === slug) ?? null;
  }

  async adminList(params?: AdminListCategoriesParams): Promise<Paginated<Category>> {
    const search = params?.search?.toLowerCase() ?? "";
    const filtered = categoriesSeed.filter(
      (c) => !search || c.name.toLowerCase().includes(search) || (c.slug ?? "").toLowerCase().includes(search),
    );

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = (page - 1) * limit;

    return paginated({
      data: filtered.slice(start, start + limit),
      meta: {
        total: filtered.length,
        current_page: page,
        last_page: Math.max(1, Math.ceil(filtered.length / limit)),
      },
    });
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

export const InMemoryCategoryRepository = InMemoryCategoryService;

interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  products_count: number;
}

const extractPage = (payload: any): { items: any[]; total: number; page: number; lastPage: number } => {
  const data = payload?.data ?? payload ?? {};
  if (Array.isArray(data)) {
    return { items: data, total: data.length, page: 1, lastPage: Math.max(1, data.length) };
  }
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = Number(data?.total ?? items.length);
  const page = Number(data?.page ?? data?.current_page ?? 1);
  const limit = Number(data?.limit ?? items.length) || 1;
  const totalPages = Number(data?.totalPages ?? data?.total_pages ?? data?.last_page ?? Math.max(1, Math.ceil(total / limit)));
  return { items, total, page, lastPage: Math.max(1, totalPages) };
};

const DEFAULT_COLOR = "#f3f4f6";

const mapCategory = (c: ApiCategory): Category => {
  const seed = categoriesSeed.find((s) => s.name === c.name);
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    icon: seed?.icon ?? Package,
    count: c.products_count,
    color: seed?.color ?? DEFAULT_COLOR,
  };
};

export class HttpCategoryService implements CategoryService {
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

  async adminList(params?: AdminListCategoriesParams): Promise<Paginated<Category>> {
    const query = new URLSearchParams({
      limit: String(params?.limit ?? 10),
      page: String(params?.page ?? 1),
    });

    if (params?.search) query.set("search", params.search);

    const payload = await apiRequest<any>(`/admin/categories?${query.toString()}`, {
      auth: true,
    });

    const { items, total, page, lastPage } = extractPage(payload);
    return paginated({
      data: items.map(mapCategory),
      meta: { total, current_page: page, last_page: lastPage },
    });
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

export const HttpCategoryRepository = HttpCategoryService;
