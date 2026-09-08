"use client";

import { useState, useEffect } from "react";
import { Store, CheckCircle2, AlertCircle, Save, Globe } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { sellerService } from "@/services/seller.service";

export const SellerStorePage = () => {
  const { user, refreshUser } = useAuth();
  const profile = user?.sellerProfile;

  const [storeName, setStoreName] = useState(profile?.storeName || "");
  const [storeSlug, setStoreSlug] = useState(profile?.storeSlug || "");
  const [description, setDescription] = useState(profile?.description || "");
  const [logoUrl, setLogoUrl] = useState(profile?.logoUrl || "");
  const [bannerUrl, setBannerUrl] = useState(profile?.bannerUrl || "");
  const [taxId, setTaxId] = useState(profile?.taxId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setStoreName(profile.storeName || "");
      setStoreSlug(profile.storeSlug || "");
      setDescription(profile.description || "");
      setLogoUrl(profile.logoUrl || "");
      setBannerUrl(profile.bannerUrl || "");
      setTaxId(profile.taxId || "");
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      toast.error("El nombre de la tienda es requerido.");
      return;
    }

    setIsSubmitting(true);
    try {
      await sellerService.upsertProfile({
        storeName: storeName.trim(),
        storeSlug: storeSlug.trim() || undefined,
        description: description.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
        bannerUrl: bannerUrl.trim() || undefined,
        taxId: taxId.trim() || undefined,
      });

      toast.success("Perfil de tienda actualizado correctamente.");
      await refreshUser();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          err?.message ||
          "Error al actualizar la tienda."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div>
        <h1 className="text-2xl font-black text-foreground">Configuración de Mi Tienda</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Personaliza la identidad pública y los datos comerciales de tu negocio
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="rounded-3xl border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-3 pb-2 border-b border-border">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Store className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Identidad Comercial</h2>
              <p className="text-xs text-muted-foreground">Datos visibles para compradores en el marketplace</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="storeName" className="text-xs font-bold text-foreground">
                Nombre Comercial de la Tienda *
              </Label>
              <Input
                id="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="h-10 text-xs rounded-xl"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="storeSlug" className="text-xs font-bold text-foreground">
                Identificador URL (Slug)
              </Label>
              <Input
                id="storeSlug"
                value={storeSlug}
                onChange={(e) => setStoreSlug(e.target.value)}
                placeholder="ej: ferreteria-central"
                className="h-10 text-xs rounded-xl"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-bold text-foreground">
              Descripción de la Tienda
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe los productos que ofreces, tu experiencia, horarios de despacho y políticas..."
              className="text-xs rounded-xl min-h-[100px]"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="logoUrl" className="text-xs font-bold text-foreground">
                URL del Logo
              </Label>
              <Input
                id="logoUrl"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://ejemplo.com/logo.png"
                className="h-10 text-xs rounded-xl"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bannerUrl" className="text-xs font-bold text-foreground">
                URL del Banner
              </Label>
              <Input
                id="bannerUrl"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://ejemplo.com/banner.jpg"
                className="h-10 text-xs rounded-xl"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:w-1/2">
            <Label htmlFor="taxId" className="text-xs font-bold text-foreground">
              Identificación Fiscal / CUIT / RUT
            </Label>
            <Input
              id="taxId"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="30-71234567-8"
              className="h-10 text-xs rounded-xl"
              disabled={isSubmitting}
            />
          </div>

          <div className="pt-3 flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 rounded-xl text-xs font-bold gap-2 px-6"
            >
              <Save className="size-4" />
              {isSubmitting ? "Guardando cambios…" : "Guardar Configuración"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default SellerStorePage;
