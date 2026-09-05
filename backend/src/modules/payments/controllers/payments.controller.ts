import { Controller, Post, Get, Body, Param, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import {
  CreatePaymentIntentDto,
  createPaymentIntentSchema,
  ProcessPaymentDto,
  processPaymentSchema,
} from '../dto/payment.dto';
import { Public, ZodValidationPipe } from '../../../common';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentService) {}

  @Public()
  @Post('intent')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear intención de pago o sesión de checkout' })
  async createIntent(
    @Body(new ZodValidationPipe(createPaymentIntentSchema)) dto: CreatePaymentIntentDto,
  ) {
    return this.paymentService.createPaymentIntent(dto);
  }

  @Public()
  @Post('simulate-webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Simular procesamiento o webhook de pasarela de pago' })
  async simulatePayment(
    @Body(new ZodValidationPipe(processPaymentSchema)) dto: ProcessPaymentDto,
  ) {
    return this.paymentService.processPayment(dto);
  }

  @Public()
  @Get('order/:orderId')
  @ApiOperation({ summary: 'Obtener pagos asociados a una orden' })
  async getByOrder(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.paymentService.getPaymentsByOrderId(orderId);
  }
}
