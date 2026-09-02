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
import { GetUserQuery } from '../application/queries/get-user.query';
import { ListUsersQuery } from '../application/queries/list-users.query';
import { AdminCreateUserHandler } from '../application/handlers/admin-create-user.handler';
import { AdminUpdateUserHandler } from '../application/handlers/admin-update-user.handler';
import { AdminDeleteUserHandler } from '../application/handlers/admin-delete-user.handler';
import { AdminUpdateUserStatusHandler } from '../application/handlers/admin-update-user-status.handler';
import { AdminUpdateUserRolesHandler } from '../application/handlers/admin-update-user-roles.handler';
import { AdminGetUserAuditQuery } from '../application/queries/admin-get-user-audit.query';

import { queryUsersSchema, QueryUsersDto } from './dto/query-users.dto';
import { adminCreateUserSchema, AdminCreateUserDto } from './dto/admin-create-user.dto';
import { adminUpdateUserSchema, AdminUpdateUserDto } from './dto/admin-update-user.dto';
import {
  adminUpdateStatusSchema,
  AdminUpdateStatusDto,
  adminUpdateRolesSchema,
  AdminUpdateRolesDto,
} from './dto/admin-users.dto';

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
@Controller('admin/users')
export class UsersController {
  constructor(
    private readonly getUserQuery: GetUserQuery,
    private readonly listUsersQuery: ListUsersQuery,
    private readonly adminCreateUserHandler: AdminCreateUserHandler,
    private readonly adminUpdateUserHandler: AdminUpdateUserHandler,
    private readonly adminDeleteUserHandler: AdminDeleteUserHandler,
    private readonly adminUpdateUserStatusHandler: AdminUpdateUserStatusHandler,
    private readonly adminUpdateUserRolesHandler: AdminUpdateUserRolesHandler,
    private readonly adminGetUserAuditQuery: AdminGetUserAuditQuery,
  ) {}

  @Get()
  async listUsers(@Query(new ZodValidationPipe(queryUsersSchema)) query: QueryUsersDto) {
    return this.listUsersQuery.execute(query);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.getUserQuery.execute(id);
    return user.toJSON();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body(new ZodValidationPipe(adminCreateUserSchema)) dto: AdminCreateUserDto) {
    const user = await this.adminCreateUserHandler.execute(dto);
    return user.toJSON();
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(adminUpdateUserSchema)) dto: AdminUpdateUserDto,
  ) {
    const user = await this.adminUpdateUserHandler.execute(id, dto);
    return user.toJSON();
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(adminUpdateStatusSchema)) dto: AdminUpdateStatusDto,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Req() req: FastifyRequest,
  ) {
    return this.adminUpdateUserStatusHandler.execute(
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
    @CurrentUser() currentUser: AuthenticatedUser,
    @Req() req: FastifyRequest,
  ) {
    return this.adminUpdateUserRolesHandler.execute(
      id,
      dto.roles,
      currentUser.id,
      req.ip,
    );
  }

  @Get(':id/audit')
  async getUserAudit(@Param('id') id: string) {
    return this.adminGetUserAuditQuery.execute(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id') id: string) {
    await this.adminDeleteUserHandler.execute(id);
    return { message: 'Usuario dado de baja lógicamente con éxito.' };
  }
}
