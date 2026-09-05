import { ChevronDown, Mail, Phone, Truck } from "lucide-react";

export function TopBarStrip() {
  return (
    <div className="bg-primary text-primary-foreground text-xs py-2 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Phone className="w-3 h-3 shrink-0" /> +54 (11) 4123-4567
          </span>
          <span className="hidden md:flex items-center gap-1.5 whitespace-nowrap">
            <Mail className="w-3 h-3 shrink-0" /> hola@ferromax.com
          </span>
        </div>
        <span className="hidden sm:flex items-center gap-1.5 font-medium whitespace-nowrap truncate">
          <Truck className="w-3 h-3 shrink-0" /> Envío gratis en compras superiores a $50
        </span>
        <div className="hidden min-[375px]:flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
            USD <ChevronDown className="w-3 h-3" />
          </span>
          <span className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
            ES <ChevronDown className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
}
