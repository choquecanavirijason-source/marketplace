import { Injectable } from '@nestjs/common';
import { SellerRepository } from '../repositories/seller.repository';
import { UpsertSellerProfileDto } from '../dto/seller.dto';

@Injectable()
export class SellerService {
  constructor(private readonly sellerRepo: SellerRepository) {}

  async getProfile(userId: string) {
    return this.sellerRepo.getProfile(userId);
  }

  async upsertProfile(userId: string, dto: UpsertSellerProfileDto) {
    return this.sellerRepo.upsertProfile(userId, dto);
  }

  async getDashboard(sellerId: string) {
    return this.sellerRepo.getSellerDashboard(sellerId);
  }

  async getProducts(sellerId: string) {
    return this.sellerRepo.getSellerProducts(sellerId);
  }
}
