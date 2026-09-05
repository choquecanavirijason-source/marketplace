import { z } from 'zod';

export const createOrderItemSchema = z.object({
  productId: z.number().int().positive().optional(),
  product_id: z.number().int().positive().optional(),
  quantity: z.number().int().positive().default(1),
}).transform((val) => ({
  productId: val.productId ?? val.product_id ?? 0,
  quantity: val.quantity,
}));

export const createOrderSchema = z.object({
  items: z.array(createOrderItemSchema).min(1, 'El pedido debe incluir al menos un producto.'),
  shippingName: z.string().max(200).optional(),
  shipping_name: z.string().max(200).optional(),
  shippingPhone: z.string().max(50).optional(),
  shipping_phone: z.string().max(50).optional(),
  shippingAddress: z.string().max(300).optional(),
  shipping_address: z.string().max(300).optional(),
  shippingCity: z.string().max(120).optional(),
  shipping_city: z.string().max(120).optional(),
  shippingProvince: z.string().max(120).optional(),
  shipping_province: z.string().max(120).optional(),
  shippingZip: z.string().optional(),
  shipping_zip: z.string().optional(),
  shippingCost: z.number().nonnegative().optional().default(0),
  shipping_cost: z.number().nonnegative().optional(),
  notes: z.string().max(500).optional(),
  paymentMethod: z.string().max(50).optional().default('card'),
  payment_method: z.string().max(50).optional(),
}).transform((val) => ({
  items: val.items,
  shippingName: val.shippingName ?? val.shipping_name ?? 'Cliente',
  shippingPhone: val.shippingPhone ?? val.shipping_phone ?? 'Sin especificar',
  shippingAddress: val.shippingAddress ?? val.shipping_address ?? 'Retiro en sucursal / Sin dirección',
  shippingCity: val.shippingCity ?? val.shipping_city ?? 'Central',
  shippingProvince: val.shippingProvince ?? val.shipping_province ?? 'Central',
  shippingZip: val.shippingZip ?? val.shipping_zip,
  shippingCost: val.shippingCost ?? val.shipping_cost ?? 0,
  notes: val.notes,
  paymentMethod: val.paymentMethod ?? val.payment_method ?? 'card',
}));

export type CreateOrderDto = z.infer<typeof createOrderSchema>;

export const orderStatusSchema = z.object({
  status: z.enum(['pendiente', 'confirmado', 'en_preparacion', 'enviado', 'entregado', 'cancelado']),
  notes: z.string().max(300).optional(),
});

export type OrderStatusDto = z.infer<typeof orderStatusSchema>;

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
  status: z.string().optional(),
  search: z.string().optional(),
});

export type OrderQueryDto = z.infer<typeof orderQuerySchema>;
