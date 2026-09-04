"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  const sections = [
    { id: "responsable", title: "1. Responsable del Tratamiento" },
    { id: "datos", title: "2. Datos que Recopilamos" },
    { id: "finalidad", title: "3. Finalidad del Uso de Datos" },
    { id: "cookies", title: "4. Cookies y Tecnologías Similares" },
    { id: "terceros", title: "5. Compartición con Terceros" },
    { id: "seguridad", title: "6. Seguridad y Cifrado SSL" },
    { id: "derechos", title: "7. Tus Derechos ARCO" },
    { id: "contacto", title: "8. Contacto y Delegado de Datos" },
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
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
                <Shield className="w-3.5 h-3.5 text-emerald-600" /> Protección de Datos Personales
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
                Política de Privacidad y Confidencialidad
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Última actualización: 3 de septiembre de 2026. Tu privacidad y seguridad son pilares fundamentales de FerroMax.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="rounded-xl text-xs h-9">
                <Link href="/terms">Ver Términos y Condiciones</Link>
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
                Secciones de Privacidad
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
                <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground space-y-2">
                  <p className="font-bold text-foreground flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-600" /> Cifrado de Extremo a Extremo
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Tus contraseñas se almacenan con algoritmos seguros bcrypt y los tokens JWT son firmados criptográficamente.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <main className="space-y-10 text-foreground leading-relaxed">
            <section id="responsable" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                <Shield className="w-5 h-5 text-primary" /> 1. Responsable del Tratamiento
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                El responsable del tratamiento de los datos personales recabados a través de esta plataforma es <strong>FerroMax Marketplace S.A.</strong>, con domicilio legal en Av. Industrial 1234, CABA, República Argentina.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nos comprometemos a proteger la privacidad de nuestros usuarios y a cumplir con la Ley N° 25.326 de Protección de los Datos Personales y demás regulaciones internacionales de privacidad aplicables.
              </p>
            </section>

            <section id="datos" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                <Database className="w-5 h-5 text-primary" /> 2. Datos que Recopilamos
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Para brindar nuestros servicios de compra y venta comercial, recopilamos las siguientes categorías de información:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-card p-4 space-y-1 text-xs">
                  <p className="font-bold text-foreground">Datos de Identificación y Contacto</p>
                  <p className="text-muted-foreground">Nombre, apellido, correo electrónico, número de teléfono/celular y domicilio de entrega.</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 space-y-1 text-xs">
                  <p className="font-bold text-foreground">Datos Fiscales (Vendedores)</p>
                  <p className="text-muted-foreground">Razón social, CUIT/RUT, domicilio fiscal, condición frente al IVA y facturación.</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 space-y-1 text-xs">
                  <p className="font-bold text-foreground">Datos de Transacción y Pagos</p>
                  <p className="text-muted-foreground">Historial de pedidos, montos facturados, métodos de pago (sin almacenar datos de tarjetas).</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 space-y-1 text-xs">
                  <p className="font-bold text-foreground">Datos Técnicos y de Conexión</p>
                  <p className="text-muted-foreground">Dirección IP, tipo de navegador, sistema operativo y registros de auditoría de inicio de sesión.</p>
                </div>
              </div>
            </section>

            <section id="finalidad" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                <UserCheck className="w-5 h-5 text-primary" /> 3. Finalidad del Uso de Datos
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tus datos personales son procesados exclusivamente para los siguientes propósitos:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                <li>Gestionar tu cuenta de usuario, autenticación de dos factores (2FA) y verificación de identidad.</li>
                <li>Procesar pedidos, gestionar cobros y coordinar el despacho logístico de productos.</li>
                <li>Emitir comprobantes de compra y facturación impositiva correspondiente.</li>
                <li>Enviar notificaciones sobre el estado de tus compras o actualizaciones de seguridad.</li>
                <li>Prevenir fraudes, accesos indebidos y garantizar la integridad de la plataforma.</li>
              </ul>
            </section>

            <section id="cookies" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                <Eye className="w-5 h-5 text-primary" /> 4. Cookies y Tecnologías Similares
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Utilizamos cookies técnicas y de sesión (como <code>ferromax-token</code>) estrictamente necesarias para recordar tu sesión activa, preferencias de idioma y carrito de compras. No comercializamos información de navegación con redes publicitarias de terceros sin tu autorización expresa.
              </p>
            </section>

            <section id="terceros" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                <Database className="w-5 h-5 text-primary" /> 5. Compartición con Terceros
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Únicamente compartimos los datos estrictamente necesarios con:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                <li><strong>Empresas de Logística:</strong> Nombre y dirección para entrega de paquetes.</li>
                <li><strong>Pasarelas de Pago:</strong> Para procesar transacciones bancarias bajo estándares PCI-DSS.</li>
                <li><strong>Organismos de Control:</strong> Cuando exista un requerimiento judicial o legal obligatorio.</li>
              </ul>
            </section>

            <section id="seguridad" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                <Lock className="w-5 h-5 text-primary" /> 6. Seguridad y Cifrado
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Implementamos medidas técnicas y organizativas robustas: cifrado SSL/TLS de 256 bits en todas las transmisiones, cortafuegos de aplicaciones, hashing de contraseñas con sal (bcrypt) y políticas estrictas de control de acceso basadas en roles (RBAC).
              </p>
            </section>

            <section id="derechos" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                <UserCheck className="w-5 h-5 text-primary" /> 7. Tus Derechos ARCO
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Como titular de los datos, tienes derecho a <strong>Acceder</strong>, <strong>Rectificar</strong>, <strong>Actualizar</strong> o <strong>Suprimir</strong> tus datos personales de nuestras bases de datos en cualquier momento. Puedes editar directamente tus datos en <Link href="/account/profile" className="text-primary font-bold hover:underline">Mi Perfil</Link> o solicitar la baja definitiva de tu cuenta.
              </p>
            </section>

            <section id="contacto" className="space-y-3 scroll-mt-24">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                <HelpCircle className="w-5 h-5 text-primary" /> 8. Contacto y Delegado de Datos
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Para consultas sobre privacidad o ejercer tus derechos legales, comunícate con nuestro Oficial de Privacidad a través de <strong>privacidad@ferromax.com</strong>.
              </p>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
