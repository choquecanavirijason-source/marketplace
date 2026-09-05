import type { Order, OrderItem, OrderStatus, Paginated } from "@/types";
import { paginated } from "@/types";
import { apiRequest } from "@/config/axios";

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

export interface OrderService {
  create(input: CreateOrderInput): Promise<Order>;
  listMine(): Promise<Order[]>;
  getById(id: number): Promise<Order | null>;
  adminList(params?: AdminListOrdersParams): Promise<Paginated<Order>>;
  adminUpdateStatus(id: number, status: OrderStatus): Promise<Order>;
}

export type OrderRepository = OrderService;

interface ApiOrderItem {
  id: number;
  productId?: number;
  product_id?: number;
  name?: string;
  productName?: string;
  price?: number;
  unitPrice?: number;
  image?: string | null;
  productImage?: string | null;
  quantity: number;
  subtotal: number;
}

interface ApiOrder {
  id: number;
  orderNumber?: string;
  order_number?: string;
  status: OrderStatus;
  subtotal: number;
  shipping?: number;
  shippingCost?: number;
  total: number;
  shippingAddress?: string | null;
  shipping_address?: string | null;
  shippingCity?: string | null;
  shipping_city?: string | null;
  shippingPhone?: string | null;
  shipping_phone?: string | null;
  notes?: string | null;
  user?: {
    id: any;
    name?: string;
    email?: string;
  } | null;
  items?: ApiOrderItem[];
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

interface ApiOrderPayload {
  data: ApiOrder | ApiOrder[] | { items: ApiOrder[]; total: number; page: number; totalPages: number };
  meta?: {
    total?: number;
    current_page?: number;
    last_page?: number;
  };
}

const mapItem = (i: ApiOrderItem): OrderItem => ({
  id: i.id,
  productId: i.productId ?? i.product_id ?? 0,
  name: i.name ?? i.productName ?? 'Producto',
  price: i.price ?? i.unitPrice ?? 0,
  image: i.image ?? i.productImage ?? null,
  quantity: i.quantity,
  subtotal: i.subtotal,
});

const mapOrder = (o: ApiOrder): Order => ({
  id: o.id,
  orderNumber: o.orderNumber ?? o.order_number ?? `FM-${o.id}`,
  status: o.status,
  subtotal: Number(o.subtotal ?? 0),
  shipping: Number(o.shipping ?? o.shippingCost ?? 0),
  total: Number(o.total ?? 0),
  shippingAddress: o.shippingAddress ?? o.shipping_address ?? null,
  shippingCity: o.shippingCity ?? o.shipping_city ?? null,
  shippingPhone: o.shippingPhone ?? o.shipping_phone ?? null,
  notes: o.notes ?? null,
  user: o.user ? { id: Number(o.user.id) || 1, name: o.user.name ?? 'Cliente', email: o.user.email ?? '' } : undefined,
  items: (o.items ?? []).map(mapItem),
  createdAt: o.createdAt ?? o.created_at ?? new Date().toISOString(),
});

export class HttpOrderService implements OrderService {
  async create(input: CreateOrderInput): Promise<Order> {
    const payload = await apiRequest<{ data: ApiOrder }>("/orders", {
      method: "POST",
      auth: true,
      body: {
        items: input.items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
        shipping_address: input.shippingAddress,
        shipping_city: input.shippingCity,
        shipping_phone: input.shippingPhone,
        notes: input.notes,
      },
    });
    return mapOrder(payload.data);
  }

  async listMine(): Promise<Order[]> {
    const payload = await apiRequest<ApiOrderPayload>("/orders?limit=50", { auth: true });
    const data = Array.isArray(payload.data) ? payload.data : [];
    return data.map(mapOrder);
  }

  async getById(id: number): Promise<Order | null> {
    try {
      const payload = await apiRequest<{ data: ApiOrder }>(`/orders/${id}`, { auth: true });
      return mapOrder(payload.data);
    } catch {
      return null;
    }
  }

  async adminList(params?: AdminListOrdersParams): Promise<Paginated<Order>> {
    const query = new URLSearchParams({ limit: String(params?.limit ?? 15) });

    if (params?.status && params.status !== "todos") query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", String(params.page));

    const payload = await apiRequest<ApiOrderPayload>(`/admin/orders?${query.toString()}`, {
      auth: true,
    });

    let rawList: ApiOrder[] = [];
    let metaTotal = 0;
    let metaPage = params?.page ?? 1;
    let metaLastPage = 1;

    if (payload.data && typeof payload.data === "object" && "items" in payload.data && Array.isArray((payload.data as any).items)) {
      rawList = (payload.data as any).items;
      metaTotal = (payload.data as any).total ?? rawList.length;
      metaPage = (payload.data as any).page ?? 1;
      metaLastPage = (payload.data as any).totalPages ?? 1;
    } else if (Array.isArray(payload.data)) {
      rawList = payload.data;
      metaTotal = payload.meta?.total ?? rawList.length;
      metaPage = payload.meta?.current_page ?? 1;
      metaLastPage = payload.meta?.last_page ?? 1;
    }

    return paginated({
      data: rawList.map(mapOrder),
      meta: {
        total: metaTotal,
        current_page: metaPage,
        last_page: metaLastPage,
      },
    });
  }

  async adminUpdateStatus(id: number, status: OrderStatus): Promise<Order> {
    const payload = await apiRequest<{ data: ApiOrder }>(`/admin/orders/${id}/status`, {
      method: "PATCH",
      auth: true,
      body: { status },
    });
    return mapOrder(payload.data);
  }
}

export const HttpOrderRepository = HttpOrderService;

export class InMemoryOrderService implements OrderService {
  private orders: Order[] = [];

  async create(input: CreateOrderInput): Promise<Order> {
    const newOrder: Order = {
      id: Date.now(),
      orderNumber: `ORD-${Date.now()}`,
      status: "pendiente",
      subtotal: 100,
      shipping: 0,
      total: 100,
      shippingAddress: input.shippingAddress ?? null,
      shippingCity: input.shippingCity ?? null,
      shippingPhone: input.shippingPhone ?? null,
      notes: input.notes ?? null,
      items: input.items.map((i) => ({
        id: i.productId,
        productId: i.productId,
        name: "Producto",
        price: 100,
        image: null,
        quantity: i.quantity,
        subtotal: 100 * i.quantity,
      })),
      createdAt: new Date().toISOString(),
    };
    this.orders.push(newOrder);
    return newOrder;
  }

  async listMine(): Promise<Order[]> {
    return this.orders;
  }

  async getById(id: number): Promise<Order | null> {
    return this.orders.find((o) => o.id === id) ?? null;
  }

  async adminList(params?: AdminListOrdersParams): Promise<Paginated<Order>> {
    return paginated({
      data: this.orders,
      meta: {
        total: this.orders.length,
        current_page: params?.page ?? 1,
        last_page: 1,
      },
    });
  }

  async adminUpdateStatus(id: number, status: OrderStatus): Promise<Order> {
    const order = this.orders.find((o) => o.id === id);
    if (!order) throw new Error("Order not found");
    order.status = status;
    return order;
  }
}

export const InMemoryOrderRepository = InMemoryOrderService;
