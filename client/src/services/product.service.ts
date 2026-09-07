import type {
  Product,
  Paginated,
  ListProductsParams,
  PaginateProductsParams,
  AdminListProductsParams,
  UpsertProductData,
} from "@/types";
import { paginated } from "@/types";
import { apiRequest } from "@/config/axios";

interface ApiProduct {
  id: number;
  slug: string;
  name: string;
  price: number;
  price_raw: string;
  original_price: number | null;
  tag: string | null;
  sku: string | null;
  stock: number;
  in_stock: boolean;
  is_active: boolean;
  description: string | null;
  long_description: string | null;
  details: string[] | null;
  sizes: string[] | null;
  colors: string[] | null;
  tags: string[] | null;
  weight: string | null;
  warranty: string | null;
  image: string | null;
  images: string[];
  category_id: number;
  category: string | null;
  category_slug: string | null;
  rating: number;
  reviews_count: number;
  created_at: string;
  updated_at: string;
}

const mapProduct = (p: ApiProduct): Product => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  price: p.price,
  originalPrice: p.original_price ?? undefined,
  rating: p.rating,
  reviews: p.reviews_count,
  image: p.image ?? "",
  images: p.images,
  category: p.category ?? "",
  categoryId: p.category_id,
  badge: p.tag ?? undefined,
  weight: p.weight ?? undefined,
  inStock: p.in_stock,
  stock: p.stock,
  isActive: p.is_active,
  sku: p.sku ?? undefined,
  tags: p.tags ?? undefined,
  description: p.description ?? undefined,
  warranty: p.warranty ?? undefined,
});

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

export class ProductService {
  async list(params?: ListProductsParams): Promise<Product[]> {
    const query = new URLSearchParams({ limit: String(params?.limit ?? 50) });
    if (params?.search) query.set("search", params.search);
    if (params?.category && params.category !== "Todos") query.set("category", params.category);
    if (params?.tag) query.set("tag", params.tag);
    if (params?.sortBy) query.set("sort_by", params.sortBy);
    if (params?.sortOrder) query.set("sort_order", params.sortOrder);

    const payload = await apiRequest<any>(`/products?${query.toString()}`);
    return extractPage(payload).items.map(mapProduct);
  }

  async listFlashDeals(): Promise<Product[]> {
    const query = new URLSearchParams({ tag: "Oferta", limit: "8" });
    const payload = await apiRequest<any>(`/products?${query.toString()}`);
    return extractPage(payload).items.map(mapProduct);
  }

  async paginate(params?: PaginateProductsParams): Promise<Paginated<Product>> {
    const query = new URLSearchParams({
      limit: String(params?.limit ?? 12),
      page: String(params?.page ?? 1),
    });

    if (params?.category && params.category !== "Todos") query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    if (params?.tag) query.set("tag", params.tag);
    if (params?.sortBy) query.set("sort_by", params.sortBy);
    if (params?.sortOrder) query.set("sort_order", params.sortOrder);

    const payload = await apiRequest<any>(`/products?${query.toString()}`);
    const { items, total, page, lastPage } = extractPage(payload);
    return paginated({
      data: items.map(mapProduct),
      meta: { total, current_page: page, last_page: lastPage },
    });
  }

  async getById(id: number): Promise<Product | null> {
    try {
      const payload = await apiRequest<{ data: ApiProduct }>(`/products/${id}`);
      return mapProduct(payload.data);
    } catch {
      return null;
    }
  }

  async adminList(params?: AdminListProductsParams, signal?: AbortSignal): Promise<Paginated<Product>> {
    const query = new URLSearchParams({
      limit: String(params?.limit ?? 10),
      page: String(params?.page ?? 1),
    });

    if (params?.search) query.set("search", params.search);
    if (params?.category && params.category !== "Todos") query.set("category", params.category);
    if (params?.isActive !== undefined && params.isActive !== "") {
      query.set("is_active", String(params.isActive));
    }
    if (params?.sortBy) query.set("sort_by", params.sortBy);
    if (params?.sortOrder) query.set("sort_order", params.sortOrder);

    const payload = await apiRequest<any>(`/admin/products?${query.toString()}`, {
      auth: true,
      signal,
    });

    const { items, total, page, lastPage } = extractPage(payload);
    return paginated({
      data: items.map(mapProduct),
      meta: { total, current_page: page, last_page: lastPage },
    });
  }

  async toggleActive(id: number, isActive: boolean): Promise<Product> {
    const payload = await apiRequest<any>(`/admin/products/${id}/status`, {
      method: "PATCH",
      auth: true,
      body: { is_active: isActive },
    });
    const item = payload?.data ?? payload;
    return mapProduct(item);
  }

  async delete(id: number): Promise<void> {
    await apiRequest(`/products/${id}`, { method: "DELETE", auth: true });
  }

  async update(id: number, data: UpsertProductData): Promise<Product> {
    const payload = await apiRequest<{ data: ApiProduct }>(`/products/${id}`, {
      method: "PUT",
      auth: true,
      body: {
        name: data.name,
        category_id: data.categoryId,
        price: data.price,
        original_price: data.originalPrice ?? null,
        tag: data.tag ?? null,
        sku: data.sku ?? null,
        stock: data.stock ?? 0,
        weight: data.weight ?? null,
        warranty: data.warranty ?? null,
        is_active: data.isActive ?? true,
        description: data.description ?? "",
        images: [{ url: data.image, alt: data.name }],
      },
    });
    return mapProduct(payload.data);
  }

  async create(data: UpsertProductData): Promise<Product> {
    const payload = await apiRequest<{ data: ApiProduct }>("/products", {
      method: "POST",
      auth: true,
      body: {
        name: data.name,
        category_id: data.categoryId,
        price: data.price,
        original_price: data.originalPrice ?? null,
        tag: data.tag ?? null,
        sku: data.sku ?? null,
        stock: data.stock ?? 0,
        weight: data.weight ?? null,
        warranty: data.warranty ?? null,
        is_active: data.isActive ?? true,
        description: data.description ?? "",
        images: [{ url: data.image, alt: data.name }],
      },
    });
    return mapProduct(payload.data);
  }

  async listRelated(id: number, category: string): Promise<Product[]> {
    const query = new URLSearchParams({ category, limit: "5" });
    const payload = await apiRequest<any>(`/products?${query.toString()}`);
    const items = extractPage(payload).items.map(mapProduct);
    return items.filter((p) => p.id !== id).slice(0, 4);
  }
}

export const productService = new ProductService();
