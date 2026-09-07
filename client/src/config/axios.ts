import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import {
  getAuthToken,
  getRefreshToken,
  setAuthToken,
  setRefreshToken,
  logoutCustomer,
} from "@/shared/lib/marketplaceStorage";
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
  signal?: AbortSignal;
}

let navigationAbortController = new AbortController();

export const cancelAllPendingRequests = () => {
  if (navigationAbortController) {
    navigationAbortController.abort();
  }
  navigationAbortController = new AbortController();
};

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
    if (!config.signal) {
      config.signal = navigationAbortController.signal;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
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
    const hasExistingTokens = Boolean(getAuthToken() || getRefreshToken());
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      hasExistingTokens &&
      !originalRequest.url?.includes("/identity/login") &&
      !originalRequest.url?.includes("/identity/refresh") &&
      !originalRequest.url?.includes("/identity/otp/login")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const currentRefreshToken = getRefreshToken();
        const refreshPayload = currentRefreshToken ? { refreshToken: currentRefreshToken } : {};
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/identity/refresh`,
          refreshPayload,
          { withCredentials: true }
        );

        const responseData = refreshResponse.data?.data || refreshResponse.data;
        const newAccessToken = responseData?.accessToken;
        const newRefreshToken = responseData?.refreshToken;

        if (newAccessToken) {
          setAuthToken(newAccessToken);
          if (newRefreshToken) {
            setRefreshToken(newRefreshToken);
          }

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        logoutCustomer();
        return Promise.reject(new ApiError(401, "Tu sesión ha expirado. Por favor, ingresa nuevamente."));
      } finally {
        isRefreshing = false;
      }
    }

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
      signal: options.signal,
    });

    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      throw error;
    }
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
