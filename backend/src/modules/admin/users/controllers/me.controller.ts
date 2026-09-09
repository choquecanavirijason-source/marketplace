import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { SessionService } from '../../auth/services/session.service';
import { StorageService } from '../../../../infrastructure/storage/storage.service';
import {
  ProfileDto,
  profileSchema,
  BusinessProfileDto,
  businessProfileSchema,
  UploadAvatarDto,
  uploadAvatarSchema,
  CreateAddressDto,
  createAddressSchema,
  UpdateAddressDto,
  updateAddressSchema,
} from '../dto';
import { CurrentUser, JwtAuthGuard, ZodValidationPipe } from '../../../../common';
import { AuthenticatedUser } from '../../../../shared';
import * as crypto from 'crypto';

@ApiTags('Me & Sessions')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller(['identity', ''])
export class MeController {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly storageService: StorageService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener información del usuario autenticado actual y sus permisos' })
  async getMe(@CurrentUser() currentUser: AuthenticatedUser) {
    const user = await this.userService.getUser(currentUser.id);
    return {
      ...user.toJSON(),
      permissions: (currentUser as any).permissions || user.permissions,
    };
  }

  @Put('profile')
  @ApiOperation({ summary: 'Actualizar perfil personal del usuario autenticado' })
  async updateProfile(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body(new ZodValidationPipe(profileSchema)) dto: ProfileDto,
  ) {
    const user = await this.userService.updateProfile(currentUser.id, dto);
    return user.toJSON();
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Subir avatar del usuario a AWS S3 y actualizar perfil' })
  async uploadAvatar(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body(new ZodValidationPipe(uploadAvatarSchema)) dto: UploadAvatarDto,
  ) {
    let base64Data = dto.image;
    let mimeType = dto.mimeType || 'image/jpeg';

    if (base64Data.startsWith('data:')) {
      const match = base64Data.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      } else {
        const commaIdx = base64Data.indexOf(',');
        if (commaIdx !== -1) {
          base64Data = base64Data.substring(commaIdx + 1);
        }
      }
    }

    const rawBuffer = Buffer.from(base64Data, 'base64');
    if (rawBuffer.length > 10 * 1024 * 1024) {
      throw new BadRequestException('La imagen no debe superar los 10MB');
    }

    // Optimizar imagen y convertir automáticamente a formato WebP (máx 512x512 para avatar)
    const { buffer: optimizedBuffer, mimeType: finalMimeType, extension } =
      await this.storageService.optimizeImage(rawBuffer, {
        maxWidth: 512,
        maxHeight: 512,
        quality: 85,
        format: 'webp',
      });

    const s3Key = `avatars/${currentUser.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
    const avatarUrl = await this.storageService.uploadBuffer(s3Key, optimizedBuffer, finalMimeType);

    const updatedUser = await this.userService.updateProfile(currentUser.id, { avatarUrl });

    return {
      avatarUrl,
      user: updatedUser.toJSON(),
      message: 'Avatar actualizado exitosamente en AWS S3',
    };
  }

  @Put('business-profile')
  @ApiOperation({ summary: 'Actualizar perfil empresarial del usuario autenticado' })
  async updateBusinessProfile(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body(new ZodValidationPipe(businessProfileSchema)) dto: BusinessProfileDto,
  ) {
    const user = await this.userService.updateBusinessProfile(currentUser.id, dto);
    return user.toJSON();
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Listar sesiones activas del usuario' })
  async listSessions(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Req() req: FastifyRequest,
  ) {
    const sessions = await this.sessionService.listSessions(currentUser.id);
    const clientIp = req.ip;
    const userAgent = req.headers['user-agent'];

    return sessions.map((s, idx) => ({
      ...s,
      isCurrent: idx === 0 || (s.ip === clientIp && s.userAgent === userAgent),
    }));
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revocar una sesión activa específica por ID' })
  async revokeSession(
    @Param('id') sessionId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    await this.sessionService.revokeSession(sessionId, currentUser.id);
  }

  @Get('addresses')
  @ApiOperation({ summary: 'Listar direcciones de envío del usuario autenticado' })
  async listAddresses(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.userService.listAddresses(currentUser.id);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Crear una nueva dirección de envío para el usuario autenticado' })
  async createAddress(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body(new ZodValidationPipe(createAddressSchema)) dto: CreateAddressDto,
  ) {
    const address = await this.userService.addAddress(currentUser.id, dto);
    return address;
  }

  @Put('addresses/:id')
  @ApiOperation({ summary: 'Actualizar una dirección de envío del usuario autenticado' })
  async updateAddress(
    @Param('id') addressId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body(new ZodValidationPipe(updateAddressSchema)) dto: UpdateAddressDto,
  ) {
    const address = await this.userService.editAddress(currentUser.id, addressId, dto);
    return address;
  }

  @Delete('addresses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una dirección de envío del usuario autenticado' })
  async deleteAddress(
    @Param('id') addressId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    await this.userService.removeAddress(currentUser.id, addressId);
  }
}
