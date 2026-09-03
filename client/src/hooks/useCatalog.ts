"use client";

import { useQuery } from "@tanstack/react-query";
import { container } from "@/infrastructure/container";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => container.listCategories.execute(),
  });
}

export const useHeroSlides = () => {
  return useQuery({
    queryKey: ["hero-slides"],
    queryFn: () => container.listHeroSlides.execute(),
  });
}
