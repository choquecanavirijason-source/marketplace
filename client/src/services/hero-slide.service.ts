import { apiClient } from "@/config/axios";
import type { HeroSlide } from "@/types";

export const heroSlideService = {
  list: async (): Promise<HeroSlide[]> => {
    const { data } = await apiClient.get<HeroSlide[]>("/hero-slides");
    return data;
  },
};
