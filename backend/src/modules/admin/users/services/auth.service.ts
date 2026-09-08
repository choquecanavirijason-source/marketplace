import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import { UserRepositoryPort } from '../interfaces/user-repository.interface';
import { AuthRepositoryPort } from '../interfaces/auth-repository.interface';
import { TokenGeneratorPort } from '../interfaces/token-generator.interface';
import { UserEntity } from '../entities/user.entity';
import { SessionEntity } from '../entities/session.entity';
import { EmailValidator } from '../validators/email.validator';
import { UserRegisteredEvent } from '../events/user.event';
import { UserType, UserStatus, OnboardingStep } from '../enums';
import { CacheService } from '../../../../infrastructure/cache/cache.service';
import { NodemailerEmailService } from '../../../../infrastructure/mail/nodemailer-email.service';
import {
  CryptoUtils,
  DateUtils,
  DuplicateEntityException,
  EntityNotFoundException,
  NotFoundException,
  UnauthorizedException,
  DomainException,
} from '../../../../shared';
import { RegisterUserDto, LoginDto, OtpLoginDto, SocialLoginDto, PhoneOtpLoginDto } from '../dto';
import { AuthConfigService } from './auth-config.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly authRepository: AuthRepositoryPort,
    private readonly tokenGenerator: TokenGeneratorPort,
    private readonly cacheService: CacheService,
    private readonly mailService: NodemailerEmailService,
    private readonly eventEmitter: EventEmitter2,
    private readonly authConfigService?: AuthConfigService,
  ) {}


  async register(command: RegisterUserDto): Promise<UserEntity> {
    const cleanEmail = EmailValidator.validate(command.email);
    const existing = await this.userRepository.findByEmail(cleanEmail);

    if (existing) {
      throw new DuplicateEntityException('Usuario', 'email', cleanEmail);
    }

    if (command.mobileNumber || command.phone) {
      const phone = command.mobileNumber || command.phone;
      const existingPhone = await this.userRepository.findByPhone(phone!);
      if (existingPhone) {
        throw new DuplicateEntityException('Usuario', 'teléfono', phone!);
      }
    }

    const passwordHash = await CryptoUtils.hashPassword(command.password);
    const userType = (command.type || command.role || UserType.BUYER) as UserType;

    let businessProfile: any = null;
    if (
      userType === UserType.SELLER_INDIVIDUAL ||
      userType === UserType.SELLER_COMPANY ||
      userType === UserType.SELLER ||
      command.taxId
    ) {
      businessProfile = {
        legalName: command.legalName || command.name || 'Empresa',
        tradeName: command.tradeName || null,
        taxId: command.taxId || 'PENDIENTE',
        legalType: command.legalType || (userType === UserType.SELLER_COMPANY ? 'EMPRESA' : 'INDIVIDUAL'),
        billingEmail: cleanEmail,
        fiscalAddress: command.fiscalAddress || command.address || null,
        reviewStatus: 'pending',
      };
    }

    const nameParts = (command.name || '').trim().split(' ');
    const firstName = command.firstName || nameParts[0] || 'Usuario';
    const lastName = command.lastName || nameParts.slice(1).join(' ') || '';

    const newUser = new UserEntity({
      id: crypto.randomUUID(),
      email: cleanEmail,
      phone: command.mobileNumber || command.phone || null,
      passwordHash,
      type: userType,
      status: UserStatus.ACTIVE,
      profile: {
        firstName,
        lastName,
        language: 'es',
        currency: 'ARS',
        country: (command as any).country || null,
        phoneCountry: (command as any).phoneCountry || null,
        completionPct: 30,
      },
      businessProfile,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedUser = await this.userRepository.create(newUser);

    await this.userRepository.saveOnboardingStep(
      savedUser.id,
      OnboardingStep.BASE_REGISTRATION,
      'completed',
    );

    if (command.termsAccepted) {
      await this.userRepository.saveOnboardingStep(
        savedUser.id,
        OnboardingStep.TERMS_ACCEPTED,
        'completed',
      );
    }

    await this.authRepository.logSecurityEvent(
      savedUser.id,
      'USER_REGISTERED',
      'info',
      undefined,
      undefined,
      { userType: savedUser.type },
    );

    this.eventEmitter.emit(
      'user.registered',
      new UserRegisteredEvent(savedUser.id, savedUser.email, savedUser.type),
    );

    this.logger.log(`Usuario registrado exitosamente: ${savedUser.id} (${savedUser.email})`);
    return savedUser;
  }

  @OnEvent('user.registered')
  async handleUserRegistered(event: UserRegisteredEvent): Promise<void> {
    try {
      await this.sendEmailOtp(event.email);
      this.logger.log(`Correo de verificación despachado tras registro para: ${event.email}`);
    } catch (err: any) {
      this.logger.error(
        `Error enviando correo de verificación tras el registro a ${event.email}: ${err?.message}`,
      );
    }
  }

  async login(command: LoginDto, clientIp?: string, userAgent?: string) {
    const cleanEmail = EmailValidator.validate(command.email);
    const user = await this.userRepository.findByEmail(cleanEmail);

    if (!user) {
      await this.authRepository.logSecurityEvent(
        null,
        'LOGIN_FAILURE',
        'warning',
        clientIp,
        undefined,
        { email: cleanEmail, reason: 'Usuario no encontrado' },
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
        clientIp,
        undefined,
        { status: user.status },
      );
      throw new UnauthorizedException('La cuenta de usuario se encuentra inactiva o suspendida.');
    }

    const isPasswordValid = await CryptoUtils.comparePassword(command.password, user.passwordHash);
    if (!isPasswordValid) {
      await this.authRepository.logSecurityEvent(
        user.id,
        'LOGIN_FAILURE',
        'warning',
        clientIp,
        undefined,
        { reason: 'Contraseña incorrecta' },
      );
      throw new UnauthorizedException('Credenciales de acceso inválidas.');
    }

    const tokens = await this.tokenGenerator.generateTokens({
      sub: user.id,
      email: user.email,
      type: user.type,
      role: user.role,
      roles: user.roles,
      permissions: user.permissions,
      kycLevel: user.kycLevel,
    });

    const refreshTokenHash = await this.tokenGenerator.hashRefreshToken(tokens.refreshToken);
    const session = new SessionEntity({
      id: crypto.randomUUID(),
      userId: user.id,
      refreshTokenHash,
      clientIp: clientIp || null,
      userAgent: userAgent || null,
      expiresAt: DateUtils.addDays(new Date(), 7),
      isRevoked: false,
      createdAt: new Date(),
    });

    await this.authRepository.createSession(session);
    await this.authRepository.logSecurityEvent(
      user.id,
      'LOGIN_SUCCESS',
      'info',
      clientIp,
      undefined,
      { sessionId: session.id },
    );

    user.recordLogin();
    await this.userRepository.update(user);

    this.logger.log(`Usuario autenticado: ${user.id} (${user.email})`);
    return {
      user: user.toJSON(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };
  }

  async refreshToken(refreshToken: string, clientIp?: string, userAgent?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token requerido.');
    }

    const tokenHash = await this.tokenGenerator.hashRefreshToken(refreshToken);
    const session = await this.authRepository.findSessionByTokenHash(tokenHash);

    if (!session) {
      throw new UnauthorizedException('Sesión no encontrada o token inválido.');
    }

    if (session.isRevoked || session.isExpired) {
      if (session.isRevoked) {
        this.logger.error(`Reúso de refresh token detectado para usuario: ${session.userId}`);
        await this.authRepository.revokeAllUserSessions(session.userId);
      }
      throw new UnauthorizedException('Sesión revocada o expirada.');
    }

    const user = await this.userRepository.findById(session.userId);
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Usuario inactivo o no disponible.');
    }

    const tokens = await this.tokenGenerator.generateTokens({
      sub: user.id,
      email: user.email,
      type: user.type,
      role: user.role,
      roles: user.roles,
      permissions: user.permissions,
      kycLevel: user.kycLevel,
    });

    const newHash = await this.tokenGenerator.hashRefreshToken(tokens.refreshToken);
    session.rotate(newHash);
    await this.authRepository.updateSession(session);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };
  }

  async logout(sessionId?: string, userId?: string, refreshToken?: string) {
    if (sessionId) {
      await this.authRepository.revokeSessionById(sessionId);
    } else if (refreshToken) {
      const tokenHash = await this.tokenGenerator.hashRefreshToken(refreshToken);
      const session = await this.authRepository.findSessionByTokenHash(tokenHash);
      if (session) {
        await this.authRepository.revokeSessionById(session.id);
      }
    }
  }

  async logoutAll(userId: string) {
    await this.authRepository.revokeAllUserSessions(userId);
  }

  async sendEmailOtp(email: string, ip?: string) {
    const cleanEmail = EmailValidator.validate(email);
    const user = await this.userRepository.findByEmail(cleanEmail);

    if (!user) {
      throw new NotFoundException('Usuario con correo electrónico', cleanEmail);
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenHash = CryptoUtils.sha256(otpCode);
    const expiresAt = DateUtils.addMinutes(new Date(), 10);

    await this.authRepository.createVerificationToken(
      user.id,
      'email_otp',
      tokenHash,
      expiresAt,
      JSON.stringify({ email: cleanEmail }),
    );

    await this.authRepository.logSecurityEvent(
      user.id,
      'EMAIL_OTP_SENT',
      'info',
      ip,
      undefined,
      { email: cleanEmail },
    );

    try {
      await this.mailService.sendOtpEmail(cleanEmail, otpCode, user.fullName);
    } catch (err: any) {
      this.logger.error(`Error enviando correo OTP a ${cleanEmail}: ${err.message}`);
    }

    const isDev = process.env.NODE_ENV !== 'production';
    return {
      message: 'Código de verificación enviado correctamente a tu correo electrónico.',
      ...(isDev ? { debugOtp: otpCode } : {}),
    };
  }

  async sendPhoneOtp(phone: string, ip?: string) {
    const user = await this.userRepository.findByPhone(phone);
    if (!user) {
      throw new NotFoundException('Usuario con teléfono', phone);
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenHash = CryptoUtils.sha256(otpCode);
    const expiresAt = DateUtils.addMinutes(new Date(), 10);

    await this.authRepository.createVerificationToken(
      user.id,
      'phone_otp',
      tokenHash,
      expiresAt,
      JSON.stringify({ phone }),
    );

    return {
      message: 'Código OTP enviado correctamente.',
      debugOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
    };
  }

  async otpLogin(dto: OtpLoginDto, userAgent?: string, clientIp?: string) {
    let user: UserEntity | null = null;
    if (dto.email) {
      const cleanEmail = EmailValidator.validate(dto.email);
      user = await this.userRepository.findByEmail(cleanEmail);
    } else if (dto.phone) {
      user = await this.userRepository.findByPhone(dto.phone);
    }

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    const tokenHash = CryptoUtils.sha256(dto.code);
    const tokenRecord = await this.authRepository.findValidVerificationToken(
      user.id,
      dto.email ? 'email_otp' : 'phone_otp',
      tokenHash,
    );

    if (!tokenRecord) {
      throw new UnauthorizedException('Código OTP inválido o expirado.');
    }

    await this.authRepository.consumeVerificationToken(tokenRecord.id);

    const tokens = await this.tokenGenerator.generateTokens({
      sub: user.id,
      email: user.email,
      type: user.type,
      role: user.role,
      roles: user.roles,
      permissions: user.permissions,
      kycLevel: user.kycLevel,
    });

    const refreshTokenHash = await this.tokenGenerator.hashRefreshToken(tokens.refreshToken);
    const session = new SessionEntity({
      id: crypto.randomUUID(),
      userId: user.id,
      refreshTokenHash,
      clientIp: clientIp || null,
      userAgent: userAgent || null,
      expiresAt: DateUtils.addDays(new Date(), 7),
      isRevoked: false,
      createdAt: new Date(),
    });

    await this.authRepository.createSession(session);
    user.recordLogin();
    await this.userRepository.update(user);

    return {
      user: user.toJSON(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };
  }

  async verifyEmail(token: string, email?: string) {
    const tokenHash = CryptoUtils.sha256(token);
    let validToken: any = null;
    let user: UserEntity | null = null;

    if (email) {
      user = await this.userRepository.findByEmail(EmailValidator.validate(email));
      if (user) {
        validToken = await this.authRepository.findValidVerificationToken(user.id, 'email_otp', tokenHash);
      }
    }

    if (!validToken) {
      validToken = await this.authRepository.findValidVerificationTokenByHash?.(tokenHash);
      if (validToken && !user) {
        user = await this.userRepository.findById(validToken.userId);
      }
    }

    if (!validToken || !user) {
      throw new UnauthorizedException('Código o enlace de verificación inválido o expirado.');
    }

    await this.authRepository.consumeVerificationToken(validToken.id);

    user.verifyEmail();
    await this.userRepository.update(user);
    await this.userRepository.saveOnboardingStep(user.id, OnboardingStep.EMAIL_VERIFIED, 'completed');

    await this.authRepository.logSecurityEvent(
      user.id,
      'EMAIL_VERIFIED',
      'info',
      undefined,
      undefined,
      { email: user.email },
    );

    return { success: true, message: 'Correo verificado correctamente.' };
  }

  async verifyPhoneOtp(phone: string, otp: string) {
    const cleanPhone = phone.trim();
    const tokenHash = CryptoUtils.sha256(otp);
    let user = await this.userRepository.findByPhone(cleanPhone);

    let tokenRecord: any = null;
    if (user) {
      tokenRecord = await this.authRepository.findValidVerificationToken(user.id, 'phone_otp', tokenHash);
    }

    if (!tokenRecord) {
      tokenRecord = await this.authRepository.findValidVerificationTokenByHash?.(tokenHash);
      if (tokenRecord && !user) {
        user = await this.userRepository.findById(tokenRecord.userId);
      }
    }

    if (tokenRecord) {
      await this.authRepository.consumeVerificationToken(tokenRecord.id);
    }

    if (user) {
      user.verifyPhone();
      await this.userRepository.update(user);
      await this.userRepository.saveOnboardingStep(user.id, OnboardingStep.PHONE_VERIFIED, 'completed');
    }

    return { success: true, message: 'Teléfono verificado correctamente.' };
  }

  async forgotPassword(email: string) {
    const cleanEmail = EmailValidator.validate(email);
    const user = await this.userRepository.findByEmail(cleanEmail);
    if (user) {
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const tokenHash = CryptoUtils.sha256(resetCode);
      await this.authRepository.createVerificationToken(
        user.id,
        'password_reset',
        tokenHash,
        DateUtils.addHours(new Date(), 1),
        JSON.stringify({ code: resetCode, email: user.email }),
      );

      const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
      const resetUrl = `${frontendUrl}/account/forgot-password?token=${resetCode}&email=${encodeURIComponent(user.email)}`;

      try {
        await this.mailService.sendPasswordResetEmail(
          user.email,
          resetCode,
          user.firstName || 'Usuario',
          resetUrl,
        );
      } catch (err: any) {
        this.logger.error(`Error enviando correo de recuperación a ${user.email}: ${err?.message}`);
      }

      this.logger.log(`[PASSWORD_RESET_DISPATCHED] Para: ${user.email} | Código generado: ${resetCode}`);
    }

    return {
      message: 'Si el correo está registrado, recibirás un código o enlace para restablecer tu contraseña.',
    };
  }

  async resetPassword(token: string, newPass: string, email?: string) {
    if (!token || !newPass) {
      throw new DomainException('El código o token de recuperación y la nueva contraseña son requeridos.');
    }

    if (newPass.length < 8) {
      throw new DomainException('La nueva contraseña debe tener al menos 8 caracteres.');
    }

    const cleanToken = token.trim();
    const tokenHash = CryptoUtils.sha256(cleanToken);

    const tokenRecord = await this.authRepository.findValidVerificationTokenByHash?.(tokenHash);
    if (!tokenRecord) {
      throw new UnauthorizedException('El código o token de recuperación es inválido o ha expirado.');
    }

    const user = await this.userRepository.findById(tokenRecord.userId);
    if (!user) {
      throw new EntityNotFoundException('Usuario', tokenRecord.userId);
    }

    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      if (user.email.toLowerCase() !== cleanEmail) {
        throw new UnauthorizedException('El código no corresponde al correo proporcionado.');
      }
    }

    const newPasswordHash = await CryptoUtils.hashPassword(newPass);
    user.changePassword(newPasswordHash);
    await this.userRepository.update(user);

    await this.authRepository.consumeVerificationToken(tokenRecord.id);

    try {
      await this.authRepository.revokeAllUserSessions(user.id);
    } catch (e: any) {
      this.logger.warn(`No se pudieron revocar todas las sesiones del usuario ${user.id}: ${e?.message}`);
    }

    await this.authRepository.logSecurityEvent(
      user.id,
      'PASSWORD_RESET',
      'info',
      undefined,
      undefined,
      { method: 'forgot_password_code' },
    );

    return { success: true, message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.' };
  }

  async phoneLogin(dto: PhoneOtpLoginDto, userAgent?: string, clientIp?: string) {
    if (this.authConfigService) {
      const config = await this.authConfigService.getSettings();
      if (!config.phoneOtpEnabled) {
        throw new DomainException('El inicio de sesión mediante teléfono móvil se encuentra temporalmente deshabilitado por el administrador.');
      }
    }

    const cleanPhone = dto.phone.trim();
    let user = await this.userRepository.findByPhone(cleanPhone);

    const tokenHash = CryptoUtils.sha256(dto.code.trim());
    let tokenRecord: any = null;

    if (user) {
      tokenRecord = await this.authRepository.findValidVerificationToken(user.id, 'phone_otp', tokenHash);
    }

    if (!tokenRecord) {
      tokenRecord = await this.authRepository.findValidVerificationTokenByHash?.(tokenHash);
      if (tokenRecord && !user) {
        user = await this.userRepository.findById(tokenRecord.userId);
      }
    }

    if (!tokenRecord) {
      throw new UnauthorizedException('Código OTP telefónico inválido o expirado.');
    }

    await this.authRepository.consumeVerificationToken(tokenRecord.id);

    // Si el usuario no existe, registrarlo automáticamente con su número
    if (!user) {
      const randomEmail = `user.${cleanPhone.replace(/\D/g, '')}@marketplace.local`;
      const dummyPass = await CryptoUtils.hashPassword(crypto.randomUUID());
      const newUser = new UserEntity({
        id: crypto.randomUUID(),
        email: randomEmail,
        phone: cleanPhone,
        passwordHash: dummyPass,
        type: UserType.BUYER,
        status: UserStatus.ACTIVE,
        phoneVerifiedAt: new Date(),
        profile: {
          firstName: 'Usuario',
          lastName: cleanPhone.slice(-4),
          completionPct: 40,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      user = await this.userRepository.create(newUser);
    } else {
      user.verifyPhone();
    }

    user.recordLogin();
    await this.userRepository.update(user);

    const tokens = await this.tokenGenerator.generateTokens({
      sub: user.id,
      email: user.email,
      type: user.type,
      role: user.role,
      roles: user.roles,
      permissions: user.permissions,
      kycLevel: user.kycLevel,
    });

    const refreshTokenHash = await this.tokenGenerator.hashRefreshToken(tokens.refreshToken);
    const session = new SessionEntity({
      id: crypto.randomUUID(),
      userId: user.id,
      refreshTokenHash,
      clientIp: clientIp || null,
      userAgent: userAgent || null,
      expiresAt: DateUtils.addDays(new Date(), 7),
      isRevoked: false,
      createdAt: new Date(),
    });

    await this.authRepository.createSession(session);
    await this.authRepository.logSecurityEvent(
      user.id,
      'PHONE_LOGIN_SUCCESS',
      'info',
      clientIp,
      userAgent,
      { phone: cleanPhone },
    );

    return {
      user: user.toJSON(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };
  }

  async socialLogin(dto: SocialLoginDto, userAgent?: string, clientIp?: string) {
    if (this.authConfigService) {
      const config = await this.authConfigService.getSettings();
      if (!config.socialLoginEnabled) {
        throw new DomainException('El inicio de sesión con redes sociales está desactivado.');
      }
      if (dto.provider === 'google' && !config.googleAuthEnabled) {
        throw new DomainException('El inicio de sesión con Google está desactivado por el administrador.');
      }
      if (dto.provider === 'facebook' && !config.facebookAuthEnabled) {
        throw new DomainException('El inicio de sesión con Facebook está desactivado por el administrador.');
      }
      if (dto.provider === 'apple' && !config.appleAuthEnabled) {
        throw new DomainException('El inicio de sesión con Apple está desactivado por el administrador.');
      }
    }

    const cleanEmail = EmailValidator.validate(dto.email);
    let user = await this.userRepository.findByEmail(cleanEmail);

    if (!user) {
      // Registro automático del usuario social
      const dummyPass = await CryptoUtils.hashPassword(crypto.randomUUID());
      const newUser = new UserEntity({
        id: crypto.randomUUID(),
        email: cleanEmail,
        passwordHash: dummyPass,
        type: UserType.BUYER,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        profile: {
          firstName: dto.firstName || 'Usuario',
          lastName: dto.lastName || dto.provider.toUpperCase(),
          avatarUrl: dto.avatarUrl || null,
          completionPct: 50,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      user = await this.userRepository.create(newUser);
      await this.userRepository.saveOnboardingStep(user.id, OnboardingStep.BASE_REGISTRATION, 'completed');
      await this.userRepository.saveOnboardingStep(user.id, OnboardingStep.EMAIL_VERIFIED, 'completed');
      this.logger.log(`Nuevo usuario registrado vía Social (${dto.provider}): ${user.id} (${cleanEmail})`);
    } else {
      if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.LOGICALLY_DELETED) {
        throw new UnauthorizedException('Tu cuenta ha sido bloqueada o suspendida. Contacta a soporte.');
      }
      user.verifyEmail();
      user.recordLogin();
      await this.userRepository.update(user);
    }

    const tokens = await this.tokenGenerator.generateTokens({
      sub: user.id,
      email: user.email,
      type: user.type,
      role: user.role,
      roles: user.roles,
      permissions: user.permissions,
      kycLevel: user.kycLevel,
    });

    const refreshTokenHash = await this.tokenGenerator.hashRefreshToken(tokens.refreshToken);
    const session = new SessionEntity({
      id: crypto.randomUUID(),
      userId: user.id,
      refreshTokenHash,
      clientIp: clientIp || null,
      userAgent: userAgent || null,
      expiresAt: DateUtils.addDays(new Date(), 7),
      isRevoked: false,
      createdAt: new Date(),
    });

    await this.authRepository.createSession(session);
    await this.authRepository.logSecurityEvent(
      user.id,
      `SOCIAL_LOGIN_${dto.provider.toUpperCase()}`,
      'info',
      clientIp,
      userAgent,
      { provider: dto.provider },
    );

    return {
      user: user.toJSON(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };
  }
}

