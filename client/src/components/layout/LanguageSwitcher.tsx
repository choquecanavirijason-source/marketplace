"use client";

import { Globe } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useHasMounted } from "@/hooks/useHasMounted";

export function LanguageSwitcher() {
  const { locale, toggleLocale } = useTranslation();
  const mounted = useHasMounted();

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-muted-foreground">
        <Globe className="w-3.5 h-3.5" />
        <span>ES</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleLocale}
      title={locale === "es" ? "Cambiar a Inglés (EN)" : "Switch to Spanish (ES)"}
      className="flex items-center gap-1 rounded-lg border border-border/80 bg-background/60 hover:bg-accent/80 px-2 py-1 text-xs font-bold text-foreground transition-colors"
    >
      <Globe className="w-3.5 h-3.5 text-primary" />
      <span>{locale.toUpperCase()}</span>
    </button>
  );
}
