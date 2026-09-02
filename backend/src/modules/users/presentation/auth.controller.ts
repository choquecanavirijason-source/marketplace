import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UsePipes,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { RegisterUserHandler } from '../application/handlers/register-user.handler';
import { RegisterUserCommand } from '../application/commands/register-user.command';
import { LoginHandler } from '../application/handlers/login.handler';
import { LoginCommand } from '../application/commands/login.command';
import { OtpLoginHandler } from '../application/handlers/otp-login.handler';
import { RefreshTokenHandler } from '../application/handlers/refresh-token.handler';
import { RefreshTokenCommand } from '../application/commands/refresh-token.command';
import { LogoutHandler } from '../application/handlers/logout.handler';
import { LogoutCommand } from '../application/commands/logout.command';
import { LogoutAllHandler } from '../application/handlers/logout-all.handler';
import { ForgotPasswordHandler } from '../application/handlers/forgot-password.handler';
import { ResetPasswordHandler } from '../application/handlers/reset-password.handler';
import { VerifyEmailHandler } from '../application/handlers/verify-email.handler';
import { SendPhoneOtpHandler } from '../application/handlers/send-phone-otp.handler';
import { VerifyPhoneOtpHandler } from '../application/handlers/verify-phone-otp.handler';

import { registerUserSchema, RegisterUserDto } from './dto/register-user.dto';
import { loginSchema, LoginDto } from './dto/login.dto';
import { otpLoginSchema, OtpLoginDto } from './dto/otp-login.dto';
import { refreshTokenSchema, RefreshTokenDto } from './dto/refresh-token.dto';
import {
  forgotPasswordSchema,
  ForgotPasswordDto,
  resetPasswordSchema,
  ResetPasswordDto,
  verifyEmailSchema,
  VerifyEmailDto,
  sendPhoneOtpSchema,
  SendPhoneOtpDto,
  verifyPhoneOtpSchema,
  VerifyPhoneOtpDto,
} from './dto/verification.dto';

import {
  ZodValidationPipe,
  Public,
  CurrentUser,
  JwtAuthGuard,
} from '../../../common';
import { AuthenticatedUser, UserType } from '../../../shared';

@Controller(['auth', 'identity'])
export class AuthController {
  constructor(
    private readonly registerUserHandler: RegisterUserHandler,
    private readonly loginHandler: LoginHandler,
    private readonly otpLoginHandler: OtpLoginHandler,
    private readonly refreshTokenHandler: RefreshTokenHandler,
    private readonly logoutHandler: LogoutHandler,
    private readonly logoutAllHandler: LogoutAllHandler,
    private readonly forgotPasswordHandler: ForgotPasswordHandler,
    private readonly resetPasswordHandler: ResetPasswordHandler,
    private readonly verifyEmailHandler: VerifyEmailHandler,
    private readonly sendPhoneOtpHandler: SendPhoneOtpHandler,
    private readonly verifyPhoneOtpHandler: VerifyPhoneOtpHandler,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(registerUserSchema))
  async register(@Body() dto: RegisterUserDto, @Req() req: FastifyRequest) {
    const parts = (dto.name || '').trim().split(' ');
    const firstName = dto.firstName || parts[0] || 'Usuario';
    const lastName = dto.lastName || parts.slice(1).join(' ') || 'Marketplace';
    const phone = dto.phone || dto.mobileNumber || dto.mobile_number;

    const user = await this.registerUserHandler.execute(
      new RegisterUserCommand(
        dto.email,
        dto.password,
        firstName,
        lastName,
        phone,
        (dto.type || dto.role || 'buyer') as UserType,
        undefined,
        dto.legalName,
        dto.tradeName,
        dto.taxId,
        dto.legalType,
        dto.fiscalAddress,
        dto.termsAccepted ?? true,
        req.ip,
        req.headers['user-agent'],
      ),
    );

    return {
      message: 'Cuenta creada exitosamente.',
      user: user.toJSON(),
      permissions: user.permissions,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(
    @Body() dto: LoginDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) _res: FastifyReply,
  ) {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    const correlationId = req.headers['x-correlation-id'] as string;

    return this.loginHandler.execute(
      new LoginCommand(dto.email, dto.password, ipAddress, userAgent, correlationId, dto.deviceId),
    );
  }

  @Public()
  @Post('login/otp')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(otpLoginSchema))
  async loginOtp(@Body() dto: OtpLoginDto, @Req() req: FastifyRequest) {
    return this.otpLoginHandler.execute({
      phone: dto.phone,
      email: dto.email,
      code: dto.code,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      deviceId: dto.deviceId,
    });
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(refreshTokenSchema))
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: FastifyRequest) {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    const correlationId = req.headers['x-correlation-id'] as string;

    return this.refreshTokenHandler.execute(
      new RefreshTokenCommand(dto.refreshToken, ipAddress, userAgent, correlationId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body?: { refreshToken?: string },
  ) {
    await this.logoutHandler.execute(new LogoutCommand(user.id, body?.refreshToken));
    return { message: 'Sesión finalizada correctamente.' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(@CurrentUser() user: AuthenticatedUser, @Req() req: FastifyRequest) {
    await this.logoutAllHandler.execute(user.id, req.ip);
    return { message: 'Todas las sesiones activas han sido cerradas con éxito.' };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(forgotPasswordSchema))
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: FastifyRequest) {
    return this.forgotPasswordHandler.execute(dto.email, req.ip);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(resetPasswordSchema))
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: FastifyRequest) {
    await this.resetPasswordHandler.execute(dto.email, dto.token, dto.password, req.ip);
    return { message: 'Contraseña actualizada correctamente. Inicia sesión con tu nueva clave.' };
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(verifyEmailSchema))
  async verifyEmail(@Body() dto: VerifyEmailDto, @Req() req: FastifyRequest) {
    await this.verifyEmailHandler.execute(dto.email, dto.token, req.ip);
    return { message: 'Correo electrónico verificado exitosamente.' };
  }

  @Public()
  @Post('send-phone-otp')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(sendPhoneOtpSchema))
  async sendPhoneOtp(@Body() dto: SendPhoneOtpDto, @Req() req: FastifyRequest) {
    return this.sendPhoneOtpHandler.execute(dto.phone, undefined, req.ip);
  }

  @Public()
  @Post('verify-phone-otp')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(verifyPhoneOtpSchema))
  async verifyPhoneOtp(@Body() dto: VerifyPhoneOtpDto, @Req() req: FastifyRequest) {
    await this.verifyPhoneOtpHandler.execute(dto.phone, dto.code, undefined, req.ip);
    return { message: 'Número de teléfono verificado exitosamente.' };
  }
}
