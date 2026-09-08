import { Module } from '@nestjs/common';
import {
  CategoriesController,
  ProductsController,
  HeroSlidesController,
} from './controllers';
import { CategoryService, ProductService, HeroSlideService } from './services';
import {
  CategoryRepository,
  ProductRepository,
  HeroSlideRepository,
} from './repositories';

@Module({
  controllers: [CategoriesController, ProductsController, HeroSlidesController],
  providers: [
    CategoryService,
    ProductService,
    HeroSlideService,
    CategoryRepository,
    ProductRepository,
    HeroSlideRepository,
  ],
  exports: [
    CategoryService,
    ProductService,
    HeroSlideService,
    CategoryRepository,
    ProductRepository,
    HeroSlideRepository,
  ],
})
export class ApiCatalogModule {}
