import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CategoryService } from '../services/category.service';
import {
  CreateCategoryDto,
  createCategorySchema,
  UpdateCategoryDto,
  updateCategorySchema,
} from '../dto';
import { ZodValidationPipe, JwtAuthGuard, RolesGuard, RequireRoles } from '../../../common';
import { UserType } from '../../../shared';

const CATALOG_ADMIN_ROLES = [UserType.ADMIN, UserType.SUPERADMIN];

@ApiTags('Catalog - Categories')
@Controller(['categories', 'catalog/categories'])
export class CategoriesController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Listar categorías activas con cantidad de productos' })
  async list() {
    return this.categoryService.listActive();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Obtener una categoría activa por su slug' })
  async getBySlug(@Param('slug') slug: string) {
    return this.categoryService.findBySlug(slug);
  }

  @Post()
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(...CATALOG_ADMIN_ROLES)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva categoría (Admin)' })
  async create(@Body(new ZodValidationPipe(createCategorySchema)) dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Put(':id')
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(...CATALOG_ADMIN_ROLES)
  @ApiOperation({ summary: 'Actualizar una categoría por ID (Admin)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateCategorySchema)) dto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(...CATALOG_ADMIN_ROLES)
  @ApiOperation({ summary: 'Eliminar lógicamente una categoría (Admin)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.categoryService.remove(id);
  }
}
