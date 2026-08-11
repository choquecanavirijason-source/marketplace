import type { HeroSlideRepository } from "@/domain/repositories/HeroSlideRepository";
import type { HeroSlide } from "@/domain/entities/HeroSlide";
import { heroSlidesSeed } from "@/infrastructure/data/heroSlides.data";

export class InMemoryHeroSlideRepository implements HeroSlideRepository {
  async list(): Promise<HeroSlide[]> {
    return heroSlidesSeed;
  }
}
