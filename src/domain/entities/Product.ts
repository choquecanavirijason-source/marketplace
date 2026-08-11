export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  category: string;
  badge?: string;
  weight?: string;
  inStock: boolean;
  sku?: string;
  tags?: string[];
  description?: string;
  shelfLife?: string;
}
