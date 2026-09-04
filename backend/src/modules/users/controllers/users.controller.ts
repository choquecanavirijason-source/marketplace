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
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
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

@ApiTags('Users Management')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(UserType.ADMIN, UserType.SUPERADMIN)
@Controller(['admin/users', 'identity/users'])
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios con paginación y filtros (Admin)' })
  async listUsers(@Query(new ZodValidationPipe(queryUsersSchema)) query: QueryUsersDto) {
    return this.userService.listUsers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de un usuario por su ID (Admin)' })
  async getUser(@Param('id') id: string) {
    const user = await this.userService.getUser(id);
    return user.toJSON();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo usuario administrativamente' })
  async createUser(@Body(new ZodValidationPipe(adminCreateUserSchema)) dto: AdminCreateUserDto) {
    const user = await this.userService.createUser(dto);
    return user.toJSON();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de un usuario por ID (Admin)' })
  async updateUser(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(adminUpdateUserSchema)) dto: AdminUpdateUserDto,
  ) {
    const user = await this.userService.updateUser(id, dto);
    return user.toJSON();
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cambiar el estado de una cuenta de usuario (Admin)' })
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
  @ApiOperation({ summary: 'Asignar o actualizar roles a un usuario (Admin)' })
  async updateRoles(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(adminUpdateRolesSchema)) dto: AdminUpdateRolesDto,
  ) {
    return this.userService.updateRoles(id, dto.roles);
  }

  @Get(':id/audit')
  @ApiOperation({ summary: 'Consultar el historial de auditoría de un usuario (Admin)' })
  async getUserAudit(@Param('id') id: string) {
    return this.userService.getUserAudit(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una cuenta de usuario (Admin)' })
  async deleteUser(@Param('id') id: string) {
    await this.userService.deleteUser(id);
  }
}
