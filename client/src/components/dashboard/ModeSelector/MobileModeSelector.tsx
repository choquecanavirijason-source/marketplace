"use client";

import { useRouter } from "next/navigation";
import { Building2, ShieldCheck, Store, User } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useDashboard } from "../DashboardProvider";

export const MobileModeSelector = () => {
  const router = useRouter();
  const {
    effectiveMode,
    isAdmin,
    isSellerAvailable,
    setActiveMode,
    setIsMobileOpen,
    handleNavClick,
    setIsActivateModalOpen,
  } = useDashboard();

  return (
    <div className="p-3 bg-muted/40 border-b border-border/60">
      <p className="text-[10px] font-black text-muted-foreground uppercase px-1 pb-1.5 tracking-wider">
        Perfil / Modo Activo
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => {
            setActiveMode("buyer");
            setIsMobileOpen(false);
            handleNavClick("/account/dashboard");
            router.push("/account/dashboard");
          }}
          className={cn(
            "p-2 rounded-xl text-left border transition-all flex items-center gap-2 cursor-pointer",
            effectiveMode === "buyer"
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-bold"
              : "bg-background border-border/70 text-muted-foreground hover:text-foreground"
          )}
        >
          <User className="size-3.5 shrink-0" />
          <span className="text-[11px] truncate">Comprador</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (isSellerAvailable) {
              setActiveMode("seller");
              setIsMobileOpen(false);
              handleNavClick("/seller/dashboard");
              router.push("/seller/dashboard");
            } else {
              setIsMobileOpen(false);
              setIsActivateModalOpen(true);
            }
          }}
          className={cn(
            "p-2 rounded-xl text-left border transition-all flex items-center gap-2 cursor-pointer",
            effectiveMode === "seller"
              ? "bg-primary/15 border-primary/40 text-primary font-bold"
              : "bg-background border-border/70 text-muted-foreground hover:text-foreground"
          )}
        >
          <Store className="size-3.5 shrink-0" />
          <span className="text-[11px] truncate">Vendedor</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMode("company");
            setIsMobileOpen(false);
            handleNavClick("/account/company");
            router.push("/account/company");
          }}
          className={cn(
            "p-2 rounded-xl text-left border transition-all flex items-center gap-2 cursor-pointer",
            effectiveMode === "company"
              ? "bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-400 font-bold"
              : "bg-background border-border/70 text-muted-foreground hover:text-foreground"
          )}
        >
          <Building2 className="size-3.5 shrink-0" />
          <span className="text-[11px] truncate">Empresa</span>
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setActiveMode("admin");
              setIsMobileOpen(false);
              handleNavClick("/admin");
              router.push("/admin");
            }}
            className={cn(
              "p-2 rounded-xl text-left border transition-all flex items-center gap-2 cursor-pointer",
              effectiveMode === "admin"
                ? "bg-red-500/15 border-red-500/40 text-red-600 dark:text-red-400 font-bold"
                : "bg-background border-border/70 text-muted-foreground hover:text-foreground"
            )}
          >
            <ShieldCheck className="size-3.5 shrink-0" />
            <span className="text-[11px] truncate">Admin</span>
          </button>
        )}
      </div>
    </div>
  );
};
