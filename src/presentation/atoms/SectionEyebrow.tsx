import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function SectionEyebrow({
  icon: Icon,
  children,
  tone = "primary",
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  tone?: "primary" | "accent";
}) {
  return (
    <p
      className={cn(
        "text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2",
        tone === "primary" ? "text-primary" : "text-accent",
      )}
    >
      <Icon className="w-3.5 h-3.5" /> {children}
    </p>
  );
}
