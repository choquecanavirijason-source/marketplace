"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Save,
  KeyRound,
  Coins,
  Store,
  Bell,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const AdminSettingsPage = () => {
  const [isSaving, setIsSaving] = useState(false);

  const [storeName, setStoreName] = useState("FerroMax 360 Marketplace");
  const [legalName, setLegalName] = useState("FerroMax Soluciones Comerciales S.R.L.");
  const [taxId, setTaxId] = useState("1029384756");
  const [supportEmail, setSupportEmail] = useState("soporte@ferromax.bo");
  const [supportPhone, setSupportPhone] = useState("+591 70012345");

  const [defaultCurrency, setDefaultCurrency] = useState("BOB");
  const [secondaryCurrency, setSecondaryCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState("6.96");

  const [taxPercentage, setTaxPercentage] = useState("13");
  const [minStockAlert, setMinStockAlert] = useState("5");
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success("Configuración guardada exitosamente");
    } catch {
      toast.error("Error al guardar la configuración");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <Store className="size-7 text-primary" />
            Configuración General
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Administra los parámetros de la plataforma, monedas, identidad comercial y alertas
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="font-bold flex items-center gap-2 cursor-pointer shadow-sm"
        >
          {isSaving ? (
            <div className="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Building2 className="size-4.5 text-primary" />
                Identidad de la Plataforma
              </CardTitle>
              <CardDescription className="text-xs">
                Información institucional que aparecerá en comprobantes y comunicaciones públicas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="storeName" className="text-xs font-semibold">
                    Nombre Comercial
                  </Label>
                  <Input
                    id="storeName"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="legalName" className="text-xs font-semibold">
                    Razón Social
                  </Label>
                  <Input
                    id="legalName"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="taxId" className="text-xs font-semibold">
                    NIT / RUC
                  </Label>
                  <Input
                    id="taxId"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supportEmail" className="text-xs font-semibold">
                    Email de Soporte
                  </Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supportPhone" className="text-xs font-semibold">
                    Teléfono de Contacto
                  </Label>
                  <Input
                    id="supportPhone"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Coins className="size-4.5 text-primary" />
                Moneda & Precios
              </CardTitle>
              <CardDescription className="text-xs">
                Definición de moneda principal, tipo de cambio oficial y cálculo impositivo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="defaultCurrency" className="text-xs font-semibold">
                    Moneda Principal
                  </Label>
                  <Input
                    id="defaultCurrency"
                    value={defaultCurrency}
                    onChange={(e) => setDefaultCurrency(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="secondaryCurrency" className="text-xs font-semibold">
                    Moneda Secundaria
                  </Label>
                  <Input
                    id="secondaryCurrency"
                    value={secondaryCurrency}
                    onChange={(e) => setSecondaryCurrency(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="exchangeRate" className="text-xs font-semibold">
                    Tipo de Cambio (BOB / USD)
                  </Label>
                  <Input
                    id="exchangeRate"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="taxPercentage" className="text-xs font-semibold">
                    IVA / Impuesto a Ventas (%)
                  </Label>
                  <Input
                    id="taxPercentage"
                    type="number"
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="minStockAlert" className="text-xs font-semibold">
                    Alerta de Stock Mínimo (Unidades)
                  </Label>
                  <Input
                    id="minStockAlert"
                    type="number"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-primary/25 bg-gradient-to-br from-card via-card to-primary/5 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <KeyRound className="size-4 text-primary" />
                Seguridad & Accesos
              </CardTitle>
              <CardDescription className="text-xs">
                Configura autenticación de usuarios, proveedores OAuth y sesiones.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Gestiona login con Google, Facebook, Apple, validación OTP móvil y expiración de tokens JWT.
              </p>
            </CardContent>
            <CardFooter className="pt-1">
              <Button asChild variant="outline" className="w-full text-xs font-bold gap-2">
                <Link href="/admin/auth-settings">
                  <span>Ir a Métodos de Acceso</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-border/70 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Bell className="size-4 text-primary" />
                Alertas & Estado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <Label className="text-xs font-semibold">Alertas por Correo</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Avisar ventas y faltantes de inventario
                  </p>
                </div>
                <Switch
                  checked={emailAlertsEnabled}
                  onCheckedChange={setEmailAlertsEnabled}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-2">
                <div>
                  <Label className="text-xs font-semibold">Modo Mantenimiento</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Suspender temporalmente compras en el storefront
                  </p>
                </div>
                <Switch
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
