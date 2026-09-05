import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
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
  ProductStatusDto,
  productStatusSchema,
} from '../dto';
import { ZodValidationPipe, JwtAuthGuard, RolesGuard, RequireRoles } from '../../../common';
import { UserType } from '../../../shared';

const CATALOG_ADMIN_ROLES = [UserType.ADMIN, UserType.SUPERADMIN];

@ApiTags('Catalog - Admin Products')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(...CATALOG_ADMIN_ROLES)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Listar productos para administración (incluye no publicados)' })
  async list(@Query(new ZodValidationPipe(productQuerySchema)) query: ProductQueryDto) {
    return this.productService.adminList(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo producto (Admin)' })
  async create(@Body(new ZodValidationPipe(createProductSchema)) dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Activar o pausar un producto (publicar/pausar)' })
  async setStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(productStatusSchema)) dto: ProductStatusDto,
  ) {
    return this.productService.setActive(id, dto.is_active);
  }
}
