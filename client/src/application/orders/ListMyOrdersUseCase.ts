import type { OrderRepository } from "@/domain/repositories/OrderRepository";
import type { Order } from "@/domain/entities/Order";

export class ListMyOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute(): Promise<Order[]> {
    return this.orderRepository.listMine();
  }
}