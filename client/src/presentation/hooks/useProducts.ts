"use client";

import { useQuery } from "@tanstack/react-query";
import { container } from "@/infrastructure/container";

export function useProducts(category?: string, search?: string) {
  return useQuery({
    queryKey: ["products", category ?? "All", search ?? ""],
    queryFn: () => container.listProducts.execute({ category, search }),
  });
}

export function useFlashDeals() {
  return useQuery({
    queryKey: ["flash-deals"],
    queryFn: () => container.listFlashDeals.execute(),
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => container.getProductById.execute(id),
  });
}

export function useRelatedProducts(id: number, category: string) {
  return useQuery({
    queryKey: ["related-products", id, category],
    queryFn: async () => {
      const product = await container.getProductById.execute(id);
      if (!product) return [];
      return container.listRelatedProducts.execute(product);
    },
  });
}
