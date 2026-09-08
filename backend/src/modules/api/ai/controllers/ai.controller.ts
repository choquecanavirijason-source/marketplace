import { Controller, Post, Get, Body, Param, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AiService } from '../services/ai.service';
import { AiAssistantPromptDto, aiAssistantPromptSchema } from '../dto/ai.dto';
import { Public, ZodValidationPipe } from '../../../../common';

@ApiTags('AI - Copilot & Recommendations')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Public()
  @Post('assistant')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Asistente Copilot conversacional guiado por el catálogo' })
  async askAssistant(
    @Body(new ZodValidationPipe(aiAssistantPromptSchema)) dto: AiAssistantPromptDto,
  ) {
    return this.aiService.consultAssistant(dto);
  }

  @Public()
  @Get('recommendations/product/:id')
  @ApiOperation({ summary: 'Recomendaciones semánticas de productos complementarios' })
  async getRecommendations(@Param('id', ParseIntPipe) id: number) {
    return this.aiService.getSemanticRecommendations(id);
  }
}
