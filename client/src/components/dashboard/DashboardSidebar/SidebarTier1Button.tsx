"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import type { RailGroup } from "../Navigation/useNavItems";

export interface SidebarTier1ButtonProps {
  group: RailGroup;
  isActive: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export const SidebarTier1Button = ({
  group,
  isActive,
  isSelected,
  onClick,
}: SidebarTier1ButtonProps) => {
  const Icon = group.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          aria-label={group.label}
          className={cn(
            "size-10 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer relative",
            isActive || isSelected
              ? "bg-primary text-primary-foreground font-bold shadow-sm scale-95"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/70 hover:scale-95"
          )}
        >
          <Icon
            className={cn(
              "size-5 transition-colors",
              isActive || isSelected ? "text-primary-foreground" : "text-current"
            )}
          />
          {isSelected && !isActive && (
            <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-full" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="text-xs font-semibold">
        {group.label}
      </TooltipContent>
    </Tooltip>
  );
};
