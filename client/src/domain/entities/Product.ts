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
