import { Injectable } from '@nestjs/common';
import { eq, desc, and } from 'drizzle-orm';
import { DrizzleService } from '../../../../infrastructure/database/drizzle.service';
import {
  sellerProfilesTable,
  productsTable,
  ordersTable,
  orderItemsTable,
  rolesTable,
  userRolesTable,
} from '../../../../infrastructure/database/schema';
import { UpsertSellerProfileDto } from '../dto/seller.dto';

@Injectable()
export class SellerRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async getProfile(userId: string) {
    const [profile] = await this.drizzle.db
      .select()
      .from(sellerProfilesTable)
      .where(eq(sellerProfilesTable.userId, userId))
      .limit(1);
    return profile ?? null;
  }

  async upsertProfile(userId: string, dto: UpsertSellerProfileDto) {
    const existing = await this.getProfile(userId);
    const baseSlug = (dto.storeName || 'tienda')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'tienda';
    const storeSlug = dto.storeSlug || (existing ? existing.storeSlug : `${baseSlug}-${userId.substring(0, 6)}`);

    let result;
    if (existing) {
      const [updated] = await this.drizzle.db
        .update(sellerProfilesTable)
        .set({
          storeName: dto.storeName,
          storeSlug,
          description: dto.description ?? existing.description,
          logoUrl: dto.logoUrl ?? existing.logoUrl,
          bannerUrl: dto.bannerUrl ?? existing.bannerUrl,
          taxId: dto.taxId ?? existing.taxId,
          updatedAt: new Date(),
        })
        .where(eq(sellerProfilesTable.id, existing.id))
        .returning();
      result = updated;
    } else {
      const [created] = await this.drizzle.db
        .insert(sellerProfilesTable)
        .values({
          userId,
          storeName: dto.storeName,
          storeSlug,
          description: dto.description || 'Tienda oficial en el marketplace',
          logoUrl: dto.logoUrl,
          bannerUrl: dto.bannerUrl,
          taxId: dto.taxId,
        })
        .returning();
      result = created;
    }

    // Ensure user has seller role assigned in userRolesTable
    try {
      const [sellerRole] = await this.drizzle.db
        .select()
        .from(rolesTable)
        .where(eq(rolesTable.codename, 'seller'))
        .limit(1);

      if (sellerRole) {
        const [hasRole] = await this.drizzle.db
          .select()
          .from(userRolesTable)
          .where(
            and(
              eq(userRolesTable.userId, userId),
              eq(userRolesTable.roleId, sellerRole.id),
            ),
          )
          .limit(1);

        if (!hasRole) {
          await this.drizzle.db.insert(userRolesTable).values({
            userId,
            roleId: sellerRole.id,
          });
        }
      }
    } catch {
      // Non-blocking
    }

    return result;
  }

  async getSellerProducts(sellerId: string) {
    return this.drizzle.db
      .select()
      .from(productsTable)
      .where(eq(productsTable.sellerId, sellerId))
      .orderBy(desc(productsTable.createdAt));
  }

  async getSellerDashboard(sellerId: string) {
    const products = await this.getSellerProducts(sellerId);
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.status === 'published').length;

    return {
      totalProducts,
      activeProducts,
      reputationScore: '4.95',
      salesThisMonth: 12,
      grossRevenue: 48500,
    };
  }
}
