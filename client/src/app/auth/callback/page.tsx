"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/context/authStore";
import {
  setAuthToken,
  setCurrentUser,
  setAuthPermissions,
  syncAuthCookies,
  getSavedActiveMode,
  resolveValidMode,
  getDestinationForMode,
} from "@/shared/lib/marketplaceStorage";

const CallbackLoadingView = ({ message }: { message: string }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-sm p-8 rounded-3xl border border-border bg-card shadow-xl relative overflow-hidden backdrop-blur-sm">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 animate-spin">
          <Loader2 className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-black tracking-tight text-foreground mb-2">
          {message}
        </h2>
        <p className="text-sm text-muted-foreground">
          Por favor espera un momento mientras preparamos tu espacio de trabajo.
        </p>
      </div>
    </div>
  );
};

const AuthCallbackContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const redirectParam = searchParams.get("redirect");
  const errorParam = searchParams.get("error");

  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [statusMessage, setStatusMessage] = useState("Iniciando sesión con tu cuenta...");

  useEffect(() => {
    let isMounted = true;

    const processAuth = async () => {
      if (errorParam) {
        setStatus("error");
        const decodedError = decodeURIComponent(errorParam);
        toast.error(decodedError || "Ocurrió un error durante la autenticación.");
        router.replace(`/account/login?error=${encodeURIComponent(decodedError)}`);
        return;
      }

      if (!token) {
        setStatus("error");
        toast.error("No se recibió el token de autenticación.");
        router.replace("/account/login");
        return;
      }

      try {
        setStatusMessage("Configurando credenciales seguras...");
        setAuthToken(token);
        syncAuthCookies();

        setStatusMessage("Cargando información de tu perfil...");
        const session = await authService.me();

        if (!isMounted) return;

        setCurrentUser(session.user);
        if (session.permissions) {
          setAuthPermissions(session.permissions);
        }
        syncAuthCookies();

        const savedMode = getSavedActiveMode(session.user.id);
        const validMode = resolveValidMode(savedMode, session.user);

        const authStore = useAuthStore.getState();
        authStore.setActiveMode(validMode);
        await authStore.refreshUser();

        setStatus("success");
        setStatusMessage("¡Autenticación completada! Redirigiendo...");

        const userName = session.user.name || session.user.firstName || "Usuario";
        toast.success(`¡Bienvenido, ${userName}!`);

        let destination = getDestinationForMode(validMode);
        if (redirectParam && redirectParam !== "/" && redirectParam !== "/auth/callback") {
          destination = redirectParam;
        }

        setTimeout(() => {
          if (isMounted) {
            router.replace(destination);
          }
        }, 600);
      } catch (err: any) {
        if (!isMounted) return;
        setStatus("error");
        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "Error al verificar la sesión.";
        toast.error(message);
        router.replace("/account/login");
      }
    };

    void processAuth();

    return () => {
      isMounted = false;
    };
  }, [token, redirectParam, errorParam, router]);

  if (status === "error") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-sm p-8 rounded-3xl border border-destructive/20 bg-card shadow-xl">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-6">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-foreground mb-2">
            Error de autenticación
          </h2>
          <p className="text-sm text-muted-foreground">
            Redirigiendo a la pantalla de inicio de sesión...
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-sm p-8 rounded-3xl border border-emerald-500/20 bg-card shadow-xl">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 mb-6 animate-bounce">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-foreground mb-2">
            {statusMessage}
          </h2>
          <p className="text-sm text-muted-foreground">
            Ingresando a tu panel de control...
          </p>
        </div>
      </div>
    );
  }

  return <CallbackLoadingView message={statusMessage} />;
};

const AuthCallbackPage = () => {
  return (
    <Suspense fallback={<CallbackLoadingView message="Procesando autenticación..." />}>
      <AuthCallbackContent />
    </Suspense>
  );
};

export default AuthCallbackPage;
