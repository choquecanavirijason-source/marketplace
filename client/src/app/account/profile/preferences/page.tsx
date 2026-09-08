"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Bell,
  Globe,
  Shield,
  Eye,
  Save,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface PreferencesState {
  orderUpdatesEmail: boolean;
  orderUpdatesSms: boolean;
  promotionsEmail: boolean;
  securityAlerts: boolean;
  newsletterMonthly: boolean;
  currency: string;
  language: string;
  showNameInReviews: boolean;
  saveBrowsingHistory: boolean;
}

const INITIAL_PREFERENCES: PreferencesState = {
  orderUpdatesEmail: true,
  orderUpdatesSms: true,
  promotionsEmail: false,
  securityAlerts: true,
  newsletterMonthly: true,
  currency: "ARS",
  language: "es",
  showNameInReviews: true,
  saveBrowsingHistory: true,
};

const AccountPreferencesPage = () => {
  const [prefs, setPrefs] = useState<PreferencesState>(INITIAL_PREFERENCES);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key: keyof PreferencesState) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelect = (key: keyof PreferencesState, value: string) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSaving(false);
    toast.success("Preferencias guardadas exitosamente.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link
              href="/account/profile"
              className="hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="size-3.5" /> Volver a Mi Perfil
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Settings className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Preferencias de la Cuenta
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Personaliza notificaciones, idioma, moneda y privacidad
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-xl font-bold text-xs gap-1.5 self-start sm:self-center"
        >
          <Save className="size-3.5" />
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>

      {/* Notifications Section */}
      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            <CardTitle className="text-base">Notificaciones y Alertas</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Elige los canales y avisos que deseas recibir en tus dispositivos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-1">
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <div className="space-y-0.5">
              <Label className="text-xs font-bold text-foreground">
                Actualizaciones de pedidos por correo
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Confirmación de compra, despacho y aviso de entrega en tu casilla
              </p>
            </div>
            <Switch
              checked={prefs.orderUpdatesEmail}
              onCheckedChange={() => handleToggle("orderUpdatesEmail")}
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <div className="space-y-0.5">
              <Label className="text-xs font-bold text-foreground">
                Alertas SMS / WhatsApp para entregas
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Mensaje instantáneo cuando el transportista esté próximo a tu domicilio
              </p>
            </div>
            <Switch
              checked={prefs.orderUpdatesSms}
              onCheckedChange={() => handleToggle("orderUpdatesSms")}
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <div className="space-y-0.5">
              <Label className="text-xs font-bold text-foreground">
                Promociones exclusivas y cupones de descuento
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Ofertas personalizadas según las categorías que más compras
              </p>
            </div>
            <Switch
              checked={prefs.promotionsEmail}
              onCheckedChange={() => handleToggle("promotionsEmail")}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label className="text-xs font-bold text-foreground">
                Alertas de seguridad e inicios de sesión
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Aviso preventivo si se detecta un ingreso desde un dispositivo o IP desconocida
              </p>
            </div>
            <Switch
              checked={prefs.securityAlerts}
              onCheckedChange={() => handleToggle("securityAlerts")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-primary" />
            <CardTitle className="text-base">Ajustes Regionales</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Selecciona la moneda principal e idioma de visualización de precios
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Moneda predeterminada</Label>
            <Select
              value={prefs.currency}
              onValueChange={(val) => handleSelect("currency", val)}
            >
              <SelectTrigger className="rounded-xl text-xs">
                <SelectValue placeholder="Seleccionar moneda" />
              </SelectTrigger>
              <SelectContent className="rounded-xl text-xs">
                <SelectItem value="ARS">Pesos Argentinos (ARS $)</SelectItem>
                <SelectItem value="USD">Dólares Estadounidenses (USD $)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Idioma de la interfaz</Label>
            <Select
              value={prefs.language}
              onValueChange={(val) => handleSelect("language", val)}
            >
              <SelectTrigger className="rounded-xl text-xs">
                <SelectValue placeholder="Seleccionar idioma" />
              </SelectTrigger>
              <SelectContent className="rounded-xl text-xs">
                <SelectItem value="es">Español (Argentina)</SelectItem>
                <SelectItem value="en">English (US)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-primary" />
            <CardTitle className="text-base">Privacidad y Datos</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Controla la visibilidad de tu perfil ante otros usuarios del marketplace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-1">
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <div className="space-y-0.5">
              <Label className="text-xs font-bold text-foreground">
                Mostrar mi nombre en reseñas públicas
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Si se desactiva, tus opiniones se mostrarán como "Comprador anónimo"
              </p>
            </div>
            <Switch
              checked={prefs.showNameInReviews}
              onCheckedChange={() => handleToggle("showNameInReviews")}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label className="text-xs font-bold text-foreground">
                Guardar historial de productos vistos
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Permite sugerirte repuestos y accesorios compatibles en tu próxima visita
              </p>
            </div>
            <Switch
              checked={prefs.saveBrowsingHistory}
              onCheckedChange={() => handleToggle("saveBrowsingHistory")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountPreferencesPage;
