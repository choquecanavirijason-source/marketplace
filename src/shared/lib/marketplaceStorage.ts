import type { Product } from "@/domain/entities/Product";

export const MARKETPLACE_PRODUCTS_KEY = "ferromax-marketplace-products";
export const MARKETPLACE_AUTH_KEY = "ferromax-marketplace-auth";

export function readAddedProducts(): Product[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(MARKETPLACE_PRODUCTS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeAddedProducts(products: Product[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MARKETPLACE_PRODUCTS_KEY, JSON.stringify(products));
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(MARKETPLACE_AUTH_KEY) === "true";
}

export function setAuthenticated(value: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MARKETPLACE_AUTH_KEY, String(value));
}
