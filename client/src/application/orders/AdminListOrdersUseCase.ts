import type { AdminListOrdersParams, OrderRepository } from "@/domain/repositories/OrderRepository";
import type { Paginated } from "@/domain/entities/Order";
import type { Order } from "@/domain/entities/Order";

export class AdminListOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute(params?: AdminListOrdersParams): Promise<Paginated<Order>> {
    return this.orderRepository.adminList(params);
  }
}