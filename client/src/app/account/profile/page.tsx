"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { EmailVerificationModal } from "@/components/auth/EmailVerificationModal";
import { useAuth, useAuthStore } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Building2,
  Mail,
  CheckCircle2,
  Shield,
  AlertCircle,
  Calendar,
  Globe,
  Coins,
  MapPin,
  Save,
  Lock,
  Camera,
} from "lucide-react";
import { PhoneCountryInput } from "@/components/ui/phone-country-input";
import { ImageCropUpload } from "@/components/common/ImageCropUpload";
import { useApiMutation } from "@/hooks/useApi";
import { userService } from "@/services/user.service";

const ProfilePage = () => {
  const { user, updateProfile, updateBusinessProfile, refreshUser } = useAuth();
  const uploadAvatarMutation = useApiMutation((imageDataUrl: string) => userService.uploadAvatar(imageDataUrl));
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Bolivia");
  const [phoneCountry, setPhoneCountry] = useState("BO");
  const [address, setAddress] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [language, setLanguage] = useState("es");
  const [currency, setCurrency] = useState("ARS");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [legalName, setLegalName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [fiscalAddress, setFiscalAddress] = useState("");

  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const parts = (user.name || "").split(" ");
      setFirstName(user.firstName || parts[0] || "");
      setLastName(user.lastName || parts.slice(1).join(" ") || "");
      setPhone(user.phone || user.mobileNumber || "");
      if (user.country || (user as any).profile?.country) {
        setCountry(user.country || (user as any).profile?.country);
      }
      if (user.phoneCountry || (user as any).profile?.phoneCountry) {
        setPhoneCountry(user.phoneCountry || (user as any).profile?.phoneCountry);
      }
      setAddress(user.address || "");
      setAvatarUrl(user.avatarUrl || (user as any).profile?.avatarUrl || "");
      if (user.businessProfile) {
        setLegalName(user.businessProfile.legalName || "");
        setTradeName(user.businessProfile.tradeName || "");
        setTaxId(user.businessProfile.taxId || "");
        setBillingEmail(user.businessProfile.billingEmail || user.email || "");
        setFiscalAddress(user.businessProfile.fiscalAddress || "");
      }
    }
  }, [user]);

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPersonal(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await updateProfile({
        name: fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        mobileNumber: phone.trim() || undefined,
        country: country.trim() || undefined,
        phoneCountry: phoneCountry.trim() || undefined,
        address: address.trim() || undefined,
        birthDate: birthDate || undefined,
        language,
        currency,
        avatarUrl: avatarUrl.trim() || undefined,
      });

      if (refreshUser) {
        void refreshUser();
      }

      toast.success("Perfil personal actualizado exitosamente.");
    } catch (err: any) {
      toast.error(err?.message || "Error al actualizar perfil.");
    } finally {
      setIsSavingPersonal(false);
    }
  };

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBusiness(true);
    try {
      if (updateBusinessProfile) {
        await updateBusinessProfile({
          legalName: legalName.trim(),
          tradeName: tradeName.trim() || undefined,
          taxId: taxId.trim(),
          billingEmail: billingEmail.trim() || undefined,
          fiscalAddress: fiscalAddress.trim() || undefined,
        });
      }

      if (refreshUser) {
        void refreshUser();
      }

      toast.success("Perfil comercial actualizado exitosamente.");
    } catch (err: any) {
      toast.error(err?.message || "Error al actualizar datos comerciales.");
    } finally {
      setIsSavingBusiness(false);
    }
  };

  const handleSaveAvatar = async (croppedDataUrl: string) => {
    await uploadAvatarMutation.mutateAsync(croppedDataUrl);
    if (refreshUser) {
      await refreshUser();
    }
  };

  const completionPct = user?.completionPct ?? 20;

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Mi Perfil
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Administra tu información personal, datos comerciales y preferencias de cuenta
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm" className="rounded-xl h-9 text-xs font-semibold">
                <Link href="/account/profile/security">
                  <Shield className="mr-2 h-4 w-4 text-primary" /> Seguridad & Dispositivos
                </Link>
              </Button>
            </div>
          </div>

          <Card className="border-border/80 bg-gradient-to-r from-primary/5 via-background to-background rounded-3xl overflow-hidden shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div
                    className="relative group/avatar cursor-pointer shrink-0"
                    onClick={() => setIsAvatarModalOpen(true)}
                    title="Hacé clic para cambiar tu foto de perfil"
                  >
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user?.name || "Foto de perfil"}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/30 shadow-md transition-transform group-hover/avatar:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary font-black text-2xl flex items-center justify-center border border-primary/20 shadow-inner group-hover/avatar:border-primary/50 transition-colors">
                        {firstName?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[1px]">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1 rounded-full shadow border-2 border-background">
                      <Camera className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-foreground">
                        {firstName ? `${firstName} ${lastName}` : user?.name || "Usuario"}
                      </h2>
                      <Badge variant="secondary" className="capitalize text-xs font-semibold rounded-lg">
                        {user?.roleName || user?.role || "Comprador"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{user?.email}</span>
                      {user?.emailVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Verificado
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsVerifyModalOpen(true)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 cursor-pointer transition-colors"
                        >
                          <AlertCircle className="w-3 h-3 text-amber-600" /> Pendiente (Verificar)
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-56 space-y-2 bg-muted/40 p-3.5 rounded-2xl border border-border/60">
                  <div className="flex justify-between text-xs font-bold text-foreground">
                    <span>Nivel del Perfil</span>
                    <span className="text-primary">{completionPct}%</span>
                  </div>
                  <Progress value={completionPct} className="h-2 rounded-full" />
                  <p className="text-[10px] text-muted-foreground">
                    {completionPct >= 80 ? "Perfil completo y verificado" : "Completá tus datos para agilizar compras"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md rounded-2xl p-1 bg-muted/60">
              <TabsTrigger value="personal" className="rounded-xl text-xs font-bold flex items-center gap-2">
                <User className="h-4 w-4" /> Datos Personales
              </TabsTrigger>
              <TabsTrigger value="business" className="rounded-xl text-xs font-bold flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Perfil Comercial
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card className="rounded-3xl border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" /> Información Personal
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Datos personales y de contacto para facturación y entrega
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePersonalSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="prof-first-name" className="text-xs font-bold uppercase tracking-wider">
                          Nombre *
                        </Label>
                        <Input
                          id="prof-first-name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Wilder"
                          className="rounded-xl"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="prof-last-name" className="text-xs font-bold uppercase tracking-wider">
                          Apellido *
                        </Label>
                        <Input
                          id="prof-last-name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Astete"
                          className="rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="prof-email" className="text-xs font-bold uppercase tracking-wider">
                          Correo Electrónico (No editable)
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="prof-email"
                            value={user?.email || ""}
                            disabled
                            className="pl-9 pr-9 rounded-xl bg-muted/50 cursor-not-allowed text-muted-foreground font-medium"
                          />
                          <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="prof-phone" className="text-xs font-bold uppercase tracking-wider">
                          Teléfono / Celular
                        </Label>
                        <PhoneCountryInput
                          id="prof-phone"
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="prof-birth" className="text-xs font-bold uppercase tracking-wider">
                          Fecha de Nacimiento
                        </Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="prof-birth"
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="pl-9 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="prof-lang" className="text-xs font-bold uppercase tracking-wider">
                          Idioma
                        </Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <select
                            id="prof-lang"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-sm outline-none transition focus:border-primary"
                          >
                            <option value="es">Español (ES)</option>
                            <option value="en">English (EN)</option>
                            <option value="pt">Português (PT)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="prof-curr" className="text-xs font-bold uppercase tracking-wider">
                          Moneda Preferida
                        </Label>
                        <div className="relative">
                          <Coins className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <select
                            id="prof-curr"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-sm outline-none transition focus:border-primary"
                          >
                            <option value="ARS">ARS ($ Pesos Argentinos)</option>
                            <option value="USD">USD ($ Dólares)</option>
                            <option value="EUR">EUR (€ Euros)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="prof-address" className="text-xs font-bold uppercase tracking-wider">
                        Dirección de Envío Habitual
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="prof-address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Av. Corrientes 1234, CABA, Argentina"
                          className="pl-9 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSavingPersonal}
                        className="rounded-xl h-10 px-6 text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {isSavingPersonal ? "Guardando..." : "Guardar Cambios"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business" className="space-y-6">
              <Card className="rounded-3xl border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" /> Datos Comerciales e Impositivos
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Información requerida para emitir facturación y operar como vendedor verificado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBusinessSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="bus-legal" className="text-xs font-bold uppercase tracking-wider">
                          Razón Social / Nombre Legal *
                        </Label>
                        <Input
                          id="bus-legal"
                          value={legalName}
                          onChange={(e) => setLegalName(e.target.value)}
                          placeholder="Ferretería Central S.A."
                          className="rounded-xl"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="bus-trade" className="text-xs font-bold uppercase tracking-wider">
                          Nombre Comercial / Fantasía
                        </Label>
                        <Input
                          id="bus-trade"
                          value={tradeName}
                          onChange={(e) => setTradeName(e.target.value)}
                          placeholder="FerroMax Central"
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="bus-tax" className="text-xs font-bold uppercase tracking-wider">
                          Identificación Fiscal (CUIT / RUT) *
                        </Label>
                        <Input
                          id="bus-tax"
                          value={taxId}
                          onChange={(e) => setTaxId(e.target.value)}
                          placeholder="30-12345678-9"
                          className="rounded-xl"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="bus-billing-email" className="text-xs font-bold uppercase tracking-wider">
                          Correo Electrónico de Facturación
                        </Label>
                        <Input
                          id="bus-billing-email"
                          type="email"
                          value={billingEmail}
                          onChange={(e) => setBillingEmail(e.target.value)}
                          placeholder="facturacion@ferromax.com"
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="bus-address" className="text-xs font-bold uppercase tracking-wider">
                        Domicilio Fiscal
                      </Label>
                      <Input
                        id="bus-address"
                        value={fiscalAddress}
                        onChange={(e) => setFiscalAddress(e.target.value)}
                        placeholder="Av. Rivadavia 4500, CABA"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSavingBusiness}
                        className="rounded-xl h-10 px-6 text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {isSavingBusiness ? "Guardando..." : "Actualizar Datos Comerciales"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <EmailVerificationModal
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          onSuccess={async () => {
            if (user) {
              useAuthStore.setState({ user: { ...user, emailVerified: true } });
            }
            if (refreshUser) {
              await refreshUser();
            }
          }}
          email={user?.email || ""}
        />

        <ImageCropUpload
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          onImageSaved={handleSaveAvatar}
          title="Cambiar Foto de Perfil"
          cropShape="circle"
        />
    </>
  );
};

export default ProfilePage;
