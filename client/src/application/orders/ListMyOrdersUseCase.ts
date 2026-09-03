import type { OrderRepository } from "@/services";
import type { Order } from "@/types";

export class ListMyOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute(): Promise<Order[]> {
    return this.orderRepository.listMine();
  }
}