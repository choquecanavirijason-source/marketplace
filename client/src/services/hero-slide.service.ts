import type { HeroSlide } from "@/types";
import { heroSlidesSeed } from "@/infrastructure/data/heroSlides.data";

export interface HeroSlideService {
  list(): Promise<HeroSlide[]>;
}

export type HeroSlideRepository = HeroSlideService;

export class InMemoryHeroSlideService implements HeroSlideService {
  async list(): Promise<HeroSlide[]> {
    return heroSlidesSeed;
  }
}

export const InMemoryHeroSlideRepository = InMemoryHeroSlideService;
