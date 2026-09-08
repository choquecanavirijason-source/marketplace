"use client";

import { cn } from "@/shared/lib/utils";
import { useDashboard } from "../DashboardProvider";
import { SidebarRail } from "./SidebarRail";
import { SidebarContent } from "./SidebarContent";

export const DashboardSidebar = () => {
  const { isRailCollapsed } = useDashboard();

  return (
    <aside
      className={cn(
        "hidden md:flex fixed top-0 bottom-0 left-0 h-screen z-40 select-none border-r border-border/60 bg-background/95 backdrop-blur-xl overflow-hidden transition-all duration-300",
        isRailCollapsed ? "w-[72px]" : "w-[312px]"
      )}
    >
      <SidebarRail />
      <SidebarContent />
    </aside>
  );
};
