import { apiRequest } from "@/infrastructure/http/client";
import type {
  AdminListOrdersParams,
  CreateOrderInput,
  OrderRepository,
} from "@/domain/repositories/OrderRepository";
import type { Order, OrderItem, OrderStatus, Paginated } from "@/domain/entities/Order";
import { paginated } from "@/domain/entities/Order";

interface ApiOrderItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  subtotal: number;
}

interface ApiOrder {
  id: number;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  total: number;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_phone: string | null;
  notes: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
  items: ApiOrderItem[];
  created_at: string;
  updated_at: string;
}

interface ApiOrderPayload {
  data: ApiOrder | ApiOrder[];
  meta?: {
    total?: number;
    current_page?: number;
    last_page?: number;
  };
}

function mapItem(i: ApiOrderItem): OrderItem {
  return {
    id: i.id,
    productId: i.product_id,
    name: i.name,
    price: i.price,
    image: i.image,
    quantity: i.quantity,
    subtotal: i.subtotal,
  };
}

function mapOrder(o: ApiOrder): Order {
  return {
    id: o.id,
    orderNumber: o.order_number,
    status: o.status,
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    shippingAddress: o.shipping_address,
    shippingCity: o.shipping_city,
    shippingPhone: o.shipping_phone,
    notes: o.notes,
    user: o.user ?? undefined,
    items: (o.items ?? []).map(mapItem),
    createdAt: o.created_at,
  };
}

export class HttpOrderRepository implements OrderRepository {
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

    const data = Array.isArray(payload.data) ? payload.data : [];
    return paginated({
      data: data.map(mapOrder),
      meta: payload.meta,
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