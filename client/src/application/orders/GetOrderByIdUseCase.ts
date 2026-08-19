import type { OrderRepository } from "@/domain/repositories/OrderRepository";
import type { Order } from "@/domain/entities/Order";

export class GetOrderByIdUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute(id: number): Promise<Order | null> {
    return this.orderRepository.getById(id);
  }
}