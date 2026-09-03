import { Wrench } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function Logo({ variant = "light" }: { variant?: "light" | "dark" }) {
  return (
    <span className="flex items-center gap-2">
      <span className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
        <Wrench className="w-5 h-5 text-white" />
      </span>
      <span>
        <span className={cn("text-xl font-black tracking-tight", variant === "light" ? "text-primary" : "text-orange-400")}>
          Ferro
        </span>
        <span className={cn("text-xl font-black tracking-tight", variant === "light" ? "text-accent" : "text-slate-300")}>
          Max
        </span>
      </span>
    </span>
  );
}
