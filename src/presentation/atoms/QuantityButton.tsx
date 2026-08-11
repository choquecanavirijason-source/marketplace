import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export function QuantityButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "w-10 h-12 flex items-center justify-center hover:bg-secondary transition-colors",
        className,
      )}
      {...props}
    />
  );
}
