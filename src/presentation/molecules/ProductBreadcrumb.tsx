import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export function ProductBreadcrumb({
  category,
  productName,
}: {
  category: string;
  productName: string;
}) {
  return (
    <div className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="flex items-center gap-1 hover:text-primary transition-colors">
          <Home className="w-3.5 h-3.5" /> Home
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="hover:text-primary cursor-pointer">{category}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-semibold truncate max-w-[200px]">{productName}</span>
      </div>
    </div>
  );
}
