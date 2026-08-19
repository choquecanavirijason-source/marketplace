"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/presentation/atoms/chart";
import { DashboardLayout, adminNavItems } from "@/presentation/organisms/DashboardLayout";
import { useAdminStats } from "@/presentation/hooks/useOrders";
import { getCurrentUser, isCustomerAuthenticated } from "@/shared/lib/marketplaceStorage";
import { formatPrice } from "@/shared/lib/format";
import { ORDER_STATUS_LABELS } from "@/shared/lib/orderStatus";
import { DollarSign, Package, ShoppingCart, TicketPercent, Users } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pendiente: "var(--chart-1)",
  confirmado: "var(--chart-2)",
  enviado: "var(--chart-3)",
  entregado: "var(--chart-4)",
  cancelado: "var(--chart-5)",
};

const revenueChartConfig = {
  revenue: {
    label: "Ingresos",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const ordersChartConfig = {
  totalOrders: {
    label: "Pedidos",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function AdminMetricsPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const { data: stats, isLoading } = useAdminStats();

  useEffect(() => {
    if (!isCustomerAuthenticated()) {
      router.push("/cuenta/ingresar?redirect=/admin/metricas");
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

  const statusData = Object.entries(stats?.ordersByStatus ?? {}).map(([status, count]) => ({
    name: ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] ?? status,
    value: count,
    status,
  }));

  return (
    <DashboardLayout navItems={adminNavItems} title="Panel administrador">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pedidos</p>
                <p className="text-2xl font-black text-foreground">{isLoading ? "…" : stats?.totalOrders ?? 0}</p>
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
                <p className="text-2xl font-black text-foreground">{isLoading ? "…" : formatPrice(stats?.revenue ?? 0)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TicketPercent className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ticket promedio</p>
                <p className="text-2xl font-black text-foreground">{isLoading ? "…" : formatPrice(stats?.averageOrder ?? 0)}</p>
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
                <p className="text-2xl font-black text-foreground">{isLoading ? "…" : stats?.totalClients ?? 0}</p>
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
                <p className="text-2xl font-black text-foreground">{isLoading ? "…" : stats?.totalProducts ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-black text-foreground">Ingresos por mes</h2>
            <p className="mb-4 text-xs text-muted-foreground">Últimos 6 meses · sin pedidos cancelados</p>
            <ChartContainer config={revenueChartConfig} className="aspect-[16/8]">
              <AreaChart data={stats?.ordersByMonth ?? []} margin={{ left: 0, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={(value: number) => `$${value}`} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="revenue"
                  type="monotone"
                  fill="url(#fillRevenue)"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  name="Ingresos"
                />
              </AreaChart>
            </ChartContainer>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-black text-foreground">Pedidos por mes</h2>
            <p className="mb-4 text-xs text-muted-foreground">Últimos 6 meses · sin pedidos cancelados</p>
            <ChartContainer config={ordersChartConfig} className="aspect-[16/8]">
              <BarChart data={stats?.ordersByMonth ?? []} margin={{ left: 0, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="totalOrders" radius={[6, 6, 0, 0]} fill="var(--chart-2)" name="Pedidos" />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-black text-foreground">Pedidos por estado</h2>
            <p className="mb-4 text-xs text-muted-foreground">Distribución del total de pedidos</p>
            <ChartContainer config={{}} className="aspect-[16/9]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} strokeWidth={2}>
                  {statusData.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "var(--chart-5)"} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {statusData.map((entry) => (
                <span key={entry.status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[entry.status] }} />
                  {entry.name}: {entry.value}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-black text-foreground">Top productos más vendidos</h2>
            <p className="mb-4 text-xs text-muted-foreground">Por cantidad vendida · sin pedidos cancelados</p>
            {stats?.topProducts.length ? (
              <div className="space-y-3">
                {stats.topProducts.map((product, index) => (
                  <div key={product.productId} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.totalSold} {product.totalSold === 1 ? "unidad vendida" : "unidades vendidas"}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-primary">{formatPrice(product.totalRevenue)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Aún no hay ventas registradas.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}