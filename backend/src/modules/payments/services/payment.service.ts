import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository';
import { CreatePaymentIntentDto, ProcessPaymentDto } from '../dto/payment.dto';
import { DrizzleService } from '../../../infrastructure/database/drizzle.service';
import { ordersTable } from '../../../infrastructure/database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly drizzle: DrizzleService,
  ) {}

  async createPaymentIntent(dto: CreatePaymentIntentDto) {
    const [order] = await this.drizzle.db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, dto.orderId))
      .limit(1);

    if (!order) {
      throw new NotFoundException(`Orden #${dto.orderId} no encontrada.`);
    }

    if (order.paymentStatus === 'paid') {
      throw new BadRequestException(`La orden #${dto.orderId} ya está pagada.`);
    }

    const amount = Number(order.total);
    const payment = await this.paymentRepo.createPayment(
      order.id,
      amount,
      dto.paymentMethod,
      dto.provider,
    );

    return {
      paymentId: payment.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount,
      currency: payment.currency,
      status: payment.status,
      clientSecret: `sim_secret_${payment.id}_${Date.now()}`,
      provider: payment.provider,
    };
  }

  async processPayment(dto: ProcessPaymentDto) {
    const [order] = await this.drizzle.db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, dto.orderId))
      .limit(1);

    if (!order) {
      throw new NotFoundException(`Orden #${dto.orderId} no encontrada.`);
    }

    let paymentId = dto.paymentId;
    if (!paymentId) {
      const existingPayments = await this.paymentRepo.findByOrderId(order.id);
      if (existingPayments.length > 0) {
        paymentId = existingPayments[0].id;
      } else {
        const newPay = await this.paymentRepo.createPayment(order.id, Number(order.total), 'card');
        paymentId = newPay.id;
      }
    }

    const isApproved = dto.status === 'approved';
    const finalStatus = isApproved ? 'approved' : 'rejected';
    const providerPaymentId = dto.providerPaymentId || `sim_tx_${Date.now()}`;

    const updatedPayment = await this.paymentRepo.updateStatus(
      paymentId,
      finalStatus,
      providerPaymentId,
    );

    if (isApproved) {
      // Update order status to paid and confirm
      await this.paymentRepo.updateOrderPaymentStatus(order.id, 'paid', 'confirmado');
      // Hold in escrow
      await this.paymentRepo.createEscrowHold(order.id, paymentId, Number(order.total));
    } else {
      await this.paymentRepo.updateOrderPaymentStatus(order.id, 'failed');
    }

    return {
      success: isApproved,
      payment: updatedPayment,
      message: isApproved ? 'Pago aprobado y fondos retenidos en Escrow.' : 'El pago fue rechazado.',
    };
  }

  async getPaymentsByOrderId(orderId: number) {
    return this.paymentRepo.findByOrderId(orderId);
  }
}
