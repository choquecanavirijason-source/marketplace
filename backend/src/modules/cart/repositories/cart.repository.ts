import { Injectable } from '@nestjs/common';
import { eq, and, inArray } from 'drizzle-orm';
import { DrizzleService } from '../../../infrastructure/database/drizzle.service';
import {
  cartsTable,
  cartItemsTable,
  productsTable,
  productImagesTable,
} from '../../../infrastructure/database/schema';

@Injectable()
export class CartRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async findOrCreateCart(userId?: string, guestToken?: string) {
    if (!userId && !guestToken) {
      throw new Error('Debe proveerse userId o guestToken para el carrito.');
    }

    let existingCart = null;

    if (userId) {
      [existingCart] = await this.drizzle.db
        .select()
        .from(cartsTable)
        .where(and(eq(cartsTable.userId, userId), eq(cartsTable.status, 'active')))
        .limit(1);
    } else if (guestToken) {
      [existingCart] = await this.drizzle.db
        .select()
        .from(cartsTable)
        .where(and(eq(cartsTable.guestToken, guestToken), eq(cartsTable.status, 'active')))
        .limit(1);
    }

    if (existingCart) {
      return existingCart;
    }

    const [newCart] = await this.drizzle.db
      .insert(cartsTable)
      .values({
        userId: userId ?? null,
        guestToken: guestToken ?? null,
        status: 'active',
        currency: 'ARS',
      })
      .returning();

    return newCart;
  }

  async getCartWithItems(cartId: number) {
    const [cart] = await this.drizzle.db
      .select()
      .from(cartsTable)
      .where(eq(cartsTable.id, cartId))
      .limit(1);

    if (!cart) return null;

    const items = await this.drizzle.db
      .select({
        id: cartItemsTable.id,
        cartId: cartItemsTable.cartId,
        productId: cartItemsTable.productId,
        quantity: cartItemsTable.quantity,
        unitPrice: cartItemsTable.unitPrice,
        createdAt: cartItemsTable.createdAt,
        updatedAt: cartItemsTable.updatedAt,
        productName: productsTable.name,
        productSlug: productsTable.slug,
        productStock: productsTable.stock,
        currentPrice: productsTable.price,
      })
      .from(cartItemsTable)
      .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
      .where(eq(cartItemsTable.cartId, cartId));

    const productIds = items.map((i) => i.productId);
    const images = productIds.length > 0
      ? await this.drizzle.db
          .select()
          .from(productImagesTable)
          .where(inArray(productImagesTable.productId, productIds))
      : [];

    const formattedItems = items.map((it) => {
      const img = images.find((im) => im.productId === it.productId);
      return {
        id: it.id,
        productId: it.productId,
        name: it.productName,
        slug: it.productSlug,
        image: img ? img.url : null,
        unitPrice: Number(it.unitPrice),
        currentPrice: Number(it.currentPrice),
        quantity: it.quantity,
        subtotal: Number(it.unitPrice) * it.quantity,
        stockAvailable: it.productStock,
      };
    });

    const subtotal = formattedItems.reduce((acc, curr) => acc + curr.subtotal, 0);
    const totalItems = formattedItems.reduce((acc, curr) => acc + curr.quantity, 0);

    return {
      id: cart.id,
      userId: cart.userId,
      guestToken: cart.guestToken,
      status: cart.status,
      currency: cart.currency,
      items: formattedItems,
      subtotal,
      totalItems,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  async addItem(cartId: number, productId: number, quantity: number, unitPrice: number) {
    const [existingItem] = await this.drizzle.db
      .select()
      .from(cartItemsTable)
      .where(and(eq(cartItemsTable.cartId, cartId), eq(cartItemsTable.productId, productId)))
      .limit(1);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      const [updated] = await this.drizzle.db
        .update(cartItemsTable)
        .set({
          quantity: newQuantity,
          unitPrice: String(unitPrice),
          updatedAt: new Date(),
        })
        .where(eq(cartItemsTable.id, existingItem.id))
        .returning();
      return updated;
    }

    const [created] = await this.drizzle.db
      .insert(cartItemsTable)
      .values({
        cartId,
        productId,
        quantity,
        unitPrice: String(unitPrice),
      })
      .returning();

    return created;
  }

  async updateItemQuantity(itemId: number, quantity: number) {
    if (quantity <= 0) {
      return this.removeItem(itemId);
    }

    const [updated] = await this.drizzle.db
      .update(cartItemsTable)
      .set({
        quantity,
        updatedAt: new Date(),
      })
      .where(eq(cartItemsTable.id, itemId))
      .returning();

    return updated;
  }

  async removeItem(itemId: number) {
    const [deleted] = await this.drizzle.db
      .delete(cartItemsTable)
      .where(eq(cartItemsTable.id, itemId))
      .returning();
    return deleted;
  }

  async clearCart(cartId: number) {
    await this.drizzle.db
      .delete(cartItemsTable)
      .where(eq(cartItemsTable.cartId, cartId));
  }

  async findCartItem(itemId: number) {
    const [item] = await this.drizzle.db
      .select()
      .from(cartItemsTable)
      .where(eq(cartItemsTable.id, itemId))
      .limit(1);
    return item ?? null;
  }
}
