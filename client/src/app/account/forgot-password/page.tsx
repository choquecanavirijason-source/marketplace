"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Mail, ArrowLeft, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { authService } from "@/services/auth.service";

const ForgotPasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get("token");
    const urlEmail = searchParams.get("email");
    if (urlEmail) {
      setEmail(urlEmail);
    }
    if (urlToken) {
      setToken(urlToken);
      setStep("reset");
    }
  }, [searchParams]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Ingresa tu correo electrónico.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      toast.success(res.message || "Código o enlace de recuperación enviado a tu correo.");
      setStep("reset");
    } catch (err: any) {
      toast.error(err?.message || "No se pudo procesar la solicitud de recuperación.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPassword) {
      toast.error("Por favor ingresa el código y tu nueva contraseña.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.resetPassword(token, newPassword);
      toast.success(res.message || "Contraseña restablecida con éxito.");
      router.push("/account/login");
    } catch (err: any) {
      toast.error(err?.message || "Código inválido o expirado. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-lg border-border/60">
        <CardHeader className="text-center space-y-1 pb-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {step === "request" ? "Recuperar Contraseña" : "Crear Nueva Contraseña"}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {step === "request"
              ? "Te enviaremos el código y las instrucciones a tu correo"
              : "Ingresa el código que recibiste por correo y tu nueva contraseña"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "request" ? (
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fp-email">Correo Electrónico Registrado</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fp-email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar Código de Recuperación"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Código de Verificación (6 dígitos)</Label>
                <Input
                  id="token"
                  placeholder="Ej: 123456"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="font-mono text-center tracking-widest text-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-pass">Nueva Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-pass"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-pass">Confirmar Nueva Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-pass"
                    type="password"
                    placeholder="Repite tu nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
                {isLoading ? "Restableciendo..." : "Guardar Nueva Contraseña"}
                <CheckCircle2 className="ml-2 h-4 w-4" />
              </Button>

              <button
                type="button"
                onClick={() => setStep("request")}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground pt-1"
              >
                ¿No recibiste el código? Solicitar uno nuevo
              </button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center text-sm border-t border-border/40 py-3">
          <Link
            href="/account/login"
            className="flex items-center text-muted-foreground hover:text-foreground text-xs"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Volver al Inicio de Sesión
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

const ForgotPasswordPage = () => {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Cargando...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
};

export default ForgotPasswordPage;
