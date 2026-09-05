import type { Category } from "@/types";
import { cn } from "@/shared/lib/utils";

export function CategoryPill({
  category,
  active,
  onClick,
}: {
  category: Category;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-md group active:scale-95",
        active ? "border-primary bg-secondary shadow-md" : "border-transparent bg-card hover:border-border",
      )}
    >
      <span
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
        style={{ background: category.color }}
      >
        <category.icon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/70 transition-colors group-hover:text-foreground" strokeWidth={1.75} />
      </span>
      <span className="text-[10px] sm:text-xs font-semibold text-center text-foreground leading-tight">{category.name}</span>
      <span className="text-[9px] sm:text-[10px] text-muted-foreground">{category.count} productos</span>
    </button>
  );
}
