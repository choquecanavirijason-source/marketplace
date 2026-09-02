import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { StartVerificationHandler } from '../application/handlers/start-verification.handler';
import { StartVerificationCommand } from '../application/commands/start-verification.command';
import { UploadDocumentUrlHandler } from '../application/handlers/upload-document-url.handler';
import { UploadDocumentUrlCommand } from '../application/commands/upload-document-url.command';
import { VerificationRepositoryPort } from '../domain/ports/verification-repository.port';
import {
  startVerificationSchema,
  StartVerificationDto,
  uploadDocumentSchema,
  UploadDocumentDto,
} from './dto/start-verification.dto';
import {
  ZodValidationPipe,
  CurrentUser,
  JwtAuthGuard,
} from '../../../common';
import { AuthenticatedUser } from '../../../shared';

@UseGuards(JwtAuthGuard)
@Controller('verification')
export class VerificationController {
  constructor(
    private readonly startVerificationHandler: StartVerificationHandler,
    private readonly uploadDocumentUrlHandler: UploadDocumentUrlHandler,
    private readonly verificationRepository: VerificationRepositoryPort,
  ) {}

  @Post('start')
  @UsePipes(new ZodValidationPipe(startVerificationSchema))
  async start(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: StartVerificationDto,
  ) {
    return this.startVerificationHandler.execute(
      new StartVerificationCommand(user.id, dto.targetLevel),
    );
  }

  @Post('documents/upload-url')
  @UsePipes(new ZodValidationPipe(uploadDocumentSchema))
  async getUploadUrl(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UploadDocumentDto,
  ) {
    return this.uploadDocumentUrlHandler.execute(
      new UploadDocumentUrlCommand(
        user.id,
        dto.documentType,
        dto.mimeType,
        dto.fileSizeBytes,
      ),
    );
  }

  @Get('status')
  async getStatus(@CurrentUser() user: AuthenticatedUser) {
    const verification = await this.verificationRepository.findByUserId(user.id);
    if (!verification) {
      return { status: 'NOT_STARTED' };
    }
    const docs = await this.verificationRepository.findDocumentsByVerificationId(verification.id);
    return {
      verification: verification.toJSON(),
      documents: docs.map((d) => d.toJSON()),
    };
  }
}
