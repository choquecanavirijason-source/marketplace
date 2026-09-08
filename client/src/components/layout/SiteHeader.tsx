"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Heart, Menu, X, Search } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { SearchBar } from "@/components/layout/SearchBar";
import { CartPopover } from "@/components/cart/CartPopover";
import { AccountMenu } from "@/components/auth/AccountMenu";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useFavorites } from "@/hooks/useFavorites";
import { useApiQuery } from "@/hooks/useApi";
import { categoryService } from "@/services/category.service";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { CategoryIcon, getCategoryColor } from "@/components/common/CategoryIcon";

export const SiteHeader = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { count: favoritesCount } = useFavorites();
  const { data: categories } = useApiQuery(["categories"], () => categoryService.list());
  const { isAdmin } = useAuth();
  const { dict } = useTranslation();
  const mounted = useHasMounted();
  const categoriesRef = useRef<HTMLDivElement>(null);

  const NAV_ITEMS = [
    { label: dict.common.home, href: "/" },
    { label: dict.common.categories, href: "/categories" },
    { label: "Pinturas", href: "/categories/pinturas" },
    { label: "Plomería", href: "/categories/plomeria" },
    { label: "Electricidad", href: "/categories/electricidad" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false);
      }
    };
    if (categoriesOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [categoriesOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleSearch = () => {
    const query = searchVal.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
    setMobileSearchOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border/60 transition-all duration-300 ${
        scrolled
          ? "bg-card/80 backdrop-blur-xl shadow-sm"
          : "bg-card backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 md:gap-4">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
          <Logo />
        </Link>

        <div className="hidden lg:block relative" ref={categoriesRef}>
          <button
            type="button"
            onClick={() => setCategoriesOpen((v) => !v)}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl cursor-pointer hover:bg-orange-700 transition-all active:scale-[0.97]"
          >
            <Menu className="w-4 h-4" />
            <span className="text-sm font-semibold">{dict.common.allCategories}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${categoriesOpen ? "rotate-180" : ""}`} />
          </button>

          <div
            className={`absolute top-full left-0 mt-2 w-72 rounded-2xl border border-border bg-card bg-white dark:bg-[#1c1815] shadow-2xl overflow-hidden z-50 transition-all duration-200 origin-top ${
              categoriesOpen
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <div className="p-3 border-b border-border bg-muted/30">
              <p className="text-xs font-bold text-foreground">{dict.common.allCategories}</p>
            </div>
            <ul className="py-2 max-h-80 overflow-y-auto bg-white dark:bg-[#1c1815]">
              {(categories ?? []).map((category, idx) => {
                const catKey = category.slug || category.id || `header-cat-${idx}`;
                const catHref = category.slug ? `/categories/${category.slug}` : `/categories`;
                return (
                  <li key={catKey}>
                    <Link
                      href={catHref}
                      onClick={() => setCategoriesOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors group/item"
                    >
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover/item:scale-110" style={{ background: getCategoryColor(category) }}>
                        <CategoryIcon category={category} className="w-4 h-4 text-foreground/70" strokeWidth={1.75} />
                      </span>
                      <span className="flex-1 text-sm font-semibold text-foreground">{category.name || "Categoría"}</span>
                      <span className="text-[10px] text-muted-foreground">{category.products_count ?? category.count ?? 0}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link
              href="/categories"
              onClick={() => setCategoriesOpen(false)}
              className="flex items-center justify-center gap-1 border-t border-border px-4 py-3 text-sm font-bold text-primary hover:bg-muted/50 transition-colors bg-white dark:bg-[#1c1815]"
            >
              {dict.common.viewAll} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="hidden md:block flex-1">
          <SearchBar value={searchVal} onChange={setSearchVal} onSearch={handleSearch} />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
          <button
            type="button"
            className="md:hidden p-2 rounded-xl hover:bg-muted/60 transition-colors text-foreground/70"
            onClick={() => setMobileSearchOpen((v) => !v)}
          >
            <Search className="w-5 h-5" />
          </button>

          <ThemeToggle variant="button" />
          <LanguageSwitcher />
          <AccountMenu />

          <Link
            href="/favorites"
            className="hidden md:flex flex-col items-center p-2 hover:text-primary transition-colors text-foreground/70 gap-0.5 relative"
          >
            <Heart className="w-5 h-5" />
            <span className="text-[10px] font-medium">{dict.common.favorites}</span>
            {mounted && favoritesCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                {favoritesCount}
              </span>
            )}
          </Link>

          <CartPopover />

          <button
            type="button"
            className="md:hidden p-2 rounded-xl hover:bg-muted/60 transition-colors"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileSearchOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-3">
          <SearchBar value={searchVal} onChange={setSearchVal} onSearch={handleSearch} />
        </div>
      </div>

      <nav className="hidden md:block border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-4 py-3 text-sm font-semibold text-foreground/80 hover:text-primary transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 h-full w-[85vw] max-w-[320px] bg-card bg-white dark:bg-[#1c1815] border-l border-border shadow-2xl z-50 md:hidden transition-transform duration-300 ease-in-out flex flex-col ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/60">
          <Logo />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="size-9 rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Tema / Modo</span>
          <ThemeToggle variant="button" />
        </div>

        <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Idioma / Language</span>
          <LanguageSwitcher />
        </div>

        {mounted && isAdmin && (
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="mx-4 mt-3 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
          >
            ★ {dict.common.adminPanel}
          </Link>
        )}

        <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 py-3 px-3 text-sm font-semibold text-foreground/80 hover:text-primary hover:bg-muted/50 rounded-xl transition-all min-h-[44px]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-border/60">
          <Link
            href="/favorites"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2.5 text-sm font-semibold text-foreground/80 hover:text-primary transition-colors"
          >
            <Heart className="w-5 h-5" />
            <span>{dict.common.favorites}</span>
            {mounted && favoritesCount > 0 && (
              <span className="ml-auto w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};