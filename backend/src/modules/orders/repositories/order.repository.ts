import { Injectable } from '@nestjs/common';
import { eq, and, or, ilike, desc, count, sql, inArray } from 'drizzle-orm';
import { DrizzleService } from '../../../infrastructure/database/drizzle.service';
import {
  ordersTable,
  orderItemsTable,
  orderTimelineEventsTable,
  usersTable,
  productsTable,
} from '../../../infrastructure/database/schema';

export interface CreateOrderParams {
  buyerId: string;
  orderNumber: string;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingProvince: string;
  shippingZip?: string;
  notes?: string;
  items: Array<{
    productId: number;
    sellerId?: string | null;
    productName: string;
    productImage?: string | null;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }>;
}

@Injectable()
export class OrderRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(params: CreateOrderParams) {
    const [order] = await this.drizzle.db
      .insert(ordersTable)
      .values({
        orderNumber: params.orderNumber,
        buyerId: params.buyerId,
        status: 'pendiente',
        paymentStatus: 'pending',
        currency: 'ARS',
        subtotal: String(params.subtotal),
        shippingCost: String(params.shippingCost),
        discountAmount: String(params.discountAmount),
        total: String(params.total),
        shippingName: params.shippingName,
        shippingPhone: params.shippingPhone,
        shippingAddress: params.shippingAddress,
        shippingCity: params.shippingCity,
        shippingProvince: params.shippingProvince,
        shippingZip: params.shippingZip,
        notes: params.notes,
      })
      .returning();

    if (params.items.length > 0) {
      await this.drizzle.db.insert(orderItemsTable).values(
        params.items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          sellerId: item.sellerId ?? null,
          productName: item.productName,
          productImage: item.productImage ?? null,
          unitPrice: String(item.unitPrice),
          quantity: item.quantity,
          subtotal: String(item.subtotal),
        })),
      );
    }

    await this.drizzle.db.insert(orderTimelineEventsTable).values({
      orderId: order.id,
      eventType: 'order.created',
      actorType: 'buyer',
      actorId: params.buyerId,
      description: `Pedido ${order.orderNumber} creado exitosamente.`,
      metadata: JSON.stringify({ total: params.total, itemsCount: params.items.length }),
    });

    return this.findById(order.id);
  }

  async findById(id: number) {
    const [order] = await this.drizzle.db
      .select({
        id: ordersTable.id,
        orderNumber: ordersTable.orderNumber,
        buyerId: ordersTable.buyerId,
        status: ordersTable.status,
        paymentStatus: ordersTable.paymentStatus,
        currency: ordersTable.currency,
        subtotal: ordersTable.subtotal,
        shippingCost: ordersTable.shippingCost,
        discountAmount: ordersTable.discountAmount,
        total: ordersTable.total,
        shippingName: ordersTable.shippingName,
        shippingPhone: ordersTable.shippingPhone,
        shippingAddress: ordersTable.shippingAddress,
        shippingCity: ordersTable.shippingCity,
        shippingProvince: ordersTable.shippingProvince,
        shippingZip: ordersTable.shippingZip,
        notes: ordersTable.notes,
        createdAt: ordersTable.createdAt,
        updatedAt: ordersTable.updatedAt,
        completedAt: ordersTable.completedAt,
        buyerEmail: usersTable.email,
        buyerPhone: usersTable.phone,
      })
      .from(ordersTable)
      .leftJoin(usersTable, eq(ordersTable.buyerId, usersTable.id))
      .where(eq(ordersTable.id, id))
      .limit(1);

    if (!order) return null;

    const items = await this.drizzle.db
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, id));

    const events = await this.drizzle.db
      .select()
      .from(orderTimelineEventsTable)
      .where(eq(orderTimelineEventsTable.orderId, id))
      .orderBy(desc(orderTimelineEventsTable.occurredAt));

    return {
      ...order,
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      discountAmount: Number(order.discountAmount),
      total: Number(order.total),
      user: {
        id: order.buyerId,
        email: order.buyerEmail,
        name: order.shippingName || 'Cliente',
        phone: order.shippingPhone || order.buyerPhone,
      },
      items: items.map((i) => ({
        id: i.id,
        productId: i.productId,
        name: i.productName,
        image: i.productImage,
        price: Number(i.unitPrice),
        quantity: i.quantity,
        subtotal: Number(i.subtotal),
      })),
      timeline: events.map((e) => ({
        id: e.id,
        eventType: e.eventType,
        actorType: e.actorType,
        description: e.description,
        occurredAt: e.occurredAt.toISOString(),
      })),
    };
  }

  async listByBuyer(buyerId: string) {
    const orders = await this.drizzle.db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.buyerId, buyerId))
      .orderBy(desc(ordersTable.createdAt));

    const orderIds = orders.map((o) => o.id);
    const items = orderIds.length > 0
      ? await this.drizzle.db
          .select()
          .from(orderItemsTable)
          .where(inArray(orderItemsTable.orderId, orderIds))
      : [];

    return orders.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      shippingCost: Number(o.shippingCost),
      discountAmount: Number(o.discountAmount),
      total: Number(o.total),
      items: items
        .filter((it) => it.orderId === o.id)
        .map((i) => ({
          id: i.id,
          productId: i.productId,
          name: i.productName,
          image: i.productImage,
          price: Number(i.unitPrice),
          quantity: i.quantity,
          subtotal: Number(i.subtotal),
        })),
    }));
  }

  async adminList(params: { page?: number; limit?: number; status?: string; search?: string }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    if (params.status && params.status !== 'todos') {
      conditions.push(eq(ordersTable.status, params.status));
    }

    if (params.search && params.search.trim()) {
      const term = `%${params.search.trim().toLowerCase()}%`;
      conditions.push(
        or(
          ilike(ordersTable.orderNumber, term),
          ilike(ordersTable.shippingName, term),
          ilike(ordersTable.shippingCity, term),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalRow] = await this.drizzle.db
      .select({ count: count() })
      .from(ordersTable)
      .where(whereClause);
    const total = Number(totalRow?.count ?? 0);

    const orders = await this.drizzle.db
      .select({
        id: ordersTable.id,
        orderNumber: ordersTable.orderNumber,
        buyerId: ordersTable.buyerId,
        status: ordersTable.status,
        paymentStatus: ordersTable.paymentStatus,
        currency: ordersTable.currency,
        subtotal: ordersTable.subtotal,
        shippingCost: ordersTable.shippingCost,
        total: ordersTable.total,
        shippingName: ordersTable.shippingName,
        shippingCity: ordersTable.shippingCity,
        shippingProvince: ordersTable.shippingProvince,
        createdAt: ordersTable.createdAt,
        buyerEmail: usersTable.email,
      })
      .from(ordersTable)
      .leftJoin(usersTable, eq(ordersTable.buyerId, usersTable.id))
      .where(whereClause)
      .orderBy(desc(ordersTable.createdAt))
      .limit(limit)
      .offset(offset);

    const orderIds = orders.map((o) => o.id);
    const items = orderIds.length > 0
      ? await this.drizzle.db
          .select()
          .from(orderItemsTable)
          .where(inArray(orderItemsTable.orderId, orderIds))
      : [];

    const formatted = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      buyerId: o.buyerId,
      status: o.status,
      paymentStatus: o.paymentStatus,
      subtotal: Number(o.subtotal),
      shipping: Number(o.shippingCost),
      total: Number(o.total),
      shippingCity: o.shippingCity,
      createdAt: o.createdAt.toISOString(),
      user: {
        id: o.buyerId,
        email: o.buyerEmail,
        name: o.shippingName || 'Cliente',
      },
      items: items
        .filter((it) => it.orderId === o.id)
        .map((i) => ({
          id: i.id,
          productId: i.productId,
          name: i.productName,
          image: i.productImage,
          price: Number(i.unitPrice),
          quantity: i.quantity,
          subtotal: Number(i.subtotal),
        })),
    }));

    return {
      items: formatted,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async updateStatus(id: number, status: string, notes?: string, actorId?: string) {
    const isCompleted = status === 'entregado';
    await this.drizzle.db
      .update(ordersTable)
      .set({
        status,
        updatedAt: new Date(),
        ...(isCompleted ? { completedAt: new Date() } : {}),
      })
      .where(eq(ordersTable.id, id));

    await this.drizzle.db.insert(orderTimelineEventsTable).values({
      orderId: id,
      eventType: `order.status.${status}`,
      actorType: 'admin',
      actorId: actorId ?? null,
      description: notes ? `Estado actualizado a "${status}": ${notes}` : `Estado actualizado a "${status}".`,
      metadata: JSON.stringify({ status, notes }),
    });

    return this.findById(id);
  }

  async getStats() {
    const allOrders = await this.drizzle.db
      .select({
        id: ordersTable.id,
        status: ordersTable.status,
        total: ordersTable.total,
        buyerId: ordersTable.buyerId,
      })
      .from(ordersTable);

    const totalOrders = allOrders.length;
    const revenue = allOrders
      .filter((o) => o.status !== 'cancelado')
      .reduce((acc, o) => acc + Number(o.total), 0);

    const averageOrder = totalOrders > 0 ? revenue / Math.max(1, totalOrders) : 0;

    const uniqueClients = new Set(allOrders.map((o) => o.buyerId)).size;

    const ordersByStatus: Record<string, number> = {};
    for (const o of allOrders) {
      ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1;
    }

    return {
      totalOrders,
      revenue,
      averageOrder,
      totalClients: uniqueClients,
      totalProducts: 36,
      ordersByStatus,
    };
  }
}
