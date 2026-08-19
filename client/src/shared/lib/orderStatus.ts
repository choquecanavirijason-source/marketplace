import type { OrderStatus } from "@/domain/entities/Order";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export const ORDER_STATUS_CLASSES: Record<OrderStatus, string> = {
  pendiente: "bg-amber-50 text-amber-700 border-amber-200",
  confirmado: "bg-blue-50 text-blue-700 border-blue-200",
  enviado: "bg-violet-50 text-violet-700 border-violet-200",
  entregado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelado: "bg-red-50 text-red-700 border-red-200",
};

export function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}