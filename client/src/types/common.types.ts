import type { Paginated } from "./pagination.types";

export type PaginatedResult<T> = Paginated<T>;

export interface ApiProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
  traceId?: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    currentPage?: number;
    lastPage?: number;
  };
}
