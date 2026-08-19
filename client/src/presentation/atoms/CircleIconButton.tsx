import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

interface CircleIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md";
}

export function CircleIconButton({ size = "md", className, ...props }: CircleIconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "bg-white rounded-full flex items-center justify-center shadow hover:bg-white transition-all",
        size === "sm" ? "w-8 h-8" : "w-9 h-9",
        className,
      )}
      {...props}
    />
  );
}
