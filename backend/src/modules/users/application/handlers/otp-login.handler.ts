import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port';
import { TokenGeneratorPort } from '../../domain/ports/token-generator.port';
import { SessionEntity } from '../../domain/entities/session.entity';
import { CacheService } from '../../../../infrastructure/cache/cache.service';
import { CryptoUtils, BadRequestException, NotFoundException, UnauthorizedException, UserStatus } from '../../../../shared';

@Injectable()
export class OtpLoginHandler {
  private readonly logger = new Logger(OtpLoginHandler.name);

  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly authRepository: AuthRepositoryPort,
    private readonly tokenGenerator: TokenGeneratorPort,
    private readonly cacheService: CacheService,
  ) {}

  async execute(params: {
    phone?: string;
    email?: string;
    code: string;
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
  }) {
    let user = null;
    if (params.phone) {
      user = await this.userRepository.findByPhone(params.phone);
    } else if (params.email) {
      user = await this.userRepository.findByEmail(params.email);
    }

    if (!user) {
      throw new NotFoundException('Usuario', params.phone || params.email || 'identificador');
    }

    if (
      user.status === UserStatus.SUSPENDED ||
      user.status === UserStatus.REJECTED ||
      user.status === UserStatus.LOGICALLY_DELETED
    ) {
      throw new UnauthorizedException('La cuenta de usuario se encuentra inactiva o suspendida.');
    }

    const tokenHash = CryptoUtils.sha256(params.code.trim());
    let validToken = await this.authRepository.findValidVerificationToken(
      user.id,
      params.email ? 'email_otp' : 'phone_otp',
      tokenHash,
    );

    if (!validToken && params.email) {
      validToken = await this.authRepository.findValidVerificationToken(
        user.id,
        'phone_otp',
        tokenHash,
      );
    }

    if (!validToken) {
      await this.authRepository.logSecurityEvent(
        user.id,
        'LOGIN_OTP_FAILURE',
        'warning',
        params.ipAddress,
        params.deviceId,
        { reason: 'Código OTP inválido o expirado' },
      );
      throw new BadRequestException('El código OTP es inválido o ha expirado.');
    }

    await this.authRepository.consumeVerificationToken(validToken.id);

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
      deviceId: params.deviceId || null,
      ip: params.ipAddress || null,
      userAgent: params.userAgent || null,
      lastSeenAt: new Date(),
      revokedAt: null,
      expiresAt: refreshData.expiresAt,
      createdAt: new Date(),
    });

    await this.authRepository.createSession(session);
    await this.cacheService.set(`session:${user.id}:${session.id}`, true, 7 * 24 * 3600);

    await this.authRepository.logSecurityEvent(
      user.id,
      'LOGIN_OTP_SUCCESS',
      'info',
      params.ipAddress,
      params.deviceId,
      { userAgent: params.userAgent },
    );

    this.logger.log(`Usuario autenticado vía OTP: ${user.id}`);

    return {
      accessToken,
      refreshToken: refreshData.token,
      expiresIn: 900,
      user: user.toJSON(),
      permissions: user.permissions,
    };
  }
}
