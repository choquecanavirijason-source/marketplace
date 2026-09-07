"use client";

import { useEffect, useState, useCallback } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ThemeToggleProps {
  variant?: "capsule" | "button";
  className?: string;
}

export const ThemeToggle = ({
  variant = "capsule",
  className,
}: ThemeToggleProps) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const syncTheme = () => {
      const savedTheme = localStorage.getItem("ferromax-theme");
      const isDark =
        savedTheme === "dark" ||
        (!savedTheme && document.documentElement.classList.contains("dark"));
      setTheme(isDark ? "dark" : "light");
    };

    syncTheme();
    window.addEventListener("storage", syncTheme);
    window.addEventListener("ferromax-theme-changed", syncTheme);

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("ferromax-theme-changed", syncTheme);
    };
  }, []);

  const toggleTheme = useCallback((newTheme: "light" | "dark") => {
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
        localStorage.setItem("ferromax-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("ferromax-theme", "light");
      }
      window.dispatchEvent(new Event("ferromax-theme-changed"));
    }
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          variant === "capsule"
            ? "w-8 h-14 rounded-full border border-border/80 bg-muted/60 opacity-50"
            : "size-9 rounded-xl border border-border/80 bg-muted/40 opacity-50",
          className
        )}
      />
    );
  }

  if (variant === "button") {
    const isDark = theme === "dark";
    return (
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => toggleTheme(isDark ? "light" : "dark")}
              className={cn(
                "size-9 rounded-xl border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer shrink-0",
                className
              )}
              aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {isDark ? (
                <Sun className="size-4 text-amber-500 animate-in fade-in zoom-in-75 duration-200" />
              ) : (
                <Moon className="size-4 text-primary animate-in fade-in zoom-in-75 duration-200" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs font-semibold">
            {isDark ? "Modo Claro" : "Modo Oscuro"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center p-0.5 rounded-full border border-border/80 bg-muted/60 shrink-0",
        className
      )}
    >
      <button
        type="button"
        onClick={() => toggleTheme("light")}
        title="Modo Claro"
        className={cn(
          "size-6 rounded-full flex items-center justify-center transition-all cursor-pointer",
          theme === "light"
            ? "bg-card text-primary shadow-xs font-bold"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Sun className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={() => toggleTheme("dark")}
        title="Modo Oscuro"
        className={cn(
          "size-6 rounded-full flex items-center justify-center transition-all cursor-pointer",
          theme === "dark"
            ? "bg-primary text-primary-foreground shadow-xs font-bold"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Moon className="size-3.5" />
      </button>
    </div>
  );
};

export default ThemeToggle;
