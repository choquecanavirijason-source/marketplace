"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Phone, Mail, KeyRound, ArrowRight, ShieldCheck } from "lucide-react";

interface LoginFormProps {
  onSuccess?: () => void;
  redirectUrl?: string;
}

export const LoginForm = ({ onSuccess, redirectUrl }: LoginFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUrl = redirectUrl || searchParams.get("callbackUrl") || searchParams.get("redirect") || "/account/dashboard";

  const { login, loginOtp, sendEmailOtp } = useAuth();

  const [activeTab, setActiveTab] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor completa tu correo y contraseña.");
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      toast.success("¡Bienvenido nuevamente!");
      if (onSuccess) onSuccess();
      else router.push(targetUrl);
    } catch (err: any) {
      toast.error(err?.message || "Error al iniciar sesión. Revisa tus credenciales.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      toast.error("Ingresa tu correo para recibir el código de verificación.");
      return;
    }

    if (!sendEmailOtp) {
      toast.error("El envío de OTP no está disponible actualmente.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendEmailOtp(email);
      setOtpSent(true);
      toast.success(res?.message || "Código enviado a tu correo.");
    } catch (err: any) {
      toast.error(err?.message || "No se pudo enviar el código de verificación.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || (!email && !phone)) {
      toast.error("Ingresa el código OTP recibido.");
      return;
    }

    if (!loginOtp) {
      toast.error("Inicio con OTP no disponible.");
      return;
    }

    setIsLoading(true);
    try {
      await loginOtp({ email: email || undefined, phone: phone || undefined, code: otpCode });
      toast.success("Sesión iniciada con código OTP.");
      if (onSuccess) onSuccess();
      else router.push(targetUrl);
    } catch (err: any) {
      toast.error(err?.message || "Código de verificación inválido o expirado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-border/60">
      <CardHeader className="text-center space-y-1 pb-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Iniciar Sesión</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Accede a tu cuenta de cliente, vendedor o administración
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "password" | "otp")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password" className="text-xs sm:text-sm">Contraseña</TabsTrigger>
            <TabsTrigger value="otp" className="text-xs sm:text-sm">Código OTP</TabsTrigger>
          </TabsList>

          <TabsContent value="password" className="space-y-4 pt-4">
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <Link
                    href="/account/forgot-password"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    ¿Olvidaste tu clave?
                  </Link>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
                {isLoading ? "Ingresando..." : "Ingresar"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="otp" className="space-y-4 pt-4">
            <form onSubmit={handleOtpLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp-email">Correo para el Código</Label>
                <div className="flex gap-2">
                  <Input
                    id="otp-email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendOtp}
                    disabled={isLoading || !email}
                  >
                    {otpSent ? "Reenviar" : "Solicitar"}
                  </Button>
                </div>
              </div>

              {otpSent && (
                <div className="space-y-2">
                  <Label htmlFor="otp-code">Código de 6 dígitos</Label>
                  <Input
                    id="otp-code"
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="text-center tracking-widest text-lg font-mono"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Revisa tu bandeja de entrada o spam. El código expira en 10 minutos.
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full font-semibold" disabled={isLoading || !otpSent}>
                {isLoading ? "Validando..." : "Verificar e Ingresar"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex flex-col space-y-3 pt-2 text-center text-sm border-t border-border/40">
        <div className="text-muted-foreground">
          ¿No tienes una cuenta?{" "}
          <Link href="/account/register" className="font-semibold text-primary hover:underline">
            Regístrate aquí
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};
