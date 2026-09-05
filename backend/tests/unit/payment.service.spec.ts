import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentService } from '../../src/modules/payments/services/payment.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PaymentService - Unit Suite', () => {
  let paymentService: PaymentService;
  let mockPaymentRepo: any;
  let mockDrizzle: any;

  beforeEach(() => {
    mockPaymentRepo = {
      createPayment: vi.fn().mockResolvedValue({
        id: 501,
        orderId: 1,
        amount: '12000.00',
        currency: 'ARS',
        status: 'pending',
        provider: 'simulator',
      }),
      findById: vi.fn(),
      findByOrderId: vi.fn(),
      updateStatus: vi.fn().mockResolvedValue({
        id: 501,
        status: 'approved',
      }),
      createEscrowHold: vi.fn().mockResolvedValue({ id: 1, amount: '12000.00', status: 'held' }),
      updateOrderPaymentStatus: vi.fn().mockResolvedValue(undefined),
    };

    mockDrizzle = {
      db: {
        select: vi.fn(),
      },
    };

    paymentService = new PaymentService(mockPaymentRepo, mockDrizzle);
  });

  it('debe crear una intención de pago correctamente para una orden existente', async () => {
    mockDrizzle.db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            { id: 1, orderNumber: 'FM-1234', total: '12000.00', paymentStatus: 'pending' },
          ]),
        }),
      }),
    });

    const intent = await paymentService.createPaymentIntent({
      orderId: 1,
      paymentMethod: 'card',
      provider: 'simulator',
    });

    expect(intent).toBeDefined();
    expect(intent.paymentId).toBe(501);
    expect(intent.amount).toBe(12000);
    expect(mockPaymentRepo.createPayment).toHaveBeenCalledWith(1, 12000, 'card', 'simulator');
  });

  it('debe arrojar error si la orden ya se encuentra pagada', async () => {
    mockDrizzle.db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            { id: 1, orderNumber: 'FM-1234', total: '12000.00', paymentStatus: 'paid' },
          ]),
        }),
      }),
    });

    await expect(
      paymentService.createPaymentIntent({
        orderId: 1,
        paymentMethod: 'card',
        provider: 'simulator',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('debe procesar un pago aprobado, crear la retención en custodia (Escrow) y actualizar la orden', async () => {
    mockDrizzle.db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            { id: 1, orderNumber: 'FM-1234', total: '12000.00', paymentStatus: 'pending' },
          ]),
        }),
      }),
    });

    const result = await paymentService.processPayment({
      orderId: 1,
      paymentId: 501,
      status: 'approved',
    });

    expect(result.success).toBe(true);
    expect(mockPaymentRepo.updateStatus).toHaveBeenCalledWith(501, 'approved', expect.any(String));
    expect(mockPaymentRepo.updateOrderPaymentStatus).toHaveBeenCalledWith(1, 'paid', 'confirmado');
    expect(mockPaymentRepo.createEscrowHold).toHaveBeenCalledWith(1, 501, 12000);
  });
});
