import {
  Controller,
  Get,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { GetUserQuery } from '../application/queries/get-user.query';
import { UpdateProfileHandler } from '../application/handlers/update-profile.handler';
import { UpdateBusinessProfileHandler } from '../application/handlers/update-business-profile.handler';
import { ListSessionsQuery } from '../application/queries/list-sessions.query';
import { RevokeSessionHandler } from '../application/handlers/revoke-session.handler';
import { updateProfileSchema, UpdateProfileDto, updateBusinessProfileSchema, UpdateBusinessProfileDto } from './dto/profile.dto';
import { JwtAuthGuard, CurrentUser, ZodValidationPipe } from '../../../common';
import { AuthenticatedUser, getPermissionsForRole } from '../../../shared';

@UseGuards(JwtAuthGuard)
@Controller(['me', 'identity'])
export class MeController {
  constructor(
    private readonly getUserQuery: GetUserQuery,
    private readonly updateProfileHandler: UpdateProfileHandler,
    private readonly updateBusinessProfileHandler: UpdateBusinessProfileHandler,
    private readonly listSessionsQuery: ListSessionsQuery,
    private readonly revokeSessionHandler: RevokeSessionHandler,
  ) {}

  @Get('me')
  async getMe(@CurrentUser() currentUser: AuthenticatedUser) {
    const user = await this.getUserQuery.execute(currentUser.id);
    return {
      user: user.toJSON(),
      permissions: user.permissions.length > 0 ? user.permissions : getPermissionsForRole(user.role),
    };
  }

  @Patch('profile')
  @UsePipes(new ZodValidationPipe(updateProfileSchema))
  async updateProfile(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    const parts = (dto.name || '').trim().split(' ');
    const firstName = dto.firstName || (dto.name ? parts[0] : undefined);
    const lastName = dto.lastName || (dto.name ? parts.slice(1).join(' ') : undefined);
    const phone = dto.phone || dto.mobileNumber || dto.mobile_number;

    const user = await this.updateProfileHandler.execute(currentUser.id, {
      firstName,
      lastName,
      avatarUrl: dto.avatarUrl,
      birthDate: dto.birthDate,
      language: dto.language,
      currency: dto.currency,
      phone,
    });

    return {
      user: user.toJSON(),
      permissions: user.permissions,
    };
  }

  // Compatibilidad con llamada PUT /me del frontend
  @Put('me')
  @UsePipes(new ZodValidationPipe(updateProfileSchema))
  async updateMe(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.updateProfile(currentUser, dto);
  }

  @Patch('business')
  @UsePipes(new ZodValidationPipe(updateBusinessProfileSchema))
  async updateBusiness(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: UpdateBusinessProfileDto,
  ) {
    const user = await this.updateBusinessProfileHandler.execute(currentUser.id, dto);
    return {
      user: user.toJSON(),
      businessProfile: user.businessProfile,
    };
  }

  @Get('sessions')
  async getSessions(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.listSessionsQuery.execute(currentUser.id);
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.OK)
  async revokeSession(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') sessionId: string,
    @Req() req: FastifyRequest,
  ) {
    await this.revokeSessionHandler.execute(currentUser.id, sessionId, req.ip);
    return { message: 'Sesión revocada exitosamente.' };
  }
}
