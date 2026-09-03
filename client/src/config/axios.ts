import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getAuthToken, logoutCustomer } from "@/shared/lib/marketplaceStorage";
import { API_BASE_URL, APP_CONFIG } from "./variables";

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  params?: Record<string, unknown>;
  auth?: boolean;
  headers?: Record<string, string>;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: APP_CONFIG.apiTimeoutMs ?? 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status ?? 500;
    const data = error.response?.data as {
      detail?: string;
      message?: string;
      title?: string;
      errors?: Record<string, string[]>;
    } | undefined;

    const message =
      data?.detail ??
      data?.message ??
      data?.title ??
      error.message ??
      `Error ${status} al conectar con el servidor.`;

    if (status === 401) {
      logoutCustomer();
    }

    return Promise.reject(new ApiError(status, message, data?.errors));
  },
);

export const apiRequest = async <T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const { method = "GET", body, params, auth = false, headers = {} } = options;

  const requestHeaders: Record<string, string> = { ...headers };

  if (auth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  try {
    const response = await apiClient.request<T>({
      url: path,
      method,
      data: body,
      params,
      headers: requestHeaders,
    });

    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const axiosErr = error as AxiosError;
    const status = axiosErr.response?.status ?? 500;
    throw new ApiError(status, axiosErr.message);
  }
};

export const apiUrl = (path: string): string => {
  return `${API_BASE_URL}${path}`;
};

export default apiClient;
