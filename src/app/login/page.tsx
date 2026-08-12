"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/presentation/atoms/button";
import { setAuthenticated, isAuthenticated } from "@/shared/lib/marketplaceStorage";

const HARDCODED_EMAIL = "admin@ferromax.com";
const HARDCODED_PASSWORD = "admin123";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(HARDCODED_EMAIL);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/admin/products");
    }
  }, [router]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (email.trim() === HARDCODED_EMAIL && password === HARDCODED_PASSWORD) {
      setAuthenticated(true);
      router.push("/admin/products");
      return;
    }

    setError("Credenciales inválidas. Usa admin@ferromax.com / admin123");
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">FerroMax</p>
          <h1 className="mt-2 text-3xl font-black text-foreground">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-muted-foreground">Accede para publicar productos en el marketplace.</p>
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
              placeholder="admin@ferromax.com"
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
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}

          <Button type="submit" className="w-full">Entrar al marketplace</Button>
        </form>

        <div className="mt-6 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Credenciales de prueba:</p>
          <p className="mt-1">Email: admin@ferromax.com</p>
          <p>Contraseña: admin123</p>
        </div>
      </div>
    </main>
  );
}
