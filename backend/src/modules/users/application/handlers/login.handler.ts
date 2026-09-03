import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { LoginCommand } from '../commands/login.command';
import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port';
import { TokenGeneratorPort } from '../../domain/ports/token-generator.port';
import { SessionEntity } from '../../domain/entities/session.entity';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { CacheService } from '../../../../infrastructure/cache/cache.service';
import {
  CryptoUtils,
  UnauthorizedException,
  UserStatus,
} from '../../../../shared';

@Injectable()
export class LoginHandler {
  private readonly logger = new Logger(LoginHandler.name);

  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly authRepository: AuthRepositoryPort,
    private readonly tokenGenerator: TokenGeneratorPort,
    private readonly cacheService: CacheService,
  ) {}

  async execute(command: LoginCommand) {
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      await this.authRepository.logSecurityEvent(
        null,
        'LOGIN_FAILURE',
        'warning',
        command.ipAddress,
        command.deviceId,
        { email: command.email, reason: 'Usuario no encontrado' },
      );
      throw new UnauthorizedException('Credenciales de acceso inválidas.');
    }

    if (
      user.status === UserStatus.SUSPENDED ||
      user.status === UserStatus.REJECTED ||
      user.status === UserStatus.LOGICALLY_DELETED
    ) {
      await this.authRepository.logSecurityEvent(
        user.id,
        'LOGIN_BLOCKED_ACCOUNT',
        'warning',
        command.ipAddress,
        command.deviceId,
        { status: user.status },
      );
      throw new UnauthorizedException('La cuenta de usuario se encuentra inactiva o suspendida.');
    }

    const isPasswordValid = await CryptoUtils.comparePassword(
      command.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      await this.authRepository.logSecurityEvent(
        user.id,
        'LOGIN_FAILURE',
        'warning',
        command.ipAddress,
        command.deviceId,
        { reason: 'Contraseña incorrecta' },
      );
      throw new UnauthorizedException('Credenciales de acceso inválidas.');
    }

    const accessToken = await this.tokenGenerator.generateAccessToken({
      sub: user.id,
      email: user.email,
      type: user.type,
      role: user.role,
      roles: user.roles,
      permissions: user.permissions,
      kycLevel: 0,
    });

    const refreshData = this.tokenGenerator.generateRefreshToken();

    const session = new SessionEntity({
      id: crypto.randomUUID(),
      userId: user.id,
      refreshTokenHash: refreshData.hash,
      deviceId: command.deviceId || null,
      ip: command.ipAddress || null,
      userAgent: command.userAgent || null,
      lastSeenAt: new Date(),
      revokedAt: null,
      expiresAt: refreshData.expiresAt,
      createdAt: new Date(),
    });

    await this.authRepository.createSession(session);

    await this.cacheService.set(`session:${user.id}:${session.id}`, true, 7 * 24 * 3600);

    await this.authRepository.logSecurityEvent(
      user.id,
      'LOGIN_SUCCESS',
      'info',
      command.ipAddress,
      command.deviceId,
      { userAgent: command.userAgent },
    );

    this.logger.log(`Usuario autenticado: ${user.id} (${user.email})`);

    return {
      accessToken,
      refreshToken: refreshData.token,
      expiresIn: 900,
      user: user.toJSON(),
      permissions: user.permissions,
    };
  }
}
