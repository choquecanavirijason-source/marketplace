"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Heart, Menu, User } from "lucide-react";
import { Logo } from "@/presentation/atoms/Logo";
import { SearchBar } from "@/presentation/molecules/SearchBar";
import { CartPopover } from "@/presentation/organisms/CartPopover";

const NAV_ITEMS = ["Inicio", "Tienda", "Herramientas", "Pinturas", "Plomería", "Electricidad", "Ofertas", "Blog"];
const NAV_WITH_CARET = ["Tienda", "Herramientas", "Ofertas"];

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  return (
    <header className="bg-card shadow-sm sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Logo />
        </Link>

        <div className="hidden lg:flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl cursor-pointer hover:bg-orange-700 transition-colors">
          <Menu className="w-4 h-4" />
          <span className="text-sm font-semibold">Todas las Categorías</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </div>

        <SearchBar value={searchVal} onChange={setSearchVal} />

        <div className="flex items-center gap-1 ml-auto">
          <button className="hidden md:flex flex-col items-center p-2 hover:text-primary transition-colors text-foreground/70 gap-0.5">
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Cuenta</span>
          </button>
          <button className="hidden md:flex flex-col items-center p-2 hover:text-primary transition-colors text-foreground/70 gap-0.5 relative">
            <Heart className="w-5 h-5" />
            <span className="text-[10px] font-medium">Favoritos</span>
            <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </button>

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
              <li key={item}>
                <a
                  href="#"
                  className="flex items-center gap-1 px-4 py-3 text-sm font-semibold text-foreground/80 hover:text-primary transition-colors relative group"
                >
                  {item}
                  {NAV_WITH_CARET.includes(item) && <ChevronDown className="w-3 h-3" />}
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border px-4 pb-4">
          {NAV_ITEMS.map((item) => (
            <a
              key={item}
              href="#"
              className="block py-2.5 text-sm font-semibold border-b border-border last:border-0 text-foreground/80 hover:text-primary transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
