import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrderService } from '../services/order.service';
import { JwtAuthGuard, RolesGuard, RequireRoles } from '../../../../common';
import { UserType } from '../../../../shared';

const STATS_ROLES = [
  UserType.ADMIN,
  UserType.SUPERADMIN,
  UserType.SUPPORT,
  UserType.SELLER,
];

@ApiTags('Admin - Stats')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(...STATS_ROLES)
@Controller('admin')
export class AdminStatsController {
  constructor(private readonly orderService: OrderService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Obtener métricas y estadísticas globales para dashboard y analíticas' })
  async getStats() {
    return this.orderService.getAdminStats();
  }
}
