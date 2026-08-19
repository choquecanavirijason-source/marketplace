"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClipboardList, MapPin, Package, Phone, User } from "lucide-react";
import { Button } from "@/presentation/atoms/button";
import { DashboardLayout, customerNavItems } from "@/presentation/organisms/DashboardLayout";
import { useAuth } from "@/presentation/hooks/useAuth";
import { useMyOrders } from "@/presentation/hooks/useOrders";
import { getCurrentUser, isCustomerAuthenticated } from "@/shared/lib/marketplaceStorage";
import { formatPrice } from "@/shared/lib/format";
import { ORDER_STATUS_CLASSES, ORDER_STATUS_LABELS, formatOrderDate } from "@/shared/lib/orderStatus";
import { ApiError } from "@/infrastructure/http/client";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { orders, isLoading } = useMyOrders();
  const { updateProfile, isUpdatingProfile } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isCustomerAuthenticated()) {
      router.push("/cuenta/ingresar?redirect=/cuenta/dashboard");
      return;
    }

    const current = getCurrentUser();
    if (current?.roleName === "admin") {
      router.push("/admin");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(current?.name ?? "");
    setMobileNumber(current?.mobileNumber ?? "");
    setAddress(current?.address ?? "");
    setAuthChecked(true);
  }, [router]);

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (password && password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password && password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      await updateProfile({
        name: name.trim() || undefined,
        mobileNumber: mobileNumber.trim() || undefined,
        address: address.trim() || undefined,
        password: password || undefined,
      });
      setPassword("");
      setConfirmPassword("");
      setMessage("Perfil actualizado correctamente.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar el perfil.");
    }
  };

  if (!authChecked) {
    return (
      <DashboardLayout navItems={customerNavItems} title="Mi cuenta">
        <div className="max-w-3xl mx-auto px-4 py-24 text-center text-muted-foreground">Verificando sesión…</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={customerNavItems} title="Mi cuenta">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <form onSubmit={handleProfileSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-bold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Datos personales
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="profile-name" className="text-sm font-medium text-foreground">Nombre</label>
                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="profile-phone" className="text-sm font-medium text-foreground">Teléfono</label>
                  <input
                    id="profile-phone"
                    type="tel"
                    value={mobileNumber}
                    onChange={(event) => setMobileNumber(event.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    placeholder="7XXXXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="profile-address" className="text-sm font-medium text-foreground">Dirección</label>
                  <input
                    id="profile-address"
                    type="text"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    placeholder="Calle, número, barrio"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="profile-password" className="text-sm font-medium text-foreground">Nueva contraseña (opcional)</label>
                  <input
                    id="profile-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="profile-confirm-password" className="text-sm font-medium text-foreground">Confirmar nueva contraseña</label>
                  <input
                    id="profile-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    placeholder="Repetí la nueva contraseña"
                  />
                </div>

                {message ? (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</div>
                ) : null}
                {error ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
                ) : null}

                <Button type="submit" className="w-full" disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? "Guardando…" : "Guardar cambios"}
                </Button>
              </div>
            </form>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-3 text-sm font-bold text-foreground flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-primary" /> Resumen
              </h2>
              <p className="text-sm text-muted-foreground">
                Tenés <span className="font-bold text-foreground">{orders.length}</span> pedido{orders.length === 1 ? "" : "s"} en tu cuenta.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" /> Mis pedidos
            </h2>

            {isLoading ? (
              <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Cargando pedidos…</div>
            ) : orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">Todavía no realizaste ningún pedido.</p>
                <Button asChild>
                  <Link href="/">Ir a la tienda</Link>
                </Button>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                  <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{formatOrderDate(order.createdAt)}</p>
                    </div>
                    <span className={`ml-auto rounded-full border px-2.5 py-1 text-xs font-bold ${ORDER_STATUS_CLASSES[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>

                  <div className="space-y-3 px-5 py-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-secondary flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-primary">{formatPrice(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border px-5 py-3.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {order.shippingCity ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {order.shippingCity}
                      </span>
                    ) : null}
                    {order.shippingPhone ? (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {order.shippingPhone}
                      </span>
                    ) : null}
                    <span className="ml-auto text-sm font-bold text-foreground">Total: {formatPrice(order.total)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}