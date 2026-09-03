import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UsePipes,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { UserService } from '../services/user.service';
import {
  QueryUsersDto,
  queryUsersSchema,
  AdminCreateUserDto,
  adminCreateUserSchema,
  AdminUpdateUserDto,
  adminUpdateUserSchema,
  AdminUpdateStatusDto,
  adminUpdateStatusSchema,
  AdminUpdateRolesDto,
  adminUpdateRolesSchema,
} from '../dto';
import {
  ZodValidationPipe,
  CurrentUser,
  JwtAuthGuard,
  RolesGuard,
  RequireRoles,
} from '../../../common';
import { AuthenticatedUser, UserType } from '../../../shared';

@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(UserType.ADMIN, UserType.SUPERADMIN)
@Controller(['admin/users', 'identity/users'])
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async listUsers(@Query(new ZodValidationPipe(queryUsersSchema)) query: QueryUsersDto) {
    return this.userService.listUsers(query);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.userService.getUser(id);
    return user.toJSON();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body(new ZodValidationPipe(adminCreateUserSchema)) dto: AdminCreateUserDto) {
    const user = await this.userService.createUser(dto);
    return user.toJSON();
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(adminUpdateUserSchema)) dto: AdminUpdateUserDto,
  ) {
    const user = await this.userService.updateUser(id, dto);
    return user.toJSON();
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(adminUpdateStatusSchema)) dto: AdminUpdateStatusDto,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Req() req: FastifyRequest,
  ) {
    return this.userService.updateStatus(
      id,
      dto.status,
      dto.reason,
      currentUser.id,
      req.ip,
    );
  }

  @Patch(':id/roles')
  async updateRoles(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(adminUpdateRolesSchema)) dto: AdminUpdateRolesDto,
  ) {
    return this.userService.updateRoles(id, dto.roles);
  }

  @Get(':id/audit')
  async getUserAudit(@Param('id') id: string) {
    return this.userService.getUserAudit(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    await this.userService.deleteUser(id);
  }
}
