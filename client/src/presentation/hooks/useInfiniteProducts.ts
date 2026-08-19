"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { container } from "@/infrastructure/container";

export function useInfiniteProducts({
  category,
  search,
  tag,
  pageSize = 12,
  startPage = 1,
  enabled = true,
}: {
  category?: string;
  search?: string;
  tag?: string;
  pageSize?: number;
  startPage?: number;
  enabled?: boolean;
}) {
  return useInfiniteQuery({
    queryKey: ["infinite-products", category ?? "", search ?? "", tag ?? "", pageSize],
    queryFn: ({ pageParam }) =>
      container.paginateProducts.execute({ category, search, tag, page: pageParam, limit: pageSize }),
    initialPageParam: startPage,
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.lastPage ? lastPage.currentPage + 1 : undefined,
    enabled,
  });
}