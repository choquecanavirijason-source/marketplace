import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CategoryService } from '../services/category.service';
import {
  CreateCategoryDto,
  createCategorySchema,
  UpdateCategoryDto,
  updateCategorySchema,
  CategoryQueryDto,
  categoryQuerySchema,
} from '../dto';
import { ZodValidationPipe, JwtAuthGuard, RolesGuard, RequireRoles } from '../../../../common';
import { UserType } from '../../../../shared';

const CATALOG_ADMIN_ROLES = [UserType.ADMIN, UserType.SUPERADMIN];

@ApiTags('Catalog - Categories (Admin)')
@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(...CATALOG_ADMIN_ROLES)
@UseInterceptors(ClassSerializerInterceptor)
export class CategoriesAdminController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar categorías para administración' })
  async list(@Query(new ZodValidationPipe(categoryQuerySchema)) query: CategoryQueryDto) {
    return this.categoryService.adminList(query);
  }

  @Post()
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva categoría (Admin)' })
  async create(@Body(new ZodValidationPipe(createCategorySchema)) dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Put(':id')
  @ApiBearerAuth('bearer')
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
  @ApiOperation({ summary: 'Eliminar lógicamente una categoría (Admin)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.categoryService.remove(id);
  }
}
