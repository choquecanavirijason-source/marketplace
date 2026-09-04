"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { container } from "@/infrastructure/container";
import type {
  UserFilters,
  CreateUserData,
  UpdateUserData,
} from "@/types";

export const useUsers = (filters: UserFilters = {}) => {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const search = filters.search ?? "";
  const role = filters.role ?? "ALL";
  const status = filters.status ?? "ALL";
  const sortBy = filters.sortBy ?? "createdAt";
  const sortOrder = filters.sortOrder ?? "desc";

  return useQuery({
    queryKey: ["admin-users", page, limit, search, role, status, sortBy, sortOrder],
    queryFn: ({ signal }) => container.users.getUsers(filters, signal),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => container.users.getUserById(id),
    enabled: Boolean(id),
  });
}

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserData) => container.users.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
      container.users.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user", variables.id] });
    },
  });
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => container.users.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageDataUrl: string) => container.users.uploadAvatar(imageDataUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
};
