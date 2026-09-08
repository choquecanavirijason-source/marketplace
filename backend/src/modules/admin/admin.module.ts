import { Module } from '@nestjs/common';
import { AdminCatalogModule } from './catalog/admin-catalog.module';
import { OrdersModule } from './orders/orders.module';
import { CrmModule } from './crm/crm.module';
import { SellerModule } from './seller/seller.module';
import { AssetsModule } from './assets/assets.module';
import { CommunityModule } from './community/community.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AdminCatalogModule,
    OrdersModule,
    CrmModule,
    SellerModule,
    AssetsModule,
    CommunityModule,
    UsersModule,
  ],
  exports: [
    AdminCatalogModule,
    OrdersModule,
    CrmModule,
    SellerModule,
    AssetsModule,
    CommunityModule,
    UsersModule,
  ],
})
export class AdminModule {}
