import { Module } from '@nestjs/common';
import { SellerController } from './controllers/seller.controller';
import { SellerService } from './services/seller.service';
import { SellerRepository } from './repositories/seller.repository';

@Module({
  controllers: [SellerController],
  providers: [SellerService, SellerRepository],
  exports: [SellerService, SellerRepository],
})
export class SellerModule {}
