"use client";

import React, { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Building2, Phone, Mail, Globe, CheckCircle2, Shield } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, updateProfile, updateBusinessProfile } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [legalName, setLegalName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [fiscalAddress, setFiscalAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || user.mobileNumber || "");
      setAddress(user.address || "");
      if (user.businessProfile) {
        setLegalName(user.businessProfile.legalName || "");
        setTradeName(user.businessProfile.tradeName || "");
        setTaxId(user.businessProfile.taxId || "");
        setFiscalAddress(user.businessProfile.fiscalAddress || "");
      }
    }
  }, [user]);

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile({
        name,
        mobileNumber: phone || undefined,
        address: address || undefined,
      });
      toast.success("Perfil personal actualizado exitosamente.");
    } catch (err: any) {
      toast.error(err?.message || "Error al actualizar perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (updateBusinessProfile) {
        await updateBusinessProfile({
          legalName,
          tradeName,
          taxId,
          fiscalAddress,
        });
      }
      toast.success("Perfil comercial actualizado exitosamente.");
    } catch (err: any) {
      toast.error(err?.message || "Error al actualizar datos de empresa.");
    } finally {
      setIsLoading(false);
    }
  };

  const isSeller = user?.role?.includes("seller");
  const completionPct = user?.completionPct ?? 50;

  return (
    <ProtectedRoute>
      <div className="container max-w-4xl mx-auto py-8 px-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mi Perfil</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona tu información personal, datos fiscales y configuración de cuenta
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/account/profile/security">
              <Button variant="outline" size="sm">
                <Shield className="mr-2 h-4 w-4" /> Seguridad & Sesiones
              </Button>
            </Link>
          </div>
        </div>

        <Card className="border-border/60 bg-gradient-to-r from-primary/5 via-background to-background">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary font-bold text-xl flex items-center justify-center">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">{user?.name || "Usuario"}</h2>
                    <Badge variant="secondary" className="capitalize">{user?.role || "Comprador"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="w-full sm:w-48 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Completitud de Perfil</span>
                  <span>{completionPct}%</span>
                </div>
                <Progress value={completionPct} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Datos Personales
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Perfil Comercial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información Personal</CardTitle>
                <CardDescription>Tus datos identificatorios dentro de la plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePersonalSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prof-name">Nombre y Apellido</Label>
                      <Input
                        id="prof-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prof-phone">Teléfono / Móvil</Label>
                      <Input
                        id="prof-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+54 11 1234-5678"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prof-address">Dirección Principal</Label>
                    <Input
                      id="prof-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Calle, Número, Ciudad"
                    />
                  </div>

                  <Button type="submit" disabled={isLoading} className="font-semibold">
                    {isLoading ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Datos Comerciales e Impositivos</CardTitle>
                <CardDescription>
                  Requerido para la emisión de facturas y operación de tiendas de venta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBusinessSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bus-legal">Razón Social</Label>
                      <Input
                        id="bus-legal"
                        value={legalName}
                        onChange={(e) => setLegalName(e.target.value)}
                        placeholder="Ferretería Central S.A."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bus-trade">Nombre de Fantasía</Label>
                      <Input
                        id="bus-trade"
                        value={tradeName}
                        onChange={(e) => setTradeName(e.target.value)}
                        placeholder="Ferretería Central"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bus-tax">Identificación Fiscal (CUIT / RUT)</Label>
                      <Input
                        id="bus-tax"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        placeholder="30-12345678-9"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bus-address">Domicilio Fiscal</Label>
                      <Input
                        id="bus-address"
                        value={fiscalAddress}
                        onChange={(e) => setFiscalAddress(e.target.value)}
                        placeholder="Av. Rivadavia 4500, CABA"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading} className="font-semibold">
                    {isLoading ? "Actualizando..." : "Actualizar Datos Comerciales"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
