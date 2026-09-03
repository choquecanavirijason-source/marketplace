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

  const [authMode, setAuthMode] = useState<"password" | "otp">("password");
  const [formError, setFormError] = useState<string | null>(null);

  const [otpIdentifier, setOtpIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  const { login, loginOtp, sendEmailOtp, isLoggingIn, isAuthenticated } = useAuth();

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
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

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
            "Credenciales incorrectas o problema de conexión con el servidor.";

      setFormError(message);
      toast.error(message);
    }
  };

  const handleRequestOtp = async () => {
    const email = otpIdentifier.trim();
    if (!email || !email.includes("@")) {
      setFormError("Ingresa un correo electrónico válido para recibir el código.");
      return;
    }

    setFormError(null);
    setIsSendingOtp(true);
    try {
      if (!sendEmailOtp) {
        throw new Error("El servicio de envío de código OTP no está disponible.");
      }
      const res = await sendEmailOtp(email);
      setOtpSent(true);
      setCountdown(60);
      toast.success(res.message || "Código enviado a tu correo.");
      if (res.debugOtp) {
        setOtpCode(res.debugOtp);
      }
    } catch (err: any) {
      const message =
        err instanceof ApiError
          ? err.message
          : err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Error al solicitar el código de verificación.";
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = otpIdentifier.trim();
    const code = otpCode.trim();

    if (!email || !code) {
      setFormError("Ingresa tu correo y el código recibido.");
      return;
    }

    setFormError(null);
    setIsSubmittingOtp(true);

    try {
      if (!loginOtp) {
        throw new Error("El inicio de sesión por OTP no está disponible.");
      }

      const session = await loginOtp({
        email,
        code,
      });

      toast.success(`¡Bienvenido, ${session.user.name || "Usuario"}!`);
      router.push(redirectTo);
    } catch (err: any) {
      const message =
        err instanceof ApiError
          ? err.message
          : err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Código OTP inválido o expirado.";
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmittingOtp(false);
    }
  };

  const handleFillAccount = (email: string, pass: string) => {
    setAuthMode("password");
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
        </div>

        {}
        <div className="flex rounded-xl bg-secondary/60 p-1 mb-5">
          <button
            type="button"
            onClick={() => {
              setAuthMode("password");
              setFormError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMode === "password"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Contraseña</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("otp");
              setFormError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMode === "otp"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Código Gmail</span>
          </button>
        </div>

        {}
        {formError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1 font-medium">{formError}</div>
          </div>
        )}

        {}
        {authMode === "password" ? (
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

              {}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground select-none">
                  <input
                    type="checkbox"
                    {...methods.register("remember")}
                    className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
                  />
                  Recordar mi sesión
                </label>

                <button
                  type="button"
                  onClick={() =>
                    toast.info(
                      "Utiliza el endpoint POST /auth/forgot-password o contacta a soporte para reestablecer tu clave.",
                    )
                  }
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  ¿Olvidaste tu clave?
                </button>
              </div>

              {}
              <Button
                type="submit"
                disabled={isLoggingIn}
                className="w-full h-11 rounded-xl text-sm font-bold shadow-md gap-2"
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
        ) : (
          
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Correo Electrónico (Gmail)
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={otpIdentifier}
                  onChange={(e) => setOtpIdentifier(e.target.value)}
                  placeholder="usuario@gmail.com"
                  required
                  className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
                />
                <Button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isSendingOtp || countdown > 0}
                  variant="outline"
                  className="shrink-0 rounded-xl text-xs font-bold px-3.5 h-[42px]"
                >
                  {isSendingOtp ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  ) : countdown > 0 ? (
                    `${countdown}s`
                  ) : (
                    "Enviar código"
                  )}
                </Button>
              </div>
              {otpSent && (
                <p className="text-[11px] text-green-600 font-medium pt-0.5">
                  ✓ Código enviado por correo. Revisa tu bandeja de entrada o spam.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Código de 6 dígitos
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                required
                className="w-full text-center tracking-widest text-lg font-bold rounded-xl border border-border bg-background px-3.5 py-2.5 outline-none transition focus:border-primary"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmittingOtp}
              className="w-full h-11 rounded-xl text-sm font-bold shadow-md gap-2 mt-2"
            >
              {isSubmittingOtp ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  <span>Validando código...</span>
                </>
              ) : (
                <>
                  <span>Ingresar con código</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        )}

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