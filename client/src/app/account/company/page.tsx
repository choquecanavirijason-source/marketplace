"use client";

import { useState, useEffect } from "react";
import { Building2, Save, CheckCircle2, AlertCircle, ShieldCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";

export const CompanyProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const business = user?.businessProfile;

  const [legalName, setLegalName] = useState(business?.legalName || "");
  const [tradeName, setTradeName] = useState(business?.tradeName || "");
  const [taxId, setTaxId] = useState(business?.taxId || "");
  const [legalType, setLegalType] = useState(business?.legalType || "S.R.L.");
  const [fiscalAddress, setFiscalAddress] = useState(business?.fiscalAddress || "");
  const [billingEmail, setBillingEmail] = useState(business?.billingEmail || user?.email || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (business) {
      setLegalName(business.legalName || "");
      setTradeName(business.tradeName || "");
      setTaxId(business.taxId || "");
      setLegalType(business.legalType || "S.R.L.");
      setFiscalAddress(business.fiscalAddress || "");
      setBillingEmail(business.billingEmail || user?.email || "");
    }
  }, [business, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!legalName.trim() || !taxId.trim()) {
      toast.error("Razón Social y CUIT/RUT son obligatorios.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.updateBusinessProfile({
        legalName: legalName.trim(),
        tradeName: tradeName.trim() || undefined,
        taxId: taxId.trim(),
        legalType: legalType.trim() || undefined,
        fiscalAddress: fiscalAddress.trim() || undefined,
        billingEmail: billingEmail.trim() || undefined,
      });

      toast.success("Perfil corporativo y fiscal guardado exitosamente.");
      await refreshUser();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          err?.message ||
          "Error al actualizar los datos de la empresa."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const reviewStatus = business?.reviewStatus || "pending";

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Modo Empresa & Perfil Fiscal</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Información fiscal y legal para compras corporativas B2B y facturación en FerroMax 360
          </p>
        </div>

        <div className="flex items-center gap-2">
          {reviewStatus === "approved" ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 px-3 py-1 rounded-full">
              <ShieldCheck className="size-4 text-green-600" /> Verificación Fiscal Aprobada
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full">
              <Clock className="size-4 text-amber-600" /> Estado: Pendiente de Verificación
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="rounded-3xl border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-3 pb-2 border-b border-border">
            <div className="size-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Building2 className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Datos de Personería Jurídica</h2>
              <p className="text-xs text-muted-foreground">Datos con los que se emitirán comprobantes y facturas fiscales</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="legalName" className="text-xs font-bold text-foreground">
                Razón Social *
              </Label>
              <Input
                id="legalName"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="Ej: Metales y Herramientas S.R.L."
                className="h-10 text-xs rounded-xl"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tradeName" className="text-xs font-bold text-foreground">
                Nombre de Fantasía (Comercial)
              </Label>
              <Input
                id="tradeName"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                placeholder="Ej: FerroCentral"
                className="h-10 text-xs rounded-xl"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="taxId" className="text-xs font-bold text-foreground">
                Identificación Fiscal (CUIT / RUT / NIT) *
              </Label>
              <Input
                id="taxId"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="Ej: 30-71234567-8"
                className="h-10 text-xs rounded-xl"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="legalType" className="text-xs font-bold text-foreground">
                Tipo Societario
              </Label>
              <Input
                id="legalType"
                value={legalType}
                onChange={(e) => setLegalType(e.target.value)}
                placeholder="Ej: S.A., S.R.L., Responsable Inscripto, Monotributo"
                className="h-10 text-xs rounded-xl"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="billingEmail" className="text-xs font-bold text-foreground">
                Correo para Envío de Facturas
              </Label>
              <Input
                id="billingEmail"
                type="email"
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
                placeholder="facturacion@empresa.com"
                className="h-10 text-xs rounded-xl"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fiscalAddress" className="text-xs font-bold text-foreground">
                Domicilio Fiscal Completo
              </Label>
              <Input
                id="fiscalAddress"
                value={fiscalAddress}
                onChange={(e) => setFiscalAddress(e.target.value)}
                placeholder="Av. Industrial 1234, Parque Industrial"
                className="h-10 text-xs rounded-xl"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 rounded-xl text-xs font-bold gap-2 px-6"
            >
              <Save className="size-4" />
              {isSubmitting ? "Guardando datos fiscales…" : "Guardar Datos de Empresa"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CompanyProfilePage;
