import type { CreateOrderInput, OrderRepository } from "@/domain/repositories/OrderRepository";
import type { Order } from "@/domain/entities/Order";

export class CreateOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute(input: CreateOrderInput): Promise<Order> {
    return this.orderRepository.create(input);
  }
}