import type {
  Product,
  Paginated,
  ListProductsParams,
  PaginateProductsParams,
  AdminListProductsParams,
  UpsertProductData,
} from "@/types";
import type { IPaginatedResponse, IPaginationRequest } from "@/types/pagination";
import { paginated } from "@/types";
import { apiRequest } from "@/config/axios";

interface ApiProduct {
  id: number;
  slug: string;
  name: string;
  price: number;
  price_raw?: string;
  priceRaw?: string;
  original_price?: number | null;
  originalPrice?: number | null;
  tag?: string | null;
  sku?: string | null;
  stock?: number;
  in_stock?: boolean;
  inStock?: boolean;
  is_active?: boolean;
  isActive?: boolean;
  description?: string | null;
  long_description?: string | null;
  longDescription?: string | null;
  details?: string[] | null;
  sizes?: string[] | null;
  colors?: string[] | null;
  tags?: string[] | null;
  weight?: string | null;
  warranty?: string | null;
  image?: string | null;
  images?: string[];
  category_id?: number;
  categoryId?: number;
  category?: string | null;
  category_slug?: string | null;
  categorySlug?: string | null;
  rating?: number;
  reviews_count?: number;
  reviewsCount?: number;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

const mapProduct = (p: ApiProduct): Product => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  price: Number(p.price),
  originalPrice: p.original_price ?? p.originalPrice ?? undefined,
  rating: p.rating ?? 0,
  reviews: p.reviews_count ?? p.reviewsCount ?? 0,
  image: p.image ?? "",
  images: Array.isArray(p.images) ? p.images : [],
  category: p.category ?? "",
  categoryId: p.category_id ?? p.categoryId,
  badge: p.tag ?? undefined,
  weight: p.weight ?? undefined,
  inStock: p.in_stock ?? p.inStock ?? (p.stock !== undefined ? p.stock > 0 : true),
  stock: p.stock ?? 0,
  isActive: p.is_active ?? p.isActive ?? true,
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

const getPaginated = async (params: IPaginationRequest): Promise<IPaginatedResponse<Product>> => {
  const query = new URLSearchParams({
    page: String(params.page || 1),
    limit: String(params.limit || params.per_page || 10),
  });
  if (params.search) query.set("search", String(params.search));
  if (params.category && params.category !== "Todos") query.set("category", String(params.category));
  if (params.tag) query.set("tag", String(params.tag));
  if (params.isActive !== undefined && params.isActive !== "") {
    query.set("is_active", String(params.isActive));
  }
  if (params.sort_by) query.set("sort_by", String(params.sort_by));
  if (params.sort_dir) query.set("sort_order", String(params.sort_dir));

  const payload = await apiRequest<any>(`/admin/products?${query.toString()}`, {
    auth: true,
  });

  const rawData = payload?.data ?? payload ?? {};
  const rawItems = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.items)
    ? rawData.items
    : [];

  const items = rawItems.map(mapProduct);

  const total = Number(payload?.pagination?.total ?? rawData?.total ?? items.length);
  const limit = Number(params.limit || params.per_page || 10);
  const page = Number(params.page || 1);
  const totalPages = Number(payload?.pagination?.totalPages ?? Math.max(1, Math.ceil(total / limit)));

  const pagination = {
    page,
    limit,
    total,
    totalPages,
  };

  return {
    success: payload?.success ?? true,
    data: items,
    pagination,
    meta: payload?.meta,
  };
};

const create = async (data: UpsertProductData): Promise<Product> => {
  const payload = await apiRequest<{ data: ApiProduct }>("/admin/products", {
    method: "POST",
    auth: true,
    body: {
      name: data.name,
      categoryId: data.categoryId,
      price: data.price,
      originalPrice: data.originalPrice ? data.originalPrice : null,
      tag: data.tag ?? null,
      sku: data.sku ?? null,
      stock: data.stock ?? 0,
      weight: data.weight ?? null,
      warranty: data.warranty ?? null,
      isActive: data.isActive ?? true,
      description: data.description ?? "",
      images: data.image ? [{ url: data.image, alt: data.name }] : [],
    },
  });
  const item = payload?.data ?? payload;
  return mapProduct(item);
};

const update = async (id: number, data: UpsertProductData): Promise<Product> => {
  const payload = await apiRequest<{ data: ApiProduct }>(`/admin/products/${id}`, {
    method: "PUT",
    auth: true,
    body: {
      name: data.name,
      categoryId: data.categoryId,
      price: data.price,
      originalPrice: data.originalPrice ? data.originalPrice : null,
      tag: data.tag ?? null,
      sku: data.sku ?? null,
      stock: data.stock ?? 0,
      weight: data.weight ?? null,
      warranty: data.warranty ?? null,
      isActive: data.isActive ?? true,
      description: data.description ?? "",
      images: data.image ? [{ url: data.image, alt: data.name }] : [],
    },
  });
  const item = payload?.data ?? payload;
  return mapProduct(item);
};

const remove = async (id: number): Promise<void> => {
  await apiRequest(`/admin/products/${id}`, { method: "DELETE", auth: true });
};

const toggleActive = async (id: number, isActive: boolean): Promise<Product> => {
  const payload = await apiRequest<any>(`/admin/products/${id}/status`, {
    method: "PATCH",
    auth: true,
    body: { is_active: isActive },
  });
  const item = payload?.data ?? payload;
  return mapProduct(item);
};

const list = async (params?: ListProductsParams): Promise<Product[]> => {
  const query = new URLSearchParams({ limit: String(params?.limit ?? 50) });
  if (params?.search) query.set("search", params.search);
  if (params?.category && params.category !== "Todos") query.set("category", params.category);
  if (params?.tag) query.set("tag", params.tag);
  if (params?.sortBy) query.set("sort_by", params.sortBy);
  if (params?.sortOrder) query.set("sort_order", params.sortOrder);

  const payload = await apiRequest<any>(`/products?${query.toString()}`);
  return extractPage(payload).items.map(mapProduct);
};

const listFlashDeals = async (): Promise<Product[]> => {
  const query = new URLSearchParams({ tag: "Oferta", limit: "8" });
  const payload = await apiRequest<any>(`/products?${query.toString()}`);
  return extractPage(payload).items.map(mapProduct);
};

const paginate = async (params?: PaginateProductsParams): Promise<Paginated<Product>> => {
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
};

const getById = async (id: number): Promise<Product | null> => {
  try {
    const payload = await apiRequest<{ data: ApiProduct }>(`/products/${id}`);
    return mapProduct(payload.data);
  } catch {
    return null;
  }
};

const adminList = async (params?: AdminListProductsParams, signal?: AbortSignal): Promise<Paginated<Product>> => {
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
};

const listRelated = async (id: number, category: string): Promise<Product[]> => {
  const query = new URLSearchParams({ category, limit: "5" });
  const payload = await apiRequest<any>(`/products?${query.toString()}`);
  const items = extractPage(payload).items.map(mapProduct);
  return items.filter((p) => p.id !== id).slice(0, 4);
};

export const ProductService = {
  getPaginated,
  create,
  update,
  remove,
  delete: remove,
  toggleActive,
  list,
  listFlashDeals,
  paginate,
  getById,
  adminList,
  listRelated,
};

export const productService = ProductService;
