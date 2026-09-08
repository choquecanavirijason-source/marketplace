"use client";

import { useState } from "react";
import {
  Award,
  CheckCircle2,
  Zap,
  Truck,
  ShieldCheck,
  Percent,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/shared/lib/format";
import { toast } from "sonner";

interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  description: string;
  features: string[];
  popular?: boolean;
  current?: boolean;
}

const PLANS: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Estándar",
    priceMonthly: 0,
    priceYearly: 0,
    description: "Para compras ocasionales y mantenimiento del hogar",
    features: [
      "Acceso completo a todo el catálogo",
      "Seguimiento de pedidos en tiempo real",
      "Garantía oficial del fabricante",
      "Atención al cliente vía email",
    ],
    current: true,
  },
  {
    id: "pro",
    name: "FerroMax Pro Club",
    priceMonthly: 5990,
    priceYearly: 59900,
    description: "Para profesionales, contratistas y entusiastas del bricolaje",
    popular: true,
    features: [
      "Envíos gratis en miles de herramientas seleccionadas",
      "10% de reintegro (cashback) en compras de maquinaria",
      "Atención prioritaria y asesoría técnica por WhatsApp",
      "30 días adicionales de garantía extendida sin cargo",
      "Acceso anticipado a ofertas Flash y liquidaciones",
    ],
  },
  {
    id: "b2b",
    name: "Plan Empresas B2B",
    priceMonthly: 14990,
    priceYearly: 149900,
    description: "Para constructoras, talleres industriales y estudios de arquitectura",
    features: [
      "Todo lo incluido en Pro Club",
      "Facturación A consolidada y resumen de cuenta corriente",
      "Coordinación de entregas directas a obra en todo el país",
      "Asesor comercial y cotizador de proyectos dedicado",
      "Descuentos mayoristas por volumen y pallet cerrado",
    ],
  },
];

const AccountSubscriptionsPage = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [currentPlanId, setCurrentPlanId] = useState("basic");

  const handleSubscribe = (plan: SubscriptionPlan) => {
    if (plan.id === currentPlanId) {
      toast.info("Ya te encuentras en este plan.");
      return;
    }
    setCurrentPlanId(plan.id);
    toast.success(`¡Felicitaciones! Te has suscrito al plan ${plan.name}.`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-2.5">
          <div className="size-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Award className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Membresías & Beneficios Club
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Ahorra en cada compra con envíos bonificados, reintegros y atención prioritaria en obra
            </p>
          </div>
        </div>

        {/* Toggle monthly / yearly */}
        <div className="flex items-center gap-2 bg-muted p-1 rounded-2xl border border-border/60 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              billingCycle === "monthly"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mensual
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              billingCycle === "yearly"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Anual</span>
            <Badge className="text-[9px] bg-emerald-500 text-white font-black px-1.5 py-0 h-4">
              2 MESES OFF
            </Badge>
          </button>
        </div>
      </div>

      {/* Active Benefits Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/70 bg-muted/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Truck className="size-5" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold">Envíos Bonificados</p>
              <p className="text-sm font-black text-foreground">En compras desde $35.000</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-muted/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Percent className="size-5" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold">Ahorro en Descuentos</p>
              <p className="text-sm font-black text-foreground">$18.450 acumulados</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-muted/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold">Garantía Protegida</p>
              <p className="text-sm font-black text-foreground">Cobertura activa</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const price = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;

          return (
            <Card
              key={plan.id}
              className={`flex flex-col justify-between transition-all relative rounded-3xl ${
                plan.popular
                  ? "border-primary shadow-lg ring-2 ring-primary/20 bg-card"
                  : "border-border/70 hover:border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-wider px-3 py-1 shadow-md">
                    <Sparkles className="size-3 mr-1" /> Más Elegido
                  </Badge>
                </div>
              )}

              <CardHeader className="p-6 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-black text-foreground">
                    {plan.name}
                  </CardTitle>
                  {isCurrent && (
                    <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 border-emerald-500/30">
                      Plan Actual
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs mt-1">
                  {plan.description}
                </CardDescription>

                <div className="pt-4 mt-4 border-t border-border/60">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-foreground">
                      {price === 0 ? "Gratis" : formatPrice(price)}
                    </span>
                    {price > 0 && (
                      <span className="text-xs text-muted-foreground font-medium">
                        /{billingCycle === "monthly" ? "mes" : "año"}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 flex-1 flex flex-col justify-between">
                <ul className="space-y-2.5 my-6 text-xs text-muted-foreground">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-foreground/90">
                      <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrent}
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full rounded-xl font-bold text-xs h-10"
                >
                  {isCurrent ? "Tu Plan Activo" : `Elegir ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AccountSubscriptionsPage;
