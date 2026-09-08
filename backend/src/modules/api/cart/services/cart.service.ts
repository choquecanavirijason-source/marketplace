import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CartRepository } from '../repositories/cart.repository';
import { AddToCartDto, UpdateCartItemDto } from '../dto/cart.dto';
import { DrizzleService } from '../../../../infrastructure/database/drizzle.service';
import { productsTable } from '../../../../infrastructure/database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepo: CartRepository,
    private readonly drizzle: DrizzleService,
  ) {}

  async getCart(userId?: string, guestToken?: string) {
    const cart = await this.cartRepo.findOrCreateCart(userId, guestToken);
    return this.cartRepo.getCartWithItems(cart.id);
  }

  async addItem(dto: AddToCartDto, userId?: string) {
    const [product] = await this.drizzle.db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, dto.productId))
      .limit(1);

    if (!product) {
      throw new NotFoundException(`Producto con ID ${dto.productId} no encontrado.`);
    }

    if (product.status !== 'published') {
      throw new BadRequestException(`El producto "${product.name}" no se encuentra disponible.`);
    }

    if (product.stock < dto.quantity) {
      throw new BadRequestException(
        `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, solicitado: ${dto.quantity}.`,
      );
    }

    const cart = await this.cartRepo.findOrCreateCart(userId, dto.guestToken);
    await this.cartRepo.addItem(cart.id, product.id, dto.quantity, Number(product.price));

    return this.cartRepo.getCartWithItems(cart.id);
  }

  async updateItemQuantity(itemId: number, dto: UpdateCartItemDto, userId?: string, guestToken?: string) {
    const item = await this.cartRepo.findCartItem(itemId);
    if (!item) {
      throw new NotFoundException(`Elemento del carrito #${itemId} no encontrado.`);
    }

    if (dto.quantity > 0) {
      const [product] = await this.drizzle.db
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, item.productId))
        .limit(1);

      if (product && product.stock < dto.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, solicitado: ${dto.quantity}.`,
        );
      }
    }

    await this.cartRepo.updateItemQuantity(itemId, dto.quantity);
    return this.cartRepo.getCartWithItems(item.cartId);
  }

  async removeItem(itemId: number) {
    const item = await this.cartRepo.findCartItem(itemId);
    if (!item) {
      throw new NotFoundException(`Elemento del carrito #${itemId} no encontrado.`);
    }

    await this.cartRepo.removeItem(itemId);
    return this.cartRepo.getCartWithItems(item.cartId);
  }

  async clearCart(userId?: string, guestToken?: string) {
    const cart = await this.cartRepo.findOrCreateCart(userId, guestToken);
    await this.cartRepo.clearCart(cart.id);
    return this.cartRepo.getCartWithItems(cart.id);
  }
}
