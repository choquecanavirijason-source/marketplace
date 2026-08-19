import { apiRequest } from "@/infrastructure/http/client";
import type { AdminRepository, AdminStats } from "@/domain/repositories/AdminRepository";
import type { Order } from "@/domain/entities/Order";
import type { Product } from "@/domain/entities/Product";

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

function mapRecentOrder(o: ApiStats["data"]["recent_orders"][number]): Order {
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
  };
}

function mapRecentProduct(p: ApiStats["data"]["recent_products"][number]): Product {
  return {
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
  };
}

export class HttpAdminRepository implements AdminRepository {
  async getStats(): Promise<AdminStats> {
    const payload = await apiRequest<ApiStats>("/admin/stats", { auth: true });

    return {
      totalProducts: payload.data.total_products,
      totalOrders: payload.data.total_orders,
      totalClients: payload.data.total_clients,
      revenue: payload.data.revenue,
      averageOrder: payload.data.average_order,
      ordersByStatus: payload.data.orders_by_status,
      ordersByMonth: payload.data.orders_by_month.map((m) => ({
        month: m.month,
        label: m.label,
        totalOrders: m.total_orders,
        revenue: m.revenue,
      })),
      topProducts: payload.data.top_products.map((p) => ({
        productId: p.product_id,
        name: p.name,
        totalSold: p.total_sold,
        totalRevenue: p.total_revenue,
      })),
      recentOrders: payload.data.recent_orders.map(mapRecentOrder),
      recentProducts: payload.data.recent_products.map(mapRecentProduct),
    };
  }
}