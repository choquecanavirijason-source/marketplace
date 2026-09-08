import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { CartService } from '../services/cart.service';
import {
  AddToCartDto,
  addToCartSchema,
  UpdateCartItemDto,
  updateCartItemSchema,
} from '../dto/cart.dto';
import { Public, ZodValidationPipe } from '../../../../common';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private extractAuthUserOrGuest(req: FastifyRequest, guestTokenQuery?: string) {
    const user = (req as any).user;
    const userId = (user?.id || user?.userId) as string | undefined;
    const guestToken = guestTokenQuery || (req.headers['x-guest-token'] as string) || undefined;
    return { userId, guestToken };
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Obtener el carrito actual del usuario o invitado' })
  async getCart(
    @Req() req: FastifyRequest,
    @Query('guestToken') guestToken?: string,
  ) {
    const { userId, guestToken: token } = this.extractAuthUserOrGuest(req, guestToken);
    return this.cartService.getCart(userId, token || 'guest_default');
  }

  @Public()
  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agregar un producto al carrito' })
  async addItem(
    @Req() req: FastifyRequest,
    @Body(new ZodValidationPipe(addToCartSchema)) dto: AddToCartDto,
  ) {
    const { userId, guestToken } = this.extractAuthUserOrGuest(req, dto.guestToken);
    return this.cartService.addItem(
      { ...dto, guestToken: dto.guestToken || guestToken || 'guest_default' },
      userId,
    );
  }

  @Public()
  @Patch('items/:id')
  @ApiOperation({ summary: 'Actualizar la cantidad de un ítem del carrito' })
  async updateItemQuantity(
    @Req() req: FastifyRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateCartItemSchema)) dto: UpdateCartItemDto,
    @Query('guestToken') guestToken?: string,
  ) {
    const { userId, guestToken: token } = this.extractAuthUserOrGuest(req, guestToken);
    return this.cartService.updateItemQuantity(id, dto, userId, token);
  }

  @Public()
  @Delete('items/:id')
  @ApiOperation({ summary: 'Eliminar un ítem del carrito' })
  async removeItem(@Param('id', ParseIntPipe) id: number) {
    return this.cartService.removeItem(id);
  }

  @Public()
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Vaciar completamente el carrito' })
  async clearCart(
    @Req() req: FastifyRequest,
    @Query('guestToken') guestToken?: string,
  ) {
    const { userId, guestToken: token } = this.extractAuthUserOrGuest(req, guestToken);
    await this.cartService.clearCart(userId, token || 'guest_default');
  }
}
