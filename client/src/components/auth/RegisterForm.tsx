"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useAuthStore } from "@/hooks/useAuth";
import { HttpAuthRepository } from "@/services/auth.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  UserPlus,
  ShoppingBag,
  Store,
  Building2,
  Mail,
  Lock,
  CheckCircle2,
  Eye,
  EyeOff,
  Smartphone,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { PhoneCountryInput } from "@/components/ui/phone-country-input";

interface RegisterFormProps {
  onSuccess?: () => void;
}

type Step = 1 | 2 | 3;
type AccountType = "buyer" | "seller_individual" | "seller_company";

const authService = new HttpAuthRepository();

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account/dashboard";

  const { register, refreshUser } = useAuth();

  const [currentStep, setCurrentStep] = useState<Step>(1);

  const [accountType, setAccountType] = useState<AccountType>("buyer");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Bolivia");
  const [phoneCountry, setPhoneCountry] = useState("BO");
  const [legalName, setLegalName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [fiscalAddress, setFiscalAddress] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(true);

  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const finishRegistration = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      router.push(redirectTo);
    }
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!termsAccepted) {
      setErrorMessage("Debes aceptar los términos y condiciones para continuar.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if ((accountType === "seller_company" || accountType === "seller_individual") && !taxId.trim()) {
      setErrorMessage("El número de identificación fiscal (CUIT/RUT) es requerido para vendedores.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await register({
        name: fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || undefined,
        mobileNumber: phone.trim() || undefined,
        country: country.trim() || undefined,
        phoneCountry: phoneCountry.trim() || undefined,
        type: accountType,
        legalName: legalName.trim() || undefined,
        tradeName: tradeName.trim() || undefined,
        taxId: taxId.trim() || undefined,
        fiscalAddress: fiscalAddress.trim() || undefined,
        termsAccepted: true,
      });

      try {
        await authService.sendEmailOtp(email.trim().toLowerCase());
        toast.info("Te enviamos un código de verificación a tu correo.");
      } catch {
      }

      setCurrentStep(2);
      toast.success("¡Cuenta creada exitosamente!");
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo crear la cuenta. Verifica los datos ingresados."
      );
      toast.error("Error al registrar la cuenta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmailOtp = async () => {
    if (!email) return;
    setIsSendingEmailOtp(true);
    try {
      await authService.sendEmailOtp(email.trim().toLowerCase());
      toast.success("Código reenviado a tu correo.");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "No se pudo reenviar el código.");
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOtp.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await authService.verifyEmail(email.trim().toLowerCase(), emailOtp.trim());
      setEmailVerified(true);
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.setState({ user: { ...currentUser, emailVerified: true } });
      }
      if (refreshUser) {
        void refreshUser();
      }
      toast.success("¡Correo verificado con éxito!");
      setCurrentStep(3);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.detail || err?.message || "Código inválido o expirado.");
      toast.error("El código de correo no es válido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipEmail = () => {
    setCurrentStep(3);
  };

  const handleSendPhoneOtp = async () => {
    if (!phone.trim()) {
      toast.error("Ingresa un número de celular válido.");
      return;
    }
    setIsSendingPhoneOtp(true);
    try {
      await authService.sendPhoneOtp?.(phone.trim());
      toast.success("Código enviado por SMS a tu celular.");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Error al enviar código al celular.");
    } finally {
      setIsSendingPhoneOtp(false);
    }
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOtp.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await authService.verifyPhoneOtp?.(phone.trim(), phoneOtp.trim());
      setPhoneVerified(true);
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.setState({ user: { ...currentUser, phoneVerified: true } });
      }
      if (refreshUser) {
        void refreshUser();
      }
      toast.success("¡Celular verificado exitosamente!");
      finishRegistration();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.detail || err?.message || "Código de celular inválido.");
      toast.error("El código de teléfono no es válido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipPhone = () => {
    finishRegistration();
  };

  return (
    <Card className="w-full max-w-xl mx-auto border-border shadow-xl rounded-3xl overflow-hidden bg-background">
      <div className="bg-muted/40 border-b border-border/80 px-6 py-4">
        <div className="flex items-center justify-between">
          {[
            { step: 1, label: "Cuenta", icon: UserPlus },
            { step: 2, label: "Email", icon: Mail },
            { step: 3, label: "Celular", icon: Smartphone },
          ].map((item, idx) => {
            const Icon = item.icon;
            const isDone = currentStep > item.step || (item.step === 2 && emailVerified) || (item.step === 3 && phoneVerified);
            const isCurrent = currentStep === item.step;
            return (
              <React.Fragment key={item.step}>
                {idx > 0 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-colors ${
                      currentStep >= item.step ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-xs font-semibold hidden sm:inline ${
                      isCurrent ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <CardHeader className="pt-6 pb-2 text-center">
        {currentStep === 1 && (
          <>
            <CardTitle className="text-2xl font-bold tracking-tight">Crear Cuenta</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Comienza a operar en FerroMax Marketplace en pocos pasos
            </CardDescription>
          </>
        )}
        {currentStep === 2 && (
          <>
            <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-1">
              <Mail className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight">Paso 2: Verificá tu Correo</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Enviamos un código de verificación a <strong>{email}</strong>
            </CardDescription>
          </>
        )}
        {currentStep === 3 && (
          <>
            <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-1">
              <Smartphone className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight">Paso 3: Verificá tu Celular</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Asegura tu cuenta para recibir alertas de envíos y notificaciones
            </CardDescription>
          </>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {errorMessage && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {currentStep === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tipo de Cuenta
              </Label>
              <RadioGroup
                value={accountType}
                onValueChange={(v) => setAccountType(v as AccountType)}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2"
              >
                <div>
                  <RadioGroupItem value="buyer" id="type-buyer" className="peer sr-only" />
                  <Label
                    htmlFor="type-buyer"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer text-center h-full transition-all"
                  >
                    <ShoppingBag className="mb-1 h-5 w-5 text-primary" />
                    <span className="text-xs font-bold">Comprador</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Compras personales</span>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value="seller_individual" id="type-seller-ind" className="peer sr-only" />
                  <Label
                    htmlFor="type-seller-ind"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer text-center h-full transition-all"
                  >
                    <Store className="mb-1 h-5 w-5 text-primary" />
                    <span className="text-xs font-bold">Vendedor Ind.</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Profesionales / Oficios</span>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value="seller_company" id="type-seller-co" className="peer sr-only" />
                  <Label
                    htmlFor="type-seller-co"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer text-center h-full transition-all"
                  >
                    <Building2 className="mb-1 h-5 w-5 text-primary" />
                    <span className="text-xs font-bold">Empresa</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Ferreterías / Mayoristas</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="reg-first-name" className="text-xs font-bold uppercase tracking-wider">
                  Nombre *
                </Label>
                <Input
                  id="reg-first-name"
                  type="text"
                  placeholder="Juan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-last-name" className="text-xs font-bold uppercase tracking-wider">
                  Apellido *
                </Label>
                <Input
                  id="reg-last-name"
                  type="text"
                  placeholder="Pérez"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="reg-email" className="text-xs font-bold uppercase tracking-wider">
                  Correo Electrónico *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="juan@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-phone" className="text-xs font-bold uppercase tracking-wider">
                  Teléfono / Celular
                </Label>
                <PhoneCountryInput
                  id="reg-phone"
                  value={phone}
                  countryCode={phoneCountry}
                  onChange={(fullPhone, code, cName) => {
                    setPhone(fullPhone);
                    setPhoneCountry(code);
                    setCountry(cName);
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-password" className="text-xs font-bold uppercase tracking-wider">
                Contraseña *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 rounded-xl"
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
              <div className="rounded-2xl border border-primary/20 bg-muted/30 p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Datos Comerciales
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-legal-name" className="text-xs font-bold uppercase tracking-wider">
                      Razón Social *
                    </Label>
                    <Input
                      id="reg-legal-name"
                      placeholder="Ferretería Industrial S.A."
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-tax-id" className="text-xs font-bold uppercase tracking-wider">
                      CUIT / RUT / NIF *
                    </Label>
                    <Input
                      id="reg-tax-id"
                      placeholder="30-12345678-9"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-trade-name" className="text-xs font-bold uppercase tracking-wider">
                      Nombre Comercial
                    </Label>
                    <Input
                      id="reg-trade-name"
                      placeholder="FerroMax Central"
                      value={tradeName}
                      onChange={(e) => setTradeName(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-fiscal-address" className="text-xs font-bold uppercase tracking-wider">
                      Dirección Fiscal
                    </Label>
                    <Input
                      id="reg-fiscal-address"
                      placeholder="Av. Industrial 1234"
                      value={fiscalAddress}
                      onChange={(e) => setFiscalAddress(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="reg-terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(!!checked)}
              />
              <Label htmlFor="reg-terms" className="text-xs text-muted-foreground leading-normal cursor-pointer">
                Acepto los{" "}
                <Link href="/terms" className="text-primary underline font-medium" target="_blank">
                  Términos del Servicio
                </Link>{" "}
                y la{" "}
                <Link href="/privacy" className="text-primary underline font-medium" target="_blank">
                  Política de Privacidad
                </Link>
                .
              </Label>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Creando cuenta..." : "Crear Cuenta y Continuar"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}

        {currentStep === 2 && (
          <form onSubmit={handleVerifyEmail} className="space-y-4 py-2">
            <div className="rounded-2xl bg-muted/40 p-4 space-y-2 text-center">
              <p className="text-xs text-muted-foreground">
                Te enviamos un código numérico de 6 dígitos a:
              </p>
              <p className="text-sm font-bold text-foreground">{email}</p>
              <button
                type="button"
                onClick={handleResendEmailOtp}
                disabled={isSendingEmailOtp}
                className="text-xs text-primary hover:underline font-semibold inline-flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSendingEmailOtp ? "animate-spin" : ""}`} />
                {isSendingEmailOtp ? "Reenviando..." : "¿No recibiste el código? Reenviar"}
              </button>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email-otp-input" className="text-xs font-bold text-foreground uppercase tracking-wider text-center block">
                Código de 6 dígitos
              </Label>
              <Input
                id="email-otp-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl font-bold tracking-widest h-12 rounded-xl"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleSkipEmail}
                className="w-full sm:w-auto text-xs text-muted-foreground hover:text-foreground rounded-xl order-2 sm:order-1"
              >
                Omitir o dejar para más adelante
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || emailOtp.trim().length < 4}
                className="w-full sm:flex-1 h-11 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm order-1 sm:order-2"
              >
                {isSubmitting ? "Confirmando..." : "Confirmar Email"}
              </Button>
            </div>
          </form>
        )}

        {currentStep === 3 && (
          <form onSubmit={handleVerifyPhone} className="space-y-4 py-2">
            <div className="rounded-2xl bg-muted/40 p-4 space-y-3 text-center">
              <p className="text-xs text-muted-foreground">
                Número de teléfono registrado:
              </p>
              <div className="flex items-center justify-center gap-2">
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+54 11 1234-5678"
                  className="max-w-[240px] text-center font-semibold rounded-xl h-9 text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSendPhoneOtp}
                  disabled={isSendingPhoneOtp || !phone.trim()}
                  className="rounded-xl text-xs h-9"
                >
                  {isSendingPhoneOtp ? "Enviando..." : "Enviar SMS"}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone-otp-input" className="text-xs font-bold text-foreground uppercase tracking-wider text-center block">
                Código recibido por celular
              </Label>
              <Input
                id="phone-otp-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={phoneOtp}
                onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl font-bold tracking-widest h-12 rounded-xl"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleSkipPhone}
                className="w-full sm:w-auto text-xs text-muted-foreground hover:text-foreground rounded-xl order-2 sm:order-1"
              >
                Omitir y finalizar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || phoneOtp.trim().length < 4}
                className="w-full sm:flex-1 h-11 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm order-1 sm:order-2"
              >
                {isSubmitting ? "Verificando..." : "Confirmar Celular y Finalizar"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/80 py-4 bg-muted/20">
        <p className="text-xs text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/account/login" className="text-primary font-bold hover:underline">
            Inicia Sesión
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};
