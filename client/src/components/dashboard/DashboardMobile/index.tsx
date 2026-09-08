"use client";

import Link from "next/link";
import { ChevronRight, LogOut, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { FerroMaxRibbonLogo } from "../FerroMaxRibbonLogo";
import { MobileModeSelector } from "../ModeSelector/MobileModeSelector";
import { MobileNavItem } from "./MobileNavItem";
import { useDashboard } from "../DashboardProvider";

export const DashboardMobile = () => {
  const {
    pathname,
    isMobileOpen,
    setIsMobileOpen,
    railGroups,
    currentNavItems,
    isAuthorizedItem,
    handleTier1Click,
    user,
    roleBadge,
    handleLogout,
    isLoggingOut,
    dict,
  } = useDashboard();

  const isCurrentAdminPath = pathname.startsWith("/admin");

  return (
    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
      <SheetContent
        side="left"
        className="w-[85vw] max-w-[320px] p-0 border-r border-border/60 bg-card/95 backdrop-blur-xl flex flex-col h-full overflow-hidden [&>button]:hidden shadow-2xl"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Menú de navegación</SheetTitle>
          <SheetDescription>
            Navegación principal de FerroMax en dispositivos móviles
          </SheetDescription>
        </SheetHeader>

        <div className="p-4 border-b border-border/70 flex items-center justify-between bg-background/80">
          <Link
            href="/"
            scroll={false}
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-2.5 group"
          >
            <div className="size-9 rounded-xl flex items-center justify-center bg-primary text-primary-foreground shadow-sm">
              <FerroMaxRibbonLogo className="size-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-foreground tracking-tight">
                FerroMax
              </span>
              <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">
                {isCurrentAdminPath ? "Admin 360" : "Mi Espacio"}
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <MobileModeSelector />

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {railGroups.map((group) => {
            const groupItem = currentNavItems.find(
              (item) => item.href === group.href
            );
            const children = (groupItem?.children || []).filter(isAuthorizedItem);

            if (children.length === 0) return null;

            return (
              <div key={group.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    handleTier1Click(group.href);
                    setIsMobileOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-[10px] font-bold text-muted-foreground/70 tracking-wider uppercase hover:text-foreground transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>{group.label}</span>
                  <ChevronRight className="size-3" />
                </button>
                <div className="space-y-1">
                  {children.map((item) => (
                    <MobileNavItem key={item.href} item={item} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-border/70 bg-background/50 space-y-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full overflow-hidden ring-2 ring-primary/20 shrink-0 bg-primary/15 flex items-center justify-center text-primary font-bold text-sm uppercase">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.name || "Avatar"}
                  className="size-full object-cover"
                />
              ) : (
                user?.firstName?.[0] || user?.name?.[0] || "U"
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-foreground truncate">
                  {user?.name ?? "Usuario"}
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] ${roleBadge.color}`}>
                  {roleBadge.label}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground truncate">
                {user?.email ?? ""}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <ThemeToggle variant="capsule" />
            <LanguageSwitcher />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full rounded-xl py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-2 text-red-600 bg-red-500/10 hover:bg-red-500/15 transition-all hover:scale-[0.98] cursor-pointer"
          >
            <LogOut className="size-3.5" />
            <span>{isLoggingOut ? "Cerrando sesión..." : dict.common.logout}</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
