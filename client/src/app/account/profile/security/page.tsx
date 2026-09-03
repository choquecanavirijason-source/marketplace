"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Laptop, Smartphone, KeyRound, LogOut, ArrowLeft, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import type { UserSessionItem } from "@/types";
import { HttpAuthRepository } from "@/services/auth.service";

export default function ProfileSecurityPage() {
  const { user, logoutAll } = useAuth();
  const authService = new HttpAuthRepository();

  const [sessions, setSessions] = useState<UserSessionItem[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isRevoking, setIsRevoking] = useState(false);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const data = await authService.getSessions();
      setSessions(data || []);
    } catch {
      setSessions([]);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (sessionId: string) => {
    try {
      await authService.revokeSession(sessionId);
      toast.success("Sesión cerrada correctamente.");
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err: any) {
      toast.error(err?.message || "No se pudo revocar la sesión.");
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm("¿Deseas cerrar todas las sesiones remotas en otros dispositivos?")) return;
    setIsRevoking(true);
    try {
      if (logoutAll) await logoutAll();
      else await authService.logoutAll();
      toast.success("Todas las demás sesiones han sido revocadas.");
      fetchSessions();
    } catch (err: any) {
      toast.error(err?.message || "Error al revocar sesiones.");
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container max-w-4xl mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center justify-between border-b pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/account/profile" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Volver a Mi Perfil
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Seguridad & Dispositivos</h1>
            <p className="text-sm text-muted-foreground">
              Controla los accesos a tu cuenta, dispositivos conectados y sesiones activas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Laptop className="h-5 w-5 text-primary" /> Sesiones Activas
                  </CardTitle>
                  <CardDescription>Dispositivos donde tu cuenta se encuentra abierta actualmente</CardDescription>
                </div>
                {sessions.length > 1 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRevokeAll}
                    disabled={isRevoking}
                  >
                    <LogOut className="mr-1.5 h-4 w-4" /> Cerrar Otras Sesiones
                  </Button>
                )}
              </CardHeader>

              <CardContent className="space-y-3">
                {isLoadingSessions ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Cargando sesiones...</p>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No se encontraron sesiones adicionales registradas.
                  </div>
                ) : (
                  sessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-full bg-primary/10 text-primary">
                          {s.userAgent?.toLowerCase().includes("mobi") ? (
                            <Smartphone className="h-5 w-5" />
                          ) : (
                            <Laptop className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">
                              {s.ip || "Dispositivo conectado"}
                            </p>
                            {s.isCurrent && (
                              <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold border-emerald-200">
                                Sesión Actual
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground max-w-xs truncate">
                            {s.userAgent || "Navegador Web"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Activo: {s.lastSeenAt ? new Date(s.lastSeenAt).toLocaleString("es-AR") : "Recientemente"}
                          </p>
                        </div>
                      </div>

                      {!s.isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevoke(s.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Estado de Cuenta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b">
                  <span className="text-muted-foreground">Estado</span>
                  <Badge variant="outline" className="capitalize text-emerald-700 font-semibold">
                    {user?.status || "Activa"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b">
                  <span className="text-muted-foreground">Correo</span>
                  <span className="font-medium text-foreground">{user?.email}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b">
                  <span className="text-muted-foreground">Rol Asignado</span>
                  <span className="font-semibold text-primary capitalize">{user?.role || "Comprador"}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-muted-foreground">Verificación de Correo</span>
                  {user?.emailVerified ? (
                    <span className="flex items-center text-emerald-600 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Verificado
                    </span>
                  ) : (
                    <span className="flex items-center text-amber-600 font-medium">
                      <AlertCircle className="h-3.5 w-3.5 mr-1" /> Pendiente
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
