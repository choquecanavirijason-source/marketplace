import { Module } from '@nestjs/common';
import {
  ProductsController,
  AdminProductsController,
  CategoriesController,
  AdminCategoriesController,
} from './controllers';
import { ProductService, CategoryService } from './services';
import { ProductRepository, CategoryRepository } from './repositories';

@Module({
  controllers: [
    ProductsController,
    AdminProductsController,
    CategoriesController,
    AdminCategoriesController,
  ],
  providers: [ProductService, CategoryService, ProductRepository, CategoryRepository],
  exports: [ProductService, CategoryService, ProductRepository, CategoryRepository],
})
export class CatalogModule {}
