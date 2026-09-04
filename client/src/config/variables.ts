

export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export const TOKEN_NAME: string = "ferromax-token";
export const AUTH_TOKEN_KEY: string = TOKEN_NAME;
export const AUTH_REFRESH_TOKEN_KEY: string = "ferromax-refresh-token";
export const AUTH_USER_KEY: string = "ferromax-user";
export const AUTH_PERMISSIONS_KEY: string = "ferromax-permissions";
export const CUSTOMER_AUTH_KEY: string = "ferromax-customer-auth";
export const CUSTOMERS_KEY: string = "ferromax-customers";
export const MARKETPLACE_PRODUCTS_KEY: string = "ferromax-marketplace-products";
export const CART_STORAGE_KEY: string = "ferromax_cart_items";
export const FAVORITES_STORAGE_KEY: string = "ferromax_favorites";
export const RECENT_SEARCHES_KEY: string = "ferromax_recent_searches";

export const AUTH_COOKIE_EXPIRES_DAYS: number = 7;

export const APP_CONFIG = {
  name: "FerroMax Marketplace",
  description: "Plataforma de ferretería, herramientas y materiales de construcción",
  defaultCurrency: "ARS",
  currencySymbol: "$",
  defaultLocale: "es-AR",
  apiTimeoutMs: 15000,
  pagination: {
    defaultLimit: 12,
    adminLimit: 10,
  },
  sessionQueryStaleTimeMs: 1000 * 60 * 5,
} as const;
