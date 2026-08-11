import { ChevronDown, Mail, Phone } from "lucide-react";

export function TopBarStrip() {
  return (
    <div className="bg-primary text-primary-foreground text-xs py-2">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Phone className="w-3 h-3" /> +1 (800) 123-4567
          </span>
          <span className="hidden md:flex items-center gap-1.5">
            <Mail className="w-3 h-3" /> hello@ekomart.com
          </span>
        </div>
        <span className="hidden sm:block font-medium">🚚 Free shipping on orders over $50</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 cursor-pointer hover:opacity-80">
            USD <ChevronDown className="w-3 h-3" />
          </span>
          <span className="flex items-center gap-1 cursor-pointer hover:opacity-80">
            EN <ChevronDown className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
}
