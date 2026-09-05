import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
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
} from '../dto';
import { ZodValidationPipe, JwtAuthGuard, RolesGuard, RequireRoles } from '../../../common';
import { UserType } from '../../../shared';

const CATALOG_ADMIN_ROLES = [UserType.ADMIN, UserType.SUPERADMIN];

@ApiTags('Catalog - Products')
@Controller(['products', 'catalog/products'])
export class ProductsController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Listar productos publicados con paginación y filtros' })
  async list(@Query(new ZodValidationPipe(productQuerySchema)) query: ProductQueryDto) {
    return this.productService.publicList(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(...CATALOG_ADMIN_ROLES)
  @ApiOperation({ summary: 'Crear un nuevo producto (Admin)' })
  async create(@Body(new ZodValidationPipe(createProductSchema)) dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle público de un producto por ID' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.productService.publicById(id);
  }

  @Put(':id')
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(...CATALOG_ADMIN_ROLES)
  @ApiOperation({ summary: 'Actualizar un producto (Admin/Seller)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateProductSchema)) dto: UpdateProductDto,
  ) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(...CATALOG_ADMIN_ROLES)
  @ApiOperation({ summary: 'Eliminar lógicamente un producto (Admin)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productService.remove(id);
  }
}
