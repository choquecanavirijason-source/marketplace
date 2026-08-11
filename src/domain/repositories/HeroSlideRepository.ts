import type { HeroSlide } from "../entities/HeroSlide";

export interface HeroSlideRepository {
  list(): Promise<HeroSlide[]>;
}
