"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Navigation,
  Package,
  PackageCheck,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
  Wallet,
} from "lucide-react";
import { Button } from "@/presentation/atoms/button";
import { DashboardLayout, customerNavItems } from "@/presentation/organisms/DashboardLayout";
import { useAuth } from "@/presentation/hooks/useAuth";
import { useMyOrders } from "@/presentation/hooks/useOrders";
import { getCurrentCustomerEmail, getCurrentUser, isCustomerAuthenticated } from "@/shared/lib/marketplaceStorage";
import { formatPrice } from "@/shared/lib/format";
import { ORDER_STATUS_CLASSES, ORDER_STATUS_LABELS, formatOrderDate } from "@/shared/lib/orderStatus";
import type { Order, OrderStatus } from "@/domain/entities/Order";
import { ApiError } from "@/infrastructure/http/client";

type TabType = "pedidos" | "perfil";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { orders, isLoading: ordersLoading } = useMyOrders();
  const { updateProfile, isUpdatingProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>("pedidos");
  const [authChecked, setAuthChecked] = useState(false);

  // Filtros de pedidos
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Formulario de perfil
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Geolocalización en perfil
  const [isLocating, setIsLocating] = useState(false);
  const [locatingMessage, setLocatingMessage] = useState("");

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
    setEmail(current?.email ?? getCurrentCustomerEmail() ?? "");
    setMobileNumber(current?.mobileNumber ?? "");
    setAddress(current?.address ?? "");
    setAuthChecked(true);
  }, [router]);

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const totalSpent = orders.reduce((sum, ord) => sum + ord.total, 0);
    const activeCount = orders.filter((o) =>
      ["pendiente", "confirmado", "enviado"].includes(o.status),
    ).length;
    const deliveredCount = orders.filter((o) => o.status === "entregado").length;
    return {
      totalOrders: orders.length,
      totalSpent,
      activeCount,
      deliveredCount,
    };
  }, [orders]);

  // Pedidos filtrados
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "todos" ? true : order.status === statusFilter;
      const matchesSearch =
        searchQuery.trim() === ""
          ? true
          : order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.items.some((item) =>
              item.name.toLowerCase().includes(searchQuery.toLowerCase()),
            );
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  const handleGetCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocatingMessage("Tu navegador no soporta geolocalización.");
      return;
    }

    setIsLocating(true);
    setLocatingMessage("Obteniendo coordenadas GPS...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "es" } },
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const road = addr.road || addr.pedestrian || addr.street || "";
            const house = addr.house_number ? ` #${addr.house_number}` : "";
            const suburb = addr.neighbourhood || addr.suburb || addr.residential || "";
            const city = addr.city || addr.town || addr.municipality || addr.state || "";
            const formatted = [road + house, suburb, city].filter(Boolean).join(", ");
            setAddress(
              formatted ||
                data.display_name ||
                `Ubicación GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
            );
            setLocatingMessage("📍 Ubicación obtenida y actualizada");
          } else {
            setAddress(`Ubicación GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
            setLocatingMessage("📍 Coordenadas GPS aplicadas");
          }
        } catch {
          setAddress(`Ubicación GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          setLocatingMessage("📍 Coordenadas GPS aplicadas");
        } finally {
          setIsLocating(false);
          setTimeout(() => setLocatingMessage(""), 4000);
        }
      },
      () => {
        setIsLocating(false);
        setLocatingMessage("No se pudo acceder a tu ubicación.");
        setTimeout(() => setLocatingMessage(""), 4000);
      },
      { timeout: 8000 },
    );
  };

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
      setMessage("Tus datos han sido actualizados exitosamente.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar el perfil.");
    }
  };

  if (!authChecked) {
    return (
      <DashboardLayout navItems={customerNavItems} title="Mi cuenta">
        <div className="w-full py-24 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm font-medium">Verificando sesión…</p>
        </div>
      </DashboardLayout>
    );
  }

  const initials = (name || email || "U")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <DashboardLayout navItems={customerNavItems} title="Mi cuenta">
      {/* CONTENEDOR 100% ANCHO CON PADDING FLUIDO */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* HERO / HEADER DE PERFIL EN ANCHO COMPLETO */}
        <div className="w-full relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-secondary/30 p-6 md:p-8 shadow-sm">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 text-white flex items-center justify-center text-xl md:text-2xl font-black shadow-md">
                  {initials}
                </div>
                <span
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center text-[10px] text-white"
                  title="Usuario activo"
                >
                  ✓
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-black text-foreground truncate">
                    {name || "Mi Cuenta"}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary flex-shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" /> Cliente Verificado
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" /> {email}
                </p>
                {address ? (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="truncate">{address}</span>
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-3 self-stretch md:self-auto flex-shrink-0">
              <Button asChild className="flex-1 md:flex-initial h-11 px-6 rounded-2xl shadow-sm">
                <Link href="/">
                  <ShoppingBag className="w-4 h-4 mr-2" /> Ir a la Tienda
                </Link>
              </Button>
            </div>
          </div>

          {/* 4 TARJETAS DE MÉTRICAS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mt-8 pt-6 border-t border-border/80">
            <div className="rounded-2xl border border-border/60 bg-background/60 p-4 sm:p-5 transition-all hover:border-primary/40 hover:shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider">Total Pedidos</span>
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-foreground">{stats.totalOrders}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">En tu historial de compras</p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/60 p-4 sm:p-5 transition-all hover:border-primary/40 hover:shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider">Total Invertido</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-foreground truncate">
                {formatPrice(stats.totalSpent)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Monto acumulado</p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/60 p-4 sm:p-5 transition-all hover:border-primary/40 hover:shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider">En Camino / Activos</span>
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-blue-600">{stats.activeCount}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Pendiente / Despachado</p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/60 p-4 sm:p-5 transition-all hover:border-primary/40 hover:shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider">Entregados</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <PackageCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.deliveredCount}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Completados con éxito</p>
            </div>
          </div>
        </div>

        {/* BARRA DE PESTAÑAS FLUIDA */}
        <div className="w-full flex items-center justify-between border-b border-border pb-1 gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("pedidos")}
              className={`relative flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-2xl transition-all cursor-pointer ${
                activeTab === "pedidos"
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Mis Pedidos</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
                  activeTab === "pedidos"
                    ? "bg-white/20 text-white"
                    : "bg-secondary text-foreground"
                }`}
              >
                {orders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("perfil")}
              className={`relative flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-2xl transition-all cursor-pointer ${
                activeTab === "perfil"
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Datos Personales & Seguridad</span>
            </button>
          </div>
        </div>

        {/* TAB 1: HISTORIAL DE PEDIDOS */}
        {activeTab === "pedidos" ? (
          <div className="w-full space-y-6">
            {/* BUSCADOR Y FILTROS */}
            <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card rounded-2xl border border-border p-4 shadow-sm">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por código (#FM-...) o producto…"
                  className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none flex-shrink-0">
                {[
                  { id: "todos", label: "Todos" },
                  { id: "pendiente", label: "Pendientes" },
                  { id: "confirmado", label: "Confirmados" },
                  { id: "enviado", label: "Enviados" },
                  { id: "entregado", label: "Entregados" },
                  { id: "cancelado", label: "Cancelados" },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatusFilter(st.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      statusFilter === st.id
                        ? "bg-foreground text-background font-bold"
                        : "bg-secondary/80 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* LISTADO DE PEDIDOS */}
            {ordersLoading ? (
              <div className="w-full space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="w-full rounded-3xl border border-border bg-card p-6 animate-pulse space-y-4">
                    <div className="h-4 bg-secondary rounded w-1/4" />
                    <div className="h-16 bg-secondary/60 rounded-xl" />
                    <div className="h-4 bg-secondary rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="w-full rounded-3xl border border-dashed border-border bg-card p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-secondary/80 flex items-center justify-center mx-auto text-muted-foreground">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {searchQuery || statusFilter !== "todos"
                      ? "No se encontraron pedidos con esos filtros"
                      : "Todavía no realizaste ningún pedido"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                    {searchQuery || statusFilter !== "todos"
                      ? "Probá cambiando el estado o el término de búsqueda para ver tus compras."
                      : "Explorá nuestro catálogo de ferretería y herramientas y disfrutá de los mejores precios."}
                  </p>
                </div>
                {searchQuery || statusFilter !== "todos" ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStatusFilter("todos");
                      setSearchQuery("");
                    }}
                    className="rounded-xl"
                  >
                    Limpiar filtros
                  </Button>
                ) : (
                  <Button asChild className="rounded-xl px-6">
                    <Link href="/">
                      <ShoppingBag className="w-4 h-4 mr-2" /> Explorar catálogo
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="w-full space-y-5">
                {filteredOrders.map((order) => (
                  <OrderCardItem key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* TAB 2: DATOS PERSONALES & SEGURIDAD */}
        {activeTab === "perfil" ? (
          <div className="w-full grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* FORMULARIO PRINCIPAL */}
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* INFORMACIÓN DE CONTACTO */}
              <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" /> Información de Contacto
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Estos datos se utilizarán de forma predeterminada para tus envíos y facturación.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="profile-name" className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Nombre Completo
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="profile-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary"
                        placeholder="Tu nombre y apellido"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="profile-phone" className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Teléfono de Contacto
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="profile-phone"
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary"
                        placeholder="7XXXXXXX"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Correo Electrónico (No modificable)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full rounded-xl border border-border bg-secondary/50 pl-10 pr-10 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
                    />
                    <Lock className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="profile-address" className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Dirección de Envío Habitual
                    </label>
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={isLocating}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      {isLocating ? "Detectando..." : "Detectar mi ubicación"}
                    </button>
                  </div>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="profile-address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary"
                      placeholder="Av. Heroínas 123, Cochabamba"
                    />
                  </div>
                  {locatingMessage ? (
                    <p className="text-xs text-primary font-medium">{locatingMessage}</p>
                  ) : null}
                </div>
              </div>

              {/* SEGURIDAD Y CONTRASEÑA */}
              <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-primary" /> Seguridad de la Cuenta
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Completá estos campos únicamente si deseás cambiar tu contraseña actual.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="profile-password" className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="profile-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary pr-10"
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="profile-confirm-password" className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Confirmar Contraseña
                    </label>
                    <input
                      id="profile-confirm-password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
                      placeholder="Repetí la contraseña"
                    />
                  </div>
                </div>
              </div>

              {/* MENSAJES */}
              {message ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>{message}</span>
                </div>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isUpdatingProfile}
                  className="rounded-2xl px-8 h-12 text-sm font-bold shadow-md shadow-primary/20"
                >
                  {isUpdatingProfile ? "Guardando cambios…" : "Guardar Cambios"}
                </Button>
              </div>
            </form>

            {/* SIDEBAR DERECHO */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Tu Cuenta FerroMax</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Mantener tus datos actualizados agiliza el proceso de compra y permite que las empresas de transporte entreguen tus productos sin demoras.
                </p>
                <div className="border-t border-border pt-4 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Compras realizadas:</span>
                    <span className="font-bold text-foreground">{orders.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Garantía de compra:</span>
                    <span className="font-bold text-emerald-600">100% Protegida</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-gradient-to-br from-secondary/50 to-secondary/20 p-6 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">¿Necesitás ayuda?</h4>
                <p className="text-xs text-muted-foreground">
                  Si tenés dudas con tus pedidos o requerís asistencia técnica, nuestro equipo de soporte está listo para asistirte.
                </p>
                <Button asChild variant="outline" size="sm" className="w-full rounded-xl bg-card">
                  <Link href="/">Contactar Soporte</Link>
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

// TARJETA DE PEDIDO EN ANCHO COMPLETO CON STEPPER CONECTADO
function OrderCardItem({ order }: { order: Order }) {
  const steps: { key: OrderStatus; label: string }[] = [
    { key: "pendiente", label: "Recibido" },
    { key: "confirmado", label: "Confirmado" },
    { key: "enviado", label: "En camino" },
    { key: "entregado", label: "Entregado" },
  ];

  const statusOrderIndex = {
    pendiente: 0,
    confirmado: 1,
    enviado: 2,
    entregado: 3,
    cancelado: -1,
  };

  const currentIndex = statusOrderIndex[order.status];

  return (
    <div className="w-full rounded-3xl border border-border bg-card shadow-sm overflow-hidden transition-all hover:border-primary/30 hover:shadow-md">
      {/* CABECERA */}
      <div className="bg-secondary/30 px-6 py-4 border-b border-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black text-foreground">{order.orderNumber}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {formatOrderDate(order.createdAt)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {order.items.length} {order.items.length === 1 ? "artículo" : "artículos"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full border px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider ${
              ORDER_STATUS_CLASSES[order.status]
            }`}
          >
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>
      </div>

      {/* STEPPER DE PROGRESO CON LÍNEA DE CONEXIÓN */}
      {order.status !== "cancelado" ? (
        <div className="px-6 py-5 bg-background/50 border-b border-border">
          <div className="relative flex items-center justify-between w-full max-w-4xl mx-auto">
            {/* LÍNEA DE FONDO */}
            <div className="absolute left-4 right-4 top-4 -translate-y-1/2 h-1 bg-secondary -z-0" />
            {/* LÍNEA ACTIVA */}
            <div
              className="absolute left-4 top-4 -translate-y-1/2 h-1 bg-primary transition-all -z-0"
              style={{
                width: `${Math.max(0, Math.min(100, (currentIndex / (steps.length - 1)) * 100))}%`,
              }}
            />

            {steps.map((step, idx) => {
              const isCompleted = currentIndex >= idx;
              const isCurrent = currentIndex === idx;
              return (
                <div key={step.key} className="flex flex-col items-center text-center z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110 shadow-sm"
                        : isCompleted
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border-2 border-border text-muted-foreground"
                    }`}
                  >
                    {isCompleted && !isCurrent ? "✓" : idx + 1}
                  </div>
                  <span
                    className={`text-xs mt-1.5 font-semibold ${
                      isCurrent
                        ? "text-primary font-bold"
                        : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* ITEMS */}
      <div className="p-6 space-y-3">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-3.5 rounded-2xl bg-secondary/20 hover:bg-secondary/40 transition-colors"
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-14 h-14 rounded-xl object-cover bg-secondary flex-shrink-0 border border-border/50"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 border border-border/50">
                <Package className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground truncate">{item.name}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span>
                  Cant: <strong className="text-foreground">{item.quantity}</strong>
                </span>
                <span>·</span>
                <span>Precio: {formatPrice(item.price)}</span>
              </div>
            </div>
            <span className="text-sm font-black text-primary flex-shrink-0">
              {formatPrice(item.subtotal)}
            </span>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="bg-secondary/10 px-6 py-4 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
          {order.shippingAddress || order.shippingCity ? (
            <span className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-xl border border-border">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <strong className="text-foreground">Entrega:</strong>{" "}
              {[order.shippingAddress, order.shippingCity].filter(Boolean).join(", ")}
            </span>
          ) : null}

          {order.shippingPhone ? (
            <span className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-xl border border-border">
              <Phone className="w-3.5 h-3.5 text-primary" />
              <strong className="text-foreground">Tel:</strong> {order.shippingPhone}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <div className="text-right">
            <span className="text-[11px] text-muted-foreground block uppercase tracking-wider font-semibold">
              Total Pagado
            </span>
            <span className="text-xl font-black text-primary">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}