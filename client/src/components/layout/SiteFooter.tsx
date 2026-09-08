import Link from "next/link";
import { Banknote, CreditCard, Landmark, Mail, MapPin, Phone, Smartphone } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { SocialIconRow } from "@/components/common/SocialIconRow";
import { FooterLinkColumn } from "@/components/common/FooterLinkColumn";

const CONTACT_ITEMS = [
  { Icon: MapPin, text: "Av. Siempre Viva 420, Buenos Aires, Argentina" },
  { Icon: Phone, text: "+54 (11) 4123-4567" },
  { Icon: Mail, text: "hola@ferromax.com" },
];

const LINK_COLUMNS = [
  {
    title: "Enlaces Rápidos",
    links: [
      { label: "Inicio", href: "/" },
      { label: "Tienda", href: "/categories" },
      { label: "Sobre Nosotros", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contacto", href: "#" },
    ],
  },
  {
    title: "Categorías",
    links: [
      { label: "Herramientas Eléctricas", href: "/categories/herramientas-electricas" },
      { label: "Herramientas Manuales", href: "/categories/herramientas-manuales" },
      { label: "Pinturas", href: "/categories/pinturas" },
      { label: "Plomería", href: "/categories/plomeria" },
      { label: "Electricidad", href: "/categories/electricidad" },
    ],
  },
  {
    title: "Mi Cuenta",
    links: [
      { label: "Mi Perfil", href: "/account/profile" },
      { label: "Historial de Pedidos", href: "/account/dashboard" },
      { label: "Favoritos", href: "/favorites" },
      { label: "Seguir Pedido", href: "#" },
      { label: "Devoluciones", href: "#" },
    ],
  },
];

const LEGAL_LINKS = [
  { label: "Política de Privacidad", href: "/privacy" },
  { label: "Términos de Servicio", href: "/terms" },
  { label: "Política de Cookies", href: "/privacy#cookies" },
];
const PAYMENT_ICONS = [CreditCard, Landmark, Smartphone, Banknote];

export const SiteFooter = () => {
  return (
    <footer className="bg-[#1c1815] dark:bg-[#0c0a09] text-white border-t border-white/5">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="mb-4">
              <Logo variant="dark" />
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-5 max-w-xs">
              Tu ferretería de confianza. Calefacción, herramientas, pinturas y todo lo que necesitás para el hogar, con envío rápido a todo el país.
            </p>
            <div className="space-y-2.5 mb-6">
              {CONTACT_ITEMS.map(({ Icon, text }) => (
                <div key={text} className="flex items-start gap-2.5 text-sm text-white/60 group hover:text-white/80 transition-colors">
                  <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" /> <span>{text}</span>
                </div>
              ))}
            </div>
            <SocialIconRow />
          </div>

          {/* Link columns */}
          {LINK_COLUMNS.map((col) => (
            <FooterLinkColumn key={col.title} title={col.title} links={col.links} />
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">© 2026 FerroMax. Todos los derechos reservados.</p>

          {/* Legal links — flex-wrap prevents overflow on tiny screens */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {LEGAL_LINKS.map((item) => (
              <Link key={item.label} href={item.href} className="text-xs text-white/40 hover:text-white/70 transition-colors whitespace-nowrap">
                {item.label}
              </Link>
            ))}
          </div>

          {/* Payment icons */}
          <div className="flex items-center gap-2">
            {PAYMENT_ICONS.map((Icon, i) => (
              <div key={i} className="w-10 h-6 bg-white/10 rounded flex items-center justify-center hover:bg-white/15 transition-colors">
                <Icon className="w-3.5 h-3.5 text-white/60" strokeWidth={1.75} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
