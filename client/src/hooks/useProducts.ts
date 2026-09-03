"use client";

import { useQuery } from "@tanstack/react-query";
import { container } from "@/infrastructure/container";

export const useProducts = (category?: string, search?: string) => {
  return useQuery({
    queryKey: ["products", category ?? "All", search ?? ""],
    queryFn: () => container.listProducts.execute({ category, search }),
  });
}

export const useFlashDeals = () => {
  return useQuery({
    queryKey: ["flash-deals"],
    queryFn: () => container.listFlashDeals.execute(),
  });
}

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => container.getProductById.execute(id),
  });
}

export const useRelatedProducts = (id: number, category: string) => {
  return useQuery({
    queryKey: ["related-products", id, category],
    queryFn: async () => {
      const product = await container.getProductById.execute(id);
      if (!product) return [];
      return container.listRelatedProducts.execute(product);
    },
  });
}
