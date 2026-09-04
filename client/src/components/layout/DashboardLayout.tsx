"use client";

import { useEffect, useState, useCallback, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Package,
  Tags,
  TrendingUp,
  User,
  Users,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  KeyRound,
  Settings,
  Bell,
  Sun,
  Moon,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { usePrivileges } from "@/hooks/usePrivileges";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { NextjsIcon, NestjsIcon } from "@/components/icons/TechIcons";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: string | string[];
  roles?: string[];
  badge?: string;
};

export const adminNavItems: DashboardNavItem[] = [
  { href: "/admin", label: "Panel General", icon: LayoutDashboard },
  {
    href: "/admin/products",
    label: "Productos",
    icon: Package,
    permission: "producto.ver",
    roles: ["admin", "superadmin", "seller", "seller_individual", "seller_company"],
  },
  {
    href: "/admin/categories",
    label: "Categorías",
    icon: Tags,
    permission: "categoria.ver",
    roles: ["admin", "superadmin"],
  },
  {
    href: "/admin/users",
    label: "Gestión de Usuarios",
    icon: Users,
    permission: "usuario.ver",
    roles: ["admin", "superadmin", "support"],
  },
  {
    href: "/admin/metrics",
    label: "Métricas y Reportes",
    icon: TrendingUp,
    permission: "metricas.ver",
    roles: ["admin", "superadmin", "finance", "seller"],
  },
  {
    href: "/admin/auth-settings",
    label: "Métodos de Acceso",
    icon: KeyRound,
    roles: ["admin", "superadmin"],
    badge: "Nuevo",
  },
];

export const customerNavItems: DashboardNavItem[] = [
  { href: "/account/dashboard", label: "Mi Cuenta", icon: LayoutDashboard },
  { href: "/account/profile", label: "Mi Perfil", icon: User },
  { href: "/account/profile/security", label: "Seguridad & Sesiones", icon: ShieldCheck },
  { href: "/favorites", label: "Mis Favoritos", icon: Heart },
];

const FerroMaxRibbonLogo = ({ className = "size-7" }: { className?: string }) => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M7 13.5C11 8.5 17 8.5 21 11.5C24.5 14 27.5 14 29 12.5"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
    <path
      d="M7 22.5C11 27.5 17 27.5 21 24.5C24.5 22 27.5 22 29 23.5"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      className="opacity-75"
    />
    <circle cx="18" cy="18" r="2.8" fill="currentColor" />
  </svg>
);

const getRoleBadgeColor = (user: any, isAdmin: boolean) => {
  if (isAdmin || user?.type === "admin" || user?.type === "superadmin") {
    return "bg-primary text-primary-foreground font-bold";
  }
  if (user?.type === "seller_company") {
    return "bg-blue-600/15 text-blue-600 dark:text-blue-400 font-bold";
  }
  if (user?.type === "seller_individual") {
    return "bg-amber-600/15 text-amber-600 dark:text-amber-400 font-bold";
  }
  if (user?.type === "support") {
    return "bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 font-bold";
  }
  return "bg-muted text-muted-foreground font-medium";
};

export const DashboardLayout = ({
  navItems,
  title,
  children,
}: {
  navItems: DashboardNavItem[];
  title: string;
  children: ReactNode;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, logout, isLoggingOut } = useAuth();
  const { can, hasAnyRole } = usePrivileges();
  const { dict } = useTranslation();

  // Estados de control de layout
  const [isMounted, setIsMounted] = useState(false);
  const [isRailCollapsed, setIsRailCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");

  // Sección activa: 'admin' | 'account'
  const isCurrentAdminSection = pathname.startsWith("/admin");
  const [activeSection, setActiveSection] = useState<"admin" | "account">(
    isCurrentAdminSection ? "admin" : "account"
  );

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const savedCollapse = localStorage.getItem("ferromax-sidebar-collapsed");
      if (savedCollapse === "true") {
        setIsRailCollapsed(true);
      }
      const savedTheme = localStorage.getItem("ferromax-theme");
      const isDark =
        savedTheme === "dark" ||
        (!savedTheme && document.documentElement.classList.contains("dark"));
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (savedTheme === "light") {
        document.documentElement.classList.remove("dark");
      }
      setThemeMode(isDark ? "dark" : "light");
    }
  }, []);

  useEffect(() => {
    setActiveSection(pathname.startsWith("/admin") ? "admin" : "account");
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleRailCollapse = useCallback(() => {
    setIsRailCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("ferromax-sidebar-collapsed", String(next));
      }
      return next;
    });
  }, []);

  const toggleThemeMode = useCallback((mode: "light" | "dark") => {
    setThemeMode(mode);
    if (typeof window !== "undefined") {
      if (mode === "dark") {
        document.documentElement.classList.add("dark");
        localStorage.setItem("ferromax-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("ferromax-theme", "light");
      }
    }
  }, []);

  const getNavLabel = (href: string, fallback: string) => {
    switch (href) {
      case "/admin":
        return dict.nav.overview;
      case "/admin/products":
        return dict.nav.products;
      case "/admin/categories":
        return dict.nav.categories;
      case "/admin/users":
        return dict.nav.users;
      case "/admin/metrics":
        return dict.nav.metrics;
      case "/account/dashboard":
        return dict.nav.myAccount;
      case "/account/profile":
        return dict.nav.myProfile;
      case "/account/profile/security":
        return dict.nav.security;
      case "/favorites":
        return dict.nav.favorites;
      default:
        return fallback;
    }
  };

  const getRoleBadgeLabel = (u: any, isAdm: boolean) => {
    if (isAdm || u?.type === "admin" || u?.type === "superadmin") {
      return dict.common.roleAdmin;
    }
    if (u?.type === "seller_company") {
      return dict.common.roleCompany;
    }
    if (u?.type === "seller_individual") {
      return dict.common.roleSeller;
    }
    if (u?.type === "support") {
      return dict.common.roleSupport;
    }
    return dict.common.roleBuyer;
  };

  const isAuthorizedItem = (item: DashboardNavItem) => {
    if (item.roles && item.roles.length > 0 && !hasAnyRole(item.roles)) {
      return false;
    }
    if (item.permission && !can(item.permission)) {
      return false;
    }
    return true;
  };

  const normalizedPath = pathname.replace(/\/$/, "");
  const allNavItems = [...customerNavItems, ...adminNavItems];

  const exactActive = allNavItems.find(
    (item) => item.href.replace(/\/$/, "") === normalizedPath
  );

  const prefixActive = !exactActive
    ? allNavItems
        .filter((item) => {
          const h = item.href.replace(/\/$/, "");
          if (
            !h ||
            h === "/" ||
            h === "/admin" ||
            h === "/account/dashboard" ||
            h === "/account/profile"
          ) {
            return false;
          }
          return normalizedPath.startsWith(`${h}/`);
        })
        .sort((a, b) => b.href.length - a.href.length)[0]
    : undefined;

  const activeHref = exactActive?.href ?? prefixActive?.href;

  const currentNav =
    allNavItems.find((item) => item.href === activeHref) ??
    navItems.find((item) => item.href.replace(/\/$/, "") === normalizedPath);

  const currentLabel = currentNav ? getNavLabel(currentNav.href, currentNav.label) : title;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.push("/account/login");
    }
  };

  const hasAdminAccess = isAdmin || adminNavItems.some(isAuthorizedItem);

  const roleBadge = {
    label: getRoleBadgeLabel(user, isAdmin),
    color: getRoleBadgeColor(user, isAdmin),
  };

  // Ítems a renderizar según la sección activa
  const activeItemsToRender = (activeSection === "admin" && hasAdminAccess ? adminNavItems : customerNavItems).filter(
    isAuthorizedItem
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex w-full relative">
      {/* ========================================================================= */}
      {/* 1. SIDEBAR DE ESCRITORIO (>= md) - NUNCA RENDERIZA EN MOBILE              */}
      {/* ========================================================================= */}
      <aside
        className={cn(
          "hidden md:flex fixed top-0 bottom-0 left-0 z-40 select-none transition-all duration-300 ease-in-out border-r border-border/80 bg-background",
          isRailCollapsed ? "w-[72px]" : "w-[312px]"
        )}
      >
        {/* ----------------------------------------------------------------------- */}
        {/* RAIL 1: BARRA PERMANENTE DE ÍCONOS (72px)                               */}
        {/* ----------------------------------------------------------------------- */}
        <div className="w-[72px] shrink-0 h-full flex flex-col items-center justify-between py-5 border-r border-border/70 bg-card z-10">
          {/* Top: Logotipo y Módulos Principales */}
          <div className="flex flex-col items-center gap-5 w-full">
            {/* Logotipo FerroMax */}
            <Link
              href="/"
              scroll={false}
              title="FerroMax 360 — Inicio"
              className="group p-1 rounded-2xl transition-transform hover:scale-105 active:scale-95"
            >
              <div className="size-11 rounded-2xl flex items-center justify-center bg-primary text-primary-foreground shadow-md shadow-primary/25 transition-all group-hover:bg-[#cf4900]">
                <FerroMaxRibbonLogo className="size-6 text-primary-foreground" />
              </div>
            </Link>

            {/* Botón flotante para descolapsar Rail 2 si está colapsado */}
            {isRailCollapsed && (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={toggleRailCollapse}
                      className="size-8 rounded-full bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all cursor-pointer shadow-xs animate-in fade-in zoom-in-75 duration-200"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs font-semibold">
                    Descolapsar menú lateral
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Módulos de Trabajo (Admin vs Mi Cuenta) */}
            <TooltipProvider delayDuration={100}>
              <div className="flex flex-col items-center gap-3 w-full">
                {/* Módulo Administrador */}
                {hasAdminAccess && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSection("admin");
                          if (!pathname.startsWith("/admin")) {
                            router.push("/admin");
                          }
                          if (isRailCollapsed) setIsRailCollapsed(false);
                        }}
                        className={cn(
                          "size-11 rounded-full flex items-center justify-center transition-all cursor-pointer",
                          activeSection === "admin"
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-105 font-bold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                        )}
                      >
                        <LayoutDashboard
                          className={cn(
                            "size-5 transition-colors",
                            activeSection === "admin" ? "text-primary-foreground" : "text-current"
                          )}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs font-semibold">
                      {dict.common.adminPanel}
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Módulo Mi Cuenta / Personal */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSection("account");
                        if (!pathname.startsWith("/account") && pathname !== "/favorites") {
                          router.push("/account/dashboard");
                        }
                        if (isRailCollapsed) setIsRailCollapsed(false);
                      }}
                      className={cn(
                        "size-11 rounded-full flex items-center justify-center transition-all cursor-pointer",
                        activeSection === "account"
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-105 font-bold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                      )}
                    >
                      <User
                        className={cn(
                          "size-5 transition-colors",
                          activeSection === "account" ? "text-primary-foreground" : "text-current"
                        )}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs font-semibold">
                    {dict.common.myAccount}
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>

          {/* Bottom: Utilidades Rápidas y Tema */}
          <div className="flex flex-col items-center gap-3.5 w-full">
            <div className="w-8 h-[1px] bg-border/80" />

            <TooltipProvider delayDuration={100}>
              {/* Configuración rápida */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={hasAdminAccess ? "/admin/auth-settings" : "/account/profile/security"}
                    scroll={false}
                    className="size-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
                  >
                    <Settings className="size-4.5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs font-medium">
                  Configuración
                </TooltipContent>
              </Tooltip>

              {/* Notificaciones */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="relative size-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
                  >
                    <Bell className="size-4.5" />
                    <span className="absolute top-2 right-2 size-2 rounded-full bg-primary ring-2 ring-card" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs font-medium">
                  Notificaciones
                </TooltipContent>
              </Tooltip>

              {/* Cápsula de Modo Día / Noche */}
              <div className="flex flex-col items-center p-0.5 rounded-full border border-border/80 bg-muted/60">
                <button
                  type="button"
                  onClick={() => toggleThemeMode("light")}
                  title="Modo Claro"
                  className={cn(
                    "size-7 rounded-full flex items-center justify-center transition-all cursor-pointer",
                    themeMode === "light"
                      ? "bg-card text-primary shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Sun className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleThemeMode("dark")}
                  title="Modo Oscuro"
                  className={cn(
                    "size-7 rounded-full flex items-center justify-center transition-all cursor-pointer",
                    themeMode === "dark"
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Moon className="size-3.5" />
                </button>
              </div>

              {/* Avatar de Usuario */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="size-9.5 rounded-full overflow-hidden ring-2 ring-primary/20 hover:ring-primary transition-all cursor-pointer shrink-0 mt-1 focus:outline-none"
                  >
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user?.name || "Avatar"}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center font-bold text-xs uppercase bg-primary/15 text-primary">
                        {user?.firstName?.[0] || user?.name?.[0] || "U"}
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" side="right" className="w-56 p-1.5 ml-2">
                  <DropdownMenuLabel className="p-2 font-normal">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-foreground truncate">
                          {user?.name ?? "Usuario"}
                        </p>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${roleBadge.color}`}>
                          {roleBadge.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {user?.email ?? ""}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/account/dashboard" scroll={false} className="cursor-pointer flex items-center gap-2 text-xs">
                        <LayoutDashboard className="size-3.5 text-muted-foreground" />
                        <span>{dict.common.myAccount}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/profile" scroll={false} className="cursor-pointer flex items-center gap-2 text-xs">
                        <User className="size-3.5 text-muted-foreground" />
                        <span>{dict.common.myProfile}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/profile/security" scroll={false} className="cursor-pointer flex items-center gap-2 text-xs">
                        <ShieldCheck className="size-3.5 text-muted-foreground" />
                        <span>{dict.common.securitySessions}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/favorites" scroll={false} className="cursor-pointer flex items-center gap-2 text-xs">
                        <Heart className="size-3.5 text-muted-foreground" />
                        <span>{dict.common.favorites}</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  {hasAdminAccess && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                          <Link href="/admin" scroll={false} className="cursor-pointer flex items-center gap-2 text-xs font-semibold text-primary">
                            <Settings className="size-3.5 text-primary" />
                            <span>{dict.common.adminPanel}</span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 text-xs"
                  >
                    <LogOut className="size-3.5 mr-2" />
                    <span>{isLoggingOut ? "Cerrando sesión..." : dict.common.logout}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* RAIL 2: PANEL CONTEXTUAL DESCOLAPSABLE (240px)                          */}
        {/* ----------------------------------------------------------------------- */}
        <div
          className={cn(
            "h-full flex flex-col justify-between bg-background transition-all duration-300 ease-in-out overflow-hidden",
            isRailCollapsed
              ? "w-0 p-0 opacity-0 pointer-events-none"
              : "w-[240px] p-4 opacity-100"
          )}
        >
          <div className="flex flex-col min-h-0 flex-1 space-y-4">
            {/* Header del Rail 2: Switcher de Workspace + Botón de Colapso */}
            <div className="flex items-center gap-2 w-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex-1 min-w-0 rounded-full px-3.5 py-2.5 border border-border/80 bg-card hover:bg-muted/50 text-foreground flex items-center justify-between text-xs font-bold transition-all cursor-pointer shadow-2xs group"
                  >
                    <span className="truncate">
                      {activeSection === "admin" ? "FerroMax Admin" : "Mi Cuenta"}
                    </span>
                    <div className="size-5 rounded-full flex items-center justify-center text-xs bg-primary text-primary-foreground transition-transform group-hover:rotate-45 shadow-xs shrink-0 ml-1.5">
                      <Plus className="size-3 stroke-[3]" />
                    </div>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-56 p-1.5">
                  <DropdownMenuLabel className="text-[11px] font-bold text-muted-foreground uppercase px-2 py-1">
                    Cambiar Espacio
                  </DropdownMenuLabel>
                  {hasAdminAccess && (
                    <DropdownMenuItem
                      onClick={() => {
                        setActiveSection("admin");
                        router.push("/admin");
                      }}
                      className="cursor-pointer text-xs font-medium flex items-center gap-2"
                    >
                      <LayoutDashboard className="size-3.5 text-primary" />
                      <span>Panel Administrador</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      setActiveSection("account");
                      router.push("/account/dashboard");
                    }}
                    className="cursor-pointer text-xs font-medium flex items-center gap-2"
                  >
                    <User className="size-3.5 text-primary" />
                    <span>Mi Cuenta Personal</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Botón para colapsar Rail 2 */}
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={toggleRailCollapse}
                      className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer shrink-0"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    Colapsar menú lateral
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Título de Sección */}
            <div className="px-2 pt-1">
              <span className="text-[10px] font-bold text-muted-foreground/80 tracking-wider uppercase">
                {activeSection === "admin" ? "Menú de Gestión" : "Mi Espacio"}
              </span>
            </div>

            {/* Enlaces de Navegación con Íconos y Texto con Alto Contraste en Selected */}
            <nav className="space-y-1.5 overflow-y-auto flex-1 pr-1 scrollbar-none">
              {activeItemsToRender.map((item) => {
                const Icon = item.icon;
                const label = getNavLabel(item.href, item.label);
                const isActive = item.href === activeHref;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    scroll={false}
                    className={cn(
                      "group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs transition-all select-none",
                      isActive
                        ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/30 scale-[1.01]"
                        : "text-muted-foreground hover:text-foreground hover:bg-primary/10 hover:text-primary font-medium"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4.5 shrink-0 transition-colors",
                        isActive
                          ? "text-primary-foreground"
                          : "text-muted-foreground/80 group-hover:text-primary"
                      )}
                    />
                    <span className={cn("truncate flex-1 font-medium", isActive && "font-bold text-primary-foreground")}>
                      {label}
                    </span>
                    {item.badge && (
                      <span
                        className={cn(
                          "ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors",
                          isActive
                            ? "bg-white/20 text-white dark:bg-black/40 dark:text-white"
                            : "bg-primary/15 text-primary"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE DRAWER (Sheet) - SOLO SE ACTIVA EN MÓVIL (< md)                  */}
      {/* ========================================================================= */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent
          side="left"
          className="w-[85vw] max-w-[320px] p-0 border-r border-border/80 bg-card flex flex-col h-full overflow-hidden [&>button]:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Menú de navegación</SheetTitle>
            <SheetDescription>Navegación principal de FerroMax en dispositivos móviles</SheetDescription>
          </SheetHeader>

          {/* Cabecera del Drawer */}
          <div className="p-4 border-b border-border/70 flex items-center justify-between bg-background/80">
            <Link
              href="/"
              scroll={false}
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-2.5 group"
            >
              <div className="size-9 rounded-xl flex items-center justify-center bg-primary text-primary-foreground shadow-sm">
                <FerroMaxRibbonLogo className="size-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-foreground tracking-tight">FerroMax</span>
                <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">
                  {activeSection === "admin" ? "Admin 360" : "Mi Espacio"}
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Segmented Tabs para cambiar de Workspace en Mobile */}
          {hasAdminAccess && (
            <div className="px-4 pt-3 pb-1">
              <div className="grid grid-cols-2 p-1 rounded-xl bg-muted/60 border border-border/70 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection("admin");
                    if (!pathname.startsWith("/admin")) router.push("/admin");
                  }}
                  className={cn(
                    "py-2 rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1.5",
                    activeSection === "admin"
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LayoutDashboard
                    className={cn(
                      "size-3.5",
                      activeSection === "admin" ? "text-primary-foreground" : "text-muted-foreground"
                    )}
                  />
                  <span>Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection("account");
                    if (!pathname.startsWith("/account") && pathname !== "/favorites") router.push("/account/dashboard");
                  }}
                  className={cn(
                    "py-2 rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1.5",
                    activeSection === "account"
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <User
                    className={cn(
                      "size-3.5",
                      activeSection === "account" ? "text-primary-foreground" : "text-muted-foreground"
                    )}
                  />
                  <span>Cuenta</span>
                </button>
              </div>
            </div>
          )}

          {/* Lista de Navegación Vertical Táctil */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
            <p className="text-[10px] font-bold text-muted-foreground/80 tracking-wider uppercase px-2 mb-2">
              {activeSection === "admin" ? "Módulos Administrativos" : "Navegación Personal"}
            </p>

            {activeItemsToRender.map((item) => {
              const Icon = item.icon;
              const label = getNavLabel(item.href, item.label);
              const isActive = item.href === activeHref;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  scroll={false}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition-all min-h-[44px]",
                    isActive
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70 font-medium"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5 shrink-0 transition-colors",
                      isActive ? "text-primary-foreground" : "text-muted-foreground"
                    )}
                  />
                  <span className={cn("flex-1 truncate", isActive ? "text-primary-foreground font-bold" : "")}>
                    {label}
                  </span>
                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        isActive
                          ? "bg-white/20 text-white dark:bg-black/40 dark:text-white"
                          : "bg-primary/15 text-primary"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Pie del Mobile Drawer: Perfil, Tema y Logout */}
          <div className="p-4 border-t border-border/70 bg-background/50 space-y-3 shrink-0">
            {/* Tarjeta de Usuario */}
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full overflow-hidden ring-2 ring-primary/20 shrink-0 bg-primary/15 flex items-center justify-center text-primary font-bold text-sm uppercase">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user?.name || "Avatar"} className="size-full object-cover" />
                ) : (
                  user?.firstName?.[0] || user?.name?.[0] || "U"
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-foreground truncate">{user?.name ?? "Usuario"}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] ${roleBadge.color}`}>
                    {roleBadge.label}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground truncate">{user?.email ?? ""}</span>
              </div>
            </div>

            {/* Alternador de Tema & Selector de Idioma */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1 p-0.5 rounded-lg border border-border/80 bg-muted/60">
                <button
                  type="button"
                  onClick={() => toggleThemeMode("light")}
                  className={cn(
                    "px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all",
                    themeMode === "light" ? "bg-card text-primary shadow-2xs font-bold" : "text-muted-foreground"
                  )}
                >
                  <Sun className="size-3.5" />
                  <span>Claro</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleThemeMode("dark")}
                  className={cn(
                    "px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all",
                    themeMode === "dark" ? "bg-primary text-primary-foreground shadow-2xs font-bold" : "text-muted-foreground"
                  )}
                >
                  <Moon className="size-3.5" />
                  <span>Oscuro</span>
                </button>
              </div>

              <LanguageSwitcher />
            </div>

            {/* Botón de Cerrar Sesión */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full rounded-xl py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-2 text-red-600 bg-red-500/10 hover:bg-red-500/15 transition-colors cursor-pointer"
            >
              <LogOut className="size-3.5" />
              <span>{isLoggingOut ? "Cerrando sesión..." : dict.common.logout}</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ========================================================================= */}
      {/* 3. CONTENIDO PRINCIPAL Y NAVBAR TOP                                       */}
      {/* ========================================================================= */}
      <div
        className={cn(
          "min-w-0 flex-1 w-full min-h-screen flex flex-col bg-muted/20 transition-[padding-left] duration-300 ease-in-out",
          isRailCollapsed ? "md:pl-[72px]" : "md:pl-[312px]"
        )}
      >
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/80 bg-background/95 backdrop-blur px-3 sm:px-6">
          {/* Lado Izquierdo: Disparadores de menú y Breadcrumbs */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Disparador Mobile: Menú Hamburguesa */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden size-9 rounded-lg border border-border/80 flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors cursor-pointer shrink-0"
              aria-label="Abrir menú"
            >
              <Menu className="size-5" />
            </button>

            {/* Disparador Desktop: Colapsar/Descolapsar Rail 2 */}
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={toggleRailCollapse}
                    className="hidden md:flex size-8.5 rounded-lg border border-border/80 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer shrink-0"
                    aria-label={isRailCollapsed ? "Expandir panel lateral" : "Colapsar panel lateral"}
                  >
                    {isRailCollapsed ? (
                      <PanelLeftOpen className="size-4 text-primary" />
                    ) : (
                      <PanelLeftClose className="size-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-medium">
                  {isRailCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-4 hidden sm:block" />

            {/* Breadcrumb de navegación */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0 truncate">
              <span className="hidden sm:inline font-medium">
                {isCurrentAdminSection ? dict.common.administration : dict.common.mySpace}
              </span>
              <ChevronRight className="size-3 text-muted-foreground/50 hidden sm:inline shrink-0" />
              <h1 className="text-foreground text-sm font-bold truncate">{currentLabel}</h1>
            </div>
          </div>

          {/* Lado Derecho: Idioma, Tema, Notificaciones y Perfil */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Toggle de tema en Navbar (visible en escritorio) */}
            <div className="hidden sm:flex items-center p-0.5 rounded-full border border-border/80 bg-muted/60">
              <button
                type="button"
                onClick={() => toggleThemeMode("light")}
                title="Modo Claro"
                className={cn(
                  "size-7 rounded-full flex items-center justify-center transition-all cursor-pointer",
                  themeMode === "light"
                    ? "bg-card text-primary shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sun className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => toggleThemeMode("dark")}
                title="Modo Oscuro"
                className={cn(
                  "size-7 rounded-full flex items-center justify-center transition-all cursor-pointer",
                  themeMode === "dark"
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Moon className="size-3.5" />
              </button>
            </div>

            <LanguageSwitcher />

            <Separator orientation="vertical" className="h-5 hidden sm:block" />

            {/* Menú Dropdown de Perfil */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2.5 rounded-xl p-1 sm:px-2.5 sm:py-1.5 hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer group text-left border border-transparent hover:border-border/60"
                >
                  <div className="bg-primary/15 text-primary flex aspect-square size-8 items-center justify-center rounded-lg font-bold text-xs uppercase shrink-0 border border-primary/25 group-hover:bg-primary group-hover:text-primary-foreground transition-colors overflow-hidden">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user?.name || "Avatar"}
                        className="size-full object-cover"
                      />
                    ) : (
                      user?.firstName?.[0] || user?.name?.[0] || "U"
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col min-w-0 leading-tight">
                    <span className="text-xs font-semibold text-foreground truncate max-w-[130px]">
                      {user?.name ?? "Usuario"}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate max-w-[130px]">
                      {user?.email ?? ""}
                    </span>
                  </div>
                  <ChevronDown className="size-3.5 text-muted-foreground/70 shrink-0 group-hover:text-foreground transition-colors hidden sm:block" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 p-1.5">
                <DropdownMenuLabel className="p-2 font-normal">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-foreground truncate">
                        {user?.name ?? "Usuario"}
                      </p>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${roleBadge.color}`}>
                        {roleBadge.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {user?.email ?? ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/account/dashboard" scroll={false} className="cursor-pointer flex items-center gap-2 text-xs">
                      <LayoutDashboard className="size-3.5 text-muted-foreground" />
                      <span>{dict.common.myAccount}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/profile" scroll={false} className="cursor-pointer flex items-center gap-2 text-xs">
                      <User className="size-3.5 text-muted-foreground" />
                      <span>{dict.common.myProfile}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/profile/security" scroll={false} className="cursor-pointer flex items-center gap-2 text-xs">
                      <ShieldCheck className="size-3.5 text-muted-foreground" />
                      <span>{dict.common.securitySessions}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" scroll={false} className="cursor-pointer flex items-center gap-2 text-xs">
                      <Heart className="size-3.5 text-muted-foreground" />
                      <span>{dict.common.favorites}</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                {hasAdminAccess && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" scroll={false} className="cursor-pointer flex items-center gap-2 text-xs font-semibold text-primary">
                          <Settings className="size-3.5 text-primary" />
                          <span>{dict.common.adminPanel}</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 text-xs"
                >
                  <LogOut className="size-3.5 mr-2" />
                  <span>{isLoggingOut ? "Cerrando sesión..." : dict.common.logout}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Contenedor del contenido de la página */}
        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>

        {/* Footer Tecnológico */}
        <footer className="w-full border-t border-border/60 bg-background/80 backdrop-blur px-4 py-3 mt-auto text-xs text-muted-foreground">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 text-[11px] font-medium">
            <div className="flex items-center gap-1.5">
              <NextjsIcon className="size-3.5 text-foreground" />
              <span className="text-foreground font-semibold">Next.js</span>
              <span className="text-muted-foreground">v16.3.0</span>
            </div>
            <span className="text-border">•</span>
            <div className="flex items-center gap-1.5">
              <NestjsIcon className="size-3.5 text-[#E0234E]" />
              <span className="text-foreground font-semibold">NestJS</span>
              <span className="text-muted-foreground">v12.0.1</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;