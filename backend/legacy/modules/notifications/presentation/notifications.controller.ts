import { Controller, Post, Body, UsePipes, HttpCode, HttpStatus } from '@nestjs/common';
import { SendOtpHandler } from '../application/handlers/send-otp.handler';
import { SendOtpCommand } from '../application/commands/send-otp.command';
import { OtpGeneratorPort } from '../domain/ports/otp-generator.port';
import {
  sendOtpSchema,
  SendOtpDto,
  verifyOtpSchema,
  VerifyOtpDto,
} from './dto/send-otp.dto';
import { ZodValidationPipe, Public } from '../../../common';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly sendOtpHandler: SendOtpHandler,
    private readonly otpGenerator: OtpGeneratorPort,
  ) {}

  @Public()
  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(sendOtpSchema))
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.sendOtpHandler.execute(
      new SendOtpCommand(dto.destination, dto.channel),
    );
  }

  @Public()
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(verifyOtpSchema))
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const isValid = await this.otpGenerator.verifyOtp(dto.destination, dto.otp);
    return {
      valid: isValid,
      message: isValid ? 'Código verificado con éxito.' : 'Código incorrecto o expirado.',
    };
  }
}
