"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText, ShieldCheck, Scale, AlertCircle, HelpCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  const sections = [
    { id: "aceptacion", title: "1. Aceptación de los Términos" },
    { id: "registro", title: "2. Registro y Cuentas de Usuario" },
    { id: "roles", title: "3. Roles: Compradores y Vendedores" },
    { id: "pagos", title: "4. Precios, Facturación y Pagos" },
    { id: "envios", title: "5. Envíos y Logística" },
    { id: "devoluciones", title: "6. Garantías y Devoluciones" },
    { id: "propiedad", title: "7. Propiedad Intelectual" },
    { id: "contacto", title: "8. Jurisdicción y Contacto" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/80 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver a la tienda
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary mb-2">
                <Scale className="w-3.5 h-3.5" /> Marco Legal y Operativo
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
                Términos y Condiciones del Servicio
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Última actualización: 3 de septiembre de 2026. Aplicable a todas las transacciones en FerroMax Marketplace.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="rounded-xl text-xs h-9">
                <Link href="/privacy">Ver Política de Privacidad</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-2 p-4 rounded-2xl bg-muted/30 border border-border/60">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Contenido del Documento
              </p>
              <nav className="space-y-1">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="block text-xs font-medium text-muted-foreground hover:text-primary hover:bg-muted/60 px-3 py-2 rounded-xl transition-all"
                  >
                    {sec.title}
                  </a>
                ))}
              </nav>

              <div className="pt-4 mt-4 border-t border-border/60">
                <div className="rounded-xl bg-primary/5 p-3 text-xs text-muted-foreground space-y-2">
                  <p className="font-bold text-foreground flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-primary" /> ¿Dudas Legales?
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Escríbenos a legal@ferromax.com para cualquier aclaración contractual.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <main className="space-y-10 text-foreground leading-relaxed">
            <section id="aceptacion" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                <FileText className="w-5 h-5 text-primary" /> 1. Aceptación de los Términos
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Al acceder, navegar o registrarte en la plataforma de <strong>FerroMax Marketplace</strong>, aceptas plenamente quedar vinculado por los presentes Términos y Condiciones. Si no estás de acuerdo con alguna de las cláusulas, deberás abstenerte de utilizar nuestro sitio y servicios.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                FerroMax actúa como un ecosistema digital que conecta compradores con proveedores, fabricantes y distribuidores autorizados de herramientas, maquinaria, materiales de construcción y ferretería industrial.
              </p>
            </section>

            <section id="registro" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> 2. Registro y Cuentas de Usuario
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Para realizar compras o comercializar productos es obligatorio crear una cuenta proporcionando información veraz, exacta y actualizada. Eres responsable exclusivo de custodiar la confidencialidad de tu contraseña y de toda actividad realizada desde tu cuenta.
              </p>
              <div className="rounded-2xl border border-border bg-card p-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Verificación Obligatoria:</strong> Para habilitar el cobro de ventas o facturación formal, es indispensable verificar el correo electrónico y teléfono celular asociados.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Edad Mínima:</strong> Solo personas con capacidad legal para contratar (mayores de 18 años) pueden operar en la plataforma.</span>
                </div>
              </div>
            </section>

            <section id="roles" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                <Scale className="w-5 h-5 text-primary" /> 3. Roles: Compradores y Vendedores
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                La plataforma distingue entre cuentas de Comprador y cuentas de Vendedor (individual o empresa):
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                <li><strong>Compradores:</strong> Pueden buscar catálogos, adquirir insumos, gestionar domicilios de entrega y calificar proveedores.</li>
                <li><strong>Vendedores:</strong> Deben contar con CUIT/RUT válido, suministrar información fiscal fehaciente, garantizar stock genuino y despachar pedidos dentro de los plazos comprometidos.</li>
              </ul>
            </section>

            <section id="pagos" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                <FileText className="w-5 h-5 text-primary" /> 4. Precios, Facturación y Pagos
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Todos los precios exhibidos están expresados en la moneda indicada e incluyen los impuestos de ley cuando corresponda. Los pagos se procesan de forma cifrada mediante pasarelas de pago certificadas (PCI-DSS).
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Los vendedores emitirán facturación fiscal conforme a la normativa tributaria vigente (Factura A, B o ticket equivalente según corresponda).
              </p>
            </section>

            <section id="envios" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                <FileText className="w-5 h-5 text-primary" /> 5. Envíos y Logística
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Los plazos de entrega y tarifas de transporte varían según el destino y el operador logístico seleccionado al momento del checkout. El comprador recibirá notificaciones y número de guía para el rastreo del paquete.
              </p>
            </section>

            <section id="devoluciones" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                <AlertCircle className="w-5 h-5 text-primary" /> 6. Garantías y Devoluciones
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Todos los productos nuevos cuentan con garantía oficial contra defectos de fabricación según lo estipulado por las leyes de defensa del consumidor. El usuario dispone de 10 días corridos desde la recepción para revocar la compra, siempre que el producto conserve su empaque y accesorios originales sin uso.
              </p>
            </section>

            <section id="propiedad" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> 7. Propiedad Intelectual
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Las marcas, logotipos, software, diseños y contenidos alojados en FerroMax están protegidos por leyes de propiedad intelectual e industrial. Queda prohibida su reproducción sin consentimiento previo por escrito.
              </p>
            </section>

            <section id="contacto" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                <Scale className="w-5 h-5 text-primary" /> 8. Jurisdicción y Contacto
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Cualquier controversia se resolverá bajo las leyes de la República Argentina, sometiéndose a los tribunales ordinarios competentes de la Ciudad Autónoma de Buenos Aires.
              </p>
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-foreground">¿Necesitas soporte con una orden o reclamo?</p>
                  <p className="text-xs text-muted-foreground">Nuestro equipo de atención al cliente atiende de lunes a viernes de 8 a 18 hs.</p>
                </div>
                <Button asChild size="sm" className="rounded-xl text-xs font-semibold h-9 px-5 shrink-0">
                  <Link href="/account/dashboard">Ir a Mi Panel</Link>
                </Button>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
