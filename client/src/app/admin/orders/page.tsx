"use client";

import { useState } from "react";
import {
  Search,
  ShoppingBag,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  MapPin,
  Phone,
  DollarSign,
  Package,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAdminOrders, useAdminStats } from "@/hooks/useOrders";
import { formatPrice } from "@/shared/lib/format";
import { ORDER_STATUS_CLASSES, ORDER_STATUS_LABELS, formatOrderDate } from "@/shared/lib/orderStatus";
import { ORDER_STATUSES } from "@/types";
import type { Order, OrderStatus } from "@/types";
import { toast } from "sonner";

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "todos">("todos");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [pendingStatus, setPendingStatus] = useState<{
    orderId: number;
    orderNumber: string;
    status: OrderStatus;
  } | null>(null);

  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: ordersData, isLoading: ordersLoading, updateStatus, isUpdating } = useAdminOrders(
    statusFilter,
    search,
  );

  const handleStatusChange = (orderId: number, orderNumber: string, nextStatus: OrderStatus) => {
    setPendingStatus({ orderId, orderNumber, status: nextStatus });
  };

  const handleConfirmStatus = async () => {
    if (!pendingStatus) return;
    try {
      await updateStatus({ id: pendingStatus.orderId, status: pendingStatus.status });
      toast.success(`Pedido ${pendingStatus.orderNumber} actualizado a ${ORDER_STATUS_LABELS[pendingStatus.status]}`);
      if (selectedOrder && selectedOrder.id === pendingStatus.orderId) {
        setSelectedOrder({ ...selectedOrder, status: pendingStatus.status });
      }
    } catch {
      toast.error("Error al actualizar el estado del pedido.");
    } finally {
      setPendingStatus(null);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
                <ShoppingBag className="w-6 h-6 text-primary" />
                Gestión de Pedidos y Ventas
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Supervisá los pedidos en tiempo real, actualizá sus estados y verificá los envíos.
              </p>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Pedidos</p>
                  <p className="text-2xl font-black text-foreground">{statsLoading ? "…" : stats?.totalOrders ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Facturación</p>
                  <p className="text-2xl font-black text-foreground">{statsLoading ? "…" : formatPrice(stats?.revenue ?? 0)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">En Camino</p>
                  <p className="text-2xl font-black text-blue-600">
                    {statsLoading ? "…" : stats?.ordersByStatus?.["enviado"] ?? 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-black text-amber-600">
                    {statsLoading ? "…" : stats?.ordersByStatus?.["pendiente"] ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card rounded-2xl border border-border p-4 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por número (#FM-...), cliente o ciudad…"
                className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none flex-shrink-0">
              {(["todos", ...ORDER_STATUSES] as Array<OrderStatus | "todos">).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    statusFilter === st
                      ? "bg-primary text-primary-foreground font-bold"
                      : "bg-secondary/80 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st === "todos" ? "Todos" : ORDER_STATUS_LABELS[st]}
                  {st !== "todos" && stats?.ordersByStatus?.[st] ? ` (${stats.ordersByStatus[st]})` : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {ordersLoading ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                Cargando pedidos...
              </div>
            ) : ordersData && ordersData.items.length > 0 ? (
              ordersData.items.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 bg-secondary/15">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold text-xs">
                        #{order.id}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black text-foreground">{order.orderNumber}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">{formatOrderDate(order.createdAt)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-primary" />
                          <strong className="text-foreground">{order.user?.name ?? "Cliente"}</strong>
                          {order.user?.email ? ` (${order.user.email})` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 ml-auto">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, order.orderNumber, e.target.value as OrderStatus)}
                        disabled={isUpdating}
                        className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold outline-none focus:border-primary cursor-pointer"
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {ORDER_STATUS_LABELS[st]}
                          </option>
                        ))}
                      </select>

                      <span className={`rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${ORDER_STATUS_CLASSES[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-xl text-xs h-8 px-3 gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver detalle
                      </Button>
                    </div>
                  </div>

                  {/* Order Items preview */}
                  <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-primary" />
                        <span>
                          {order.items.length} {order.items.length === 1 ? "producto" : "productos"}:{" "}
                          <strong className="text-foreground">
                            {order.items.map((it) => `${it.quantity}x ${it.name}`).join(", ")}
                          </strong>
                        </span>
                      </p>
                      {order.shippingCity || order.shippingAddress ? (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>Entrega en: {[order.shippingAddress, order.shippingCity].filter(Boolean).join(", ")}</span>
                        </p>
                      ) : null}
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-muted-foreground block uppercase font-semibold">Total</span>
                      <span className="text-xl font-black text-primary">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
                <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto" />
                <h3 className="text-base font-bold text-foreground">No se encontraron pedidos</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  No hay pedidos registrados que coincidan con los filtros aplicados.
                </p>
              </div>
            )}
          </div>

        {/* Modal: Order Details */}
        <Dialog open={selectedOrder !== null} onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3 pr-6">
                <div>
                  <DialogTitle className="text-xl font-black text-foreground flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    Detalle del Pedido #{selectedOrder?.id}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Código: <strong className="text-foreground">{selectedOrder?.orderNumber}</strong> · Fecha:{" "}
                    {selectedOrder ? formatOrderDate(selectedOrder.createdAt) : ""}
                  </DialogDescription>
                </div>
                {selectedOrder && (
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${ORDER_STATUS_CLASSES[selectedOrder.status]}`}>
                    {ORDER_STATUS_LABELS[selectedOrder.status]}
                  </span>
                )}
              </div>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6 pt-2">
                {/* Client & Shipping info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-secondary/30 p-4 border border-border text-xs">
                  <div>
                    <h4 className="font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-primary" /> Datos del Comprador
                    </h4>
                    <p className="text-foreground font-semibold">{selectedOrder.user?.name ?? "Cliente"}</p>
                    <p className="text-muted-foreground">{selectedOrder.user?.email}</p>
                    {selectedOrder.shippingPhone && (
                      <p className="text-muted-foreground mt-1 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {selectedOrder.shippingPhone}
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> Dirección de Entrega
                    </h4>
                    <p className="text-foreground">{selectedOrder.shippingAddress || "Retiro en sucursal"}</p>
                    <p className="text-muted-foreground">{selectedOrder.shippingCity}</p>
                    {selectedOrder.notes && (
                      <p className="text-amber-800 bg-amber-50 rounded-lg p-2 mt-2 border border-amber-200">
                        <strong>Nota:</strong> {selectedOrder.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-bold text-foreground uppercase tracking-wider text-xs mb-3">
                    Productos del Pedido ({selectedOrder.items.length})
                  </h4>
                  <div className="space-y-2.5">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3.5 p-3 rounded-2xl border border-border bg-card"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover bg-secondary flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <span className="text-sm font-black text-primary">{formatPrice(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-border pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-foreground">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Costo de Envío:</span>
                    <span className="font-semibold text-foreground">{formatPrice(selectedOrder.shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-foreground pt-2 border-t border-border">
                    <span>Total Pagado:</span>
                    <span className="text-lg text-primary">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal: Confirm Status Change */}
        <AlertDialog open={pendingStatus !== null} onOpenChange={(open) => { if (!open) setPendingStatus(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar cambio de estado operativo</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Confirmás cambiar el estado del pedido{" "}
                <span className="font-bold text-foreground">{pendingStatus?.orderNumber}</span> a{" "}
                <span className="font-bold text-foreground">
                  {pendingStatus ? ORDER_STATUS_LABELS[pendingStatus.status] : ""}
                </span>
                ? Se registrará un evento de auditoría en la línea de tiempo del pedido.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingStatus(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction disabled={isUpdating} onClick={handleConfirmStatus}>
                {isUpdating ? "Guardando…" : "Confirmar Cambio"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
