import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../shared';

export const ROLES_KEY = 'roles';
export const RequireRoles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
