import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrderService } from '../services/order.service';
import { CreateOrderDto, createOrderSchema } from '../dto/order.dto';
import { JwtAuthGuard, CurrentUser, ZodValidationPipe } from '../../../../common';
import { AuthenticatedUser } from '../../../../shared';

@ApiTags('Orders - Buyer')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo pedido a partir del checkout' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createOrderSchema)) dto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(user.id, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Listar pedidos del comprador autenticado' })
  async listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.orderService.listMyOrders(user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pedidos del usuario autenticado' })
  async listAll(@CurrentUser() user: AuthenticatedUser) {
    return this.orderService.listMyOrders(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un pedido por ID' })
  async getById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const order = await this.orderService.getOrderById(id);
    return order;
  }
}
