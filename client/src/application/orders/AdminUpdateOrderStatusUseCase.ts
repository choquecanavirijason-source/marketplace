import type { OrderRepository } from "@/domain/repositories/OrderRepository";
import type { Order, OrderStatus } from "@/domain/entities/Order";

export class AdminUpdateOrderStatusUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute(id: number, status: OrderStatus): Promise<Order> {
    return this.orderRepository.adminUpdateStatus(id, status);
  }
}