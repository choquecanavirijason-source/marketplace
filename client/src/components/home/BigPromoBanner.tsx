export const BigPromoBanner = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-4 md:py-6">
      <div className="rounded-2xl md:rounded-3xl overflow-hidden relative bg-gradient-to-r from-primary to-orange-700 min-h-[180px] md:min-h-[200px] flex items-center">
        <div className="relative z-10 p-6 sm:p-8 md:p-12 max-w-lg">
          <p className="text-orange-200 text-xs sm:text-sm font-bold uppercase tracking-widest mb-2">Oferta Especial</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight mb-3">
            Obtené 20% Off en tu
            <br />
            Primer Pedido
          </h2>
          <p className="text-orange-100/80 text-xs sm:text-sm mb-4 sm:mb-6">
            Usá el código <span className="font-black bg-white/20 px-2 py-0.5 rounded-lg text-white">FERRO20</span> al pagar.
          </p>
          <button type="button" className="bg-white text-primary font-bold px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl hover:bg-orange-50 transition-all active:scale-95 shadow-lg text-sm sm:text-base">
            Reclamar Oferta
          </button>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1783477108548-ed63e5766c42?w=600&h=400&fit=crop&auto=format"
            alt="Calefactor"
            className="w-full h-full object-cover opacity-15 dark:opacity-10"
          />
        </div>
        {/* Floating decorative circles */}
        <div className="absolute -right-20 -top-20 w-48 sm:w-64 h-48 sm:h-64 rounded-full bg-white/5 animate-float-slow" />
        <div className="absolute -right-10 -bottom-10 w-32 sm:w-40 h-32 sm:h-40 rounded-full bg-white/5 animate-float-delayed" />
        <div className="absolute left-1/3 -bottom-16 w-24 h-24 rounded-full bg-white/[0.03] animate-float hidden md:block" />
      </div>
    </section>
  );
};
