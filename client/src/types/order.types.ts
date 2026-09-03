export const ORDER_STATUSES = [
  "pendiente",
  "confirmado",
  "enviado",
  "entregado",
  "cancelado",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingPhone: string | null;
  notes: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  items: OrderItem[];
  createdAt: string;
}

export interface CreateOrderInput {
  items: Array<{ productId: number; quantity: number }>;
  shippingAddress?: string;
  shippingCity?: string;
  shippingPhone?: string;
  notes?: string;
}

export interface AdminListOrdersParams {
  status?: OrderStatus | "todos";
  search?: string;
  page?: number;
  limit?: number;
}
