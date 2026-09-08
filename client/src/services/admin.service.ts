import { apiRequest } from "@/config/axios";
import type { Order, Product, AdminStats } from "@/types";

interface ApiStats {
  data: {
    total_products: number;
    total_orders: number;
    total_clients: number;
    revenue: number;
    average_order: number;
    orders_by_status: Record<string, number>;
    orders_by_month: Array<{
      month: string;
      label: string;
      total_orders: number;
      revenue: number;
    }>;
    top_products: Array<{
      product_id: number;
      name: string;
      total_sold: number;
      total_revenue: number;
    }>;
    recent_orders: Array<{
      id: number;
      order_number: string;
      status: Order["status"];
      subtotal: number;
      shipping: number;
      total: number;
      shipping_address: string | null;
      shipping_city: string | null;
      shipping_phone: string | null;
      notes: string | null;
      user?: { id: number; name: string; email: string } | null;
      items: Array<{
        id: number;
        product_id: number;
        name: string;
        price: number;
        image: string | null;
        quantity: number;
        subtotal: number;
      }>;
      created_at: string;
      updated_at: string;
    }>;
    recent_products: Array<{
      id: number;
      name: string;
      price: number;
      original_price: number | null;
      tag: string | null;
      sku: string | null;
      in_stock: boolean;
      image: string | null;
      images: string[];
      category: string | null;
      rating: number;
      reviews_count: number;
    }>;
  };
}

const mapRecentOrder = (o: ApiStats["data"]["recent_orders"][number]): Order => ({
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
  items: o.items.map((i) => ({
    id: i.id,
    productId: i.product_id,
    name: i.name,
    price: i.price,
    image: i.image,
    quantity: i.quantity,
    subtotal: i.subtotal,
  })),
  createdAt: o.created_at,
});

const mapRecentProduct = (p: ApiStats["data"]["recent_products"][number]): Product => ({
  id: p.id,
  name: p.name,
  price: p.price,
  originalPrice: p.original_price ?? undefined,
  rating: p.rating,
  reviews: p.reviews_count,
  image: p.image ?? "",
  images: p.images,
  category: p.category ?? "",
  badge: p.tag ?? undefined,
  inStock: p.in_stock,
  sku: p.sku ?? undefined,
});

export class AdminService {
  async getStats(): Promise<AdminStats> {
    const payload = await apiRequest<any>("/admin/stats", { auth: true });
    const raw = payload?.data || payload || {};

    const totalProducts = Number(raw.total_products ?? raw.totalProducts ?? 0);
    const totalOrders = Number(raw.total_orders ?? raw.totalOrders ?? 0);
    const totalClients = Number(raw.total_clients ?? raw.totalClients ?? 0);
    const revenue = Number(raw.revenue ?? 0);
    const averageOrder = Number(raw.average_order ?? raw.averageOrder ?? (totalOrders > 0 ? revenue / totalOrders : 0));
    const ordersByStatus = raw.orders_by_status ?? raw.ordersByStatus ?? {};

    const rawMonths = raw.orders_by_month ?? raw.ordersByMonth ?? [];
    const ordersByMonth = Array.isArray(rawMonths)
      ? rawMonths.map((m: any) => ({
          month: String(m.month ?? ""),
          label: String(m.label ?? m.month ?? ""),
          totalOrders: Number(m.total_orders ?? m.totalOrders ?? 0),
          revenue: Number(m.revenue ?? 0),
        }))
      : [];

    const rawTop = raw.top_products ?? raw.topProducts ?? [];
    const topProducts = Array.isArray(rawTop)
      ? rawTop.map((p: any) => ({
          productId: Number(p.product_id ?? p.productId ?? 0),
          name: String(p.name ?? ""),
          totalSold: Number(p.total_sold ?? p.totalSold ?? 0),
          totalRevenue: Number(p.total_revenue ?? p.totalRevenue ?? 0),
        }))
      : [];

    const rawOrders = raw.recent_orders ?? raw.recentOrders ?? [];
    const recentOrders = Array.isArray(rawOrders) ? rawOrders.map(mapRecentOrder) : [];

    const rawProd = raw.recent_products ?? raw.recentProducts ?? [];
    const recentProducts = Array.isArray(rawProd) ? rawProd.map(mapRecentProduct) : [];

    return {
      totalProducts,
      totalOrders,
      totalClients,
      revenue,
      averageOrder,
      ordersByStatus,
      ordersByMonth,
      topProducts,
      recentOrders,
      recentProducts,
    };
  }
}

export const adminService = new AdminService();
