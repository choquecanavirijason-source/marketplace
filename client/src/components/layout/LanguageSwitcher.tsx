"use client";

import { Check, ChevronDown, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/hooks/useTranslation";
import { useHasMounted } from "@/hooks/useHasMounted";
import { cn } from "@/shared/lib/utils";
import type { Locale } from "@/locales";

interface LanguageSwitcherProps {
  variant?: "dropdown" | "capsule";
  className?: string;
}

const LANGUAGES: { code: Locale; label: string; flag: string }[] = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇺🇸" },
];

export const LanguageSwitcher = ({
  variant = "dropdown",
  className,
}: LanguageSwitcherProps) => {
  const { locale, setLocale } = useTranslation();
  const mounted = useHasMounted();

  if (!mounted) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-muted-foreground/60 rounded-xl border border-border/50 bg-background/50",
          className,
        )}
      >
        <Globe className="size-3.5" />
        <span>ES</span>
      </div>
    );
  }

  if (variant === "capsule") {
    return (
      <div
        className={cn(
          "inline-flex items-center p-0.5 rounded-xl border border-border/70 bg-muted/40 text-xs font-semibold select-none",
          className,
        )}
      >
        {LANGUAGES.map((lang) => {
          const isActive = locale === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLocale(lang.code)}
              className={cn(
                "px-2 py-1 rounded-lg transition-all duration-200 cursor-pointer text-[11px] font-bold flex items-center gap-1",
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs scale-95"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span>{lang.flag}</span>
              <span>{lang.code.toUpperCase()}</span>
            </button>
          );
        })}
      </div>
    );
  }

  const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Cambiar idioma"
          className={cn(
            "group flex items-center gap-1.5 rounded-xl border border-border/70 bg-card/80 hover:bg-muted/70 px-2.5 py-1.5 text-xs font-bold text-foreground transition-all hover:scale-[0.98] cursor-pointer shadow-2xs",
            className,
          )}
        >
          <Globe className="size-3.5 text-primary group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-[11px]">{currentLang.flag}</span>
          <span className="font-extrabold">{currentLang.code.toUpperCase()}</span>
          <ChevronDown className="size-3 text-muted-foreground/70 group-hover:text-foreground transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 p-1 shadow-xl">
        {LANGUAGES.map((lang) => {
          const isSelected = locale === lang.code;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLocale(lang.code)}
              className={cn(
                "flex items-center justify-between px-2.5 py-2 text-xs font-medium cursor-pointer rounded-lg transition-colors",
                isSelected
                  ? "bg-primary/10 text-primary font-bold"
                  : "hover:bg-muted/70 text-foreground",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{lang.flag}</span>
                <span>{lang.label}</span>
              </div>
              {isSelected && <Check className="size-3.5 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
