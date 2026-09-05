"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { container } from "@/infrastructure/container";
import type { AddressInput, UserAddress } from "@/services";

export const useAddresses = () => {
  return useQuery({
    queryKey: ["my-addresses"],
    queryFn: () => container.auth.listAddresses?.() ?? Promise.resolve([] as UserAddress[]),
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddressInput) => container.auth.createAddress?.(data) as Promise<UserAddress>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-addresses"] });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AddressInput> }) =>
      container.auth.updateAddress?.(id, data) as Promise<UserAddress>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-addresses"] });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => container.auth.deleteAddress?.(id) as Promise<void>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-addresses"] });
    },
  });
};
