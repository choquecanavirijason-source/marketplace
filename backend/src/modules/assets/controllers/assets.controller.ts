import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AssetsService } from '../services/assets.service';
import { CreateUploadSessionDto, createUploadSessionSchema } from '../dto/assets.dto';
import { JwtAuthGuard, CurrentUser, ZodValidationPipe } from '../../../common';
import { AuthenticatedUser } from '../../../shared';

@ApiTags('Assets - Media Storage')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('upload-sessions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generar Presigned URL para subida directa a bucket S3/R2' })
  async createUploadSession(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createUploadSessionSchema)) dto: CreateUploadSessionDto,
  ) {
    return this.assetsService.createUploadSession(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar archivos y assets multimedia subidos' })
  async list() {
    return this.assetsService.listAssets();
  }
}
