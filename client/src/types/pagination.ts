export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IPaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: IPagination;
  meta?: {
    timestamp?: string;
    correlationId?: string;
    [key: string]: unknown;
  };
}

export interface IPaginationRequest extends Record<string, unknown> {
  page: number;
  limit?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  filters?: Record<string, string[] | string>;
}
