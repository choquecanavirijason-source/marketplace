import { apiRequest } from "@/infrastructure/http/client";
import type {
  AdminListProductsParams,
  ListProductsParams,
  ProductRepository,
  UpsertProductData,
} from "@/domain/repositories/ProductRepository";
import type { Product } from "@/domain/entities/Product";
import { paginated, type Paginated } from "@/domain/entities/Order";

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

function mapProduct(p: ApiProduct): Product {
  return {
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
  };
}

interface PaginatedPayload<T> {
  data: T[];
  meta?: {
    total?: number;
    current_page?: number;
    last_page?: number;
  };
}

async function fetchProducts(search = ""): Promise<Product[]> {
  const query = new URLSearchParams({ limit: "200" });
  if (search) query.set("search", search);

  const payload = await apiRequest<PaginatedPayload<ApiProduct>>(`/products?${query.toString()}`);
  return payload.data.map(mapProduct);
}

const FLASH_DEAL_TAGS = ["Oferta", "Nuevo"];

export class HttpProductRepository implements ProductRepository {
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

  async getById(id: number): Promise<Product | null> {
    try {
      const payload = await apiRequest<{ data: ApiProduct }>(`/products/${id}`);
      return mapProduct(payload.data);
    } catch {
      return null;
    }
  }

  async adminList(params?: AdminListProductsParams): Promise<Paginated<Product>> {
    const query = new URLSearchParams({
      limit: String(params?.limit ?? 10),
      page: String(params?.page ?? 1),
    });

    if (params?.search) query.set("search", params.search);
    if (params?.category) query.set("category", params.category);
    if (params?.isActive !== undefined && params.isActive !== "") {
      query.set("is_active", String(params.isActive));
    }

    const payload = await apiRequest<PaginatedPayload<ApiProduct>>(`/admin/products?${query.toString()}`, {
      auth: true,
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