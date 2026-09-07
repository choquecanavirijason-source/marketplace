"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";

export const useInfiniteProducts = ({
  category,
  search,
  tag,
  sortBy,
  sortOrder,
  pageSize = 12,
  startPage = 1,
  enabled = true,
}: {
  category?: string;
  search?: string;
  tag?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  pageSize?: number;
  startPage?: number;
  enabled?: boolean;
}) => {
  return useInfiniteQuery({
    queryKey: ["infinite-products", category ?? "", search ?? "", tag ?? "", sortBy ?? "", sortOrder ?? "", pageSize],
    queryFn: ({ pageParam }) =>
      productService.paginate({ category, search, tag, sortBy, sortOrder, page: pageParam as number, limit: pageSize }),
    initialPageParam: startPage,
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.lastPage ? lastPage.currentPage + 1 : undefined,
    enabled,
  });
}