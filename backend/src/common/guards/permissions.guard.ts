import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { Permission, getPermissionsForRole, UserRole } from '../../shared';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('Usuario no autenticado.');
    }

    // SUPERADMIN cuenta con bypass total de permisos
    if (user.role === UserRole.SUPERADMIN || user.role === 'SUPERADMIN') {
      return true;
    }

    const userPermissions: string[] =
      user.permissions ?? getPermissionsForRole(user.role);

    const hasAll = requiredPermissions.every((p) => userPermissions.includes(p));
    if (!hasAll) {
      throw new ForbiddenException(
        `Permisos insuficientes. Se requiere: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
