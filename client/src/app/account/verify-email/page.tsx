"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { authService } from "@/services/auth.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Mail, ArrowLeft, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const VerifyEmailPage: React.FC = () => {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const targetEmail = user?.email || email;

  const handleSendCode = async () => {
    if (!targetEmail) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }
    setIsSending(true);
    setError(null);
    try {
      await authService.sendEmailOtp(targetEmail);
      toast.success("Código de verificación enviado a tu correo.");
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Error al enviar el código.");
      toast.error("No se pudo enviar el correo de verificación.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !targetEmail) return;

    setIsVerifying(true);
    setError(null);
    try {
      await authService.verifyEmail(targetEmail, code.trim());
      setIsSuccess(true);
      toast.success("¡Correo verificado con éxito!");
      if (refreshUser) {
        await refreshUser();
      }
      setTimeout(() => {
        router.push("/account/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Código inválido o expirado.");
      toast.error("El código ingresado no es válido.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-background to-secondary/20 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <Link
          href="/account/dashboard"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Volver al panel
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-xl border-border/60 bg-background/95 backdrop-blur-sm rounded-3xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">Verificación de Correo</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Protege tu cuenta y activa todas las funciones de compras y ventas.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">¡Cuenta Verificada!</h3>
              <p className="text-xs text-muted-foreground">
                Tu correo electrónico ha sido confirmado con éxito. Redirigiendo a tu panel...
              </p>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {!user && (
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="rounded-xl"
                    required
                  />
                </div>
              )}

              {user && (
                <div className="rounded-xl bg-muted/50 p-3 flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <div className="text-xs truncate">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                      Correo a verificar
                    </span>
                    <span className="font-semibold text-foreground">{user.email}</span>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="otp-code" className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Código de 6 dígitos
                  </Label>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isSending}
                    className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" /> Enviando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3" /> Solicitar código
                      </>
                    )}
                  </button>
                </div>
                <Input
                  id="otp-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="text-center text-xl font-bold tracking-widest h-12 rounded-xl"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isVerifying || code.trim().length < 4}
                className="w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md"
              >
                {isVerifying ? "Verificando..." : "Confirmar y Activar"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default VerifyEmailPage;
