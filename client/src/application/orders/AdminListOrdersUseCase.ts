import type { AdminListOrdersParams, OrderRepository } from "@/services";
import type { Paginated } from "@/types";
import type { Order } from "@/types";

export class AdminListOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute(params?: AdminListOrdersParams): Promise<Paginated<Order>> {
    return this.orderRepository.adminList(params);
  }
}