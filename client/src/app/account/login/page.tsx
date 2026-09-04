"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  LockKeyhole,
  ArrowRight,
  Sparkles,
  AlertCircle,
  ShoppingBag,
  Mail,
  Smartphone,
  CheckCircle2,
  Phone,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TextInput, PasswordInput } from "@/components/forms";
import { PhoneCountryInput } from "@/components/ui/phone-country-input";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ApiError } from "@/config/axios";
import { getPublicAuthConfig, type PublicAuthSettings } from "@/services/auth-config.service";
import { GoogleIcon, FacebookIcon, AppleIcon } from "@/components/icons/SocialIcons";
import { HttpAuthRepository } from "@/services/auth.service";

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
    role: "Super Administrador",
    badge: "SuperAdmin",
    email: "admin@marketplace.com",
    password: "Password1234!",
    desc: "Control total y auditoría",
    color: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/40 hover:bg-purple-500/20",
  },
  {
    role: "Vendedor Empresa",
    badge: "Seller",
    email: "seller@marketplace.com",
    password: "Password1234!",
    desc: "Ferretería S.A., ventas y stock",
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/40 hover:bg-amber-500/20",
  },
  {
    role: "Comprador / Cliente",
    badge: "Buyer",
    email: "buyer@marketplace.com",
    password: "Password1234!",
    desc: "Catálogo e historial de compras",
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/40 hover:bg-blue-500/20",
  },
  {
    role: "Soporte Técnico",
    badge: "Staff",
    email: "staff@marketplace.com",
    password: "Password1234!",
    desc: "Moderación y soporte operativo",
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/40 hover:bg-emerald-500/20",
  },
];

const authHttp = new HttpAuthRepository();

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitRedirect = searchParams.get("redirect") || searchParams.get("callbackUrl");

  const [formError, setFormError] = useState<string | null>(null);

  const {
    login,
    phoneLogin,
    socialLogin,
    isLoggingIn,
    isAuthenticated,
    isAdmin,
    isLoading,
    user,
    logout,
  } = useAuth();

  const { dict } = useTranslation();

  // Consulta de configuración pública de métodos de autenticación
  const { data: rawAuthConfig } = useQuery<PublicAuthSettings>({
    queryKey: ["public-auth-config"],
    queryFn: getPublicAuthConfig,
    staleTime: 60 * 1000,
  });

  const authConfig: PublicAuthSettings | undefined =
    (rawAuthConfig as any)?.data || rawAuthConfig;

  const [activeTab, setActiveTab] = useState<"email" | "phone">("email");

  // Estado para login por celular (OTP) con selector de país
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneCountry, setPhoneCountry] = useState("BO");
  const [otpCode, setOtpCode] = useState("");
  const [otpStep, setOtpStep] = useState<"phone" | "code">("phone");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);

  useEffect(() => {
    if (authConfig) {
      if (!authConfig.emailPasswordEnabled && authConfig.phoneOtpEnabled) {
        setActiveTab("phone");
      } else if (authConfig.defaultAuthMethod === "phone" && authConfig.phoneOtpEnabled) {
        setActiveTab("phone");
      } else {
        setActiveTab("email");
      }
    }
  }, [authConfig]);

  const methods = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
  });

  const { setValue, handleSubmit } = methods;

  const targetDestination = explicitRedirect || (isAdmin ? "/admin" : "/account/dashboard");

  // Redirección inmediata si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace(targetDestination);
    }
  }, [isAuthenticated, isLoading, router, targetDestination]);

  const redirectAfterLogin = (session: any) => {
    const role = (session.user.role || session.user.roleName || session.user.type || "").toLowerCase();
    const userRoles = (session.user.roles || []).map((r: string) => r.toLowerCase());
    const isAdminRole =
      role === "admin" ||
      role === "superadmin" ||
      role === "support" ||
      role === "staff" ||
      userRoles.includes("admin") ||
      userRoles.includes("superadmin");

    if (explicitRedirect) {
      router.replace(explicitRedirect);
    } else if (isAdminRole) {
      router.replace("/admin");
    } else {
      router.replace("/account/dashboard");
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    setFormError(null);

    try {
      const session = await login({
        email: data.email,
        password: data.password,
      });

      toast.success(`¡Bienvenido de nuevo, ${session.user.name || "Usuario"}!`);
      redirectAfterLogin(session);
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

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || phoneNumber.trim().length < 6) {
      toast.error("Ingresa un número de celular válido.");
      return;
    }

    setIsSendingOtp(true);
    setFormError(null);
    try {
      const res = await authHttp.sendPhoneOtp(phoneNumber.trim());
      setOtpStep("code");
      toast.success(res.message || "Código enviado por SMS.");
      if (res.debugOtp) {
        setOtpCode(res.debugOtp);
        toast.info(`Código demo: ${res.debugOtp}`);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Error al enviar código SMS.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      toast.error("Ingresa el código de 6 dígitos recibido.");
      return;
    }

    setIsVerifyingPhone(true);
    setFormError(null);
    try {
      const session = await (phoneLogin
        ? phoneLogin(phoneNumber.trim(), otpCode.trim())
        : authHttp.phoneLogin(phoneNumber.trim(), otpCode.trim()));
      toast.success(`¡Bienvenido, ${session.user.name || "Usuario"}!`);
      redirectAfterLogin(session);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Código de verificación inválido.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  const handleSocialClick = async (provider: "google" | "facebook" | "apple") => {
    try {
      const mockEmail = `user.${provider}@marketplace.com`;
      const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
      const session = await (socialLogin
        ? socialLogin({
            provider,
            email: mockEmail,
            firstName: "Usuario",
            lastName: providerName,
          })
        : authHttp.socialLogin({
            provider,
            email: mockEmail,
            firstName: "Usuario",
            lastName: providerName,
          }));

      toast.success(`¡Sesión iniciada con ${providerName}!`);
      redirectAfterLogin(session);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        `Error al conectar con ${provider}.`;
      setFormError(msg);
      toast.error(msg);
    }
  };

  const handleFillAccount = (email: string, pass: string) => {
    setActiveTab("email");
    setValue("email", email, { shouldValidate: true });
    setValue("password", pass, { shouldValidate: true });
    setFormError(null);
  };

  // Resuelve valores de configuración con fallback seguro a true
  const emailEnabled = authConfig?.emailPasswordEnabled ?? true;
  const phoneEnabled = authConfig?.phoneOtpEnabled ?? true;
  const socialEnabled = authConfig?.socialLoginEnabled ?? true;
  // Seguridad: Si todos estuvieran inactivos, el correo debe prevalecer siempre
  const effectiveEmailEnabled = emailEnabled || (!phoneEnabled && !socialEnabled);

  // ESTADO 1: Comprobando sesión activa
  if (isLoading) {
    return (
      <main className="min-h-screen w-full bg-gradient-to-br from-muted/40 via-background to-primary/5 flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl flex flex-col items-center text-center space-y-4">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Verificando sesión...</p>
        </div>
      </main>
    );
  }

  // ESTADO 2: Usuario ya autenticado (No puede volver a ver el formulario de login)
  if (isAuthenticated) {
    const displayName =
      user?.name ||
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      user?.email ||
      "Usuario";

    return (
      <main className="min-h-screen w-full bg-gradient-to-br from-muted/40 via-background to-primary/5 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8">
        {/* Barra superior */}
        <div className="w-full max-w-md mb-4 flex items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1.5 text-primary" />
            {dict.common.backToStore}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {dict.auth.sslEncryption}
            </span>
          </div>
        </div>

        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl relative overflow-hidden backdrop-blur-sm text-center">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 mb-4 ring-8 ring-emerald-500/5">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Sesión Activa
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Ya has iniciado sesión en la plataforma.
          </p>

          <div className="my-5 p-4 rounded-2xl bg-muted/50 border border-border/80 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm uppercase shrink-0">
                {displayName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
              </div>
            </div>
            {user?.role && (
              <div className="mt-2.5 pt-2.5 border-t border-border/60 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Rol actual:</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wide">
                  {user.role}
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground mb-5 animate-pulse">
            Redirigiendo a tu panel automáticamente...
          </p>

          <div className="space-y-3">
            <Button
              type="button"
              onClick={() => router.replace(targetDestination)}
              className="w-full h-11 rounded-xl text-sm font-bold shadow-md cursor-pointer gap-2"
            >
              <span>{isAdmin ? "Ir al Panel de Administración" : "Continuar a mi Panel"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                await logout();
                toast.success("Has cerrado sesión correctamente.");
              }}
              className="w-full h-11 rounded-xl text-sm font-semibold cursor-pointer text-muted-foreground hover:text-foreground gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión e ingresar con otra cuenta</span>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // ESTADO 3: Formulario de inicio de sesión
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-muted/40 via-background to-primary/5 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8">
      {/* Barra superior */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between gap-2">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ShoppingBag className="w-3.5 h-3.5 mr-1.5 text-primary" />
          {dict.common.backToStore}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {dict.auth.sslEncryption}
          </span>
        </div>
      </div>

      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl relative overflow-hidden backdrop-blur-sm">
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner mb-3">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {dict.auth.loginTitle}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {dict.auth.loginSubtitle}
          </p>

          {formError && (
            <div className="mt-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/90 dark:bg-red-950/40 p-3.5 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <div className="flex-1 font-medium text-left">{formError}</div>
            </div>
          )}
        </div>

        {/* Pestañas de Selección de Método (Email vs Celular) si ambos están habilitados */}
        {effectiveEmailEnabled && phoneEnabled && (
          <div className="grid grid-cols-2 p-1 bg-muted/60 rounded-2xl mb-5 border border-border/80">
            <button
              type="button"
              onClick={() => {
                setActiveTab("email");
                setFormError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "email"
                  ? "bg-card text-foreground shadow-sm ring-1 ring-border/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="w-3.5 h-3.5 shrink-0 text-primary" />
              <span className="truncate">Correo y Clave</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("phone");
                setFormError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "phone"
                  ? "bg-card text-foreground shadow-sm ring-1 ring-border/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 shrink-0 text-primary" />
              <span className="truncate">Por Celular (SMS)</span>
            </button>
          </div>
        )}

        {/* MÉTODO 1: Email + Contraseña */}
        {activeTab === "email" && effectiveEmailEnabled && (
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <TextInput
                name="email"
                type="email"
                label={dict.auth.email}
                placeholder="tu@email.com"
                required
                autoComplete="email"
              />

              <PasswordInput
                name="password"
                label={dict.auth.password}
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
                  <span>{dict.auth.rememberMe}</span>
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {dict.auth.forgotPassword}
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoggingIn}
                className="w-full h-11 rounded-xl text-sm font-bold shadow-md gap-2 mt-2 cursor-pointer"
              >
                {isLoggingIn ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                    <span>{dict.auth.verifyingCredentials}</span>
                  </>
                ) : (
                  <>
                    <span>{dict.auth.enterPlatform}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </FormProvider>
        )}

        {/* MÉTODO 2: Celular + Código OTP (SMS) con Selector de País */}
        {activeTab === "phone" && phoneEnabled && (
          <div className="space-y-4">
            {otpStep === "phone" ? (
              <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="login-phone" className="text-xs font-bold text-foreground">
                    Número de Teléfono Móvil
                  </label>
                  <PhoneCountryInput
                    id="login-phone"
                    value={phoneNumber}
                    countryCode={phoneCountry}
                    defaultCountry="BO"
                    onChange={(fullPhone, code) => {
                      setPhoneNumber(fullPhone);
                      setPhoneCountry(code);
                    }}
                    placeholder="71234567"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Te enviaremos un código SMS de 6 dígitos para verificar tu identidad al instante.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full h-11 rounded-xl text-sm font-bold shadow-md gap-2 mt-2 cursor-pointer"
                >
                  {isSendingOtp ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                      <span>Enviando código...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar Código SMS</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">
                      Código de Verificación SMS
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpStep("phone")}
                      className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Cambiar número
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    required
                    className="w-full text-center tracking-[0.4em] font-mono text-lg py-2.5 rounded-xl border border-border bg-background outline-none focus:border-primary"
                  />
                  <p className="text-[11px] text-muted-foreground text-center">
                    Enviado a <strong className="text-foreground">{phoneNumber}</strong>
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isVerifyingPhone}
                  className="w-full h-11 rounded-xl text-sm font-bold shadow-md gap-2 mt-2 cursor-pointer"
                >
                  {isVerifyingPhone ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                      <span>Iniciando sesión...</span>
                    </>
                  ) : (
                    <>
                      <span>Verificar e Ingresar</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        )}

        {/* MÉTODO 3: Redes Sociales (Social Login) */}
        {socialEnabled && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-card px-2.5 text-muted-foreground font-semibold">
                  O continúa con
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Botón Google */}
              {(!authConfig || authConfig.googleAuthEnabled) && (
                <button
                  type="button"
                  onClick={() => handleSocialClick("google")}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-border bg-card hover:bg-muted/60 transition-colors shadow-sm cursor-pointer group"
                  title="Continuar con Google"
                >
                  <GoogleIcon className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold truncate">Google</span>
                </button>
              )}

              {/* Botón Facebook */}
              {(!authConfig || authConfig.facebookAuthEnabled) && (
                <button
                  type="button"
                  onClick={() => handleSocialClick("facebook")}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-border bg-card hover:bg-muted/60 transition-colors shadow-sm cursor-pointer group"
                  title="Continuar con Facebook"
                >
                  <FacebookIcon className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold truncate">Facebook</span>
                </button>
              )}

              {/* Botón Apple */}
              {(!authConfig || authConfig.appleAuthEnabled) && (
                <button
                  type="button"
                  onClick={() => handleSocialClick("apple")}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-border bg-card hover:bg-muted/60 transition-colors shadow-sm cursor-pointer group"
                  title="Continuar con Apple"
                >
                  <AppleIcon className="w-4 h-4 shrink-0 fill-foreground" />
                  <span className="text-xs font-semibold truncate">Apple</span>
                </button>
              )}
            </div>
          </>
        )}

        {/* Acceso Rápido / Cuentas Demo */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
            <span className="bg-card px-2.5 text-muted-foreground font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary" />
              {dict.auth.quickAccessAccounts}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {TEST_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => handleFillAccount(acc.email, acc.password)}
              className={`flex flex-col p-2.5 rounded-xl border text-left transition-all cursor-pointer hover:scale-[1.01] ${acc.color}`}
              title={acc.desc}
            >
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="text-xs font-bold leading-tight">{acc.badge}</span>
                <Sparkles className="w-3 h-3 opacity-60 shrink-0" />
              </div>
              <span className="text-[11px] font-medium opacity-90 truncate">
                {acc.role}
              </span>
              <span className="text-[10px] opacity-70 truncate mt-0.5">
                {acc.desc}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground pt-4 border-t border-border/80">
          {dict.auth.noAccount}{" "}
          <Link
            href={`/account/register${explicitRedirect ? `?redirect=${encodeURIComponent(explicitRedirect)}` : ""}`}
            className="font-bold text-primary hover:underline inline-flex items-center gap-1"
          >
            {dict.auth.signUpHere}
          </Link>
        </div>
      </div>
    </main>
  );
};

const CustomerLoginPage = () => {
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
};

export default CustomerLoginPage;