import { Injectable } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { DrizzleService } from '../../../infrastructure/database/drizzle.service';
import {
  paymentsTable,
  financialLedgerTable,
  escrowHoldsTable,
  ordersTable,
  orderTimelineEventsTable,
} from '../../../infrastructure/database/schema';

@Injectable()
export class PaymentRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async createPayment(orderId: number, amount: number, paymentMethod: string, provider = 'simulator') {
    const [payment] = await this.drizzle.db
      .insert(paymentsTable)
      .values({
        orderId,
        amount: String(amount),
        currency: 'ARS',
        status: 'pending',
        provider,
        paymentMethod,
      })
      .returning();
    return payment;
  }

  async findById(id: number) {
    const [payment] = await this.drizzle.db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.id, id))
      .limit(1);
    return payment ?? null;
  }

  async findByOrderId(orderId: number) {
    return this.drizzle.db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.orderId, orderId))
      .orderBy(desc(paymentsTable.createdAt));
  }

  async updateStatus(id: number, status: string, providerPaymentId?: string) {
    const isApproved = status === 'approved';
    const [updated] = await this.drizzle.db
      .update(paymentsTable)
      .set({
        status,
        providerPaymentId: providerPaymentId ?? undefined,
        updatedAt: new Date(),
        ...(isApproved ? { approvedAt: new Date() } : {}),
      })
      .where(eq(paymentsTable.id, id))
      .returning();

    return updated;
  }

  async createEscrowHold(orderId: number, paymentId: number, amount: number) {
    const autoReleaseDate = new Date();
    autoReleaseDate.setDate(autoReleaseDate.getDate() + 7); // Escrow hold for 7 days

    const [hold] = await this.drizzle.db
      .insert(escrowHoldsTable)
      .values({
        orderId,
        paymentId,
        amount: String(amount),
        status: 'held',
        autoReleaseAt: autoReleaseDate,
      })
      .returning();

    await this.drizzle.db.insert(financialLedgerTable).values({
      orderId,
      paymentId,
      type: 'escrow_hold',
      amount: String(amount),
      balanceAfter: String(amount),
      description: `Retención en custodia (Escrow) de \$${amount} para orden #${orderId}`,
    });

    return hold;
  }

  async releaseEscrow(orderId: number) {
    const [hold] = await this.drizzle.db
      .select()
      .from(escrowHoldsTable)
      .where(eq(escrowHoldsTable.orderId, orderId))
      .limit(1);

    if (hold && hold.status === 'held') {
      await this.drizzle.db
        .update(escrowHoldsTable)
        .set({
          status: 'released',
          releasedAt: new Date(),
        })
        .where(eq(escrowHoldsTable.id, hold.id));

      await this.drizzle.db.insert(financialLedgerTable).values({
        orderId,
        paymentId: hold.paymentId,
        type: 'escrow_release',
        amount: hold.amount,
        balanceAfter: '0.00',
        description: `Liberación de fondos en custodia para la orden #${orderId}`,
      });
    }
  }

  async recordLedger(orderId: number, paymentId: number, type: string, amount: number, desc: string) {
    return this.drizzle.db.insert(financialLedgerTable).values({
      orderId,
      paymentId,
      type,
      amount: String(amount),
      balanceAfter: String(amount),
      description: desc,
    });
  }

  async updateOrderPaymentStatus(orderId: number, paymentStatus: string, orderStatus?: string) {
    await this.drizzle.db
      .update(ordersTable)
      .set({
        paymentStatus,
        ...(orderStatus ? { status: orderStatus } : {}),
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, orderId));

    await this.drizzle.db.insert(orderTimelineEventsTable).values({
      orderId,
      eventType: `payment.${paymentStatus}`,
      actorType: 'system',
      description: `Estado de pago actualizado a "${paymentStatus}".`,
      metadata: JSON.stringify({ paymentStatus, orderStatus }),
    });
  }
}
