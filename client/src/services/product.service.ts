import type { Product, Paginated } from "@/types";
import { paginated } from "@/types";
import { apiRequest } from "@/config/axios";
import { productsSeed, flashDealsSeed } from "@/infrastructure/data/products.data";
import { readAddedProducts } from "@/shared/lib/marketplaceStorage";

export interface ListProductsParams {
  category?: string;
  search?: string;
}

export interface PaginateProductsParams {
  category?: string;
  search?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

export interface AdminListProductsParams {
  search?: string;
  category?: string;
  isActive?: boolean | "";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface UpsertProductData {
  name: string;
  categoryId: number;
  price: string;
  originalPrice?: string | null;
  tag?: string | null;
  sku?: string | null;
  stock?: number;
  weight?: string | null;
  warranty?: string | null;
  isActive?: boolean;
  description?: string;
  image?: string;
}

export interface ProductService {
  list(params?: ListProductsParams): Promise<Product[]>;
  listFlashDeals(): Promise<Product[]>;
  getById(id: number): Promise<Product | null>;
  paginate(params?: PaginateProductsParams): Promise<Paginated<Product>>;
  adminList(params?: AdminListProductsParams, signal?: AbortSignal): Promise<Paginated<Product>>;
  toggleActive(id: number, isActive: boolean): Promise<Product>;
  delete(id: number): Promise<void>;
  update(id: number, data: UpsertProductData): Promise<Product>;
}

export type ProductRepository = ProductService;

const baseProducts: Product[] = [...productsSeed, ...flashDealsSeed];

const getAllProducts = (): Product[] => {
  return [...baseProducts, ...readAddedProducts()];
};

const paginateInMemory = (products: Product[], page = 1, limit = 10): Paginated<Product> => {
  const start = (page - 1) * limit;
  return {
    items: products.slice(start, start + limit),
    total: products.length,
    currentPage: page,
    lastPage: Math.max(1, Math.ceil(products.length / limit)),
  };
};

export class InMemoryProductService implements ProductService {
  async list(params?: ListProductsParams): Promise<Product[]> {
    let products = getAllProducts();

    if (params?.search) {
      const term = params.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          (p.sku ?? "").toLowerCase().includes(term),
      );
    }

    if (!params?.category || params.category === "Todos") return products;
    return products.filter((p) => p.category === params.category);
  }

  async listFlashDeals(): Promise<Product[]> {
    return [...flashDealsSeed, ...readAddedProducts().filter((p) => p.badge?.toLowerCase() === "nuevo" || p.badge?.toLowerCase() === "oferta")];
  }

  async paginate(params?: PaginateProductsParams): Promise<Paginated<Product>> {
    let products = getAllProducts();

    if (params?.search) {
      const term = params.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          (p.sku ?? "").toLowerCase().includes(term),
      );
    }

    if (params?.category && params.category !== "Todos") {
      products = products.filter((p) => p.category.toLowerCase() === params.category?.toLowerCase());
    }

    if (params?.tag) {
      const tags = params.tag.split(",").map((t) => t.trim().toLowerCase());
      products = products.filter((p) => p.badge && tags.includes(p.badge.toLowerCase()));
    }

    return paginateInMemory(products, params?.page, params?.limit ?? 12);
  }

  async getById(id: number): Promise<Product | null> {
    return getAllProducts().find((p) => p.id === id) ?? null;
  }

  async adminList(params?: AdminListProductsParams): Promise<Paginated<Product>> {
    let products = getAllProducts();

    if (params?.search) {
      const term = params.search.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(term));
    }
    if (params?.category) {
      products = products.filter((p) => p.category.toLowerCase() === params.category?.toLowerCase());
    }
    if (params?.isActive !== undefined && params.isActive !== "") {
      products = products.filter((p) => p.isActive === params.isActive);
    }

    if (params?.sortBy) {
      const field = params.sortBy;
      const order = params.sortOrder === "desc" ? "desc" : "asc";
      products.sort((a, b) => {
        let valA: any = "";
        let valB: any = "";
        switch (field) {
          case "name":
            valA = (a.name || "").toLowerCase();
            valB = (b.name || "").toLowerCase();
            break;
          case "category":
            valA = (a.category || "").toLowerCase();
            valB = (b.category || "").toLowerCase();
            break;
          case "price":
            valA = Number(a.price) || 0;
            valB = Number(b.price) || 0;
            break;
          case "stock":
            valA = Number(a.stock) || 0;
            valB = Number(b.stock) || 0;
            break;
          case "isActive":
            valA = a.isActive ? 1 : 0;
            valB = b.isActive ? 1 : 0;
            break;
          default:
            valA = (a.name || "").toLowerCase();
            valB = (b.name || "").toLowerCase();
            break;
        }
        if (valA < valB) return order === "asc" ? -1 : 1;
        if (valA > valB) return order === "asc" ? 1 : -1;
        return 0;
      });
    }

    return paginateInMemory(products, params?.page, params?.limit);
  }

  async toggleActive(id: number, isActive: boolean): Promise<Product> {
    const product = getAllProducts().find((p) => p.id === id);
    if (!product) throw new Error(`Producto ${id} no encontrado`);
    return { ...product, isActive, inStock: isActive && product.inStock };
  }

  async delete(id: number): Promise<void> {
    const product = getAllProducts().find((p) => p.id === id);
    if (!product) throw new Error(`Producto ${id} no encontrado`);
  }

  async update(id: number, data: UpsertProductData): Promise<Product> {
    const product = getAllProducts().find((p) => p.id === id);
    if (!product) throw new Error(`Producto ${id} no encontrado`);

    return {
      ...product,
      name: data.name,
      categoryId: data.categoryId,
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
      badge: data.tag ?? undefined,
      sku: data.sku ?? undefined,
      stock: data.stock ?? 0,
      inStock: (data.stock ?? 0) > 0,
      isActive: data.isActive ?? true,
      weight: data.weight ?? undefined,
      warranty: data.warranty ?? undefined,
      description: data.description,
      image: data.image ?? product.image,
    };
  }
}

export const InMemoryProductRepository = InMemoryProductService;

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

interface PaginatedPayload<T> {
  data: T[];
  meta?: {
    total?: number;
    current_page?: number;
    last_page?: number;
  };
}

const fetchProducts = async (search = ""): Promise<Product[]> => {
  const query = new URLSearchParams({ limit: "200" });
  if (search) query.set("search", search);

  const payload = await apiRequest<PaginatedPayload<ApiProduct>>(`/products?${query.toString()}`);
  return payload.data.map(mapProduct);
};

const FLASH_DEAL_TAGS = ["Oferta", "Nuevo"];

export class HttpProductService implements ProductService {
  async list(params?: ListProductsParams): Promise<Product[]> {
    const products = await fetchProducts(params?.search ?? "");

    if (!params?.category || params.category === "Todos") return products;
    return products.filter((p) => p.category === params.category);
  }

  async listFlashDeals(): Promise<Product[]> {
    const products = await fetchProducts();
    return products.filter((p) => {
      const tag = p.badge?.toLowerCase();
      return tag !== undefined && FLASH_DEAL_TAGS.some((t) => t.toLowerCase() === tag);
    });
  }

  async paginate(params?: PaginateProductsParams): Promise<Paginated<Product>> {
    const query = new URLSearchParams({
      limit: String(params?.limit ?? 12),
      page: String(params?.page ?? 1),
    });

    if (params?.category) query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    if (params?.tag) query.set("tag", params.tag);

    const payload = await apiRequest<PaginatedPayload<ApiProduct>>(`/products?${query.toString()}`);
    return paginated({ data: payload.data.map(mapProduct), meta: payload.meta });
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
    if (params?.category) query.set("category", params.category);
    if (params?.isActive !== undefined && params.isActive !== "") {
      query.set("is_active", String(params.isActive));
    }
    if (params?.sortBy) query.set("sort_by", params.sortBy);
    if (params?.sortOrder) query.set("sort_order", params.sortOrder);

    const payload = await apiRequest<PaginatedPayload<ApiProduct>>(`/admin/products?${query.toString()}`, {
      auth: true,
      signal,
    });

    return paginated({ data: payload.data.map(mapProduct), meta: payload.meta });
  }

  async toggleActive(id: number, isActive: boolean): Promise<Product> {
    const payload = await apiRequest<{ data: ApiProduct }>(`/admin/products/${id}/status`, {
      method: "PATCH",
      auth: true,
      body: { is_active: isActive },
    });
    return mapProduct(payload.data);
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
}

export const HttpProductRepository = HttpProductService;
