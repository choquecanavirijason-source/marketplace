"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  Store,
  Building2,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/config/axios";

type AccountType = "buyer" | "seller_individual" | "seller_empresa";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [accountType, setAccountType] = useState<AccountType>("buyer");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);

  const [legalName, setLegalName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [tradeName, setTradeName] = useState("");

  const [error, setError] = useState("");
  const { register, isRegistering, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError("Completá todos los campos obligatorios.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!termsAccepted) {
      setError("Debes aceptar los Términos y Condiciones para continuar.");
      return;
    }

    if (accountType === "seller_empresa" && (!legalName.trim() || !taxId.trim())) {
      setError("Para cuentas de empresa, la Razón Social y el CUIT / NIT son requeridos.");
      return;
    }

    setError("");

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const session = await register({
        name: fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        mobileNumber: phone.trim() || undefined,
        phone: phone.trim() || undefined,
        type: accountType,
        legalName: legalName.trim() || undefined,
        tradeName: tradeName.trim() || undefined,
        taxId: taxId.trim() || undefined,
        termsAccepted,
      });

      const role = session.user.roleName?.toLowerCase();
      if (role === "admin" || role === "superadmin") {
        router.push("/admin");
      } else if (role?.includes("seller")) {
        router.push("/account/dashboard");
      } else {
        router.push(redirectTo);
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.errors) {
        const messages = Object.values(err.errors).flat();
        setError(messages.join(" "));
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : err?.response?.data?.detail ||
              err?.response?.data?.message ||
              err?.message ||
              "No se pudo crear la cuenta. Verifica los datos ingresados.",
        );
      }
    }
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-background to-secondary/20 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8">
      {}
      <div className="w-full max-w-lg mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ShoppingBag className="w-3.5 h-3.5 mr-1.5 text-primary" />
          Volver a la tienda
        </Link>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Garantía de Seguridad
        </span>
      </div>

      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl relative overflow-hidden backdrop-blur-sm">
        {}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        {}
        <div className="text-center mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            SimpleMarketplace360
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Crear Nueva Cuenta
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Selecciona el tipo de cuenta que mejor se adapte a tu operativa
          </p>
        </div>

        {}
        <div className="mb-6 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setAccountType("buyer")}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
              accountType === "buyer"
                ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                : "border-border hover:bg-secondary/40 text-muted-foreground"
            }`}
          >
            <ShoppingBag className="w-5 h-5 mb-1 text-primary" />
            <span className="text-xs font-bold">Comprador</span>
            <span className="text-[10px] opacity-75">Compras y envíos</span>
          </button>

          <button
            type="button"
            onClick={() => setAccountType("seller_individual")}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
              accountType === "seller_individual"
                ? "border-amber-500 bg-amber-500/10 text-amber-600 font-bold shadow-sm"
                : "border-border hover:bg-secondary/40 text-muted-foreground"
            }`}
          >
            <Store className="w-5 h-5 mb-1 text-amber-600" />
            <span className="text-xs font-bold">Vendedor Indiv.</span>
            <span className="text-[10px] opacity-75">Monotributo/Indep.</span>
          </button>

          <button
            type="button"
            onClick={() => setAccountType("seller_empresa")}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
              accountType === "seller_empresa"
                ? "border-purple-500 bg-purple-500/10 text-purple-600 font-bold shadow-sm"
                : "border-border hover:bg-secondary/40 text-muted-foreground"
            }`}
          >
            <Building2 className="w-5 h-5 mb-1 text-purple-600" />
            <span className="text-xs font-bold">Empresa</span>
            <span className="text-[10px] opacity-75">Sociedad Comercial</span>
          </button>
        </div>

        {}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="text-xs font-bold text-foreground uppercase tracking-wider">
                Nombre *
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
                placeholder="Juan"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lastName" className="text-xs font-bold text-foreground uppercase tracking-wider">
                Apellido *
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
                placeholder="Pérez"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-foreground uppercase tracking-wider">
                Correo Electrónico *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-bold text-foreground uppercase tracking-wider">
                Teléfono de Contacto
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
                placeholder="+54 9 11 1234 5678"
              />
            </div>
          </div>

          {}
          {accountType === "seller_empresa" && (
            <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                <Building2 className="w-4 h-4 text-purple-600" />
                <span>Datos Fiscales de la Empresa</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground uppercase">
                    Razón Social *
                  </label>
                  <input
                    type="text"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    required={accountType === "seller_empresa"}
                    placeholder="Mi Empresa S.A."
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none transition focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground uppercase">
                    CUIT / RUT / NIT *
                  </label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    required={accountType === "seller_empresa"}
                    placeholder="30-71234567-8"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none transition focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground uppercase">
                  Nombre Comercial / Fantasía
                </label>
                <input
                  type="text"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  placeholder="Marca comercial de tu tienda"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none transition focus:border-purple-600"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-bold text-foreground uppercase tracking-wider">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 pr-10 text-sm outline-none transition focus:border-primary"
                  placeholder="Mínimo 8 caracteres"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-bold text-foreground uppercase tracking-wider">
                Confirmar Contraseña *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 pr-10 text-sm outline-none transition focus:border-primary"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirmPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-muted-foreground select-none">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
              <span>
                Acepto los{" "}
                <strong className="text-foreground font-semibold">Términos y Condiciones</strong> y
                la <strong className="text-foreground font-semibold">Política de Privacidad</strong>{" "}
                de SimpleMarketplace360.
              </span>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl text-sm font-bold shadow-md gap-2 mt-4"
            disabled={isRegistering}
          >
            {isRegistering ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                <span>Registrando cuenta...</span>
              </>
            ) : (
              <>
                <span>Crear Cuenta en Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {}
        <div className="mt-6 text-center text-xs text-muted-foreground pt-4 border-t border-border/80">
          ¿Ya tenés una cuenta?{" "}
          <Link
            href={`/account/login?redirect=${encodeURIComponent(redirectTo)}`}
            className="font-bold text-primary hover:underline inline-flex items-center gap-1"
          >
            Iniciá sesión aquí
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CustomerRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}