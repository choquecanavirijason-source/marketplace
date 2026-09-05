import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SellerService } from '../services/seller.service';
import { UpsertSellerProfileDto, upsertSellerProfileSchema } from '../dto/seller.dto';
import { JwtAuthGuard, CurrentUser, ZodValidationPipe } from '../../../common';
import { AuthenticatedUser } from '../../../shared';

@ApiTags('Seller Hub')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Obtener perfil comercial del vendedor' })
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.sellerService.getProfile(user.id);
  }

  @Post('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Crear o actualizar perfil comercial del vendedor' })
  async upsertProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(upsertSellerProfileSchema)) dto: UpsertSellerProfileDto,
  ) {
    return this.sellerService.upsertProfile(user.id, dto);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Resumen e indicadores de rendimiento del vendedor' })
  async getDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.sellerService.getDashboard(user.id);
  }

  @Get('products')
  @ApiOperation({ summary: 'Listar productos pertenecientes a la tienda del vendedor' })
  async getProducts(@CurrentUser() user: AuthenticatedUser) {
    return this.sellerService.getProducts(user.id);
  }
}
