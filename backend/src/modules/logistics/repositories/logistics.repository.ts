import { Injectable } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { DrizzleService } from '../../../infrastructure/database/drizzle.service';
import {
  shipmentsTable,
  shipmentEventsTable,
  ordersTable,
  orderTimelineEventsTable,
} from '../../../infrastructure/database/schema';
import { CreateShipmentDto, UpdateShipmentStatusDto } from '../dto/logistics.dto';

@Injectable()
export class LogisticsRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async createShipment(dto: CreateShipmentDto) {
    const trackingCode = `TRK-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

    const [shipment] = await this.drizzle.db
      .insert(shipmentsTable)
      .values({
        orderId: dto.orderId,
        carrier: dto.carrier,
        trackingCode,
        serviceType: dto.serviceType,
        destinationAddress: dto.destinationAddress,
        destinationCity: dto.destinationCity,
        receiverName: dto.receiverName,
        receiverPhone: dto.receiverPhone,
        shippingCost: String(dto.shippingCost ?? 0),
        estimatedDeliveryAt: estimatedDelivery,
      })
      .returning();

    await this.drizzle.db.insert(shipmentEventsTable).values({
      shipmentId: shipment.id,
      status: 'pendiente_preparacion',
      location: 'Centro de Distribución Central',
      description: 'Envío registrado, a la espera de empaquetado.',
    });

    return shipment;
  }

  async findById(id: number) {
    const [shipment] = await this.drizzle.db
      .select()
      .from(shipmentsTable)
      .where(eq(shipmentsTable.id, id))
      .limit(1);

    if (!shipment) return null;

    const events = await this.drizzle.db
      .select()
      .from(shipmentEventsTable)
      .where(eq(shipmentEventsTable.shipmentId, id))
      .orderBy(desc(shipmentEventsTable.occurredAt));

    return {
      ...shipment,
      shippingCost: Number(shipment.shippingCost),
      events,
    };
  }

  async findByOrderId(orderId: number) {
    const [shipment] = await this.drizzle.db
      .select()
      .from(shipmentsTable)
      .where(eq(shipmentsTable.orderId, orderId))
      .limit(1);

    if (!shipment) return null;
    return this.findById(shipment.id);
  }

  async findByTrackingCode(trackingCode: string) {
    const [shipment] = await this.drizzle.db
      .select()
      .from(shipmentsTable)
      .where(eq(shipmentsTable.trackingCode, trackingCode))
      .limit(1);

    if (!shipment) return null;
    return this.findById(shipment.id);
  }

  async updateStatus(id: number, dto: UpdateShipmentStatusDto) {
    const isShipped = dto.status === 'despachado';
    const isDelivered = dto.status === 'entregado';

    const [shipment] = await this.drizzle.db
      .update(shipmentsTable)
      .set({
        status: dto.status,
        updatedAt: new Date(),
        ...(isShipped ? { shippedAt: new Date() } : {}),
        ...(isDelivered ? { deliveredAt: new Date() } : {}),
      })
      .where(eq(shipmentsTable.id, id))
      .returning();

    await this.drizzle.db.insert(shipmentEventsTable).values({
      shipmentId: id,
      status: dto.status,
      location: dto.location,
      description: dto.description,
    });

    // Mirror event on order timeline
    if (shipment) {
      await this.drizzle.db.insert(orderTimelineEventsTable).values({
        orderId: shipment.orderId,
        eventType: `shipment.${dto.status}`,
        actorType: 'carrier',
        description: `Logística (${shipment.carrier}): ${dto.description} en ${dto.location}`,
      });

      if (isDelivered) {
        await this.drizzle.db
          .update(ordersTable)
          .set({ status: 'entregado', completedAt: new Date(), updatedAt: new Date() })
          .where(eq(ordersTable.id, shipment.orderId));
      } else if (isShipped) {
        await this.drizzle.db
          .update(ordersTable)
          .set({ status: 'enviado', updatedAt: new Date() })
          .where(eq(ordersTable.id, shipment.orderId));
      }
    }

    return this.findById(id);
  }

  async listShipments(limit = 50) {
    const shipments = await this.drizzle.db
      .select()
      .from(shipmentsTable)
      .orderBy(desc(shipmentsTable.createdAt))
      .limit(limit);

    return shipments.map((s) => ({
      ...s,
      shippingCost: Number(s.shippingCost),
    }));
  }
}
