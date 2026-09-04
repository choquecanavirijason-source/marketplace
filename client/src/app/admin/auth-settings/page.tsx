"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShieldCheck,
  Mail,
  Smartphone,
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RotateCcw,
  Sparkles,
  Lock,
  Radio,
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getAdminAuthConfig,
  updateAdminAuthConfig,
  type AdminAuthSettings,
  type UpdateAuthSettingsData,
} from "@/services/auth-config.service";
import { GoogleIcon, FacebookIcon, AppleIcon } from "@/components/icons/SocialIcons";

export default function AdminAuthSettingsPage() {
  const queryClient = useQueryClient();

  const {
    data: config,
    isLoading,
    isError,
    error,
  } = useQuery<AdminAuthSettings>({
    queryKey: ["admin-auth-config"],
    queryFn: getAdminAuthConfig,
  });

  const [formData, setFormData] = useState<UpdateAuthSettingsData>({
    emailPasswordEnabled: true,
    phoneOtpEnabled: true,
    socialLoginEnabled: true,
    googleAuthEnabled: true,
    facebookAuthEnabled: true,
    appleAuthEnabled: true,
    defaultAuthMethod: "email",
    requireEmailVerification: false,
    requirePhoneVerification: false,
  });

  useEffect(() => {
    if (config) {
      setFormData({
        emailPasswordEnabled: config.emailPasswordEnabled,
        phoneOtpEnabled: config.phoneOtpEnabled,
        socialLoginEnabled: config.socialLoginEnabled,
        googleAuthEnabled: config.googleAuthEnabled,
        facebookAuthEnabled: config.facebookAuthEnabled,
        appleAuthEnabled: config.appleAuthEnabled,
        defaultAuthMethod: config.defaultAuthMethod || "email",
        requireEmailVerification: config.requireEmailVerification,
        requirePhoneVerification: config.requirePhoneVerification,
      });
    }
  }, [config]);

  const mutation = useMutation({
    mutationFn: (data: UpdateAuthSettingsData) => updateAdminAuthConfig(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["admin-auth-config"], updated);
      queryClient.invalidateQueries({ queryKey: ["public-auth-config"] });
      toast.success("¡Configuración de acceso guardada correctamente!");
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.detail ||
          err?.message ||
          "Error al guardar la configuración de autenticación."
      );
    },
  });

  const handleToggle = (key: keyof UpdateAuthSettingsData, val: boolean) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de seguridad: al menos 1 método debe estar activo
    if (
      !formData.emailPasswordEnabled &&
      !formData.phoneOtpEnabled &&
      !formData.socialLoginEnabled
    ) {
      toast.error("Debe existir al menos un método de autenticación habilitado.");
      return;
    }

    mutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">
          Cargando configuración de autenticación...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <KeyRound className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Configuración de Métodos de Acceso
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Controla y personaliza qué opciones de inicio de sesión y registro están disponibles para los usuarios en la plataforma.
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={mutation.isPending}
          className="rounded-xl shadow-md gap-2 h-11 px-5 font-bold cursor-pointer"
        >
          {mutation.isPending ? (
            <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Guardar Cambios</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Métodos Principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Método 1: Email y Contraseña */}
          <Card className={`rounded-3xl border transition-all ${formData.emailPasswordEnabled ? "border-primary/40 bg-card shadow-sm" : "border-border/60 bg-muted/20 opacity-75"}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <Switch
                  checked={formData.emailPasswordEnabled}
                  onCheckedChange={(val) => handleToggle("emailPasswordEnabled", val)}
                />
              </div>
              <CardTitle className="text-lg font-bold mt-2">
                Por Correo Electrónico
              </CardTitle>
              <CardDescription className="text-xs">
                Acceso clásico con email y contraseña segura con cifrado bcrypt.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground pt-0 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Soporta recuperación de contraseña
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Validación de formato RFC
              </div>
            </CardContent>
          </Card>

          {/* Método 2: Celular y SMS */}
          <Card className={`rounded-3xl border transition-all ${formData.phoneOtpEnabled ? "border-primary/40 bg-card shadow-sm" : "border-border/60 bg-muted/20 opacity-75"}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <Switch
                  checked={formData.phoneOtpEnabled}
                  onCheckedChange={(val) => handleToggle("phoneOtpEnabled", val)}
                />
              </div>
              <CardTitle className="text-lg font-bold mt-2">
                Por Celular (SMS / OTP)
              </CardTitle>
              <CardDescription className="text-xs">
                Inicio rápido con número de teléfono móvil y código OTP de 6 dígitos.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground pt-0 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Login sin recordar contraseñas
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verificación instantánea de celular
              </div>
            </CardContent>
          </Card>

          {/* Método 3: Redes Sociales */}
          <Card className={`rounded-3xl border transition-all ${formData.socialLoginEnabled ? "border-primary/40 bg-card shadow-sm" : "border-border/60 bg-muted/20 opacity-75"}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <Switch
                  checked={formData.socialLoginEnabled}
                  onCheckedChange={(val) => handleToggle("socialLoginEnabled", val)}
                />
              </div>
              <CardTitle className="text-lg font-bold mt-2">
                Por Redes Sociales
              </CardTitle>
              <CardDescription className="text-xs">
                Registro y autenticación con un clic mediante proveedores OAuth.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground pt-0 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Google, Facebook y Apple
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Obtención de avatar y datos de perfil
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Proveedores de Redes Sociales Específicos */}
        {formData.socialLoginEnabled && (
          <Card className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/80 px-6 py-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <CardTitle className="text-base font-bold">
                  Proveedores de Redes Sociales Permitidos
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Selecciona qué botones de redes sociales estarán visibles en el formulario de inicio de sesión.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 divide-y divide-border">
              {/* Google */}
              <div className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl border border-border bg-background flex items-center justify-center">
                    <GoogleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Google OAuth</p>
                    <p className="text-xs text-muted-foreground">
                      Permite iniciar sesión con cuentas @gmail.com o Google Workspace.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.googleAuthEnabled}
                  onCheckedChange={(val) => handleToggle("googleAuthEnabled", val)}
                />
              </div>

              {/* Facebook */}
              <div className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl border border-border bg-blue-600 text-white flex items-center justify-center">
                    <FacebookIcon className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Facebook Login</p>
                    <p className="text-xs text-muted-foreground">
                      Conexión mediante Meta Accounts y perfiles de Facebook.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.facebookAuthEnabled}
                  onCheckedChange={(val) => handleToggle("facebookAuthEnabled", val)}
                />
              </div>

              {/* Apple */}
              <div className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl border border-border bg-foreground text-background flex items-center justify-center">
                    <AppleIcon className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Sign in with Apple</p>
                    <p className="text-xs text-muted-foreground">
                      Inicio de sesión privado y seguro para usuarios de Apple ID e iOS.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.appleAuthEnabled}
                  onCheckedChange={(val) => handleToggle("appleAuthEnabled", val)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Políticas y Comportamiento de Acceso */}
        <Card className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/80 px-6 py-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <CardTitle className="text-base font-bold">
                Políticas de Seguridad y Comportamiento
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Ajusta las reglas de verificación y la vista inicial del formulario.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-foreground">
                  Método de acceso predeterminado
                </Label>
                <select
                  value={formData.defaultAuthMethod}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      defaultAuthMethod: e.target.value as any,
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary cursor-pointer font-medium"
                >
                  <option value="email">Pestaña Correo Electrónico</option>
                  <option value="phone">Pestaña Celular / SMS</option>
                  <option value="social">Destacar Botones Sociales</option>
                </select>
                <p className="text-[11px] text-muted-foreground">
                  Indica cuál pestaña se abre en primer lugar cuando el usuario entra a la pantalla de Login.
                </p>
              </div>

              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-bold text-foreground">
                      Exigir Verificación de Correo
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Solicita obligatoriamente código de correo tras el registro.
                    </p>
                  </div>
                  <Switch
                    checked={formData.requireEmailVerification}
                    onCheckedChange={(val) => handleToggle("requireEmailVerification", val)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-bold text-foreground">
                      Exigir Verificación de Celular
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Pide confirmar número móvil por SMS para habilitar compras.
                    </p>
                  </div>
                  <Switch
                    checked={formData.requirePhoneVerification}
                    onCheckedChange={(val) => handleToggle("requirePhoneVerification", val)}
                  />
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-muted/20 border-t border-border px-6 py-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-primary" />
              Los cambios se propagan de inmediato en la pantalla de inicio de sesión.
            </span>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-xl font-bold px-5 h-10 cursor-pointer shadow-sm"
            >
              {mutation.isPending ? "Guardando..." : "Guardar Configuración"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
