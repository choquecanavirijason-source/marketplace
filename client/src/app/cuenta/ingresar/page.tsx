"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/presentation/atoms/button";
import { useAuth } from "@/presentation/hooks/useAuth";
import { isCustomerAuthenticated } from "@/shared/lib/marketplaceStorage";
import { ApiError } from "@/infrastructure/http/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login, isLoggingIn } = useAuth();

  useEffect(() => {
    if (isCustomerAuthenticated()) {
      router.push(redirectTo);
    }
  }, [router, redirectTo]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const session = await login({ email, password });
      router.push(session.user.roleName === "admin" ? "/admin" : redirectTo);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo iniciar sesión. Intentá de nuevo.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">FerroMax</p>
          <h1 className="mt-2 text-3xl font-black text-foreground">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-muted-foreground">Ingresá a tu cuenta para completar tu compra.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">Correo</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-primary"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-primary"
              placeholder="••••••••"
              required
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}

          <Button type="submit" className="w-full" disabled={isLoggingIn}>
            {isLoggingIn ? "Ingresando…" : "Iniciar sesión"}
          </Button>
        </form>

        <div className="mt-6 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Cuenta de prueba (cliente):</p>
          <p className="mt-1">Email: cliente@ferromax.com</p>
          <p>Contraseña: password</p>
        </div>

        <div className="mt-3 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Cuenta de prueba (administrador):</p>
          <p className="mt-1">Email: admin@ferromax.com</p>
          <p>Contraseña: password</p>
          <p className="mt-1 text-[11px]">Al iniciar sesión con esta cuenta vas directo al panel de administrador.</p>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿No tenés cuenta?{" "}
          <Link href={`/cuenta/crear?redirect=${encodeURIComponent(redirectTo)}`} className="font-semibold text-primary hover:underline">
            Creála acá
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}