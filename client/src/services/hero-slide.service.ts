import type { HeroSlide } from "@/types";
import { heroSlidesSeed } from "@/infrastructure/data/heroSlides.data";

export class HeroSlideService {
  async list(): Promise<HeroSlide[]> {
    return heroSlidesSeed;
  }
}

export const heroSlideService = new HeroSlideService();
