import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CartService } from '../../src/modules/api/cart/services/cart.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CartService - Unit Suite', () => {
  let cartService: CartService;
  let mockCartRepo: any;
  let mockDrizzle: any;

  beforeEach(() => {
    mockCartRepo = {
      findOrCreateCart: vi.fn().mockResolvedValue({ id: 1, userId: 'user-1', guestToken: null }),
      getCartWithItems: vi.fn().mockResolvedValue({
        id: 1,
        items: [{ id: 10, productId: 100, name: 'Taladro Percutor', quantity: 2, subtotal: 15000 }],
        subtotal: 15000,
        totalItems: 2,
      }),
      addItem: vi.fn().mockResolvedValue({ id: 10, cartId: 1, productId: 100, quantity: 2 }),
      updateItemQuantity: vi.fn().mockResolvedValue({ id: 10, quantity: 3 }),
      removeItem: vi.fn().mockResolvedValue({ id: 10 }),
      clearCart: vi.fn().mockResolvedValue(undefined),
      findCartItem: vi.fn(),
    };

    mockDrizzle = {
      db: {
        select: vi.fn(),
      },
    };

    cartService = new CartService(mockCartRepo, mockDrizzle);
  });

  it('debe obtener el carrito activo', async () => {
    const cart = await cartService.getCart('user-1');
    expect(cart).toBeDefined();
    expect(cart?.subtotal).toBe(15000);
    expect(mockCartRepo.findOrCreateCart).toHaveBeenCalledWith('user-1', undefined);
  });

  it('debe lanzar NotFoundException si el producto a agregar no existe', async () => {
    mockDrizzle.db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    await expect(
      cartService.addItem({ productId: 999, quantity: 1 }, 'user-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('debe lanzar BadRequestException si el producto supera el stock disponible', async () => {
    mockDrizzle.db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            { id: 100, name: 'Amoladora', status: 'published', stock: 2, price: '5000' },
          ]),
        }),
      }),
    });

    await expect(
      cartService.addItem({ productId: 100, quantity: 5 }, 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('debe agregar el producto exitosamente si cumple con stock y estado publicado', async () => {
    mockDrizzle.db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            { id: 100, name: 'Amoladora', status: 'published', stock: 10, price: '5000' },
          ]),
        }),
      }),
    });

    const res = await cartService.addItem({ productId: 100, quantity: 2 }, 'user-1');
    expect(mockCartRepo.addItem).toHaveBeenCalledWith(1, 100, 2, 5000);
    expect(res).toBeDefined();
  });
});
