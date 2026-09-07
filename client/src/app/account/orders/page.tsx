"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { orderService } from "@/services/order.service";
import { useApiQuery } from "@/hooks/useApi";
import { formatPrice } from "@/shared/lib/format";
import {
  ORDER_STATUS_CLASSES,
  ORDER_STATUS_LABELS,
  formatOrderDate,
} from "@/shared/lib/orderStatus";
import type { OrderStatus, Order } from "@/types";

const STATUS_FILTERS: Array<{ id: string; label: string }> = [
  { id: "todos", label: "Todos" },
  { id: "pendiente", label: "Pendientes" },
  { id: "confirmado", label: "Confirmados" },
  { id: "enviado", label: "Enviados" },
  { id: "entregado", label: "Entregados" },
  { id: "cancelado", label: "Cancelados" },
];

export const CustomerOrdersPage = () => {
  const { data: ordersData, isLoading } = useApiQuery(["my-orders"], () => orderService.listMine());
  const orders = ordersData ?? [];
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredOrders = useMemo(() => {
    return orders.filter((order: Order) => {
      const matchesStatus =
        statusFilter === "todos" || order.status === statusFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        String(order.id).includes(searchQuery.trim()) ||
        String(order.orderNumber || "").includes(searchQuery.trim()) ||
        order.items?.some((item) =>
          item.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <ShoppingBag className="size-7 text-primary" />
            Mis Pedidos
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Historial de compras, estado de despacho y seguimiento de envíos
          </p>
        </div>

        <Button asChild variant="outline" className="text-xs font-bold gap-2">
          <Link href="/">
            <span>Explorar Catálogo</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nro. de pedido o producto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {STATUS_FILTERS.map((filter) => {
            const isActive = statusFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setStatusFilter(filter.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="border-border/60 animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/4 mb-4" />
                <div className="h-12 bg-muted rounded w-full mb-3" />
                <div className="h-4 bg-muted rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-border/80 bg-muted/20">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <Package className="size-8" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">
            {orders.length === 0
              ? "Aún no tienes pedidos registrados"
              : "No se encontraron pedidos con los filtros aplicados"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">
            {orders.length === 0
              ? "Encuentra herramientas, materiales y equipos con envío garantizado en FerroMax 360."
              : "Prueba seleccionando otro estado o ajustando el término de búsqueda."}
          </p>
          {orders.length === 0 && (
            <Button asChild className="font-bold text-xs">
              <Link href="/">Ir a Comprar</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order: Order) => {
            const statusLabel =
              ORDER_STATUS_LABELS[order.status as OrderStatus] || order.status;
            const statusClass =
              ORDER_STATUS_CLASSES[order.status as OrderStatus] ||
              "bg-muted text-muted-foreground";

            return (
              <Card
                key={order.id}
                className="border-border/70 overflow-hidden transition-all hover:border-border hover:shadow-xs"
              >
                <div className="bg-muted/40 px-5 py-3 border-b border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-foreground">
                      Pedido #{order.id}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      {order.createdAt ? formatOrderDate(order.createdAt) : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusClass}`}
                    >
                      {statusLabel}
                    </span>
                    <span className="font-black text-foreground text-sm">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>

                <CardContent className="p-5 space-y-3">
                  <div className="divide-y divide-border/40">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="size-10 rounded-lg object-cover bg-muted shrink-0"
                            />
                          ) : (
                            <div className="size-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                              <Package className="size-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Cantidad: {item.quantity} x {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>

                        <span className="font-bold text-foreground shrink-0">
                          {formatPrice(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerOrdersPage;
