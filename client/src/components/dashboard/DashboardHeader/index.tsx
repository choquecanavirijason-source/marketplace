"use client";

import { ChevronRight, Menu } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { useDashboard } from "../DashboardProvider";

export const DashboardHeader = () => {
  const { pathname, currentLabel, setIsMobileOpen, dict } = useDashboard();
  const isCurrentAdminPath = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background/80 backdrop-blur-xl px-3 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden size-9 rounded-lg border border-border/80 flex items-center justify-center text-foreground hover:bg-muted/80 transition-all hover:scale-105 cursor-pointer shrink-0"
          aria-label="Abrir menú"
        >
          <Menu className="size-5" />
        </button>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0 truncate">
          <span className="hidden sm:inline font-medium">
            {isCurrentAdminPath ? dict.common.administration : dict.common.mySpace}
          </span>
          <ChevronRight className="size-3 text-muted-foreground/50 hidden sm:inline shrink-0" />
          <h1 className="text-foreground text-sm font-bold truncate">{currentLabel}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <LanguageSwitcher />

        <Separator orientation="vertical" className="h-5 hidden sm:block" />

        <UserMenu />
      </div>
    </header>
  );
};
