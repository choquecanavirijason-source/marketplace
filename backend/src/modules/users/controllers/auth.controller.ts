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
import { AuthService } from '../services/auth.service';
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
} from '../dto';
import {
  ZodValidationPipe,
  Public,
  CurrentUser,
  JwtAuthGuard,
} from '../../../common';
import { AuthenticatedUser } from '../../../shared';

@Controller(['auth', 'identity'])
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ZodValidationPipe(registerUserSchema)) dto: RegisterUserDto,
  ) {
    const user = await this.authService.register(dto);
    return user.toJSON();
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.authService.login(dto, req.ip, req.headers['user-agent']);

    (reply as any).setCookie?.('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth/refresh',
      maxAge: 7 * 24 * 60 * 60,
    });

    return result;
  }

  @Public()
  @Post('otp/login')
  @HttpCode(HttpStatus.OK)
  async otpLogin(
    @Body(new ZodValidationPipe(otpLoginSchema)) dto: OtpLoginDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.authService.otpLogin(dto, req.headers['user-agent'], req.ip);

    (reply as any).setCookie?.('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth/refresh',
      maxAge: 7 * 24 * 60 * 60,
    });

    return result;
  }

  @Public()
  @Post('otp/send-email')
  @HttpCode(HttpStatus.OK)
  async sendEmailOtp(
    @Body(new ZodValidationPipe(sendEmailOtpSchema)) dto: SendEmailOtpDto,
    @Req() req: FastifyRequest,
  ) {
    return this.authService.sendEmailOtp(dto.email, req.ip);
  }

  @Public()
  @Post('otp/send-phone')
  @HttpCode(HttpStatus.OK)
  async sendPhoneOtp(
    @Body(new ZodValidationPipe(sendPhoneOtpSchema)) dto: SendPhoneOtpDto,
    @Req() req: FastifyRequest,
  ) {
    return this.authService.sendPhoneOtp(dto.phone, req.ip);
  }

  @Public()
  @Post('otp/verify-phone')
  @HttpCode(HttpStatus.OK)
  async verifyPhoneOtp(
    @Body(new ZodValidationPipe(verifyPhoneOtpSchema)) dto: VerifyPhoneOtpDto,
  ) {
    return this.authService.verifyPhoneOtp(dto.phone, (dto as any).code || (dto as any).otp);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body(new ZodValidationPipe(refreshTokenSchema)) dto: RefreshTokenDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const cookieToken = (req as any).cookies?.refresh_token;
    const token = dto.refreshToken || cookieToken;

    const result = await this.authService.refreshToken(token!, req.ip, req.headers['user-agent']);

    (reply as any).setCookie?.('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth/refresh',
      maxAge: 7 * 24 * 60 * 60,
    });

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const cookieToken = (req as any).cookies?.refresh_token;
    await this.authService.logout(undefined, user.id, cookieToken);
    (reply as any).clearCookie?.('refresh_token', { path: '/api/v1/auth/refresh' });
    return { message: 'Sesión cerrada correctamente.' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    await this.authService.logoutAll(user.id);
    (reply as any).clearCookie?.('refresh_token', { path: '/api/v1/auth/refresh' });
    return { message: 'Todas las sesiones fueron revocadas exitosamente.' };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body(new ZodValidationPipe(forgotPasswordSchema)) dto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) dto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body(new ZodValidationPipe(verifyEmailSchema)) dto: VerifyEmailDto,
  ) {
    return this.authService.verifyEmail(dto.token, dto.email);
  }
}
