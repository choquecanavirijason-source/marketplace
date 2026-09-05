import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LiveShoppingService } from '../services/live-shopping.service';
import {
  CreateLiveEventDto,
  createLiveEventSchema,
  PostLiveChatMessageDto,
  postLiveChatMessageSchema,
} from '../dto/live-shopping.dto';
import { Public, ZodValidationPipe } from '../../../common';

@ApiTags('Live Shopping')
@Controller('live')
export class LiveShoppingController {
  constructor(private readonly liveService: LiveShoppingService) {}

  @Public()
  @Get('events')
  @ApiOperation({ summary: 'Listar eventos de Live Shopping programados o en vivo' })
  async listEvents() {
    return this.liveService.listEvents();
  }

  @Public()
  @Post('events')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva sala de Live Shopping' })
  async create(
    @Body(new ZodValidationPipe(createLiveEventSchema)) dto: CreateLiveEventDto,
  ) {
    return this.liveService.createEvent(null, dto);
  }

  @Public()
  @Get('events/:id/room')
  @ApiOperation({ summary: 'Entrar a la sala en vivo con video, chat y producto fijado' })
  async getRoom(@Param('id', ParseIntPipe) id: number) {
    return this.liveService.getEventRoom(id);
  }

  @Public()
  @Post('events/:id/chat/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Publicar mensaje en el chat en vivo del streaming' })
  async postMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(postLiveChatMessageSchema)) dto: PostLiveChatMessageDto,
  ) {
    return this.liveService.postMessage(id, dto);
  }

  @Public()
  @Patch('events/:id/status')
  @ApiOperation({ summary: 'Cambiar estado de transmisión del evento (scheduled, live, ended)' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.liveService.updateStatus(id, status);
  }
}
