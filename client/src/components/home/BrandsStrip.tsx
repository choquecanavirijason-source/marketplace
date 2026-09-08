import { Package } from "lucide-react";

const BRANDS = ["ThermoPlus", "ForjaPro", "NordicHeat", "TornaFix", "FuegoHogar", "SteelGrip"];

export const BrandsStrip = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <div className="bg-card rounded-2xl md:rounded-3xl border border-border p-5 md:p-6">
        <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 md:mb-6">Marcas de Confianza</p>
        {/* Horizontal scroll on mobile, wrapped flex on larger screens */}
        <div className="flex items-center gap-6 md:gap-8 overflow-x-auto md:overflow-visible md:justify-around md:flex-wrap pb-1 md:pb-0 scrollbar-none">
          {BRANDS.map((brand, idx) => (
            <div key={brand || `brand-${idx}`} className="flex items-center gap-2 text-muted-foreground/50 hover:text-primary transition-all cursor-pointer shrink-0 group">
              <Package className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold tracking-tight whitespace-nowrap">{brand}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
