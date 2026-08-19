import type { HeroSlideRepository } from "@/domain/repositories/HeroSlideRepository";
import type { HeroSlide } from "@/domain/entities/HeroSlide";

export class ListHeroSlidesUseCase {
  constructor(private readonly heroSlideRepository: HeroSlideRepository) {}

  execute(): Promise<HeroSlide[]> {
    return this.heroSlideRepository.list();
  }
}
