import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { SessionService } from '../services/session.service';
import { ProfileDto, profileSchema, BusinessProfileDto, businessProfileSchema } from '../dto';
import { CurrentUser, JwtAuthGuard, ZodValidationPipe } from '../../../common';
import { AuthenticatedUser } from '../../../shared';

@UseGuards(JwtAuthGuard)
@Controller(['identity', ''])
export class MeController {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
  ) {}

  @Get('me')
  async getMe(@CurrentUser() currentUser: AuthenticatedUser) {
    const user = await this.userService.getUser(currentUser.id);
    return {
      ...user.toJSON(),
      permissions: (currentUser as any).permissions || user.permissions,
    };
  }

  @Put('profile')
  async updateProfile(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body(new ZodValidationPipe(profileSchema)) dto: ProfileDto,
  ) {
    const user = await this.userService.updateProfile(currentUser.id, dto);
    return user.toJSON();
  }

  @Put('business-profile')
  async updateBusinessProfile(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body(new ZodValidationPipe(businessProfileSchema)) dto: BusinessProfileDto,
  ) {
    const user = await this.userService.updateBusinessProfile(currentUser.id, dto);
    return user.toJSON();
  }

  @Get('sessions')
  async listSessions(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.sessionService.listSessions(currentUser.id);
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeSession(
    @Param('id') sessionId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    await this.sessionService.revokeSession(sessionId, currentUser.id);
  }
}
