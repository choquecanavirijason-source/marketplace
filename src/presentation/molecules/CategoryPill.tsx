import type { Category } from "@/domain/entities/Category";
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
        "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
        active ? "border-primary bg-secondary shadow-md" : "border-transparent bg-card hover:border-border",
      )}
    >
      <span
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: category.color }}
      >
        <category.icon className="w-5 h-5 text-foreground/70" strokeWidth={1.75} />
      </span>
      <span className="text-xs font-semibold text-center text-foreground leading-tight">{category.name}</span>
      <span className="text-[10px] text-muted-foreground">{category.count} productos</span>
    </button>
  );
}
