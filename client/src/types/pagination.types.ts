export interface Paginated<T> {
  items: T[];
  total: number;
  currentPage: number;
  lastPage: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const paginated = <T>(payload: {
  data: T[];
  meta?: {
    total?: number;
    current_page?: number;
    last_page?: number;
    page?: number;
    limit?: number;
    total_pages?: number;
  };
}): Paginated<T> => {
  const items = payload.data;
  const total = payload.meta?.total ?? items.length;
  const page = payload.meta?.current_page ?? payload.meta?.page ?? 1;
  const lastPage = payload.meta?.last_page ?? payload.meta?.total_pages ?? 1;
  return {
    items,
    total,
    page,
    currentPage: page,
    lastPage,
    totalPages: lastPage,
    limit: payload.meta?.limit ?? items.length,
  };
}
