"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { toast } from "sonner";

const FAQS = [
  {
    q: "¿Cómo realizo el seguimiento de mi pedido?",
    a: "Una vez despachado el paquete, recibirás un correo y mensaje de WhatsApp con el número de guía satelital. También puedes consultar el estado en tiempo real desde tu panel en 'Mis Pedidos'.",
  },
  {
    q: "¿Emiten Factura A para empresas y responsables inscriptos?",
    a: "Sí, emitimos Factura A automáticamente. Al registrarte en Modo Empresa o ingresar tu CUIT durante el checkout, tus comprobantes fiscales se generan de inmediato y los descargas desde la sección 'Facturación'.",
  },
  {
    q: "¿Cuáles son los tiempos de entrega?",
    a: "En CABA y Gran Buenos Aires entregamos en 24 horas hábiles. Para el resto de las provincias, los envíos demoran entre 48 y 72 horas hábiles a través de nuestra red logística asegurada.",
  },
  {
    q: "¿Cómo solicito una devolución o cambio?",
    a: "Tienes 30 días corridos desde la recepción del producto para solicitar un cambio sin costo si el artículo presenta fallas o no es de tu conformidad. Escríbenos directamente o inicia el reclamo en tu panel.",
  },
];

const ContactPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("ventas");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Por favor completa los campos obligatorios.");
      return;
    }

    setIsSending(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSending(false);

    toast.success("¡Mensaje enviado con éxito! Un asesor se contactará en menos de 2 horas hábiles.");
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 md:py-16 space-y-12 w-full">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Estamos para Ayudarte
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            ¿Tenés dudas sobre herramientas, pedidos, cotizaciones para obras o devoluciones? Escribinos o contactanos por cualquiera de nuestros canales oficiales.
          </p>
        </div>

        {/* Channels Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/70 rounded-2xl bg-muted/20">
            <CardContent className="p-5 space-y-2 text-center flex flex-col items-center">
              <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Phone className="size-5" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-foreground">Venta Telefónica</h3>
              <p className="text-xs text-muted-foreground">+54 (11) 4123-4567</p>
              <span className="text-[11px] text-emerald-600 font-bold">Lun a Vie 8 a 19 hs</span>
            </CardContent>
          </Card>

          <Card className="border-border/70 rounded-2xl bg-muted/20">
            <CardContent className="p-5 space-y-2 text-center flex flex-col items-center">
              <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <MessageSquare className="size-5" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-foreground">WhatsApp Directo</h3>
              <p className="text-xs text-muted-foreground">+54 9 11 9876-5432</p>
              <span className="text-[11px] text-emerald-600 font-bold">Respuesta inmediata</span>
            </CardContent>
          </Card>

          <Card className="border-border/70 rounded-2xl bg-muted/20">
            <CardContent className="p-5 space-y-2 text-center flex flex-col items-center">
              <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Mail className="size-5" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-foreground">Correo de Soporte</h3>
              <p className="text-xs text-muted-foreground">hola@ferromax.com</p>
              <span className="text-[11px] text-muted-foreground font-semibold">Atención 24/7</span>
            </CardContent>
          </Card>

          <Card className="border-border/70 rounded-2xl bg-muted/20">
            <CardContent className="p-5 space-y-2 text-center flex flex-col items-center">
              <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <MapPin className="size-5" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-foreground">Depósito Central</h3>
              <p className="text-xs text-muted-foreground">Av. Siempre Viva 420</p>
              <span className="text-[11px] text-muted-foreground font-semibold">Buenos Aires, Argentina</span>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form & Map/Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-7 bg-card p-6 sm:p-8 rounded-3xl border border-border/70 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-foreground">Envíanos un Mensaje</h2>
              <p className="text-xs text-muted-foreground">
                Completá tus datos y nuestro equipo comercial te responderá a la brevedad
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Nombre y Apellido *</Label>
                  <Input
                    placeholder="Tu nombre completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Correo Electrónico *</Label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Teléfono / WhatsApp</Label>
                  <Input
                    placeholder="+54 11 1234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Motivo de Consulta</Label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger className="rounded-xl text-xs">
                      <SelectValue placeholder="Selecciona un motivo" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl text-xs">
                      <SelectItem value="ventas">Cotización y Ventas por Mayor</SelectItem>
                      <SelectItem value="pedidos">Estado de mi Pedido</SelectItem>
                      <SelectItem value="tecnico">Asesoramiento Técnico</SelectItem>
                      <SelectItem value="facturacion">Facturación Electrónica</SelectItem>
                      <SelectItem value="devoluciones">Cambios y Devoluciones</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Mensaje o Detalle del Requerimiento *</Label>
                <Textarea
                  placeholder="Detalla qué productos precisas cotizar, tu número de pedido o consulta técnica..."
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="rounded-xl text-xs"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSending}
                className="w-full rounded-xl font-bold text-xs h-10 gap-2"
              >
                <Send className="size-3.5" />
                {isSending ? "Enviando mensaje..." : "Enviar Mensaje"}
              </Button>
            </form>
          </div>

          {/* FAQs */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="size-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Preguntas Frecuentes</h2>
            </div>

            <div className="space-y-2.5">
              {FAQS.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    className="border border-border/70 rounded-2xl p-4 bg-muted/20 space-y-2 transition-all cursor-pointer"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-xs text-foreground">{faq.q}</h4>
                      <ChevronDown
                        className={`size-4 text-muted-foreground shrink-0 transition-transform ${
                          isOpen ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </div>
                    {isOpen && (
                      <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border/40">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default ContactPage;
