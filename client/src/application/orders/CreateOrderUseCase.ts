import type { CreateOrderInput, OrderRepository } from "@/services";
import type { Order } from "@/types";

export class CreateOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute(input: CreateOrderInput): Promise<Order> {
    return this.orderRepository.create(input);
  }
}