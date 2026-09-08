import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { CreateOrderDto, OrderStatusDto, OrderQueryDto } from '../dto/order.dto';
import { DrizzleService } from '../../../../infrastructure/database/drizzle.service';
import { productsTable } from '../../../../infrastructure/database/schema';
import { inArray, eq } from 'drizzle-orm';
import { EntityNotFoundException, DomainException } from '../../../../shared';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly drizzle: DrizzleService,
  ) {}

  async createOrder(buyerId: string, dto: CreateOrderDto) {
    const productIds = dto.items.map((i) => i.productId);
    const dbProducts = await this.drizzle.db
      .select()
      .from(productsTable)
      .where(inArray(productsTable.id, productIds));

    if (dbProducts.length === 0) {
      throw new DomainException('No se encontraron los productos especificados.');
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    const items = dto.items.map((item) => {
      const p = productMap.get(item.productId);
      if (!p) {
        throw new DomainException(`El producto con ID ${item.productId} no existe.`);
      }
      if (p.stock < item.quantity) {
        throw new DomainException(`Stock insuficiente para el producto "${p.name}".`);
      }
      const unitPrice = Number(p.price);
      const subtotal = unitPrice * item.quantity;
      return {
        productId: p.id,
        sellerId: p.sellerId,
        productName: p.name,
        productImage: null,
        unitPrice,
        quantity: item.quantity,
        subtotal,
      };
    });

    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    const shippingCost = dto.shippingCost ?? 0;
    const discountAmount = 0;
    const total = subtotal + shippingCost - discountAmount;

    const orderNumber = `FM-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const order = await this.orderRepository.create({
      buyerId,
      orderNumber,
      subtotal,
      shippingCost,
      discountAmount,
      total,
      shippingName: dto.shippingName,
      shippingPhone: dto.shippingPhone,
      shippingAddress: dto.shippingAddress,
      shippingCity: dto.shippingCity,
      shippingProvince: dto.shippingProvince,
      shippingZip: dto.shippingZip,
      notes: dto.notes,
      items,
    });

    for (const item of items) {
      const p = productMap.get(item.productId);
      if (p) {
        await this.drizzle.db
          .update(productsTable)
          .set({ stock: Math.max(0, p.stock - item.quantity) })
          .where(eq(productsTable.id, item.productId));
      }
    }

    return order;
  }

  async listMyOrders(buyerId: string) {
    return this.orderRepository.listByBuyer(buyerId);
  }

  async getOrderById(id: number) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new EntityNotFoundException('Pedido', String(id));
    }
    return order;
  }

  async adminListOrders(query: OrderQueryDto) {
    return this.orderRepository.adminList(query);
  }

  async adminUpdateStatus(id: number, dto: OrderStatusDto, adminId?: string) {
    const existing = await this.orderRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Pedido', String(id));
    }
    return this.orderRepository.updateStatus(id, dto.status, dto.notes, adminId);
  }

  async getAdminStats() {
    return this.orderRepository.getStats();
  }
}
