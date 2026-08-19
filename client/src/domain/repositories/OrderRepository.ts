import type { Order, OrderStatus, Paginated } from "../entities/Order";

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

export interface OrderRepository {
  create(input: CreateOrderInput): Promise<Order>;
  listMine(): Promise<Order[]>;
  getById(id: number): Promise<Order | null>;
  adminList(params?: AdminListOrdersParams): Promise<Paginated<Order>>;
  adminUpdateStatus(id: number, status: OrderStatus): Promise<Order>;
}