"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { container } from "@/infrastructure/container";
import type { AdminListCategoriesParams } from "@/domain/repositories/CategoryRepository";

export function useAdminCategories(params?: AdminListCategoriesParams) {
  const query = useQuery({
    queryKey: ["admin-categories", params?.search ?? "", params?.page ?? 1],
    queryFn: () => container.adminListCategories.execute(params),
  });

  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const create = useMutation({
    mutationFn: (name: string) => container.createCategory.execute(name),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => container.updateCategory.execute(id, name),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => container.deleteCategory.execute(id),
    onSuccess: invalidate,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
    create: create.mutateAsync,
    isCreating: create.isPending,
    update: update.mutateAsync,
    isUpdating: update.isPending,
    remove: remove.mutateAsync,
    isRemoving: remove.isPending,
  };
}