import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderService } from '../../src/modules/orders/services/order.service';
import { DomainException, EntityNotFoundException } from '../../src/shared';

describe('OrderService - Unit Suite', () => {
  let orderService: OrderService;
  let mockOrderRepo: any;
  let mockDrizzle: any;

  beforeEach(() => {
    mockOrderRepo = {
      create: vi.fn().mockImplementation((params) => Promise.resolve({
        id: 99,
        orderNumber: params.orderNumber,
        buyerId: params.buyerId,
        total: params.total,
        status: 'pendiente',
        paymentStatus: 'pending',
      })),
      findById: vi.fn(),
      listByBuyer: vi.fn().mockResolvedValue([
        { id: 99, orderNumber: 'FM-123', total: 20000, status: 'pendiente' },
      ]),
      adminList: vi.fn(),
      updateStatus: vi.fn(),
      getStats: vi.fn().mockResolvedValue({
        totalOrders: 10,
        revenue: 250000,
        averageOrder: 25000,
      }),
    };

    mockDrizzle = {
      db: {
        select: vi.fn(),
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
          }),
        }),
      },
    };

    orderService = new OrderService(mockOrderRepo, mockDrizzle);
  });

  it('debe listar los pedidos del comprador autenticado', async () => {
    const orders = await orderService.listMyOrders('user-100');
    expect(orders).toHaveLength(1);
    expect(mockOrderRepo.listByBuyer).toHaveBeenCalledWith('user-100');
  });

  it('debe arrojar EntityNotFoundException si la orden no existe', async () => {
    mockOrderRepo.findById.mockResolvedValue(null);
    await expect(orderService.getOrderById(999)).rejects.toThrow(EntityNotFoundException);
  });

  it('debe crear una orden descontando el stock correspondiente', async () => {
    mockDrizzle.db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([
          { id: 1, name: 'Sierra Circular', price: '20000', stock: 5, sellerId: 'seller-1' },
        ]),
      }),
    });

    const order = await orderService.createOrder('user-100', {
      items: [{ productId: 1, quantity: 2 }],
      shippingName: 'Juan Pérez',
      shippingPhone: '11223344',
      shippingAddress: 'San Martín 120',
      shippingCity: 'Rosario',
      shippingProvince: 'Santa Fe',
      shippingCost: 1500,
    });

    expect(order).toBeDefined();
    expect(order.total).toBe(41500); // 20000*2 + 1500
    expect(mockOrderRepo.create).toHaveBeenCalled();
    expect(mockDrizzle.db.update).toHaveBeenCalled();
  });
});
