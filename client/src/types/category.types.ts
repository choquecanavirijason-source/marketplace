export interface ICategory {
  id: number;
  name: string;
  slug: string;
  products_count?: string | number;
  count?: number;
  parent_id?: number | null;
  description?: string | null;
  image_url?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  icon?: any;
  color?: string;
}

export interface ICategoryRequest {
  name: string;
  slug?: string;
  parent_id?: number | null;
  description?: string | null;
  image_url?: string | null;
  is_active?: boolean;
}

export type Category = ICategory;
export type CategoryInput = ICategoryRequest;