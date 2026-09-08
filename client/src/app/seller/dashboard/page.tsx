"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  TrendingUp,
  DollarSign,
  Star,
  Store,
  Plus,
  ArrowRight,
  ShieldCheck,
  Eye,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useApiQuery } from "@/hooks/useApi";
import { sellerService } from "@/services/seller.service";
import { formatPrice } from "@/shared/lib/format";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { ActivateSellerModal } from "@/components/seller/ActivateSellerModal";

export const SellerDashboardPage = () => {
  const router = useRouter();
  const { user, hasSellerProfile, isSeller } = useAuth();
  const isSellerActive = Boolean(hasSellerProfile || user?.sellerProfile || isSeller);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);

  const { data: dashboard, isLoading: isLoadingDashboard } = useApiQuery(
    ["seller-dashboard"],
    () => sellerService.getDashboard(),
    { enabled: isSellerActive }
  );

  const { data: products = [], isLoading: isLoadingProducts } = useApiQuery(
    ["seller-products"],
    () => sellerService.getProducts(),
    { enabled: isSellerActive }
  );

  const storeName = user?.sellerProfile?.storeName || "Mi Tienda";
  const isVerified = user?.sellerProfile?.isVerified || false;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card rounded-3xl p-6 border border-border">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Store className="size-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-foreground">{storeName}</h1>
              {isVerified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="size-3" /> Verificada
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Panel de administración de vendedor · FerroMax 360
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-xl text-xs font-semibold"
          >
            <Link href="/seller/store">Configurar Tienda</Link>
          </Button>
          <Button
            asChild
            className="h-10 rounded-xl text-xs font-bold gap-2"
          >
            <Link href="/seller/products">
              <Plus className="size-4" />
              Publicar Producto
            </Link>
          </Button>
        </div>
      </div>

      {!isSellerActive && (
        <Card className="rounded-3xl border-primary/30 bg-primary/5 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-foreground">
                Aún no has configurado los datos de tu tienda
              </h2>
              <p className="text-xs text-muted-foreground">
                Activa tu perfil comercial para empezar a publicar y recibir ventas en el marketplace.
              </p>
            </div>
            <Button
              onClick={() => setIsActivateModalOpen(true)}
              className="h-10 rounded-xl text-xs font-bold shrink-0"
            >
              Completar Perfil de Tienda
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Productos</span>
            <div className="size-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Package className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground mt-2">
            {isLoadingDashboard ? "…" : dashboard?.totalProducts ?? products.length}
          </p>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            {dashboard?.activeProducts ?? products.filter((p: any) => p.status === "published" || p.isActive).length} activos para la venta
          </span>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Ventas del Mes</span>
            <div className="size-8 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
              <ShoppingBag className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground mt-2">
            {isLoadingDashboard ? "…" : dashboard?.salesThisMonth ?? 0}
          </p>
          <span className="text-[11px] text-green-600 font-semibold mt-0.5 block">
            Pedidos procesados
          </span>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Ingresos Estimados</span>
            <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign className="size-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground mt-2">
            {isLoadingDashboard ? "…" : formatPrice(dashboard?.grossRevenue ?? 0)}
          </p>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Facturado en 30 días
          </span>
        </Card>

        <Card className="rounded-2xl border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Reputación Tienda</span>
            <div className="size-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Star className="size-4 fill-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground mt-2">
            {isLoadingDashboard ? "…" : `${dashboard?.reputationScore ?? "5.0"}/5`}
          </p>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Calificación de compradores
          </span>
        </Card>
      </div>

      <Card className="rounded-3xl border-border bg-card overflow-hidden">
        <CardHeader className="p-6 border-b border-border flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-black text-foreground">
              Mis Productos Recientes
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Productos publicados bajo el catálogo de {storeName}
            </CardDescription>
          </div>
          <Button asChild variant="ghost" className="text-xs font-bold text-primary gap-1">
            <Link href="/seller/products">
              Ver Todos <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingProducts ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Cargando catálogo de tu tienda…
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Package className="size-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Todavía no has publicado productos</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Empieza a cargar tus herramientas, repuestos o materiales para que los compradores puedan encontrarte.
              </p>
              <Button asChild className="h-9 text-xs font-bold rounded-xl mt-2">
                <Link href="/seller/products">Publicar mi Primer Producto</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {products.slice(0, 5).map((prod, idx) => (
                <div key={prod.id || `seller-prod-${idx}`} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <ImageWithFallback
                      src={prod.image}
                      alt={prod.name}
                      className="size-12 rounded-xl object-cover bg-secondary shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{prod.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {prod.category} · Stock: {prod.stock ?? 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-black text-foreground">
                      {formatPrice(prod.price)}
                    </span>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg text-xs"
                    >
                      <Link href={`/products/${prod.id}`}>
                        <Eye className="size-3 mr-1" /> Ver
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ActivateSellerModal
        open={isActivateModalOpen}
        onOpenChange={setIsActivateModalOpen}
      />
    </div>
  );
};

export default SellerDashboardPage;
