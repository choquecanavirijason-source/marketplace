import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrderService } from '../services/order.service';
import {
  OrderStatusDto,
  orderStatusSchema,
  OrderQueryDto,
  orderQuerySchema,
} from '../dto/order.dto';
import {
  JwtAuthGuard,
  RolesGuard,
  RequireRoles,
  CurrentUser,
  ZodValidationPipe,
} from '../../../common';
import { UserType, AuthenticatedUser } from '../../../shared';

const ORDER_ADMIN_ROLES = [UserType.ADMIN, UserType.SUPERADMIN];

@ApiTags('Orders - Backoffice')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(...ORDER_ADMIN_ROLES)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly orderService: OrderService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Obtener métricas y estadísticas globales de pedidos para dashboard' })
  async getStats() {
    return this.orderService.getAdminStats();
  }

  @Get()
  @ApiOperation({ summary: 'Listar pedidos para administración con filtros y paginación' })
  async list(@Query(new ZodValidationPipe(orderQuerySchema)) query: OrderQueryDto) {
    return this.orderService.adminListOrders(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle completo de un pedido con su timeline' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.getOrderById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado operativo de un pedido' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(orderStatusSchema)) dto: OrderStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.orderService.adminUpdateStatus(id, dto, user.id);
  }
}
