import type { OrderRepository } from "@/services";
import type { Order } from "@/types";

export class GetOrderByIdUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute(id: number): Promise<Order | null> {
    return this.orderRepository.getById(id);
  }
}