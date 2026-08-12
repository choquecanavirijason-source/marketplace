import { Banknote, CreditCard, Landmark, Mail, MapPin, Phone, Smartphone } from "lucide-react";
import { Logo } from "@/presentation/atoms/Logo";
import { SocialIconRow } from "@/presentation/molecules/SocialIconRow";
import { FooterLinkColumn } from "@/presentation/molecules/FooterLinkColumn";

const CONTACT_ITEMS = [
  { Icon: MapPin, text: "Av. Siempre Viva 420, Buenos Aires, Argentina" },
  { Icon: Phone, text: "+54 (11) 4123-4567" },
  { Icon: Mail, text: "hola@ferromax.com" },
];

const LINK_COLUMNS = [
  { title: "Enlaces Rápidos", links: ["Inicio", "Sobre Nosotros", "Tienda", "Blog", "Contacto"] },
  { title: "Categorías", links: ["Herramientas Eléctricas", "Herramientas Manuales", "Pinturas", "Plomería", "Electricidad"] },
  { title: "Mi Cuenta", links: ["Mi Perfil", "Historial de Pedidos", "Favoritos", "Seguir Pedido", "Devoluciones"] },
];

const LEGAL_LINKS = ["Política de Privacidad", "Términos de Servicio", "Política de Cookies"];
const PAYMENT_ICONS = [CreditCard, Landmark, Smartphone, Banknote];

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Logo variant="dark" />
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-5 max-w-xs">
              Tu ferretería de confianza. Calefacción, herramientas, pinturas y todo lo que necesitás para el hogar, con envío rápido a todo el país.
            </p>
            <div className="space-y-2 mb-6">
              {CONTACT_ITEMS.map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-white/60">
                  <Icon className="w-4 h-4 flex-shrink-0" /> {text}
                </div>
              ))}
            </div>
            <SocialIconRow />
          </div>
          {LINK_COLUMNS.map((col) => (
            <FooterLinkColumn key={col.title} title={col.title} links={col.links} />
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">© 2026 FerroMax. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            {LEGAL_LINKS.map((item) => (
              <a key={item} href="#" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {PAYMENT_ICONS.map((Icon, i) => (
              <div key={i} className="w-10 h-6 bg-white/10 rounded flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-white/60" strokeWidth={1.75} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
