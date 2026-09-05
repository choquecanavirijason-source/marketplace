import { z } from 'zod';

export const createShipmentSchema = z.object({
  orderId: z.number().int().positive('ID de orden requerido.'),
  carrier: z.string().default('Correo Express'),
  serviceType: z.string().default('estandar'),
  destinationAddress: z.string().min(5),
  destinationCity: z.string().min(2),
  receiverName: z.string().min(2),
  receiverPhone: z.string().min(5),
  shippingCost: z.number().nonnegative().optional().default(0),
});

export type CreateShipmentDto = z.infer<typeof createShipmentSchema>;

export const updateShipmentStatusSchema = z.object({
  status: z.enum([
    'pendiente_preparacion',
    'en_preparacion',
    'lista_para_despacho',
    'despachado',
    'en_transito',
    'en_reparto',
    'entregado',
    'intento_fallido',
    'devuelto_origen',
  ]),
  location: z.string().min(2, 'Ubicación requerida'),
  description: z.string().min(3, 'Descripción requerida'),
});

export type UpdateShipmentStatusDto = z.infer<typeof updateShipmentStatusSchema>;
