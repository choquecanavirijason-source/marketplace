import type { Product } from "@/domain/entities/Product";

export const MARKETPLACE_PRODUCTS_KEY = "ferromax-marketplace-products";
export const CUSTOMER_AUTH_KEY = "ferromax-customer-auth";
export const CUSTOMERS_KEY = "ferromax-customers";
export const AUTH_TOKEN_KEY = "ferromax-token";
export const AUTH_USER_KEY = "ferromax-user";

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
  return window.localStorage.getItem(CUSTOMER_AUTH_KEY) === "true";
}

export function setCustomerAuthenticated(value: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CUSTOMER_AUTH_KEY, String(value));
}

export function getCurrentCustomerEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(`${CUSTOMER_AUTH_KEY}-email`);
}

function setCurrentCustomerEmail(email: string | null) {
  if (typeof window === "undefined") return;
  if (email) window.localStorage.setItem(`${CUSTOMER_AUTH_KEY}-email`, email);
  else window.localStorage.removeItem(`${CUSTOMER_AUTH_KEY}-email`);
}

export function getCurrentCustomerName(): string | null {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(`${CUSTOMER_AUTH_KEY}-name`);
  if (stored) return stored;

  // Sesiones creadas antes de guardar el nombre: lo resolvemos desde el email y lo guardamos.
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
  if (name) window.localStorage.setItem(`${CUSTOMER_AUTH_KEY}-name`, name);
  else window.localStorage.removeItem(`${CUSTOMER_AUTH_KEY}-name`);
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
}

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  roleName: string | null;
  mobileNumber?: string | null;
  address?: string | null;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  else window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function setCurrentUser(user: CurrentUser | null) {
  if (typeof window === "undefined") return;
  if (user) window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(AUTH_USER_KEY);
}

export function getCurrentUser(): CurrentUser | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}

export function setSession(user: CurrentUser, token: string) {
  setCustomerAuthenticated(true);
  setCurrentUser(user);
  setAuthToken(token);
  setCurrentCustomerEmail(user.email);
  setCurrentCustomerName(user.name);
}

export function isAdminUser(): boolean {
  const user = getCurrentUser();
  return user?.roleName === "admin";
}
