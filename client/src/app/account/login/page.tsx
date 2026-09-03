"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ShieldCheck,
  LockKeyhole,
  ArrowRight,
  Sparkles,
  AlertCircle,
  ShoppingBag,
  KeyRound,
  Smartphone,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  TextInput,
  PasswordInput,
} from "@/components/forms";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/config/axios";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo electrónico es requerido")
    .email("Ingresa un formato de correo electrónico válido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const TEST_ACCOUNTS = [
  {
    role: "Super Admin",
    badge: "SuperAdmin",
    email: "admin@marketplace.com",
    password: "Password1234!",
    desc: "Control total, auditoría forense y configuración",
    color: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200/70",
  },
  {
    role: "Vendedor Empresa",
    badge: "Seller",
    email: "seller@marketplace.com",
    password: "Password1234!",
    desc: "Ferretería Industrial S.A., gestión y ventas",
    color: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200/70",
  },
  {
    role: "Comprador",
    badge: "Buyer",
    email: "buyer@marketplace.com",
    password: "Password1234!",
    desc: "Cliente con historial de pedidos",
    color: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200/70",
  },
  {
    role: "Soporte",
    badge: "Staff",
    email: "staff@marketplace.com",
    password: "Password1234!",
    desc: "Moderación y soporte operativo",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200/70",
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [formError, setFormError] = useState<string | null>(null);

  const { login, isLoggingIn, isAuthenticated } = useAuth();

  const methods = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
  });

  const { setValue, handleSubmit } = methods;

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  const onSubmit = async (data: LoginFormValues) => {
    setFormError(null);

    try {
      const session = await login({
        email: data.email,
        password: data.password,
      });

      toast.success(`¡Bienvenido de nuevo, ${session.user.name || "Usuario"}!`);

      const role = session.user.roleName?.toLowerCase();
      if (role === "admin" || role === "superadmin") {
        router.push("/admin");
      } else {
        router.push(redirectTo);
      }
    } catch (err: any) {
      const message =
        err instanceof ApiError
          ? err.message
          : err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Credenciales incorrectas. Verifica tu correo y contraseña.";

      setFormError(message);
      toast.error(message);
    }
  };

  const handleFillAccount = (email: string, pass: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", pass, { shouldValidate: true });
    setFormError(null);
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-background to-secondary/20 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8">
      {}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ShoppingBag className="w-3.5 h-3.5 mr-1.5 text-primary" />
          Volver a la tienda
        </Link>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Cifrado SSL 256-bit
        </span>
      </div>

      {}
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl relative overflow-hidden backdrop-blur-sm">
        {}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        {}
        <div className="text-center mb-5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner mb-3">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Iniciar Sesión
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Accede a tu cuenta de comprador, vendedor o administración
          </p>
          {formError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1 font-medium">{formError}</div>
          </div>
        )}
        </div>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextInput
              name="email"
              type="email"
              label="Correo Electrónico"
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />

            <PasswordInput
              name="password"
              label="Contraseña"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground select-none">
                <input
                  type="checkbox"
                  {...methods.register("remember")}
                  className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span>Recordar sesión</span>
              </label>

              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-11 rounded-xl text-sm font-bold shadow-md gap-2 mt-2"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Ingresar a la Plataforma</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </FormProvider>

        {}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
            <span className="bg-card px-2.5 text-muted-foreground font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary" />
              Cuentas de Acceso Rápido
            </span>
          </div>
        </div>

        {}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TEST_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => handleFillAccount(acc.email, acc.password)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${acc.color}`}
              title={acc.desc}
            >
              <span className="text-xs font-bold leading-tight">{acc.badge}</span>
              <span className="text-[10px] opacity-75 truncate max-w-full">
                {acc.role}
              </span>
            </button>
          ))}
        </div>

        {}
        <div className="mt-6 text-center text-xs text-muted-foreground pt-4 border-t border-border/80">
          ¿No tienes una cuenta aún?{" "}
          <Link
            href={`/account/register?redirect=${encodeURIComponent(redirectTo)}`}
            className="font-bold text-primary hover:underline inline-flex items-center gap-1"
          >
            Regístrate aquí
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}