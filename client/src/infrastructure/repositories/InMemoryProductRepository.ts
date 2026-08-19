import type {
  AdminListProductsParams,
  ListProductsParams,
  PaginateProductsParams,
  ProductRepository,
  UpsertProductData,
} from "@/domain/repositories/ProductRepository";
import type { Paginated } from "@/domain/entities/Order";
import type { Product } from "@/domain/entities/Product";
import { flashDealsSeed, productsSeed } from "@/infrastructure/data/products.data";
import { readAddedProducts } from "@/shared/lib/marketplaceStorage";

const baseProducts: Product[] = [...productsSeed, ...flashDealsSeed];

function getAllProducts(): Product[] {
  return [...baseProducts, ...readAddedProducts()];
}

function paginate(products: Product[], page = 1, limit = 10): Paginated<Product> {
  const start = (page - 1) * limit;
  return {
    items: products.slice(start, start + limit),
    total: products.length,
    currentPage: page,
    lastPage: Math.max(1, Math.ceil(products.length / limit)),
  };
}

export class InMemoryProductRepository implements ProductRepository {
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

    return paginate(products, params?.page, params?.limit ?? 12);
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

    return paginate(products, params?.page, params?.limit);
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
