import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { KYC_LEVEL_KEY } from '../decorators/require-kyc-level.decorator';
import { KycLevel } from '../../shared';

@Injectable()
export class KycLevelGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredLevel = this.reflector.getAllAndOverride<KycLevel>(KYC_LEVEL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredLevel === undefined || requiredLevel === null) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || user.kycLevel < requiredLevel) {
      throw new ForbiddenException(
        `Nivel de verificación insuficiente. Se requiere nivel KYC ${requiredLevel}.`,
      );
    }

    return true;
  }
}
