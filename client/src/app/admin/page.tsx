"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/presentation/atoms/alert-dialog";
import { DashboardLayout, adminNavItems } from "@/presentation/organisms/DashboardLayout";
import { useAdminOrders, useAdminStats } from "@/presentation/hooks/useOrders";
import { getCurrentUser, isCustomerAuthenticated } from "@/shared/lib/marketplaceStorage";
import { formatPrice } from "@/shared/lib/format";
import { ORDER_STATUS_CLASSES, ORDER_STATUS_LABELS, formatOrderDate } from "@/shared/lib/orderStatus";
import { ORDER_STATUSES } from "@/domain/entities/Order";
import type { OrderStatus } from "@/domain/entities/Order";

function StatusSelect({
  value,
  onChange,
  disabled,
}: {
  value: OrderStatus;
  onChange: (status: OrderStatus) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as OrderStatus)}
      className="rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-primary"
    >
      {ORDER_STATUSES.map((status) => (
        <option key={status} value={status}>
          {ORDER_STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "todos">("todos");
  const [search, setSearch] = useState("");
  const [pendingStatus, setPendingStatus] = useState<{ orderId: number; orderNumber: string; status: OrderStatus } | null>(null);

  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: ordersData, isLoading: ordersLoading, updateStatus, isUpdating } = useAdminOrders(statusFilter, search);

  useEffect(() => {
    if (!isCustomerAuthenticated()) {
      router.push("/cuenta/ingresar?redirect=/admin");
      return;
    }
    if (getCurrentUser()?.roleName !== "admin") {
      router.push("/");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthChecked(true);
  }, [router]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background px-4 py-24 text-center text-muted-foreground">Verificando sesión…</div>
    );
  }

  return (
    <DashboardLayout navItems={adminNavItems} title="Panel administrador">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pedidos</p>
                <p className="text-2xl font-black text-foreground">{statsLoading ? "…" : stats?.totalOrders ?? 0}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Productos</p>
                <p className="text-2xl font-black text-foreground">{statsLoading ? "…" : stats?.totalProducts ?? 0}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Clientes</p>
                <p className="text-2xl font-black text-foreground">{statsLoading ? "…" : stats?.totalClients ?? 0}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ingresos</p>
                <p className="text-2xl font-black text-foreground">{statsLoading ? "…" : formatPrice(stats?.revenue ?? 0)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {(["todos", ...ORDER_STATUSES] as Array<OrderStatus | "todos">).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  statusFilter === status
                    ? "bg-primary text-white"
                    : "border border-border bg-card text-muted-foreground hover:border-primary"
                }`}
              >
                {status === "todos" ? "Todos" : ORDER_STATUS_LABELS[status]}
                {status !== "todos" && stats ? ` (${stats.ordersByStatus[status] ?? 0})` : ""}
              </button>
            ))}
          </div>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="ml-auto w-full max-w-xs rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="Buscar por número o cliente…"
          />
        </div>

        <div className="space-y-4">
          {ordersLoading ? (
            <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Cargando pedidos…</div>
          ) : ordersData && ordersData.items.length > 0 ? (
            ordersData.items.map((order) => (
              <div key={order.id} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatOrderDate(order.createdAt)} · {order.user?.name ?? "Cliente"} {order.user ? `(${order.user.email})` : ""}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <StatusSelect
                      value={order.status}
                      onChange={(status) =>
                        setPendingStatus({ orderId: order.id, orderNumber: order.orderNumber, status })
                      }
                      disabled={isUpdating}
                    />
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${ORDER_STATUS_CLASSES[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </div>

                <div className="px-5 py-3.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1">
                    <ClipboardList className="w-3.5 h-3.5" />
                    {order.items.length} {order.items.length === 1 ? "producto" : "productos"}
                    {order.shippingCity ? ` · Envío a ${order.shippingCity}` : ""}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-border px-5 py-3.5">
                  <p className="text-sm text-muted-foreground">
                    Subtotal {formatPrice(order.subtotal)} + envío {formatPrice(order.shipping)}
                  </p>
                  <p className="text-lg font-black text-primary">Total: {formatPrice(order.total)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">No hay pedidos que coincidan con el filtro.</p>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={pendingStatus !== null} onOpenChange={(open) => { if (!open) setPendingStatus(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cambio de estado</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Confirmás cambiar el estado del pedido{" "}
              <span className="font-bold text-foreground">{pendingStatus?.orderNumber}</span> a{" "}
              <span className="font-bold text-foreground">
                {pendingStatus ? ORDER_STATUS_LABELS[pendingStatus.status] : ""}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingStatus(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isUpdating}
              onClick={() => {
                if (pendingStatus) {
                  void updateStatus({ id: pendingStatus.orderId, status: pendingStatus.status });
                }
                setPendingStatus(null);
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}