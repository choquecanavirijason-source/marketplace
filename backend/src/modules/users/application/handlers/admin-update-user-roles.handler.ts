import { Injectable, Logger } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port';
import { NotFoundException, BadRequestException } from '../../../../shared';

@Injectable()
export class AdminUpdateUserRolesHandler {
  private readonly logger = new Logger(AdminUpdateUserRolesHandler.name);

  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly authRepository: AuthRepositoryPort,
  ) {}

  async execute(userId: string, roles: string[], adminUserId?: string, ip?: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario', userId);
    }

    if (!Array.isArray(roles) || roles.length === 0) {
      throw new BadRequestException('Se debe especificar al menos un rol.');
    }

    await this.userRepository.assignRoles(userId, roles, adminUserId);

    await this.authRepository.logSecurityEvent(
      userId,
      'ADMIN_ROLES_UPDATED',
      'warning',
      ip,
      undefined,
      {
        previousRoles: user.roles,
        newRoles: roles,
        assignedBy: adminUserId,
      },
    );

    const updatedUser = await this.userRepository.findById(userId);
    this.logger.log(`Roles de usuario ${userId} actualizados a: ${roles.join(', ')}`);

    return updatedUser?.toJSON();
  }
}
