import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommunityService } from '../services/community.service';
import {
  CreateConversationDto,
  createConversationSchema,
  PostMessageDto,
  postMessageSchema,
} from '../dto/community.dto';
import { JwtAuthGuard, CurrentUser, ZodValidationPipe } from '../../../common';
import { AuthenticatedUser } from '../../../shared';

@ApiTags('Community & Omnichannel')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Abrir un nuevo hilo de chat omnicanal o ticket' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createConversationSchema)) dto: CreateConversationDto,
  ) {
    return this.communityService.createConversation(user.id, dto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Listar conversaciones activas de la bandeja' })
  async list(@Query('status') status?: string) {
    return this.communityService.listConversations(status);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Obtener hilo de conversación con sus mensajes' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.communityService.getConversation(id);
  }

  @Post('conversations/:id/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enviar mensaje de respuesta en la conversación' })
  async reply(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(postMessageSchema)) dto: PostMessageDto,
  ) {
    const senderType = ['admin', 'superadmin', 'support'].includes(user.role) ? 'agent' : 'customer';
    return this.communityService.replyMessage(id, user.id, senderType, dto);
  }
}
