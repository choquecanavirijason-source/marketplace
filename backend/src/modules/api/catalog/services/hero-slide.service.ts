import { Injectable } from '@nestjs/common';
import { HeroSlideRepository } from '../repositories/hero-slide.repository';
import { HeroSlideModel } from '../models/hero-slide.model';

@Injectable()
export class HeroSlideService {
  constructor(private readonly heroSlideRepository: HeroSlideRepository) {}

  findAll = async (): Promise<HeroSlideModel[]> => {
    return this.heroSlideRepository.findAll();
  };
}
