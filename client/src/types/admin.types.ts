import type { Order } from "./order.types";
import type { Product } from "./product.types";

export interface MonthlyMetric {
  month: string;
  label: string;
  totalOrders: number;
  revenue: number;
}

export interface TopProductMetric {
  productId: number;
  name: string;
  totalSold: number;
  totalRevenue: number;
}

export interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalClients: number;
  revenue: number;
  averageOrder: number;
  ordersByStatus: Record<string, number>;
  ordersByMonth: MonthlyMetric[];
  topProducts: TopProductMetric[];
  recentOrders: Order[];
  recentProducts: Product[];
}
