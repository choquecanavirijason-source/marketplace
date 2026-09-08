import {
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductService } from '../services/product.service';
import { ProductQueryDto, productQuerySchema } from '../dto';
import { ZodValidationPipe, Public } from '../../../../common';

@ApiTags('Catalog - Products (Public)')
@Controller('products')
@Public()
@UseInterceptors(ClassSerializerInterceptor)
export class ProductsController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar productos públicos con paginación y filtros' })
  async list(@Query(new ZodValidationPipe(productQuerySchema)) query: ProductQueryDto) {
    return this.productService.publicList(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener detalle de producto público por ID' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.productService.publicById(id);
  }
}
