"use client";

import Link from "next/link";
import { cn } from "@/shared/lib/utils";
import { useDashboard } from "../DashboardProvider";
import type { DashboardNavItem } from "../Navigation/NavItems.config";

export interface MobileNavItemProps {
  item: DashboardNavItem;
}

export const MobileNavItem = ({ item }: MobileNavItemProps) => {
  const { isPathActive, handleNavClick, setIsMobileOpen } = useDashboard();
  const Icon = item.icon;
  const isActive = isPathActive(item.href, item.exact);

  return (
    <Link
      href={item.href}
      scroll={false}
      onClick={() => {
        setIsMobileOpen(false);
        handleNavClick(item.href);
      }}
      className={cn(
        "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all min-h-[42px]",
        isActive
          ? "bg-primary text-primary-foreground font-bold shadow-sm scale-[0.98]"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/70 font-medium"
      )}
    >
      <Icon
        className={cn(
          "size-4.5 shrink-0 transition-colors",
          isActive ? "text-primary-foreground" : "text-muted-foreground"
        )}
      />
      <span
        className={cn(
          "flex-1 truncate",
          isActive ? "text-primary-foreground font-bold" : ""
        )}
      >
        {item.label}
      </span>
      {item.badge && (
        <span
          className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full",
            isActive
              ? "bg-white/20 text-white dark:bg-black/40 dark:text-white"
              : "bg-primary/15 text-primary"
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
};
