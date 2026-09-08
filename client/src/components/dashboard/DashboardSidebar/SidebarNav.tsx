"use client";

import Link from "next/link";
import { cn } from "@/shared/lib/utils";
import { useDashboard } from "../DashboardProvider";
import type { DashboardNavItem } from "../Navigation/NavItems.config";

export const SidebarNavLink = ({
  item,
  isChild = false,
}: {
  item: DashboardNavItem;
  isChild?: boolean;
}) => {
  const { isPathActive, handleNavClick } = useDashboard();
  const Icon = item.icon;
  const isActive = isPathActive(item.href, item.exact);

  return (
    <Link
      href={item.href}
      scroll={false}
      onClick={() => handleNavClick(item.href)}
      className={cn(
        "group w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all duration-200 select-none",
        isActive
          ? "bg-primary text-primary-foreground font-bold shadow-sm scale-[0.98]"
          : "text-muted-foreground hover:text-foreground hover:bg-primary/10 hover:text-primary font-medium hover:scale-[0.98]",
        isChild && "pl-9"
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0 transition-colors",
          isActive
            ? "text-primary-foreground"
            : "text-muted-foreground/80 group-hover:text-primary"
        )}
      />
      <span
        className={cn(
          "truncate flex-1",
          isActive && "font-bold text-primary-foreground"
        )}
      >
        {item.label}
      </span>
      {item.badge && (
        <span
          className={cn(
            "ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors",
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

export const SidebarNav = () => {
  const { currentChildren, selectedGroupLabel } = useDashboard();

  if (currentChildren.length === 0) {
    return null;
  }

  return (
    <nav className="space-y-4 overflow-y-auto flex-1 pr-1 scrollbar-none">
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-bold text-muted-foreground/70 tracking-wider uppercase">
          {selectedGroupLabel}
        </p>
        <div className="space-y-0.5">
          {currentChildren.map((item) => (
            <SidebarNavLink key={item.href} item={item} />
          ))}
        </div>
      </div>
    </nav>
  );
};
