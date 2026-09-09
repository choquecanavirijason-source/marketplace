import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Query,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FastifyRequest, FastifyReply } from 'fastify';
import * as crypto from 'crypto';
import { env } from '../../../../config/env-schema';
import { AuthService } from '../services/auth.service';
import { AuthConfigService } from '../services/auth-config.service';
import {
  RegisterUserDto,
  registerUserSchema,
  LoginDto,
  loginSchema,
  OtpLoginDto,
  otpLoginSchema,
  RefreshTokenDto,
  refreshTokenSchema,
  SendEmailOtpDto,
  sendEmailOtpSchema,
  SendPhoneOtpDto,
  sendPhoneOtpSchema,
  VerifyPhoneOtpDto,
  verifyPhoneOtpSchema,
  VerifyEmailDto,
  verifyEmailSchema,
  ForgotPasswordDto,
  forgotPasswordSchema,
  ResetPasswordDto,
  resetPasswordSchema,
  SocialLoginDto,
  socialLoginSchema,
  PhoneOtpLoginDto,
  phoneOtpLoginSchema,
  UpdateAuthSettingsDto,
  updateAuthSettingsSchema,
} from '../dto';
import {
  ZodValidationPipe,
  Public,
  CurrentUser,
  JwtAuthGuard,
  RolesGuard,
  RequireRoles,
} from '../../../../common';
import { AuthenticatedUser, UserType } from '../../../../shared';

@ApiTags('Identity & Auth')
@Controller(['auth', 'identity'])
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authConfigService?: AuthConfigService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de validación inválidos o correo ya existente' })
  async register(
    @Body(new ZodValidationPipe(registerUserSchema)) dto: RegisterUserDto,
  ) {
    const user = await this.authService.register(dto);
    return user.toJSON();
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con email y contraseña' })
  @ApiResponse({ status: 200, description: 'Credenciales válidas, retorna accessToken y user' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.authService.login(dto, req.ip, req.headers['user-agent']);

    (reply as any).setCookie?.('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return result;
  }

  @Public()
  @Post('otp/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión mediante código OTP (Email o SMS)' })
  async otpLogin(
    @Body(new ZodValidationPipe(otpLoginSchema)) dto: OtpLoginDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.authService.otpLogin(dto, req.headers['user-agent'], req.ip);

    (reply as any).setCookie?.('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return result;
  }

  @Public()
  @Post('otp/send-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar código OTP por correo electrónico' })
  async sendEmailOtp(
    @Body(new ZodValidationPipe(sendEmailOtpSchema)) dto: SendEmailOtpDto,
    @Req() req: FastifyRequest,
  ) {
    return this.authService.sendEmailOtp(dto.email, req.ip);
  }

  @Public()
  @Post('otp/send-phone')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar código OTP por SMS' })
  async sendPhoneOtp(
    @Body(new ZodValidationPipe(sendPhoneOtpSchema)) dto: SendPhoneOtpDto,
    @Req() req: FastifyRequest,
  ) {
    return this.authService.sendPhoneOtp(dto.phone, req.ip);
  }

  @Public()
  @Post('otp/verify-phone')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar código OTP telefónico' })
  async verifyPhoneOtp(
    @Body(new ZodValidationPipe(verifyPhoneOtpSchema)) dto: VerifyPhoneOtpDto,
  ) {
    return this.authService.verifyPhoneOtp(dto.phone, (dto as any).code || (dto as any).otp);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar el access token utilizando refresh token' })
  async refresh(
    @Body(new ZodValidationPipe(refreshTokenSchema)) dto: RefreshTokenDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const cookieToken = (req as any).cookies?.refresh_token;
    const token = dto.refreshToken || cookieToken;

    if (!token) {
      throw new UnauthorizedException('No se proporcionó un token de actualización válido.');
    }

    const result = await this.authService.refreshToken(token, req.ip, req.headers['user-agent']);

    (reply as any).setCookie?.('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return result;
  }

  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar la sesión activa actual' })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const cookieToken = (req as any).cookies?.refresh_token;
    await this.authService.logout(undefined, user.id, cookieToken);
    (reply as any).clearCookie?.('refresh_token', { path: '/' });
    return { message: 'Sesión cerrada correctamente.' };
  }

  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revocar y cerrar todas las sesiones del usuario' })
  async logoutAll(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    await this.authService.logoutAll(user.id);
    (reply as any).clearCookie?.('refresh_token', { path: '/' });
    return { message: 'Todas las sesiones fueron revocadas exitosamente.' };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar restablecimiento de contraseña olvidada' })
  async forgotPassword(
    @Body(new ZodValidationPipe(forgotPasswordSchema)) dto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restablecer contraseña con token de verificación' })
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) dto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(dto.token, dto.password, dto.email);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar dirección de correo electrónico con token' })
  async verifyEmail(
    @Body(new ZodValidationPipe(verifyEmailSchema)) dto: VerifyEmailDto,
  ) {
    return this.authService.verifyEmail(dto.token, dto.email);
  }

  @Public()
  @Get('config')
  @ApiOperation({ summary: 'Obtener los métodos de autenticación permitidos (Público)' })
  async getPublicConfig() {
    if (this.authConfigService) {
      return this.authConfigService.getPublicConfig();
    }
    return {
      emailPasswordEnabled: true,
      phoneOtpEnabled: true,
      socialLoginEnabled: true,
      googleAuthEnabled: true,
      facebookAuthEnabled: true,
      appleAuthEnabled: true,
      defaultAuthMethod: 'email',
      requireEmailVerification: false,
      requirePhoneVerification: false,
    };
  }

  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(UserType.ADMIN, UserType.SUPERADMIN)
  @Get('admin/config')
  @ApiOperation({ summary: 'Obtener configuración completa de autenticación (Admin)' })
  async getAdminConfig() {
    if (this.authConfigService) {
      return this.authConfigService.getSettings();
    }
    return {};
  }

  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(UserType.ADMIN, UserType.SUPERADMIN)
  @Patch('admin/config')
  @ApiOperation({ summary: 'Actualizar métodos y reglas de autenticación (Admin)' })
  async updateConfig(
    @Body(new ZodValidationPipe(updateAuthSettingsSchema)) dto: UpdateAuthSettingsDto,
  ) {
    if (this.authConfigService) {
      return this.authConfigService.updateSettings(dto);
    }
    return dto;
  }

  @Public()
  @Post('social/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión o registrarse con redes sociales (Google, Facebook, Apple)' })
  async socialLogin(
    @Body(new ZodValidationPipe(socialLoginSchema)) dto: SocialLoginDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.authService.socialLogin(dto, req.headers['user-agent'], req.ip);

    (reply as any).setCookie?.('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return result;
  }

  @Public()
  @Post('phone/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión directamente con número de teléfono móvil y código OTP' })
  async phoneLogin(
    @Body(new ZodValidationPipe(phoneOtpLoginSchema)) dto: PhoneOtpLoginDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.authService.phoneLogin(dto, req.headers['user-agent'], req.ip);

    (reply as any).setCookie?.('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return result;
  }

  @Public()
  @Get(':provider')
  @ApiOperation({ summary: 'Iniciar redirección OAuth hacia el proveedor (google, facebook, apple)' })
  async socialAuthRedirect(
    @Param('provider') provider: string,
    @Query('redirect') redirectQuery: string | undefined,
    @Res() reply: FastifyReply,
  ) {
    const validProviders = ['google', 'facebook', 'apple'];
    if (!validProviders.includes(provider)) {
      throw new NotFoundException(`Proveedor de autenticación no soportado: ${provider}`);
    }

    const statePayload = JSON.stringify({
      nonce: crypto.randomUUID(),
      redirect: redirectQuery || '/',
    });
    const state = Buffer.from(statePayload).toString('base64url');

    (reply as any).setCookie?.('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 10 * 60,
    });

    const redirectUrl = await this.authService.getSocialAuthorizationUrl(provider, state);
    return reply.status(302).redirect(redirectUrl);
  }

  @Public()
  @Get(':provider/callback')
  @ApiOperation({ summary: 'Callback OAuth de retorno para Google, Facebook y Apple (GET)' })
  async socialAuthCallback(
    @Param('provider') provider: string,
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ) {
    if (error || !code) {
      const errorMsg = encodeURIComponent(error || 'No se recibió el código de autorización.');
      return reply.status(302).redirect(`${env.FRONTEND_URL}/account/login?error=${errorMsg}`);
    }

    let redirectTarget = '/';
    try {
      if (state) {
        const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf-8'));
        if (parsed.redirect) redirectTarget = parsed.redirect;
      }
    } catch {
      // Ignorar fallo de parseo de state
    }

    try {
      const result = await this.authService.handleSocialCallback(
        provider,
        code,
        undefined,
        req.headers['user-agent'],
        req.ip,
      );

      (reply as any).setCookie?.('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
      (reply as any).clearCookie?.('oauth_state', { path: '/' });

      const finalUrl = `${env.FRONTEND_URL}/auth/callback?token=${encodeURIComponent(result.accessToken)}&redirect=${encodeURIComponent(redirectTarget)}`;
      return reply.status(302).redirect(finalUrl);
    } catch (err: any) {
      const errorMsg = encodeURIComponent(err?.message || 'Error en autenticación social.');
      return reply.status(302).redirect(`${env.FRONTEND_URL}/account/login?error=${errorMsg}`);
    }
  }

  @Public()
  @Post('apple/callback')
  @ApiOperation({ summary: 'Callback form_post de Apple Sign In' })
  async appleAuthCallbackPost(
    @Body() body: { code?: string; state?: string; id_token?: string; user?: string; error?: string },
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ) {
    if (body?.error || !body?.code) {
      const errorMsg = encodeURIComponent(body?.error || 'No se recibió el código de autorización de Apple.');
      return reply.status(302).redirect(`${env.FRONTEND_URL}/account/login?error=${errorMsg}`);
    }

    let redirectTarget = '/';
    try {
      if (body.state) {
        const parsed = JSON.parse(Buffer.from(body.state, 'base64url').toString('utf-8'));
        if (parsed.redirect) redirectTarget = parsed.redirect;
      }
    } catch {
      // Ignorar fallo de parseo de state
    }

    try {
      const result = await this.authService.handleSocialCallback(
        'apple',
        body.code,
        { id_token: body.id_token, user: body.user },
        req.headers['user-agent'],
        req.ip,
      );

      (reply as any).setCookie?.('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
      (reply as any).clearCookie?.('oauth_state', { path: '/' });

      const finalUrl = `${env.FRONTEND_URL}/auth/callback?token=${encodeURIComponent(result.accessToken)}&redirect=${encodeURIComponent(redirectTarget)}`;
      return reply.status(302).redirect(finalUrl);
    } catch (err: any) {
      const errorMsg = encodeURIComponent(err?.message || 'Error en autenticación con Apple.');
      return reply.status(302).redirect(`${env.FRONTEND_URL}/account/login?error=${errorMsg}`);
    }
  }
}
