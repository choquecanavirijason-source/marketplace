import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProductService } from '../services/product.service';
import {
  ProductQueryDto,
  productQuerySchema,
  CreateProductDto,
  createProductSchema,
  UpdateProductDto,
  updateProductSchema,
  ProductStatusDto,
  productStatusSchema,
} from '../dto';
import { ZodValidationPipe, JwtAuthGuard, RolesGuard, RequireRoles } from '../../../../common';
import { UserType } from '../../../../shared';

const CATALOG_ADMIN_ROLES = [UserType.ADMIN, UserType.SUPERADMIN];

@ApiTags('Catalog - Products (Admin)')
@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(...CATALOG_ADMIN_ROLES)
@UseInterceptors(ClassSerializerInterceptor)
export class ProductsAdminController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Listar productos para administración' })
  async adminList(@Query(new ZodValidationPipe(productQuerySchema)) query: ProductQueryDto) {
    return this.productService.adminList(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Crear un nuevo producto (Admin)' })
  async create(@Body(new ZodValidationPipe(createProductSchema)) dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Get(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Obtener detalle de producto para administración' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getById(id);
  }

  @Put(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Actualizar un producto (Admin)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateProductSchema)) dto: UpdateProductDto,
  ) {
    return this.productService.update(id, dto);
  }

  @Put(':id/status')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Cambiar estado de publicación del producto (Admin)' })
  async setStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(productStatusSchema)) dto: ProductStatusDto,
  ) {
    return this.productService.setActive(id, dto.is_active);
  }

  @Patch(':id/status')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Cambiar estado de publicación del producto (Admin - PATCH)' })
  async patchStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(productStatusSchema)) dto: ProductStatusDto,
  ) {
    return this.productService.setActive(id, dto.is_active);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Eliminar lógicamente un producto (Admin)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productService.remove(id);
  }
}
