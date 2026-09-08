"use client";

import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  Truck,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const STATS = [
  { value: "+25", label: "Años de trayectoria" },
  { value: "+50.000", label: "Productos en catálogo" },
  { value: "24/48 hs", label: "Cobertura y envíos en todo el país" },
  { value: "+150.000", label: "Clientes y profesionales conformes" },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Garantía & Confianza",
    description: "Trabajamos únicamente con marcas oficiales y productos certificados bajo estrictas normas de seguridad industrial.",
  },
  {
    icon: Truck,
    title: "Logística Inteligente",
    description: "Centros de distribución estratégicos con despacho prioritario en obra y seguimiento satelital de envíos.",
  },
  {
    icon: Users,
    title: "Asesoría Técnica Experta",
    description: "Un equipo especializado de ingenieros y técnicos capacitados para guiarte en el dimensionamiento de tu proyecto.",
  },
  {
    icon: Award,
    title: "Compromiso con el Profesional",
    description: "Planes especiales B2B, cuentas corrientes y beneficios exclusivos para gremios, constructoras y talleres.",
  },
];

const BRANDS = [
  "BOSCH", "DEWALT", "MAKITA", "STANLEY", "SINTEPLAST", "BLACK+DECKER", "3M", "TRAMONTINA"
];

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-16 md:py-24 border-b border-border/60">
          <div className="max-w-6xl mx-auto px-4 text-center space-y-4">
            <Badge className="bg-primary/15 text-primary border-primary/30 font-bold px-3 py-1 rounded-full text-xs">
              <Sparkles className="size-3.5 mr-1" /> Conocé FerroMax
            </Badge>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
              Construyendo confianza y equipando el futuro de cada obra
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Somos el marketplace de ferretería, herramientas y materiales de construcción líder en Argentina. Conectamos a los mejores fabricantes con profesionales y hogares.
            </p>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="py-12 bg-muted/30 border-b border-border/60">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((stat, i) => (
              <div key={i} className="space-y-1">
                <p className="text-2xl sm:text-4xl font-black text-primary tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 md:py-20 max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <Badge variant="outline" className="text-xs font-bold text-primary">
                Nuestra Historia
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                De una ferretería de barrio a una plataforma tecnológica federal
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                FerroMax nació con un propósito claro: simplificar el abastecimiento de herramientas, maquinarias y materiales para los constructores, carpinteros, herreros y aficionados del hogar.
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Hoy combinamos depósitos robotizados de última generación con una red logística federal, ofreciendo más de 50.000 artículos en stock permanente con entrega asegurada en 24 y 48 horas en las principales ciudades del país.
              </p>
              <div className="pt-2">
                <Button asChild className="rounded-xl font-bold text-xs gap-1.5">
                  <Link href="/categories">
                    Explorar Catálogo <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="bg-muted/40 rounded-3xl p-8 border border-border/70 flex flex-col justify-between space-y-6">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Building2 className="size-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Sede Central & Logística</h3>
                  <p className="text-xs text-muted-foreground">Parque Industrial Panamericana, Buenos Aires</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-muted-foreground border-t border-border/60 pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-primary shrink-0" />
                  <span>Atención comercial: Lunes a Sábados de 8:00 a 19:00 hs</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-primary shrink-0" />
                  <span>Despachos a más de 1.800 localidades en todo el territorio nacional</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-muted/20 border-t border-border/60">
          <div className="max-w-6xl mx-auto px-4 space-y-10">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Nuestros Pilares
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Principios que guían cada entrega, cotización y solución que brindamos
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUES.map((val, idx) => (
                <Card key={idx} className="border-border/70 hover:border-primary/40 transition-all rounded-3xl">
                  <CardContent className="p-6 space-y-3">
                    <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <val.icon className="size-6" />
                    </div>
                    <h3 className="font-bold text-sm text-foreground">{val.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {val.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Official Brands */}
        <section className="py-14 border-t border-border/60 max-w-6xl mx-auto px-4 text-center space-y-6">
          <p className="text-xs uppercase font-black tracking-widest text-muted-foreground">
            Distribuidores Oficiales de las Marcas Más Exigentes
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-70">
            {BRANDS.map((brand) => (
              <span key={brand} className="font-black text-sm sm:text-base tracking-wider text-foreground">
                {brand}
              </span>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default AboutPage;
