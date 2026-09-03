"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Heart, Menu } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { SearchBar } from "@/components/layout/SearchBar";
import { CartPopover } from "@/components/cart/CartPopover";
import { AccountMenu } from "@/components/auth/AccountMenu";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useFavorites } from "@/hooks/useFavorites";
import { useCategories } from "@/hooks/useCatalog";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";

export function SiteHeader() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const { count: favoritesCount } = useFavorites();
  const { data: categories } = useCategories();
  const { isAdmin } = useAuth();
  const { dict } = useTranslation();
  const mounted = useHasMounted();

  const NAV_ITEMS = [
    { label: dict.common.home, href: "/" },
    { label: dict.common.categories, href: "/categories" },
    { label: "Pinturas", href: "/categories/pinturas" },
    { label: "Plomería", href: "/categories/plomeria" },
    { label: "Electricidad", href: "/categories/electricidad" },
  ];

  const handleSearch = () => {
    const query = searchVal.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
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
            <span className="text-sm font-semibold">{dict.common.allCategories}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoriesOpen ? "rotate-180" : ""}`} />
          </button>

          {categoriesOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl border border-border bg-card shadow-xl overflow-hidden z-50">
              <p className="px-4 pt-4 pb-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {dict.common.categories}
              </p>
              <ul className="max-h-80 overflow-y-auto">
                {(categories ?? []).map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/categories/${category.slug}`}
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
                href="/categories"
                onClick={() => setCategoriesOpen(false)}
                className="flex items-center justify-center gap-1 border-t border-border px-4 py-3 text-sm font-bold text-primary hover:bg-muted/50 transition-colors"
              >
                {dict.common.viewAll} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        <SearchBar value={searchVal} onChange={setSearchVal} onSearch={handleSearch} />

        <div className="flex items-center gap-2 ml-auto">
          <LanguageSwitcher />
          <AccountMenu />
          <Link href="/favorites" className="hidden md:flex flex-col items-center p-2 hover:text-primary transition-colors text-foreground/70 gap-0.5 relative">
            <Heart className="w-5 h-5" />
            <span className="text-[10px] font-medium">{dict.common.favorites}</span>
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
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform" />
                </Link>
              </li>
            ))}
            {mounted && isAdmin && (
              <li className="ml-auto">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-full transition-colors"
                >
                  ★ {dict.common.adminPanel}
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border px-4 pb-4">
          <div className="py-2 border-b border-border flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Idioma / Language</span>
            <LanguageSwitcher />
          </div>
          {mounted && isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-sm font-bold text-primary border-b border-border"
            >
              ★ {dict.common.adminPanel}
            </Link>
          )}
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