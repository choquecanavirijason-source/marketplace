import { Module } from '@nestjs/common';
import { CategoriesAdminController, ProductsAdminController } from './controllers';
import { CategoryService, ProductService } from './services';
import { CategoryRepository, ProductRepository } from './repositories';

@Module({
  controllers: [CategoriesAdminController, ProductsAdminController],
  providers: [CategoryService, ProductService, CategoryRepository, ProductRepository],
  exports: [CategoryService, ProductService, CategoryRepository, ProductRepository],
})
export class AdminCatalogModule {}
