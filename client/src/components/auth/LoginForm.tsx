"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  onSuccess?: () => void;
  redirectUrl?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, redirectUrl }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUrl = redirectUrl || searchParams.get("callbackUrl") || searchParams.get("redirect") || "/account/dashboard";

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor completa tu correo y contraseña.");
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      toast.success("¡Bienvenido nuevamente!");
      if (onSuccess) onSuccess();
      else router.push(targetUrl);
    } catch (err: any) {
      toast.error(err?.message || "Error al iniciar sesión. Revisa tus credenciales.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-orange-400/10 to-primary/20 rounded-[2rem] blur-xl opacity-60" />
        <Card className="relative w-full shadow-xl border-border/60 rounded-3xl overflow-hidden">
          <CardHeader className="text-center space-y-1 pb-4">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary mb-2 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Iniciar Sesión</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Accede a tu cuenta de cliente, vendedor o administración
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-xs font-bold uppercase tracking-wider">
                  Correo Electrónico
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-xs font-bold uppercase tracking-wider">
                    Contraseña
                  </Label>
                  <Link
                    href="/account/forgot-password"
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    ¿Olvidaste tu clave?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all"
                    required
                    autoComplete="current-password"
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

              <Button
                type="submit"
                className="w-full h-11 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md mt-2 bg-gradient-to-r from-primary to-orange-600 hover:from-orange-700 hover:to-primary transition-all active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? "Ingresando..." : "Ingresar a la Plataforma"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-4 text-center text-xs border-t border-border/60 bg-muted/20">
            <div className="text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <Link href="/account/register" className="font-bold text-primary hover:underline">
                Regístrate aquí
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
