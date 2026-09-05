import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LogisticsService } from '../services/logistics.service';
import {
  CreateShipmentDto,
  createShipmentSchema,
  UpdateShipmentStatusDto,
  updateShipmentStatusSchema,
} from '../dto/logistics.dto';
import { Public, ZodValidationPipe } from '../../../common';

@ApiTags('Logistics')
@Controller('shipping')
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Public()
  @Post('shipments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear envío y generar tracking para un pedido' })
  async create(
    @Body(new ZodValidationPipe(createShipmentSchema)) dto: CreateShipmentDto,
  ) {
    return this.logisticsService.createShipment(dto);
  }

  @Public()
  @Get('shipments')
  @ApiOperation({ summary: 'Listar envíos recientes' })
  async list() {
    return this.logisticsService.listShipments();
  }

  @Public()
  @Get('shipments/:id')
  @ApiOperation({ summary: 'Obtener detalle de envío por ID' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.logisticsService.getShipment(id);
  }

  @Public()
  @Get('order/:orderId')
  @ApiOperation({ summary: 'Consultar información de despacho de una orden' })
  async getByOrder(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.logisticsService.getShipmentByOrder(orderId);
  }

  @Public()
  @Get('track/:code')
  @ApiOperation({ summary: 'Rastrear paquete por código de tracking' })
  async track(@Param('code') code: string) {
    return this.logisticsService.track(code);
  }

  @Public()
  @Patch('shipments/:id/status')
  @ApiOperation({ summary: 'Actualizar estado del envío e hitos de seguimiento' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateShipmentStatusSchema)) dto: UpdateShipmentStatusDto,
  ) {
    return this.logisticsService.updateStatus(id, dto);
  }
}
