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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CrmService } from '../services/crm.service';
import {
  CreateLeadDto,
  createLeadSchema,
  UpdateLeadStatusDto,
  updateLeadStatusSchema,
} from '../dto/crm.dto';
import { JwtAuthGuard, RolesGuard, RequireRoles, ZodValidationPipe } from '../../../common';
import { UserType } from '../../../shared';

@ApiTags('CRM')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(UserType.ADMIN, UserType.SUPERADMIN, UserType.SELLER)
@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Post('leads')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo prospecto o lead comercial' })
  async createLead(
    @Body(new ZodValidationPipe(createLeadSchema)) dto: CreateLeadDto,
  ) {
    return this.crmService.createLead(dto);
  }

  @Get('leads')
  @ApiOperation({ summary: 'Listar prospectos del pipeline comercial' })
  async listLeads() {
    return this.crmService.listLeads();
  }

  @Patch('leads/:id/status')
  @ApiOperation({ summary: 'Actualizar etapa y calificación del prospecto' })
  async updateLeadStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateLeadStatusSchema)) dto: UpdateLeadStatusDto,
  ) {
    return this.crmService.updateLeadStatus(id, dto);
  }

  @Get('pipeline/stats')
  @ApiOperation({ summary: 'Obtener métricas y resumen del embudo de ventas' })
  async getPipelineStats() {
    return this.crmService.getPipelineStats();
  }
}
