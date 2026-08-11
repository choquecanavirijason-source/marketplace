import { Leaf } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function Logo({ variant = "light" }: { variant?: "light" | "dark" }) {
  return (
    <span className="flex items-center gap-2">
      <span className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
        <Leaf className="w-5 h-5 text-white" />
      </span>
      <span>
        <span className={cn("text-xl font-black tracking-tight", variant === "light" ? "text-primary" : "text-green-400")}>
          Eko
        </span>
        <span className={cn("text-xl font-black tracking-tight", variant === "light" ? "text-accent" : "text-orange-400")}>
          Mart
        </span>
      </span>
    </span>
  );
}
