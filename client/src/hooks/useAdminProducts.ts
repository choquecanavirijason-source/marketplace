"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { container } from "@/infrastructure/container";
import type { AdminListProductsParams } from "@/services";

export const useAdminProducts = (params?: AdminListProductsParams) => {
  const query = useQuery({
    queryKey: [
      "admin-products",
      params?.search ?? "",
      params?.category ?? "",
      params?.isActive ?? "",
      params?.sortBy ?? "name",
      params?.sortOrder ?? "asc",
      params?.page ?? 1,
    ],
    queryFn: ({ signal }) => container.adminListProducts.execute(params, signal),
  });

  const queryClient = useQueryClient();

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      container.toggleProductActive.execute(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => container.deleteProduct.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
    toggleActive: toggleActive.mutateAsync,
    isToggling: toggleActive.isPending,
    remove: remove.mutateAsync,
    isRemoving: remove.isPending,
  };
}