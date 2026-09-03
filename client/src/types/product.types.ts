export interface Product {
  id: number;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  category: string;
  categoryId?: number;
  badge?: string;
  weight?: string;
  inStock: boolean;
  stock?: number;
  isActive?: boolean;
  sku?: string;
  tags?: string[];
  description?: string;
  warranty?: string;
}

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
