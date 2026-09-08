"use client";

import Link from "next/link";
import { Bell, ChevronRight, Settings } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { FerroMaxRibbonLogo } from "../FerroMaxRibbonLogo";
import { SidebarTier1Button } from "./SidebarTier1Button";
import { useDashboard } from "../DashboardProvider";

export const SidebarRail = () => {
  const {
    pathname,
    isAdmin,
    railGroups,
    selectedGroupHref,
    handleTier1Click,
    handleNavClick,
    isRailCollapsed,
    toggleRailCollapse,
  } = useDashboard();

  return (
    <div className="w-[72px] shrink-0 h-full flex flex-col justify-between items-center py-3 px-2 border-r border-border/50 bg-card/90 backdrop-blur-sm z-10 overflow-hidden">
      <div className="flex flex-col items-center gap-2 w-full shrink-0">
        <Link
          href="/"
          scroll={false}
          title="FerroMax 360 — Inicio"
          className="group p-1 rounded-2xl transition-colors hover:bg-muted/70 mb-0.5"
        >
          <div className="size-10 rounded-2xl flex items-center justify-center bg-primary text-primary-foreground shadow-md shadow-primary/25 transition-all duration-300 group-hover:bg-[#cf4900] group-hover:scale-110">
            <FerroMaxRibbonLogo className="size-5.5 text-primary-foreground" />
          </div>
        </Link>

        {isRailCollapsed && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={toggleRailCollapse}
                  className="size-8 rounded-full bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all cursor-pointer shadow-xs mb-0.5 hover:scale-110"
                >
                  <ChevronRight className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-semibold">
                Expandir menú lateral
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <TooltipProvider delayDuration={100}>
          <div className="flex flex-col items-center gap-1.5 w-full">
            {railGroups.map((group) => {
              const isActive = group.match(pathname);
              const isSelected = selectedGroupHref === group.href;

              return (
                <SidebarTier1Button
                  key={group.id}
                  group={group}
                  isActive={isActive}
                  isSelected={isSelected}
                  onClick={() => handleTier1Click(group.href)}
                />
              );
            })}
          </div>
        </TooltipProvider>
      </div>

      <div className="flex flex-col items-center gap-2.5 w-full mt-auto pt-2 pb-1 shrink-0">
        <div className="w-7 h-[1px] bg-border/80 my-0.5" />

        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={isAdmin ? "/admin/settings" : "/account/profile/security"}
                scroll={false}
                onClick={() =>
                  handleNavClick(
                    isAdmin ? "/admin/settings" : "/account/profile/security"
                  )
                }
                className="size-8.5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all hover:scale-110"
              >
                <Settings className="size-4.5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs font-medium">
              Configuración
            </TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="relative size-8.5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all hover:scale-110 cursor-pointer"
                  >
                    <Bell className="size-4.5" />
                    <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-card animate-pulse" />
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium">
                Notificaciones (3)
              </TooltipContent>
            </Tooltip>

            <DropdownMenuContent side="right" align="end" className="w-80 p-2 shadow-2xl ml-2">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/60 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">Notificaciones</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-primary/15 text-primary">
                    3 nuevas
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toast.success("Notificaciones marcadas como leídas")}
                  className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                >
                  Marcar leídas
                </button>
              </div>

              <div className="space-y-1 py-1 max-h-64 overflow-y-auto">
                <div className="p-2 rounded-lg hover:bg-muted/60 transition-colors text-xs space-y-0.5">
                  <p className="font-bold text-foreground">Nuevo pedido recibido #ORD-2026-089</p>
                  <p className="text-[11px] text-muted-foreground">
                    Taladro Percutor Bosch 750W (Bs 850)
                  </p>
                  <span className="text-[10px] text-muted-foreground/70">Hace 10 minutos</span>
                </div>
                <div className="p-2 rounded-lg hover:bg-muted/60 transition-colors text-xs space-y-0.5">
                  <p className="font-bold text-foreground">Alerta de stock bajo</p>
                  <p className="text-[11px] text-muted-foreground">
                    Amoladora Angular DeWalt (Quedan 2 unidades)
                  </p>
                  <span className="text-[10px] text-muted-foreground/70">Hace 1 hora</span>
                </div>
                <div className="p-2 rounded-lg hover:bg-muted/60 transition-colors text-xs space-y-0.5">
                  <p className="font-bold text-foreground">Consulta en Bandeja</p>
                  <p className="text-[11px] text-muted-foreground">
                    María López consultó sobre tiempo de despacho
                  </p>
                  <span className="text-[10px] text-muted-foreground/70">Hace 2 horas</span>
                </div>
              </div>

              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="p-1.5 justify-center text-center">
                <Link
                  href={isAdmin ? "/admin/inbox" : "/account/orders"}
                  className="text-xs font-bold text-primary text-center w-full block py-1 cursor-pointer"
                >
                  {isAdmin ? "Ver Bandeja Omnicanal" : "Ver Mis Pedidos"}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle variant="capsule" />
        </TooltipProvider>
      </div>
    </div>
  );
};
