import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/presentation/atoms/Logo";
import { SocialIconRow } from "@/presentation/molecules/SocialIconRow";
import { FooterLinkColumn } from "@/presentation/molecules/FooterLinkColumn";

const CONTACT_ITEMS = [
  { Icon: MapPin, text: "420 Green Lane, Portland, OR 97201" },
  { Icon: Phone, text: "+1 (800) 123-4567" },
  { Icon: Mail, text: "hello@ekomart.com" },
];

const LINK_COLUMNS = [
  { title: "Quick Links", links: ["Home", "About Us", "Shop", "Blog", "Contact"] },
  { title: "Categories", links: ["Fresh Vegetables", "Fresh Fruits", "Dairy & Eggs", "Bakery", "Beverages"] },
  { title: "My Account", links: ["My Profile", "Order History", "Wishlist", "Track Order", "Returns"] },
];

const LEGAL_LINKS = ["Privacy Policy", "Terms of Service", "Cookie Policy"];
const PAYMENT_ICONS = ["💳", "🏦", "📱", "🔐"];

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
              Your trusted online grocery store. Fresh, organic, and sustainably sourced produce delivered daily.
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
          <p className="text-xs text-white/40">© 2026 EkoMart. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {LEGAL_LINKS.map((item) => (
              <a key={item} href="#" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {PAYMENT_ICONS.map((icon, i) => (
              <div key={i} className="w-10 h-6 bg-white/10 rounded flex items-center justify-center text-xs">
                {icon}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
