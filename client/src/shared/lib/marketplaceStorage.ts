import type { Product } from "@/types";
import { getCookie, setCookie, removeCookie } from "./cookies";
export {
  MARKETPLACE_PRODUCTS_KEY,
  CUSTOMER_AUTH_KEY,
  CUSTOMERS_KEY,
  AUTH_TOKEN_KEY,
  AUTH_REFRESH_TOKEN_KEY,
  AUTH_USER_KEY,
  AUTH_PERMISSIONS_KEY,
  TOKEN_NAME,
} from "@/config";
import { MARKETPLACE_PRODUCTS_KEY, CUSTOMER_AUTH_KEY, CUSTOMERS_KEY, AUTH_TOKEN_KEY, AUTH_REFRESH_TOKEN_KEY, AUTH_USER_KEY, AUTH_PERMISSIONS_KEY } from "@/config";

export const readAddedProducts = (): Product[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(MARKETPLACE_PRODUCTS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeAddedProducts = (products: Product[]): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MARKETPLACE_PRODUCTS_KEY, JSON.stringify(products));
};

export interface Customer {
  name: string;
  email: string;
  password: string;
}

export const DEMO_CUSTOMER: Customer = {
  name: "Cliente Demo",
  email: "cliente@ferromax.com",
  password: "cliente123",
};

export const DEMO_ADMIN: Customer = {
  name: "Admin Demo",
  email: "admin@ferromax.com",
  password: "admin123",
};

const readCustomers = (): Customer[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CUSTOMERS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as Customer[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCustomers = (customers: Customer[]): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
};

const findCustomerByEmail = (email: string): Customer | undefined => {
  const normalized = email.toLowerCase();
  if (normalized === DEMO_CUSTOMER.email) return DEMO_CUSTOMER;
  if (normalized === DEMO_ADMIN.email) return DEMO_ADMIN;
  return readCustomers().find((c) => c.email.toLowerCase() === normalized);
};

export const isCustomerAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  return (
    getCookie(CUSTOMER_AUTH_KEY) === "true" ||
    window.localStorage.getItem(CUSTOMER_AUTH_KEY) === "true" ||
    Boolean(getAuthToken())
  );
};

export const setCustomerAuthenticated = (value: boolean): void => {
  if (typeof window === "undefined") return;
  if (value) {
    setCookie(CUSTOMER_AUTH_KEY, "true", 7);
    window.localStorage.setItem(CUSTOMER_AUTH_KEY, "true");
  } else {
    removeCookie(CUSTOMER_AUTH_KEY);
    window.localStorage.removeItem(CUSTOMER_AUTH_KEY);
  }
};

export const getCurrentCustomerEmail = (): string | null => {
  if (typeof window === "undefined") return null;
  const user = getCurrentUser();
  if (user?.email) return user.email;
  return getCookie(`${CUSTOMER_AUTH_KEY}-email`) ?? window.localStorage.getItem(`${CUSTOMER_AUTH_KEY}-email`);
};

const setCurrentCustomerEmail = (email: string | null): void => {
  if (typeof window === "undefined") return;
  if (email) {
    setCookie(`${CUSTOMER_AUTH_KEY}-email`, email, 7);
    window.localStorage.setItem(`${CUSTOMER_AUTH_KEY}-email`, email);
  } else {
    removeCookie(`${CUSTOMER_AUTH_KEY}-email`);
    window.localStorage.removeItem(`${CUSTOMER_AUTH_KEY}-email`);
  }
};

export const getCurrentCustomerName = (): string | null => {
  if (typeof window === "undefined") return null;

  const user = getCurrentUser();
  if (user?.name) return user.name;

  const stored = getCookie(`${CUSTOMER_AUTH_KEY}-name`) ?? window.localStorage.getItem(`${CUSTOMER_AUTH_KEY}-name`);
  if (stored) return stored;

  const email = getCurrentCustomerEmail();
  if (!email) return null;

  const known = findCustomerByEmail(email);
  if (known) {
    setCurrentCustomerName(known.name);
    return known.name;
  }

  return null;
};

const setCurrentCustomerName = (name: string | null): void => {
  if (typeof window === "undefined") return;
  if (name) {
    setCookie(`${CUSTOMER_AUTH_KEY}-name`, name, 7);
    window.localStorage.setItem(`${CUSTOMER_AUTH_KEY}-name`, name);
  } else {
    removeCookie(`${CUSTOMER_AUTH_KEY}-name`);
    window.localStorage.removeItem(`${CUSTOMER_AUTH_KEY}-name`);
  }
};

export const registerCustomer = (customer: Customer): { ok: true } | { ok: false; error: string } => {
  const email = customer.email.trim().toLowerCase();
  const customers = readCustomers();

  if (customers.some((c) => c.email.toLowerCase() === email)) {
    return { ok: false, error: "Ya existe una cuenta con ese correo." };
  }

  writeCustomers([...customers, { ...customer, email }]);
  setCustomerAuthenticated(true);
  setCurrentCustomerEmail(email);
  setCurrentCustomerName(customer.name.trim());
  return { ok: true };
};

export const loginCustomer = (email: string, password: string): { ok: true } | { ok: false; error: string } => {
  const normalizedEmail = email.trim().toLowerCase();
  const customer = findCustomerByEmail(normalizedEmail);

  if (!customer || customer.password !== password) {
    return { ok: false, error: "Correo o contraseña incorrectos." };
  }

  setCustomerAuthenticated(true);
  setCurrentCustomerEmail(normalizedEmail);
  setCurrentCustomerName(customer.name);
  return { ok: true };
};

export const logoutCustomer = (): void => {
  setCustomerAuthenticated(false);
  setCurrentCustomerEmail(null);
  setCurrentCustomerName(null);
  setAuthToken(null);
  setRefreshToken(null);
  setCurrentUser(null);
  setAuthPermissions([]);
};

export interface CurrentUser {
  id: number | string;
  name: string;
  email: string;
  roleName: string | null;
  role?: string | null;
  phone?: string | null;
  mobileNumber?: string | null;
  address?: string | null;
  firstName?: string;
  lastName?: string;
  type?: string | null;
  status?: string | null;
  roles?: string[];
  country?: string | null;
  phoneCountry?: string | null;
  avatarUrl?: string | null;
  completionPct?: number;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  businessProfile?: {
    legalName?: string;
    tradeName?: string;
    taxId?: string;
    legalType?: string;
    reviewStatus?: string;
    billingEmail?: string;
    fiscalAddress?: string;
  } | null;
  sellerProfile?: {
    id?: number;
    userId?: string;
    storeName: string;
    storeSlug: string;
    description?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    taxId?: string | null;
    rating?: string | number;
    totalSales?: string | number;
    isVerified?: boolean;
    status?: string;
  } | null;
  onboardingStates?: Array<{
    stepCode: string;
    status: string;
  }> | null;
}

export type DashboardMode = "buyer" | "seller" | "company" | "admin";
export const ACTIVE_MODE_KEY = "ferromax-active-mode";

export const getSavedActiveMode = (userId?: string | number): DashboardMode => {
  if (typeof window === "undefined") return "buyer";
  try {
    if (userId) {
      const userCookie = getCookie(`${ACTIVE_MODE_KEY}-${userId}`) as DashboardMode;
      if (
        userCookie === "buyer" ||
        userCookie === "seller" ||
        userCookie === "company" ||
        userCookie === "admin"
      ) {
        return userCookie;
      }
      const userLocal = window.localStorage.getItem(`${ACTIVE_MODE_KEY}-${userId}`) as DashboardMode;
      if (
        userLocal === "buyer" ||
        userLocal === "seller" ||
        userLocal === "company" ||
        userLocal === "admin"
      ) {
        return userLocal;
      }
    }

    const cookieMode = getCookie(ACTIVE_MODE_KEY) as DashboardMode;
    if (
      cookieMode === "buyer" ||
      cookieMode === "seller" ||
      cookieMode === "company" ||
      cookieMode === "admin"
    ) {
      return cookieMode;
    }
    const localMode = window.localStorage.getItem(ACTIVE_MODE_KEY) as DashboardMode;
    if (
      localMode === "buyer" ||
      localMode === "seller" ||
      localMode === "company" ||
      localMode === "admin"
    ) {
      return localMode;
    }
  } catch {}
  return "buyer";
};

export const setSavedActiveMode = (mode: DashboardMode, userId?: string | number): void => {
  if (typeof window === "undefined") return;
  try {
    setCookie(ACTIVE_MODE_KEY, mode, 30);
    window.localStorage.setItem(ACTIVE_MODE_KEY, mode);
    if (userId) {
      setCookie(`${ACTIVE_MODE_KEY}-${userId}`, mode, 30);
      window.localStorage.setItem(`${ACTIVE_MODE_KEY}-${userId}`, mode);
    }
  } catch {}
};

export const resolveValidMode = (
  desiredMode: DashboardMode | null | undefined,
  user: CurrentUser | null,
  computedRoles?: {
    isAdmin?: boolean;
    isSeller?: boolean;
    hasSellerProfile?: boolean;
    hasBusinessProfile?: boolean;
  }
): DashboardMode => {
  if (!user) return "buyer";

  const isAdm =
    computedRoles?.isAdmin ??
    Boolean(
      user.role === "admin" ||
        user.role === "superadmin" ||
        user.role === "support" ||
        user.role === "staff" ||
        user.type === "admin" ||
        user.type === "superadmin" ||
        user.type === "support" ||
        user.roles?.includes("admin") ||
        user.roles?.includes("superadmin")
    );

  const isSel =
    computedRoles?.isSeller ??
    Boolean(
      user.role === "seller" ||
        user.role === "seller_individual" ||
        user.role === "seller_company" ||
        user.type === "seller" ||
        user.type === "seller_individual" ||
        user.type === "seller_company" ||
        user.roles?.includes("seller") ||
        user.roles?.includes("seller_individual") ||
        user.roles?.includes("seller_company") ||
        Boolean(user.sellerProfile)
    );

  const isComp =
    computedRoles?.hasBusinessProfile ??
    Boolean(user.businessProfile || user.type === "company" || user.type === "seller_company");

  if (desiredMode === "admin" && isAdm) return "admin";
  if (desiredMode === "seller" && isSel) return "seller";
  if (desiredMode === "company" && isComp) return "company";
  if (desiredMode === "buyer") return "buyer";

  if (isAdm) return "admin";
  if (isSel) return "seller";
  if (isComp) return "company";
  return "buyer";
};

export const getDestinationForMode = (mode: DashboardMode): string => {
  switch (mode) {
    case "admin":
      return "/admin";
    case "seller":
      return "/seller/dashboard";
    case "company":
      return "/account/company";
    case "buyer":
    default:
      return "/account/dashboard";
  }
};

export const syncAuthCookies = (): void => {
  if (typeof window === "undefined") return;

  const cookieToken =
    getCookie(AUTH_TOKEN_KEY) ??
    getCookie("token") ??
    getCookie("access_token") ??
    getCookie("accessToken");
  const localToken =
    window.localStorage.getItem(AUTH_TOKEN_KEY) ??
    window.localStorage.getItem("token") ??
    window.localStorage.getItem("access_token") ??
    window.localStorage.getItem("accessToken");
  const resolvedToken = cookieToken || localToken;
  if (resolvedToken) {
    if (!getCookie(AUTH_TOKEN_KEY)) {
      setCookie(AUTH_TOKEN_KEY, resolvedToken, 7);
    }
    if (!window.localStorage.getItem(AUTH_TOKEN_KEY)) {
      window.localStorage.setItem(AUTH_TOKEN_KEY, resolvedToken);
    }
  }

  const cookieRefresh =
    getCookie(AUTH_REFRESH_TOKEN_KEY) ??
    getCookie("refresh_token") ??
    getCookie("refreshToken");
  const localRefresh =
    window.localStorage.getItem(AUTH_REFRESH_TOKEN_KEY) ??
    window.localStorage.getItem("refresh_token") ??
    window.localStorage.getItem("refreshToken");
  const resolvedRefresh = cookieRefresh || localRefresh;
  if (resolvedRefresh) {
    if (!getCookie(AUTH_REFRESH_TOKEN_KEY)) {
      setCookie(AUTH_REFRESH_TOKEN_KEY, resolvedRefresh, 7);
    }
    if (!window.localStorage.getItem(AUTH_REFRESH_TOKEN_KEY)) {
      window.localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, resolvedRefresh);
    }
  }

  const cookieUser = getCookie(AUTH_USER_KEY);
  const localUser = window.localStorage.getItem(AUTH_USER_KEY);
  const resolvedUser = cookieUser || localUser;
  if (resolvedUser) {
    if (!getCookie(AUTH_USER_KEY)) {
      setCookie(AUTH_USER_KEY, resolvedUser, 7);
    }
    if (!window.localStorage.getItem(AUTH_USER_KEY)) {
      window.localStorage.setItem(AUTH_USER_KEY, resolvedUser);
    }
  }

  const cookiePerms = getCookie(AUTH_PERMISSIONS_KEY);
  const localPerms = window.localStorage.getItem(AUTH_PERMISSIONS_KEY);
  const resolvedPerms = cookiePerms || localPerms;
  if (resolvedPerms) {
    if (!getCookie(AUTH_PERMISSIONS_KEY)) {
      setCookie(AUTH_PERMISSIONS_KEY, resolvedPerms, 7);
    }
    if (!window.localStorage.getItem(AUTH_PERMISSIONS_KEY)) {
      window.localStorage.setItem(AUTH_PERMISSIONS_KEY, resolvedPerms);
    }
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const cookieVal =
    getCookie(AUTH_TOKEN_KEY) ??
    getCookie("token") ??
    getCookie("access_token") ??
    getCookie("accessToken");
  if (cookieVal) {
    if (!getCookie(AUTH_TOKEN_KEY)) {
      setCookie(AUTH_TOKEN_KEY, cookieVal, 7);
    }
    return cookieVal;
  }
  const localVal =
    window.localStorage.getItem(AUTH_TOKEN_KEY) ??
    window.localStorage.getItem("token") ??
    window.localStorage.getItem("access_token") ??
    window.localStorage.getItem("accessToken");
  if (localVal) {
    setCookie(AUTH_TOKEN_KEY, localVal, 7);
    return localVal;
  }
  return null;
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const cookieVal =
    getCookie(AUTH_REFRESH_TOKEN_KEY) ??
    getCookie("refresh_token") ??
    getCookie("refreshToken");
  if (cookieVal) {
    if (!getCookie(AUTH_REFRESH_TOKEN_KEY)) {
      setCookie(AUTH_REFRESH_TOKEN_KEY, cookieVal, 7);
    }
    return cookieVal;
  }
  const localVal =
    window.localStorage.getItem(AUTH_REFRESH_TOKEN_KEY) ??
    window.localStorage.getItem("refresh_token") ??
    window.localStorage.getItem("refreshToken");
  if (localVal) {
    setCookie(AUTH_REFRESH_TOKEN_KEY, localVal, 7);
    return localVal;
  }
  return null;
};

export const setRefreshToken = (token: string | null): void => {
  if (typeof window === "undefined") return;
  if (token) {
    setCookie(AUTH_REFRESH_TOKEN_KEY, token, 7);
    setCookie("refresh_token", token, 7);
    window.localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, token);
  } else {
    removeCookie(AUTH_REFRESH_TOKEN_KEY);
    removeCookie("refresh_token");
    removeCookie("refreshToken");
    window.localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
    window.localStorage.removeItem("refresh_token");
    window.localStorage.removeItem("refreshToken");
  }
};

export const setAuthToken = (token: string | null): void => {
  if (typeof window === "undefined") return;
  if (token) {
    setCookie(AUTH_TOKEN_KEY, token, 7);
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    removeCookie(AUTH_TOKEN_KEY);
    removeCookie("token");
    removeCookie("access_token");
    removeCookie("accessToken");
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("access_token");
    window.localStorage.removeItem("accessToken");
  }
};

export const setCurrentUser = (user: CurrentUser | null): void => {
  if (typeof window === "undefined") return;
  if (user) {
    const raw = JSON.stringify(user);
    setCookie(AUTH_USER_KEY, raw, 7);
    window.localStorage.setItem(AUTH_USER_KEY, raw);
    setCurrentCustomerEmail(user.email);
    setCurrentCustomerName(user.name);
  } else {
    removeCookie(AUTH_USER_KEY);
    window.localStorage.removeItem(AUTH_USER_KEY);
  }
};

export const getCurrentUser = (): CurrentUser | null => {
  if (typeof window === "undefined") return null;

  const cookieVal = getCookie(AUTH_USER_KEY);
  if (cookieVal) {
    try {
      const parsed = JSON.parse(cookieVal) as CurrentUser;
      if (!window.localStorage.getItem(AUTH_USER_KEY)) {
        window.localStorage.setItem(AUTH_USER_KEY, cookieVal);
      }
      return parsed;
    } catch {}
  }

  const localVal = window.localStorage.getItem(AUTH_USER_KEY);
  if (localVal) {
    try {
      const parsed = JSON.parse(localVal) as CurrentUser;
      setCookie(AUTH_USER_KEY, localVal, 7);
      return parsed;
    } catch {
      return null;
    }
  }

  return null;
};

export const setAuthPermissions = (permissions: string[]): void => {
  if (typeof window === "undefined") return;
  if (permissions && permissions.length > 0) {
    const raw = JSON.stringify(permissions);
    setCookie(AUTH_PERMISSIONS_KEY, raw, 7);
    window.localStorage.setItem(AUTH_PERMISSIONS_KEY, raw);
  } else {
    removeCookie(AUTH_PERMISSIONS_KEY);
    window.localStorage.removeItem(AUTH_PERMISSIONS_KEY);
  }
};

export const getAuthPermissions = (): string[] => {
  if (typeof window === "undefined") return [];
  const cookieVal = getCookie(AUTH_PERMISSIONS_KEY);
  if (cookieVal) {
    try {
      const parsed = JSON.parse(cookieVal);
      if (Array.isArray(parsed)) {
        if (!window.localStorage.getItem(AUTH_PERMISSIONS_KEY)) {
          window.localStorage.setItem(AUTH_PERMISSIONS_KEY, cookieVal);
        }
        return parsed;
      }
    } catch {}
  }

  const raw = window.localStorage.getItem(AUTH_PERMISSIONS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      setCookie(AUTH_PERMISSIONS_KEY, raw, 7);
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
};

export const setSession = (
  user: CurrentUser,
  token?: string | null,
  permissions: string[] = [],
  refreshToken?: string | null,
): void => {
  setCustomerAuthenticated(true);
  setCurrentUser(user);
  if (token && token.trim() !== "") {
    setAuthToken(token);
  }
  if (refreshToken && refreshToken.trim() !== "") {
    setRefreshToken(refreshToken);
  }
  if (permissions && permissions.length > 0) {
    setAuthPermissions(permissions);
  }
};

export const isAdminUser = (): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  const role = (user.role ?? user.type ?? user.roleName ?? "").toLowerCase();
  const userRoles = (user.roles ?? []).map((r) => r.toLowerCase());
  return (
    role === "admin" ||
    role === "superadmin" ||
    role === "support" ||
    role === "staff" ||
    userRoles.includes("admin") ||
    userRoles.includes("superadmin")
  );
};

export const hasRole = (requiredRole: string): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  const role = (user.role ?? user.type ?? user.roleName ?? "").toLowerCase();
  const userRoles = (user.roles ?? []).map((r) => r.toLowerCase());
  const target = requiredRole.toLowerCase();
  if (role === "superadmin" || userRoles.includes("superadmin")) return true;
  if (
    (role === "admin" || userRoles.includes("admin")) &&
    (target === "admin" || target === "support" || target === "staff")
  ) {
    return true;
  }
  return role === target || userRoles.includes(target);
};

export const hasPermission = (permission: string): boolean => {
  const user = getCurrentUser();
  if (!user) return false;

  const role = (user.role ?? user.type ?? user.roleName ?? "").toLowerCase();
  const userRoles = (user.roles ?? []).map((r) => r.toLowerCase());
  if (
    role === "superadmin" ||
    role === "admin" ||
    userRoles.includes("superadmin") ||
    userRoles.includes("admin")
  ) {
    return true;
  }

  const permissions = getAuthPermissions();
  return permissions.includes(permission) || permissions.includes("*");
};
