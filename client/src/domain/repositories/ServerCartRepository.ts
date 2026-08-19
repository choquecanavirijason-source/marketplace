export interface ServerCartProduct {
  id: number;
  slug: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  images: string[];
  stock: number;
  inStock: boolean;
  category: string | null;
}

export interface ServerCartItem {
  id: number;
  productId: number;
  quantity: number;
  product: ServerCartProduct;
}

export interface ServerCartRepository {
  getCart(): Promise<ServerCartItem[]>;
  addItem(productId: number, quantity: number): Promise<ServerCartItem>;
  updateQuantity(cartItemId: number, quantity: number): Promise<ServerCartItem>;
  removeItem(cartItemId: number): Promise<void>;
  clearCart(): Promise<void>;
}