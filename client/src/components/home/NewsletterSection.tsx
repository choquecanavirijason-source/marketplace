import { Mail } from "lucide-react";
import { NewsletterForm } from "@/components/common/NewsletterForm";

export const NewsletterSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-6 pb-10">
      <div
        className="rounded-2xl md:rounded-3xl relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #bf360c 0%, #e65100 50%, #f57c00 100%)" }}
      >
        <div className="relative z-10 text-center py-10 sm:py-12 px-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Sumate a la Comunidad FerroMax</h2>
          <p className="text-orange-100/80 text-xs sm:text-sm mb-6 sm:mb-8 max-w-md mx-auto">
            Suscribite para recibir ofertas semanales, novedades de temporada y consejos de nuestros técnicos.
          </p>
          <NewsletterForm />
          <p className="text-orange-200/50 text-xs mt-4">Sin spam. Cancelá cuando quieras.</p>
        </div>
        {/* Floating decorative circles */}
        <div className="absolute -left-12 sm:-left-16 -bottom-12 sm:-bottom-16 w-36 sm:w-48 h-36 sm:h-48 rounded-full bg-white/5 animate-float" />
        <div className="absolute -right-6 sm:-right-8 -top-6 sm:-top-8 w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-white/5 animate-float-delayed" />
        <div className="absolute left-1/4 top-4 w-16 h-16 rounded-full bg-white/[0.03] animate-float-slow hidden sm:block" />
      </div>
    </section>
  );
};
