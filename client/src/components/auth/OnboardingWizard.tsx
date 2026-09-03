"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, User, Phone, Building, FileCheck, ArrowRight, ArrowLeft } from "lucide-react";

interface OnboardingWizardProps {
  onComplete?: () => void;
}

export const OnboardingWizard = ({ onComplete }: OnboardingWizardProps) => {
  const router = useRouter();
  const { user, updateProfile, updateBusinessProfile, sendEmailOtp } = useAuth();

  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.name?.split(" ").slice(1).join(" ") || "");
  const [phone, setPhone] = useState(user?.phone || user?.mobileNumber || "");
  const [legalName, setLegalName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [fiscalAddress, setFiscalAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isSeller = user?.role?.includes("seller");
  const totalSteps = isSeller ? 4 : 3;
  const progressPct = Math.round((step / totalSteps) * 100);

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast.error("Ingresa tu nombre.");
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        mobileNumber: phone || undefined,
      });
      toast.success("Información personal guardada.");
      setStep(2);
    } catch (err: any) {
      toast.error(err?.message || "Error al actualizar perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerify = async () => {
    if (!user?.email) return;
    setIsLoading(true);
    try {
      if (sendEmailOtp) {
        await sendEmailOtp(user.email);
        toast.success("Código de validación enviado a tu correo.");
      }
    } catch (err: any) {
      toast.error(err?.message || "No se pudo enviar el código.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSeller) setStep(3);
    else setStep(totalSteps);
  };

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalName || !taxId) {
      toast.error("Razón social y CUIT/Tax ID son obligatorios.");
      return;
    }

    setIsLoading(true);
    try {
      if (updateBusinessProfile) {
        await updateBusinessProfile({
          legalName,
          tradeName: tradeName || legalName,
          taxId,
          fiscalAddress: fiscalAddress || undefined,
        });
      }
      toast.success("Información comercial guardada.");
      setStep(4);
    } catch (err: any) {
      toast.error(err?.message || "Error al actualizar datos comerciales.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    toast.success("¡Onboarding completado exitosamente!");
    if (onComplete) onComplete();
    else router.push("/account/dashboard");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-border/60">
      <CardHeader className="space-y-2 pb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Paso {step} de {totalSteps}
          </span>
          <span className="text-xs text-muted-foreground font-medium">{progressPct}% completado</span>
        </div>
        <Progress value={progressPct} className="h-2" />
        <CardTitle className="text-xl font-bold pt-2">
          {step === 1 && "Paso 1: Completa tu información personal"}
          {step === 2 && "Paso 2: Verificación de contacto"}
          {step === 3 && "Paso 3: Datos de tu negocio o empresa"}
          {step === 4 && "Paso 4: ¡Todo listo!"}
        </CardTitle>
        <CardDescription className="text-sm">
          {step === 1 && "Verifica y actualiza tu nombre para que podamos identificarte."}
          {step === 2 && "Comprueba tus canales de comunicación para recibir notificaciones de compras."}
          {step === 3 && "Ingresa tus datos fiscales para emitir facturas y publicar productos."}
          {step === 4 && "Has configurado tu perfil de manera exitosa."}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ob-firstname">Nombre</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="ob-firstname"
                    placeholder="Tu nombre"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ob-lastname">Apellido</Label>
                <Input
                  id="ob-lastname"
                  placeholder="Tu apellido"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ob-phone">Teléfono de contacto</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="ob-phone"
                  placeholder="+54 11 9876-5432"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Continuar"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Correo Electrónico</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSendVerify}
                  disabled={isLoading}
                >
                  Enviar Código
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver
              </Button>
              <Button type="submit" className="flex-1 font-semibold">
                Siguiente <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        {step === 3 && isSeller && (
          <form onSubmit={handleStep3} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ob-taxid">Identificación Fiscal (CUIT / RUT / RFC)</Label>
              <Input
                id="ob-taxid"
                placeholder="30-12345678-9"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ob-legal">Razón Social</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="ob-legal"
                    placeholder="Empresa S.A."
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ob-trade">Nombre Fantasía</Label>
                <Input
                  id="ob-trade"
                  placeholder="Ferretería Pro"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ob-address">Domicilio Fiscal</Label>
              <Input
                id="ob-address"
                placeholder="Calle 123, Ciudad, Provincia"
                value={fiscalAddress}
                onChange={(e) => setFiscalAddress(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver
              </Button>
              <Button type="submit" className="flex-1 font-semibold" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar y Continuar"}
              </Button>
            </div>
          </form>
        )}

        {step === totalSteps && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold">¡Bienvenido a Ferromax Marketplace!</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Tu cuenta ha sido configurada y lista para operar en el ecosistema.
              </p>
            </div>

            <Button onClick={handleFinish} className="w-full font-semibold">
              Ir a mi Panel de Control <FileCheck className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
