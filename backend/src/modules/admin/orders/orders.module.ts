import { Module } from '@nestjs/common';
import { OrdersController } from './controllers/orders.controller';
import { AdminOrdersController } from './controllers/admin-orders.controller';
import { AdminStatsController } from './controllers/admin-stats.controller';
import { OrderService } from './services/order.service';
import { OrderRepository } from './repositories/order.repository';

@Module({
  controllers: [OrdersController, AdminOrdersController, AdminStatsController],
  providers: [OrderService, OrderRepository],
  exports: [OrderService, OrderRepository],
})
export class OrdersModule {}
