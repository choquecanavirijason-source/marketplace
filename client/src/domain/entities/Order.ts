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

export interface Paginated<T> {
  items: T[];
  total: number;
  currentPage: number;
  lastPage: number;
}

export function paginated<T>(payload: {
  data: T[];
  meta?: {
    total?: number;
    current_page?: number;
    last_page?: number;
  };
}): Paginated<T> {
  return {
    items: payload.data,
    total: payload.meta?.total ?? payload.data.length,
    currentPage: payload.meta?.current_page ?? 1,
    lastPage: payload.meta?.last_page ?? 1,
  };
}