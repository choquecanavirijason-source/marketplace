import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CategoryService } from '../services/category.service';
import { CategoryQueryDto, categoryQuerySchema } from '../dto';
import { ZodValidationPipe, JwtAuthGuard, RolesGuard, RequireRoles } from '../../../common';
import { UserType } from '../../../shared';

const CATALOG_ADMIN_ROLES = [UserType.ADMIN, UserType.SUPERADMIN];

@ApiTags('Catalog - Admin Categories')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(...CATALOG_ADMIN_ROLES)
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Listar categorías para administración' })
  async list(@Query(new ZodValidationPipe(categoryQuerySchema)) query: CategoryQueryDto) {
    return this.categoryService.adminList(query);
  }
}
