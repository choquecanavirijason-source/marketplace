import type { HeroSlideRepository } from "@/services";
import type { HeroSlide } from "@/types";

export class ListHeroSlidesUseCase {
  constructor(private readonly heroSlideRepository: HeroSlideRepository) {}

  execute(): Promise<HeroSlide[]> {
    return this.heroSlideRepository.list();
  }
}
