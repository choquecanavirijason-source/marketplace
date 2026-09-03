"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserPlus, ShoppingBag, Store, Building2, Mail, Lock, Phone, User, CheckCircle2, Eye, EyeOff } from "lucide-react";

interface RegisterFormProps {
  onSuccess?: () => void;
}

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const router = useRouter();
  const { register } = useAuth();

  const [accountType, setAccountType] = useState<"buyer" | "seller_individual" | "seller_company">("buyer");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [legalName, setLegalName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [fiscalAddress, setFiscalAddress] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      toast.error("Debes aceptar los términos y condiciones para registrarte.");
      return;
    }

    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if ((accountType === "seller_company" || accountType === "seller_individual") && !taxId) {
      toast.error("El número de identificación fiscal (CUIT/RUT) es requerido para vendedores.");
      return;
    }

    setIsLoading(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await register({
        name: fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email,
        password,
        mobileNumber: phone || undefined,
        phone: phone || undefined,
        type: accountType,
        legalName: accountType === "seller_company" ? legalName || fullName : undefined,
        tradeName: accountType === "seller_company" ? tradeName || fullName : undefined,
        taxId: (accountType === "seller_company" || accountType === "seller_individual") ? taxId : undefined,
        fiscalAddress: fiscalAddress || undefined,
        termsAccepted: true,
      });

      toast.success("¡Cuenta creada exitosamente! Bienvenido.");
      if (onSuccess) onSuccess();
      else router.push("/account/dashboard");
    } catch (err: any) {
      toast.error(err?.message || "No se pudo completar el registro. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-lg border-border/60">
      <CardHeader className="text-center space-y-1 pb-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
          <UserPlus className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Crear una Cuenta</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Selecciona tu perfil de usuario para comenzar
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Tipo de Cuenta</Label>
            <RadioGroup
              value={accountType}
              onValueChange={(v) => setAccountType(v as any)}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              <Label
                htmlFor="r-buyer"
                className={`flex flex-col items-center justify-between rounded-lg border-2 p-3.5 hover:bg-muted/40 cursor-pointer text-center transition-all ${
                  accountType === "buyer" ? "border-primary bg-primary/5" : "border-muted"
                }`}
              >
                <RadioGroupItem value="buyer" id="r-buyer" className="sr-only" />
                <ShoppingBag className="h-6 w-6 mb-2 text-primary" />
                <span className="font-semibold text-xs sm:text-sm">Comprador</span>
                <span className="text-[11px] text-muted-foreground mt-1">Para compras personales</span>
              </Label>

              <Label
                htmlFor="r-seller-ind"
                className={`flex flex-col items-center justify-between rounded-lg border-2 p-3.5 hover:bg-muted/40 cursor-pointer text-center transition-all ${
                  accountType === "seller_individual" ? "border-primary bg-primary/5" : "border-muted"
                }`}
              >
                <RadioGroupItem value="seller_individual" id="r-seller-ind" className="sr-only" />
                <Store className="h-6 w-6 mb-2 text-amber-600" />
                <span className="font-semibold text-xs sm:text-sm">Vendedor Ind.</span>
                <span className="text-[11px] text-muted-foreground mt-1">Para profesionales</span>
              </Label>

              <Label
                htmlFor="r-seller-comp"
                className={`flex flex-col items-center justify-between rounded-lg border-2 p-3.5 hover:bg-muted/40 cursor-pointer text-center transition-all ${
                  accountType === "seller_company" ? "border-primary bg-primary/5" : "border-muted"
                }`}
              >
                <RadioGroupItem value="seller_company" id="r-seller-comp" className="sr-only" />
                <Building2 className="h-6 w-6 mb-2 text-purple-600" />
                <span className="font-semibold text-xs sm:text-sm">Empresa</span>
                <span className="text-[11px] text-muted-foreground mt-1">Ferreterías e industrias</span>
              </Label>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reg-firstname">Nombre</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reg-firstname"
                  placeholder="Juan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-lastname">Apellido</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reg-lastname"
                  placeholder="Pérez"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reg-email">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="juan@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-phone">Teléfono / Celular</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reg-phone"
                  type="tel"
                  placeholder="+54 11 1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {(accountType === "seller_company" || accountType === "seller_individual") && (
            <div className="rounded-lg border border-primary/20 bg-muted/30 p-4 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Datos Comerciales
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-taxid" className="text-xs">Identificación Fiscal (CUIT / RUT)</Label>
                  <Input
                    id="reg-taxid"
                    placeholder="30-12345678-9"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    required
                  />
                </div>

                {accountType === "seller_company" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-legalname" className="text-xs">Razón Social</Label>
                    <Input
                      id="reg-legalname"
                      placeholder="Empresa S.R.L."
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              {accountType === "seller_company" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-tradename" className="text-xs">Nombre Fantasía</Label>
                    <Input
                      id="reg-tradename"
                      placeholder="Ferretería Central"
                      value={tradeName}
                      onChange={(e) => setTradeName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-fiscaladdress" className="text-xs">Domicilio Fiscal</Label>
                    <Input
                      id="reg-fiscaladdress"
                      placeholder="Av. Corrientes 1234, CABA"
                      value={fiscalAddress}
                      onChange={(e) => setFiscalAddress(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-start space-x-2 pt-1">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(c) => setTermsAccepted(Boolean(c))}
            />
            <Label htmlFor="terms" className="text-xs leading-relaxed font-normal text-muted-foreground cursor-pointer">
              Acepto los{" "}
              <Link href="/terms" className="text-primary hover:underline font-medium">
                Términos y Condiciones
              </Link>{" "}
              y la{" "}
              <Link href="/privacy" className="text-primary hover:underline font-medium">
                Política de Privacidad
              </Link>{" "}
              del Marketplace.
            </Label>
          </div>

          <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
            {isLoading ? "Creando tu cuenta..." : "Completar Registro"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center text-sm border-t border-border/40 py-3">
        <p className="text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/account/login" className="font-semibold text-primary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};
