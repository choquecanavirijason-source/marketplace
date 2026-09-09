import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { KycService } from '../services/kyc.service';
import { SubmitKycDto, submitKycSchema } from '../dto/submit-kyc.dto';
import {
  CurrentUser,
  JwtAuthGuard,
  Public,
  ZodValidationPipe,
} from '../../../../common';
import { AuthenticatedUser } from '../../../../shared';

@ApiTags('KYC & Biometrics')
@Controller(['kyc', 'identity/kyc'])
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Public()
  @Get('challenge')
  @ApiOperation({ summary: 'Obtener un reto biométrico anti-repetición (parpadeo/giro) para verificación facial' })
  @ApiResponse({ status: 200, description: 'Reto emitido con éxito' })
  async getChallenge() {
    return this.kycService.getChallenge();
  }

  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  @Post('submit')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Enviar documento de identidad y video selfie con prueba de vida para análisis biométrico' })
  @ApiResponse({ status: 202, description: 'Verificación enviada y en análisis' })
  @ApiResponse({ status: 400, description: 'Archivos o formato inválidos' })
  async submitVerification(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body(new ZodValidationPipe(submitKycSchema)) dto: SubmitKycDto,
  ) {
    return this.kycService.submitVerification(currentUser.id, dto);
  }

  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  @Get('status')
  @ApiOperation({ summary: 'Consultar el estado de verificación biométrica e identidad del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Estado actual de verificación' })
  async getStatus(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query('jobId') jobId?: string,
  ) {
    return this.kycService.getVerificationStatus(currentUser.id, jobId);
  }
}
