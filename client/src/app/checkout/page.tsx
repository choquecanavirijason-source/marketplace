"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Home,
  Loader2,
  Lock,
  MapPin,
  Navigation,
  Phone,
  RotateCcw,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Truck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StorefrontTemplate } from "@/components/layout/StorefrontTemplate";
import { TrustBadgeItem } from "@/components/feedback/TrustBadgeItem";
import { PaymentIconsRow } from "@/components/common/PaymentIconsRow";
import { useCart } from "@/hooks/useCart";
import { useCreateOrder } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { formatPrice } from "@/shared/lib/format";
import { ApiError } from "@/config/axios";

const TRUST_ITEMS = [
  { icon: Truck, text: "Envío gratis en compras superiores a $50" },
  { icon: RotateCcw, text: "Devoluciones fáciles dentro de 30 días" },
  { icon: Shield, text: "Pago 100% seguro y protección de datos" },
];

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const { createOrder, isCreating, error } = useCreateOrder();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [submittingError, setSubmittingError] = useState("");

  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    setCustomerEmail(user.email ?? "");
    setCustomerName(user.name ?? "");
    setShippingAddress(user.address ?? "");
    setShippingCity("");
    setShippingPhone(user.mobileNumber ?? "");
  }, [user]);

  const handleGetCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Tu navegador no soporta geolocalización.");
      return;
    }

    setIsLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationCoords({ lat: latitude, lng: longitude });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "es",
              },
            },
          );

          if (response.ok) {
            const data = await response.json();
            const addr = data.address || {};

            const road = addr.road || addr.pedestrian || addr.street || addr.footway || "";
            const houseNumber = addr.house_number ? ` #${addr.house_number}` : "";
            const neighbourhood = addr.neighbourhood || addr.suburb || addr.residential || addr.quarter || "";
            const streetParts = [road + houseNumber, neighbourhood].filter(Boolean).join(", ");

            const city =
              addr.city ||
              addr.town ||
              addr.municipality ||
              addr.county ||
              addr.state_district ||
              addr.state ||
              "";

            if (streetParts) {
              setShippingAddress(streetParts);
            } else if (data.display_name) {
              const shortName = data.display_name.split(",").slice(0, 3).join(",").trim();
              setShippingAddress(shortName);
            } else {
              setShippingAddress(`Ubicación GPS (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`);
            }

            if (city) {
              setShippingCity(city);
            }
          } else {
            setShippingAddress(`Ubicación GPS (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`);
          }
        } catch {
          setShippingAddress(`Ubicación GPS (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Permiso de ubicación denegado. Puedes ingresar tu dirección manualmente.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError("No se pudo detectar tu ubicación GPS.");
        } else {
          setLocationError("Tiempo de espera agotado al obtener la ubicación.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const shipping = total >= 50 ? 0 : 5;
  const grandTotal = total + shipping;

  const handleConfirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittingError("");

    try {
      const order = await createOrder({
        items: items.map((item) => ({ productId: item.id, quantity: item.qty })),
        shippingAddress: shippingAddress.trim() || undefined,
        shippingCity: shippingCity.trim() || undefined,
        shippingPhone: shippingPhone.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      clearCart();
      setOrderNumber(order.orderNumber);
      setOrderPlaced(true);
    } catch (err) {
      setSubmittingError(err instanceof ApiError ? err.message : "No se pudo procesar el pedido. Intentá de nuevo.");
    }
  };

  if (orderPlaced) {
    return (
      <ProtectedRoute redirectTo="/account/login?redirect=/checkout">
        <StorefrontTemplate>
          <div className="max-w-lg mx-auto px-4 py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-11 h-11 text-green-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground mb-2">¡Pedido confirmado!</h1>
            <p className="text-muted-foreground mb-2">
              Gracias por tu compra. Tu número de pedido es{" "}
              <span className="font-semibold text-foreground">{orderNumber}</span>.
            </p>
            <p className="text-muted-foreground mb-8">
              Te enviamos la confirmación a <span className="font-semibold text-foreground">{customerEmail ?? "tu correo"}</span>. Podés seguir su estado en tu panel de pedidos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="h-11 px-8">
                <Link href="/account/dashboard">Ver mis pedidos</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 px-8">
                <Link href="/">Volver a la tienda</Link>
              </Button>
            </div>
          </div>
        </StorefrontTemplate>
      </ProtectedRoute>
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
    <ProtectedRoute redirectTo="/account/login?redirect=/checkout">
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

      <form onSubmit={handleConfirm} className="max-w-7xl mx-auto px-4 py-10">
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

            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Datos de envío
                </h2>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isLocating}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Detectando ubicación…
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5" />
                      Usar mi ubicación actual
                    </>
                  )}
                </button>
              </div>

              {locationError ? (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  {locationError}
                </div>
              ) : null}

              {locationCoords ? (
                <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-xs text-green-900 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>
                      Ubicación GPS detectada ({locationCoords.lat.toFixed(5)}, {locationCoords.lng.toFixed(5)})
                    </span>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${locationCoords.lat},${locationCoords.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-green-700 hover:underline flex-shrink-0"
                  >
                    Ver mapa <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : null}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="shipping-address" className="text-sm font-medium text-foreground">Dirección</label>
                  <input
                    id="shipping-address"
                    type="text"
                    value={shippingAddress}
                    onChange={(event) => setShippingAddress(event.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-primary"
                    placeholder="Calle, número, barrio"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="shipping-city" className="text-sm font-medium text-foreground">Ciudad</label>
                    <input
                      id="shipping-city"
                      type="text"
                      value={shippingCity}
                      onChange={(event) => setShippingCity(event.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-primary"
                      placeholder="Cochabamba"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="shipping-phone" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Teléfono
                    </label>
                    <input
                      id="shipping-phone"
                      type="tel"
                      value={shippingPhone}
                      onChange={(event) => setShippingPhone(event.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-primary"
                      placeholder="7XXXXXXX"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium text-foreground">Notas del pedido (opcional)</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-primary"
                    placeholder="Instrucciones de entrega, horarios, etc."
                  />
                </div>
              </div>
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
                  <span className={shipping === 0 ? "font-bold text-green-600" : "text-foreground font-medium"}>
                    {shipping === 0 ? "Gratis" : formatPrice(shipping)}
                  </span>
                </div>
              </div>
              <div className="border-t border-border mt-4 pt-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span className="text-2xl font-black text-primary">{formatPrice(grandTotal)}</span>
              </div>

              {submittingError ? (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{submittingError}</div>
              ) : null}

              {error && !submittingError ? (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error instanceof ApiError ? error.message : "No se pudo procesar el pedido."}
                </div>
              ) : null}

              <Button type="submit" className="w-full h-12 text-sm mt-5" disabled={isCreating}>
                {isCreating ? "Procesando pedido…" : "Confirmar Pedido"}
              </Button>
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
      </form>
      </StorefrontTemplate>
    </ProtectedRoute>
  );
}