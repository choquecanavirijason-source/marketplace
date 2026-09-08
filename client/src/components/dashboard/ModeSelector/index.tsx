"use client";

import { useRouter } from "next/navigation";
import {
  Building2,
  Check,
  ChevronDown,
  ShieldCheck,
  Store,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import { useDashboard } from "../DashboardProvider";

export const ModeSelector = () => {
  const router = useRouter();
  const {
    effectiveMode,
    user,
    isAdmin,
    isSellerAvailable,
    isCompanyAvailable,
    setActiveMode,
    handleNavClick,
    setIsActivateModalOpen,
  } = useDashboard();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex-1 min-w-0 rounded-2xl px-3 py-2 border border-border/80 bg-card hover:bg-muted/60 text-foreground flex items-center justify-between text-xs font-bold transition-all cursor-pointer shadow-2xs group hover:scale-[0.98]"
        >
          <div className="flex items-center gap-2 min-w-0 truncate">
            <div
              className={cn(
                "size-6 rounded-lg flex items-center justify-center shrink-0",
                effectiveMode === "admin"
                  ? "bg-red-500/15 text-red-600 dark:text-red-400"
                  : effectiveMode === "seller"
                  ? "bg-primary/15 text-primary"
                  : effectiveMode === "company"
                  ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              )}
            >
              {effectiveMode === "admin" ? (
                <ShieldCheck className="size-3.5" />
              ) : effectiveMode === "seller" ? (
                <Store className="size-3.5" />
              ) : effectiveMode === "company" ? (
                <Building2 className="size-3.5" />
              ) : (
                <User className="size-3.5" />
              )}
            </div>
            <div className="flex flex-col text-left truncate">
              <span className="truncate leading-tight font-extrabold text-foreground">
                {effectiveMode === "admin"
                  ? "FerroMax Admin"
                  : effectiveMode === "seller"
                  ? user?.sellerProfile?.storeName || "Mi Tienda"
                  : effectiveMode === "company"
                  ? user?.businessProfile?.legalName || "Mi Empresa"
                  : user?.name || "Mi Cuenta"}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium leading-none mt-0.5">
                {effectiveMode === "admin"
                  ? "Panel de Gestión"
                  : effectiveMode === "seller"
                  ? "Modo Vendedor"
                  : effectiveMode === "company"
                  ? "Modo Empresa (B2B)"
                  : "Modo Comprador"}
              </span>
            </div>
          </div>
          <div className="size-5 rounded-full flex items-center justify-center text-xs text-muted-foreground group-hover:text-foreground transition-transform shrink-0 ml-1">
            <ChevronDown className="size-3.5" />
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-72 p-1.5 shadow-xl">
        <DropdownMenuLabel className="text-[10px] font-black text-muted-foreground uppercase px-2 py-1 tracking-wider">
          Cambiar Perfil / Modo
        </DropdownMenuLabel>

        {/* Modo Comprador */}
        <DropdownMenuItem
          onClick={() => {
            setActiveMode("buyer");
            handleNavClick("/account/dashboard");
            router.push("/account/dashboard");
          }}
          className={cn(
            "cursor-pointer text-xs p-2.5 rounded-xl flex items-center justify-between transition-all",
            effectiveMode === "buyer"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold"
              : "hover:bg-muted/70 text-foreground"
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-7 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
              <User className="size-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold truncate">Modo Comprador</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                Compras personales y pedidos
              </span>
            </div>
          </div>
          {effectiveMode === "buyer" && (
            <Check className="size-4 text-emerald-600 shrink-0 ml-2" />
          )}
        </DropdownMenuItem>

        {/* Modo Vendedor */}
        {isSellerAvailable ? (
          <DropdownMenuItem
            onClick={() => {
              setActiveMode("seller");
              handleNavClick("/seller/dashboard");
              router.push("/seller/dashboard");
            }}
            className={cn(
              "cursor-pointer text-xs p-2.5 rounded-xl flex items-center justify-between transition-all",
              effectiveMode === "seller"
                ? "bg-primary/10 text-primary font-bold"
                : "hover:bg-muted/70 text-foreground"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <Store className="size-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold truncate">
                  {user?.sellerProfile?.storeName || "Modo Vendedor"}
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  Gestión de catálogo y ventas
                </span>
              </div>
            </div>
            {effectiveMode === "seller" && (
              <Check className="size-4 text-primary shrink-0 ml-2" />
            )}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => setIsActivateModalOpen(true)}
            className="cursor-pointer text-xs p-2.5 rounded-xl flex items-center justify-between hover:bg-primary/10 hover:text-primary transition-all text-foreground"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-7 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                <Store className="size-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-foreground">Activar Modo Vendedor</span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  Empieza a vender en FerroMax
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-primary/15 text-primary px-2 py-0.5 rounded-full shrink-0">
              Activar
            </span>
          </DropdownMenuItem>
        )}

        {/* Modo Empresa */}
        {isCompanyAvailable ? (
          <DropdownMenuItem
            onClick={() => {
              setActiveMode("company");
              handleNavClick("/account/company");
              router.push("/account/company");
            }}
            className={cn(
              "cursor-pointer text-xs p-2.5 rounded-xl flex items-center justify-between transition-all",
              effectiveMode === "company"
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold"
                : "hover:bg-muted/70 text-foreground"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-7 rounded-lg bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
                <Building2 className="size-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold truncate">
                  {user?.businessProfile?.legalName || "Modo Empresa"}
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  CUIT: {user?.businessProfile?.taxId || "Registrado"} · B2B
                </span>
              </div>
            </div>
            {effectiveMode === "company" && (
              <Check className="size-4 text-blue-600 shrink-0 ml-2" />
            )}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => {
              setActiveMode("company");
              handleNavClick("/account/company");
              router.push("/account/company");
            }}
            className="cursor-pointer text-xs p-2.5 rounded-xl flex items-center justify-between hover:bg-blue-500/10 hover:text-blue-600 transition-all text-foreground"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-7 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                <Building2 className="size-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-foreground">Modo Empresa (B2B)</span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  Registrar CUIT y datos fiscales
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-blue-500/15 text-blue-600 px-2 py-0.5 rounded-full shrink-0">
              Registrar
            </span>
          </DropdownMenuItem>
        )}

        {/* Admin Global */}
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setActiveMode("admin");
                handleNavClick("/admin");
                router.push("/admin");
              }}
              className={cn(
                "cursor-pointer text-xs p-2.5 rounded-xl flex items-center justify-between transition-all",
                effectiveMode === "admin"
                  ? "bg-red-500/10 text-red-600 dark:text-red-400 font-bold"
                  : "hover:bg-muted/70 text-foreground"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-7 rounded-lg bg-red-500/15 text-red-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold">FerroMax Admin</span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    Panel general y gobernanza
                  </span>
                </div>
              </div>
              {effectiveMode === "admin" && (
                <Check className="size-4 text-red-600 shrink-0 ml-2" />
              )}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
