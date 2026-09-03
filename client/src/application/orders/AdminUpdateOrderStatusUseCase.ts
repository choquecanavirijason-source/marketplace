import type { OrderRepository } from "@/services";
import type { Order, OrderStatus } from "@/types";

export class AdminUpdateOrderStatusUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute(id: number, status: OrderStatus): Promise<Order> {
    return this.orderRepository.adminUpdateStatus(id, status);
  }
}