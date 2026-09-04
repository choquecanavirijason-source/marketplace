"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout, customerNavItems } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Laptop, Smartphone, LogOut, ArrowLeft, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import type { UserSessionItem } from "@/types";
import { HttpAuthRepository } from "@/services/auth.service";

const ProfileSecurityPage = () => {
  const { user, logoutAll } = useAuth();
  const authService = new HttpAuthRepository();

  const [sessions, setSessions] = useState<UserSessionItem[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isRevoking, setIsRevoking] = useState(false);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const res = await authService.getSessions();
      const list = Array.isArray(res) ? res : Array.isArray((res as any)?.data) ? (res as any).data : [];
      setSessions(list);
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
      setSessions((prev) => (Array.isArray(prev) ? prev.filter((s) => s.id !== sessionId) : []));
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

  const safeSessions = Array.isArray(sessions) ? sessions : [];

  return (
    <ProtectedRoute>
      <DashboardLayout navItems={customerNavItems} title="Seguridad & Sesiones">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/account/profile" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <ArrowLeft className="h-3.5 w-3.5" /> Volver a Mi Perfil
                </Link>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Seguridad & Dispositivos
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
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
                  {safeSessions.length > 1 && (
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
                  ) : safeSessions.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      No se encontraron sesiones adicionales registradas.
                    </div>
                  ) : (
                    safeSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card/50 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Smartphone className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-foreground">
                                {session.userAgent || session.deviceId || "Dispositivo Web"}
                              </p>
                              {session.isCurrent && (
                                <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold border-0">
                                  Esta sesión
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              IP: {session.ip || "Desconocida"} • Última actividad:{" "}
                              {session.lastSeenAt
                                ? new Date(session.lastSeenAt).toLocaleString("es-ES", {
                                    day: "2-digit",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Reciente"}
                            </p>
                          </div>
                        </div>

                        {!session.isCurrent && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevoke(session.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Revocar
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
                <CardContent className="space-y-4 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground">Correo Verificado</span>
                    {user?.emailVerified ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Sí
                      </span>
                    ) : (
                      <span className="text-amber-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" /> Pendiente
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground">Celular Verificado</span>
                    {user?.phoneVerified ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Sí
                      </span>
                    ) : (
                      <span className="text-muted-foreground">No registrado</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Tokens Seguros</span>
                    <span className="text-emerald-600 font-semibold">JWT + Refresh Activo</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ProfileSecurityPage;
