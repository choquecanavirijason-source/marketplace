"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Heart, Menu } from "lucide-react";
import { Logo } from "@/presentation/atoms/Logo";
import { SearchBar } from "@/presentation/molecules/SearchBar";
import { CartPopover } from "@/presentation/organisms/CartPopover";
import { AccountMenu } from "@/presentation/organisms/AccountMenu";
import { useFavorites } from "@/presentation/hooks/useFavorites";
import { useCategories } from "@/presentation/hooks/useCatalog";
import { useHasMounted } from "@/presentation/hooks/useHasMounted";

const NAV_ITEMS = [
  { label: "Inicio", href: "/" },
  { label: "Tienda", href: "/categorias" },
  { label: "Herramientas", href: "/categorias" },
  { label: "Pinturas", href: "/categorias/pinturas" },
  { label: "Plomería", href: "/categorias/plomeria" },
  { label: "Electricidad", href: "/categorias/electricidad" },
  { label: "Ofertas", href: "#" },
  { label: "Blog", href: "#" },
];

const NAV_WITH_CARET = ["Tienda", "Herramientas", "Ofertas"];

export function SiteHeader() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const { count: favoritesCount } = useFavorites();
  const { data: categories } = useCategories();
  const mounted = useHasMounted();

  const handleSearch = () => {
    const query = searchVal.trim();
    router.push(query ? `/buscar?q=${encodeURIComponent(query)}` : "/buscar");
  };

  return (
    <header className="bg-card shadow-sm sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Logo />
        </Link>

        <div className="hidden lg:block relative">
          <button
            type="button"
            onClick={() => setCategoriesOpen((v) => !v)}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl cursor-pointer hover:bg-orange-700 transition-colors"
          >
            <Menu className="w-4 h-4" />
            <span className="text-sm font-semibold">Todas las Categorías</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoriesOpen ? "rotate-180" : ""}`} />
          </button>

          {categoriesOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl border border-border bg-card shadow-xl overflow-hidden z-50">
              <p className="px-4 pt-4 pb-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Categorías
              </p>
              <ul className="max-h-80 overflow-y-auto">
                {(categories ?? []).map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/categorias/${category.slug}`}
                      onClick={() => setCategoriesOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors"
                    >
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: category.color }}>
                        <category.icon className="w-4 h-4 text-foreground/70" strokeWidth={1.75} />
                      </span>
                      <span className="flex-1 text-sm font-semibold text-foreground">{category.name}</span>
                      <span className="text-[10px] text-muted-foreground">{category.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/categorias"
                onClick={() => setCategoriesOpen(false)}
                className="flex items-center justify-center gap-1 border-t border-border px-4 py-3 text-sm font-bold text-primary hover:bg-muted/50 transition-colors"
              >
                Ver todas las categorías <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        <SearchBar value={searchVal} onChange={setSearchVal} onSearch={handleSearch} />

        <div className="flex items-center gap-1 ml-auto">
          <AccountMenu />
          <Link href="/favoritos" className="hidden md:flex flex-col items-center p-2 hover:text-primary transition-colors text-foreground/70 gap-0.5 relative">
            <Heart className="w-5 h-5" />
            <span className="text-[10px] font-medium">Favoritos</span>
            {mounted && favoritesCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </Link>

          <CartPopover />

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen((v) => !v)}>
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      <nav className="hidden md:block border-t border-border">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-4 py-3 text-sm font-semibold text-foreground/80 hover:text-primary transition-colors relative group"
                >
                  {item.label}
                  {NAV_WITH_CARET.includes(item.label) && <ChevronDown className="w-3 h-3" />}
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border px-4 pb-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-sm font-semibold border-b border-border last:border-0 text-foreground/80 hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}