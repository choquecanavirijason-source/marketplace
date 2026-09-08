import {
  Controller,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HeroSlideService } from '../services/hero-slide.service';
import { Public } from '../../../../common';

@ApiTags('Catalog - Hero Slides (Public)')
@Controller('hero-slides')
@Public()
@UseInterceptors(ClassSerializerInterceptor)
export class HeroSlidesController {
  constructor(private readonly heroSlideService: HeroSlideService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar hero slides promocionales' })
  async list() {
    return this.heroSlideService.findAll();
  }
}
