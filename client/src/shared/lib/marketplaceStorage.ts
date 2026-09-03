import type { Product } from "@/types";
import { getCookie, setCookie, removeCookie } from "./cookies";
export {
  MARKETPLACE_PRODUCTS_KEY,
  CUSTOMER_AUTH_KEY,
  CUSTOMERS_KEY,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  AUTH_PERMISSIONS_KEY,
  TOKEN_NAME,
} from "@/config";
import { MARKETPLACE_PRODUCTS_KEY, CUSTOMER_AUTH_KEY, CUSTOMERS_KEY, AUTH_TOKEN_KEY, AUTH_USER_KEY, AUTH_PERMISSIONS_KEY } from "@/config";

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

function readCustomers(): Customer[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CUSTOMERS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as Customer[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCustomers(customers: Customer[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

function findCustomerByEmail(email: string): Customer | undefined {
  const normalized = email.toLowerCase();
  if (normalized === DEMO_CUSTOMER.email) return DEMO_CUSTOMER;
  if (normalized === DEMO_ADMIN.email) return DEMO_ADMIN;
  return readCustomers().find((c) => c.email.toLowerCase() === normalized);
}

export function isCustomerAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return (
    getCookie(CUSTOMER_AUTH_KEY) === "true" ||
    window.localStorage.getItem(CUSTOMER_AUTH_KEY) === "true" ||
    Boolean(getAuthToken())
  );
}

export function setCustomerAuthenticated(value: boolean) {
  if (typeof window === "undefined") return;
  if (value) {
    setCookie(CUSTOMER_AUTH_KEY, "true", 7);
    window.localStorage.setItem(CUSTOMER_AUTH_KEY, "true");
  } else {
    removeCookie(CUSTOMER_AUTH_KEY);
    window.localStorage.removeItem(CUSTOMER_AUTH_KEY);
  }
}

export function getCurrentCustomerEmail(): string | null {
  if (typeof window === "undefined") return null;
  const user = getCurrentUser();
  if (user?.email) return user.email;
  return getCookie(`${CUSTOMER_AUTH_KEY}-email`) ?? window.localStorage.getItem(`${CUSTOMER_AUTH_KEY}-email`);
}

function setCurrentCustomerEmail(email: string | null) {
  if (typeof window === "undefined") return;
  if (email) {
    setCookie(`${CUSTOMER_AUTH_KEY}-email`, email, 7);
    window.localStorage.setItem(`${CUSTOMER_AUTH_KEY}-email`, email);
  } else {
    removeCookie(`${CUSTOMER_AUTH_KEY}-email`);
    window.localStorage.removeItem(`${CUSTOMER_AUTH_KEY}-email`);
  }
}

export function getCurrentCustomerName(): string | null {
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
}

function setCurrentCustomerName(name: string | null) {
  if (typeof window === "undefined") return;
  if (name) {
    setCookie(`${CUSTOMER_AUTH_KEY}-name`, name, 7);
    window.localStorage.setItem(`${CUSTOMER_AUTH_KEY}-name`, name);
  } else {
    removeCookie(`${CUSTOMER_AUTH_KEY}-name`);
    window.localStorage.removeItem(`${CUSTOMER_AUTH_KEY}-name`);
  }
}

export function registerCustomer(customer: Customer): { ok: true } | { ok: false; error: string } {
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
}

export function loginCustomer(email: string, password: string): { ok: true } | { ok: false; error: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const customer = findCustomerByEmail(normalizedEmail);

  if (!customer || customer.password !== password) {
    return { ok: false, error: "Correo o contraseña incorrectos." };
  }

  setCustomerAuthenticated(true);
  setCurrentCustomerEmail(normalizedEmail);
  setCurrentCustomerName(customer.name);
  return { ok: true };
}

export function logoutCustomer() {
  setCustomerAuthenticated(false);
  setCurrentCustomerEmail(null);
  setCurrentCustomerName(null);
  setAuthToken(null);
  setCurrentUser(null);
  setAuthPermissions([]);
}

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
  onboardingStates?: Array<{
    stepCode: string;
    status: string;
  }> | null;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return getCookie(AUTH_TOKEN_KEY) ?? window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    setCookie(AUTH_TOKEN_KEY, token, 7);
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    removeCookie(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export function setCurrentUser(user: CurrentUser | null) {
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
}

export function getCurrentUser(): CurrentUser | null {
  if (typeof window === "undefined") return null;

  const raw = getCookie(AUTH_USER_KEY) ?? window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}

export function setAuthPermissions(permissions: string[]) {
  if (typeof window === "undefined") return;
  if (permissions && permissions.length > 0) {
    const raw = JSON.stringify(permissions);
    setCookie(AUTH_PERMISSIONS_KEY, raw, 7);
    window.localStorage.setItem(AUTH_PERMISSIONS_KEY, raw);
  } else {
    removeCookie(AUTH_PERMISSIONS_KEY);
    window.localStorage.removeItem(AUTH_PERMISSIONS_KEY);
  }
}

export function getAuthPermissions(): string[] {
  if (typeof window === "undefined") return [];
  const raw = getCookie(AUTH_PERMISSIONS_KEY) ?? window.localStorage.getItem(AUTH_PERMISSIONS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setSession(user: CurrentUser, token: string, permissions: string[] = []) {
  setCustomerAuthenticated(true);
  setCurrentUser(user);
  setAuthToken(token);
  setAuthPermissions(permissions);
}

export function isAdminUser(): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  const role = (user.type ?? user.roleName ?? "").toLowerCase();
  const userRoles = (user.roles ?? []).map((r) => r.toLowerCase());
  return (
    role === "admin" ||
    role === "superadmin" ||
    role === "support" ||
    role === "staff" ||
    userRoles.includes("admin") ||
    userRoles.includes("superadmin")
  );
}

export function hasRole(requiredRole: string): boolean {
  const user = getCurrentUser();
  if (!user?.roleName) return false;
  return user.roleName.toLowerCase() === requiredRole.toLowerCase();
}

export function hasPermission(permission: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;

  const role = user.roleName?.toLowerCase();
  if (role === "superadmin") return true;

  const permissions = getAuthPermissions();
  return permissions.includes(permission) || permissions.includes("*");
}
