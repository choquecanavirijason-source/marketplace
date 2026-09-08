import { Expose } from 'class-transformer';

export class HeroSlideModel {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  subtitle: string;

  @Expose()
  desc: string;

  @Expose()
  cta: string;

  @Expose()
  bg: string;

  @Expose()
  accent: string;

  @Expose()
  image: string;
}
