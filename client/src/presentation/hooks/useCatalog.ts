"use client";

import { useQuery } from "@tanstack/react-query";
import { container } from "@/infrastructure/container";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => container.listCategories.execute(),
  });
}

export function useHeroSlides() {
  return useQuery({
    queryKey: ["hero-slides"],
    queryFn: () => container.listHeroSlides.execute(),
  });
}
