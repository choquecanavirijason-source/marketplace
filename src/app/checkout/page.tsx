"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Home, Lock, RotateCcw, Shield, ShoppingBag, ShoppingCart, Truck, User } from "lucide-react";
import { Button } from "@/presentation/atoms/button";
import { StorefrontTemplate } from "@/presentation/templates/StorefrontTemplate";
import { TrustBadgeItem } from "@/presentation/molecules/TrustBadgeItem";
import { PaymentIconsRow } from "@/presentation/molecules/PaymentIconsRow";
import { useCart } from "@/presentation/hooks/useCart";
import { formatPrice } from "@/shared/lib/format";
import { getCurrentCustomerEmail, getCurrentCustomerName, isCustomerAuthenticated } from "@/shared/lib/marketplaceStorage";

const TRUST_ITEMS = [
  { icon: Truck, text: "Envío gratis en compras superiores a $50" },
  { icon: RotateCcw, text: "Devoluciones fáciles dentro de 30 días" },
  { icon: Shield, text: "Pago 100% seguro y protección de datos" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);

  useEffect(() => {
    if (!isCustomerAuthenticated()) {
      router.push("/cuenta/ingresar?redirect=/checkout");
      return;
    }
    setAuthenticated(true);
    setCustomerEmail(getCurrentCustomerEmail());
    setCustomerName(getCurrentCustomerName());
    setAuthChecked(true);
  }, [router]);

  const handleConfirm = () => {
    clearCart();
    setOrderPlaced(true);
  };

  if (!authChecked) {
    return (
      <StorefrontTemplate>
        <div className="max-w-3xl mx-auto px-4 py-24 text-center text-muted-foreground">Verificando sesión…</div>
      </StorefrontTemplate>
    );
  }

  if (!authenticated) return null;

  if (orderPlaced) {
    return (
      <StorefrontTemplate>
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-11 h-11 text-green-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground mb-2">¡Pedido confirmado!</h1>
          <p className="text-muted-foreground mb-8">
            Gracias por tu compra. Te enviamos la confirmación a <span className="font-semibold text-foreground">{customerEmail ?? "tu correo"}</span>.
          </p>
          <Button asChild className="h-11 px-8">
            <Link href="/">Volver a la tienda</Link>
          </Button>
        </div>
      </StorefrontTemplate>
    );
  }

  if (items.length === 0) {
    return (
      <StorefrontTemplate>
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-5">
            <ShoppingCart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-2">Tu carrito está vacío</h1>
          <p className="text-muted-foreground mb-8">Agregá productos antes de finalizar la compra.</p>
          <Button asChild className="h-11 px-8">
            <Link href="/">Ir a la tienda</Link>
          </Button>
        </div>
      </StorefrontTemplate>
    );
  }

  return (
    <StorefrontTemplate>
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="flex items-center gap-1 hover:text-primary transition-colors">
            <Home className="w-3.5 h-3.5" /> Inicio
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-semibold">Finalizar compra</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground leading-tight">Finalizar compra</h1>
            <p className="text-sm text-muted-foreground">Revisá tu pedido antes de confirmar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Comprando como</p>
                <p className="text-sm font-bold text-foreground truncate">{customerName ?? customerEmail}</p>
              </div>
              <span className="ml-auto flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex-shrink-0">
                <Lock className="w-3 h-3" /> Sesión verificada
              </span>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-sm font-bold text-foreground">Tu pedido · {items.length} {items.length === 1 ? "producto" : "productos"}</h2>
              </div>
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-5 border-b border-border last:border-0">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-secondary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatPrice(item.price)} × {item.qty}</p>
                  </div>
                  <span className="text-sm font-bold text-primary flex-shrink-0">{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 lg:sticky lg:top-20 self-start">
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="text-sm font-bold text-foreground mb-4">Resumen</h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground font-medium">{formatPrice(total)}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Envío</span>
                  <span className="font-bold text-green-600">Gratis</span>
                </div>
              </div>
              <div className="border-t border-border mt-4 pt-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span className="text-2xl font-black text-primary">{formatPrice(total)}</span>
              </div>
              <Button onClick={handleConfirm} className="w-full h-12 text-sm mt-5">Confirmar Pedido</Button>
              <p className="text-[11px] text-muted-foreground text-center mt-3">Al confirmar aceptás nuestros términos y condiciones.</p>
            </div>

            <div className="bg-secondary rounded-2xl p-5 space-y-2.5">
              {TRUST_ITEMS.map((item) => (
                <TrustBadgeItem key={item.text} {...item} />
              ))}
            </div>

            <div className="bg-card rounded-2xl border border-border p-5">
              <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Pago 100% seguro garantizado</p>
              <PaymentIconsRow />
            </div>
          </div>
        </div>
      </div>
    </StorefrontTemplate>
  );
}
