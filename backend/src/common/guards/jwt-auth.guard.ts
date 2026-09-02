import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { appConfig } from '../../config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token de autenticación no proporcionado.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: appConfig.jwt.accessSecret,
      });
      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        kycLevel: payload.kycLevel ?? 0,
      };
    } catch {
      throw new UnauthorizedException('Token de autenticación inválido o expirado.');
    }

    return true;
  }

  private extractTokenFromHeader(request: { headers: Record<string, string | undefined> }): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
