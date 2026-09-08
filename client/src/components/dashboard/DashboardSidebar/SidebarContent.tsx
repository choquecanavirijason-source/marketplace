"use client";

import { ChevronLeft } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { ModeSelector } from "../ModeSelector";
import { SidebarNav } from "./SidebarNav";
import { useDashboard } from "../DashboardProvider";

export const SidebarContent = () => {
  const { isRailCollapsed, toggleRailCollapse } = useDashboard();

  return (
    <div
      className={cn(
        "h-full flex flex-col justify-between bg-background overflow-hidden transition-all duration-300",
        isRailCollapsed
          ? "w-0 p-0 opacity-0 pointer-events-none"
          : "w-[240px] p-4 opacity-100"
      )}
    >
      <div className="flex flex-col min-h-0 flex-1 space-y-4">
        <div className="flex items-center gap-2 w-full shrink-0">
          <ModeSelector />

          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={toggleRailCollapse}
                  className="size-8.5 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 border border-border/70 transition-all cursor-pointer shrink-0 hover:scale-110"
                >
                  <ChevronLeft className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                Colapsar menú lateral
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <SidebarNav />
      </div>
    </div>
  );
};
