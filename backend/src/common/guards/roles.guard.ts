import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/require-roles.decorator';
import { UserRole } from '../../shared';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('No posees los roles necesarios para ejecutar esta acción.');
    }

    const userRole = (user.role || user.type || '').toString().toLowerCase();
    const userRoles: string[] = Array.isArray(user.roles)
      ? user.roles.map((r: string) => r.toString().toLowerCase())
      : userRole ? [userRole] : [];

    const hasRole = requiredRoles.some((reqRole) => {
      const normalizedReq = reqRole.toString().toLowerCase();
      return userRole === normalizedReq || userRoles.includes(normalizedReq);
    });

    if (!hasRole) {
      throw new ForbiddenException('No posees los roles necesarios para ejecutar esta acción.');
    }

    return true;
  }
}
