import { Package } from "lucide-react";

const BRANDS = ["Whole Foods", "Green Earth", "Nature Valley", "Farm Fresh", "Pure Organic", "BioSelect"];

export function BrandsStrip() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-card rounded-3xl border border-border p-6">
        <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">Trusted Brands</p>
        <div className="flex items-center justify-around flex-wrap gap-6">
          {BRANDS.map((brand) => (
            <div key={brand} className="flex items-center gap-2 text-muted-foreground/50 hover:text-primary transition-colors cursor-pointer">
              <Package className="w-5 h-5" />
              <span className="text-sm font-bold tracking-tight">{brand}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
