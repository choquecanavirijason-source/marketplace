import { apiRequest } from "@/config/axios";
import type { Product } from "@/types";

export interface ISellerProfile {
  id?: number;
  userId?: string;
  storeName: string;
  storeSlug?: string;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  taxId?: string | null;
  rating?: string | number;
  totalSales?: string | number;
  isVerified?: boolean;
  status?: string;
}

export interface SellerDashboardData {
  totalProducts: number;
  activeProducts: number;
  reputationScore: string;
  salesThisMonth: number;
  grossRevenue: number;
}

export interface UpsertSellerProfileData {
  storeName: string;
  storeSlug?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  taxId?: string;
}

const getProfile = async (): Promise<ISellerProfile | null> => {
  try {
    const res = await apiRequest<any>("/seller/profile", { auth: true });
    return res?.data ?? res ?? null;
  } catch {
    return null;
  }
};

const upsertProfile = async (data: UpsertSellerProfileData): Promise<ISellerProfile> => {
  const res = await apiRequest<any>("/seller/profile", {
    method: "POST",
    auth: true,
    body: data,
  });
  return res?.data ?? res;
};

const getDashboard = async (): Promise<SellerDashboardData> => {
  try {
    const res = await apiRequest<any>("/seller/dashboard", { auth: true });
    return (
      res?.data ??
      res ?? {
        totalProducts: 0,
        activeProducts: 0,
        reputationScore: "5.0",
        salesThisMonth: 0,
        grossRevenue: 0,
      }
    );
  } catch {
    return {
      totalProducts: 0,
      activeProducts: 0,
      reputationScore: "5.0",
      salesThisMonth: 0,
      grossRevenue: 0,
    };
  }
};

const getProducts = async (): Promise<Product[]> => {
  try {
    const res = await apiRequest<any>("/seller/products", { auth: true });
    const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return items;
  } catch {
    return [];
  }
};

export const sellerService = {
  getProfile,
  upsertProfile,
  getDashboard,
  getProducts,
};
