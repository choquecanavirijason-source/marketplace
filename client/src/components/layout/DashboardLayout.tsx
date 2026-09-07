"use client";

import { useEffect, useState, useCallback, useMemo, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
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
  Menu,
  X,
  ShoppingBag,
  Truck,
  Contact,
  MessageSquare,
  Radio,
  Bot,
  Store,
  Home,
  Award,
  CreditCard,
  Gift,
  Star,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
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
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NextjsIcon, NestjsIcon } from "@/components/icons/TechIcons";
import { cancelAllPendingRequests } from "@/config/axios";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: string | string[];
  roles?: string[];
  badge?: string;
  category?: string;
  children?: DashboardNavItem[];
  exact?: boolean;
};

export const adminNavItems: DashboardNavItem[] = [
  {
    href: "/admin",
    label: "Panel General",
    icon: LayoutDashboard,
    exact: true,
    children: [
      {
        href: "/admin/orders",
        label: "Pedidos y Ventas",
        icon: ShoppingBag,
        permission: "pedido.ver",
        roles: ["admin", "superadmin", "seller", "support"],
      },
      {
        href: "/admin/logistics",
        label: "Logística y Envíos",
        icon: Truck,
        permission: "logistica.ver",
        roles: ["admin", "superadmin", "seller", "support"],
      },
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
    ]
  },
  {
    href: "/admin/crm",
    label: "Clientes & Canales",
    icon: Contact,
    children: [
      {
        href: "/admin/crm",
        label: "CRM & Clientes",
        icon: Contact,
        permission: "crm.ver",
        roles: ["admin", "superadmin", "seller"],
      },
      {
        href: "/admin/inbox",
        label: "Bandeja Omnicanal",
        icon: MessageSquare,
        permission: "inbox.ver",
        roles: ["admin", "superadmin", "support"],
      },
      {
        href: "/admin/live-shopping",
        label: "Live Shopping",
        icon: Radio,
        permission: "live.ver",
        roles: ["admin", "superadmin", "seller"],
        badge: "En Vivo",
      },
    ]
  },
  {
    href: "/admin/metrics",
    label: "Analítica & Control",
    icon: TrendingUp,
    children: [
      {
        href: "/admin/ai-copilot",
        label: "IA & Recomendaciones",
        icon: Bot,
        permission: "ai.ver",
        roles: ["admin", "superadmin"],
        badge: "IA",
      },
      {
        href: "/admin/metrics",
        label: "Métricas y Reportes",
        icon: TrendingUp,
        permission: "metricas.ver",
        roles: ["admin", "superadmin", "finance", "seller"],
      },
      {
        href: "/admin/users",
        label: "Gestión de Usuarios",
        icon: Users,
        permission: "usuario.ver",
        roles: ["admin", "superadmin", "support"],
      },
    ]
  },
  {
    href: "/admin/settings",
    label: "Configuración",
    icon: Settings,
    children: [
      {
        href: "/admin/settings",
        label: "Configuración General",
        icon: Settings,
        roles: ["admin", "superadmin"],
      },
      {
        href: "/admin/auth-settings",
        label: "Métodos de Acceso",
        icon: KeyRound,
        roles: ["admin", "superadmin"],
        badge: "Nuevo",
      },
    ]
  },
  {
    href: "/account/dashboard",
    label: "Mi Perfil",
    icon: User,
    children: [
      {
        href: "/account/dashboard",
        label: "Resumen de Cuenta",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        href: "/account/orders",
        label: "Mis Pedidos",
        icon: ShoppingBag,
      },
      {
        href: "/account/favorites",
        label: "Mis Favoritos",
        icon: Heart,
      },
      {
        href: "/account/addresses",
        label: "Mis Direcciones",
        icon: MapPin,
      },
      {
        href: "/account/profile",
        label: "Mi Perfil",
        icon: User,
        exact: true,
      },
      {
        href: "/account/profile/security",
        label: "Seguridad",
        icon: ShieldCheck,
      },
    ]
  },
];

export const customerNavItems: DashboardNavItem[] = [
  {
    href: "/account/dashboard",
    label: "Mi Cuenta",
    icon: LayoutDashboard,
    exact: true,
    children: [
      {
        href: "/account/dashboard",
        label: "Resumen de Cuenta",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        href: "/account/orders",
        label: "Mis Pedidos",
        icon: ShoppingBag,
      },
      {
        href: "/account/favorites",
        label: "Mis Favoritos",
        icon: Heart,
      },
      {
        href: "/account/addresses",
        label: "Mis Direcciones",
        icon: MapPin,
      },
      {
        href: "/account/wishlist",
        label: "Lista de Deseos",
        icon: Gift,
      },
      {
        href: "/account/reviews",
        label: "Mis Reseñas",
        icon: Star,
      },
    ]
  },
  {
    href: "/account/profile",
    label: "Perfil & Seguridad",
    icon: User,
    children: [
      {
        href: "/account/profile",
        label: "Mi Perfil",
        icon: User,
        exact: true,
      },
      {
        href: "/account/profile/security",
        label: "Seguridad",
        icon: ShieldCheck,
      },
      {
        href: "/account/profile/preferences",
        label: "Preferencias",
        icon: Settings,
      },
    ]
  },
  {
    href: "/account/payments",
    label: "Pagos & Suscripciones",
    icon: CreditCard,
    children: [
      {
        href: "/account/payments",
        label: "Métodos de Pago",
        icon: CreditCard,
        exact: true,
      },
      {
        href: "/account/subscriptions",
        label: "Suscripciones",
        icon: Award,
      },
      {
        href: "/account/invoices",
        label: "Facturas",
        icon: Receipt,
      },
    ]
  },
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
  navItems?: DashboardNavItem[];
  title?: string;
  children: ReactNode;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { user, isAdmin, logout, isLoggingOut } = useAuth();
  const { can, hasAnyRole } = usePrivileges();
  const { dict } = useTranslation();

  const [isMounted, setIsMounted] = useState(false);
  const [isRailCollapsed, setIsRailCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedGroupHref, setSelectedGroupHref] = useState<string>("");

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const savedCollapse = localStorage.getItem("ferromax-sidebar-collapsed");
      if (savedCollapse === "true") {
        setIsRailCollapsed(true);
      }
    }
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsNavigating(false);
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

  const handleNavClick = useCallback(
    (href: string) => {
      if (href !== pathname) {
        queryClient.cancelQueries();
        cancelAllPendingRequests();
        setIsNavigating(true);
      }
    },
    [pathname, queryClient]
  );

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

  const isAuthorizedItem = useCallback((item: DashboardNavItem) => {
    if (item.roles && item.roles.length > 0 && !hasAnyRole(item.roles)) {
      return false;
    }
    if (item.permission && !can(item.permission)) {
      return false;
    }
    return true;
  }, [hasAnyRole, can]);

  const hasAdminAccess = isAdmin || adminNavItems.some(isAuthorizedItem);

  const currentNavItems = useMemo(() => {
    return hasAdminAccess ? adminNavItems : customerNavItems;
  }, [hasAdminAccess]);

  const isPathActive = useCallback((itemHref: string, exact?: boolean) => {
    const normalizedPath = pathname.replace(/\/$/, "");
    const normalizedHref = itemHref.replace(/\/$/, "");

    if (exact) {
      return normalizedPath === normalizedHref;
    }

    if (normalizedHref === "/" || normalizedHref === "/admin" || normalizedHref === "/account/dashboard") {
      return normalizedPath === normalizedHref;
    }

    return normalizedPath.startsWith(normalizedHref);
  }, [pathname]);

  const railGroups = useMemo(() => {
    return currentNavItems
      .filter(item => item.children && item.children.length > 0 && isAuthorizedItem(item))
      .map(item => ({
        id: item.href,
        label: item.label,
        icon: item.icon,
        href: item.href,
        match: (path: string) => {
          if (item.exact) {
            return path === item.href;
          }
          if (path === item.href) return true;
          return item.children?.some(child => {
            if (child.exact) {
              return path === child.href;
            }
            return path.startsWith(child.href);
          }) || false;
        }
      }));
  }, [currentNavItems, isAuthorizedItem]);

  useEffect(() => {
    const activeGroup = railGroups.find(g => g.match(pathname));
    if (activeGroup) {
      setSelectedGroupHref(activeGroup.href);
    } else if (railGroups.length > 0 && !selectedGroupHref) {
      setSelectedGroupHref(railGroups[0].href);
    }
  }, [pathname, railGroups]);

  const selectedGroup = useMemo(() => {
    return currentNavItems.find(item => item.href === selectedGroupHref);
  }, [currentNavItems, selectedGroupHref]);

  const currentChildren = useMemo(() => {
    return (selectedGroup?.children || []).filter(isAuthorizedItem);
  }, [selectedGroup, isAuthorizedItem]);

  const selectedGroupLabel = selectedGroup?.label || "Menú";

  const getCurrentTitle = useCallback(() => {
    const allItems = currentNavItems.flatMap(item => {
      if (item.children) {
        return [item, ...item.children];
      }
      return [item];
    });

    const found = allItems.find(item => isPathActive(item.href, item.exact));
    if (found) {
      return found.label;
    }
    return title || (pathname.startsWith("/admin") ? "Panel Administrador" : "Mi Cuenta");
  }, [currentNavItems, pathname, title, isPathActive]);

  const currentLabel = getCurrentTitle();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.push("/account/login");
    }
  };

  const roleBadge = {
    label: getRoleBadgeLabel(user, isAdmin),
    color: getRoleBadgeColor(user, isAdmin),
  };

  const isCurrentAdminPath = pathname.startsWith("/admin");
  const isAccountPath = pathname.startsWith("/account");

  const NavLink = ({ item, isChild = false }: { item: DashboardNavItem; isChild?: boolean }) => {
    const Icon = item.icon;
    const isActive = isPathActive(item.href, item.exact);

    return (
      <Link
        href={item.href}
        scroll={false}
        onClick={() => handleNavClick(item.href)}
        className={cn(
          "group w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all duration-200 select-none",
          isActive
            ? "bg-primary text-primary-foreground font-bold shadow-sm scale-[0.98]"
            : "text-muted-foreground hover:text-foreground hover:bg-primary/10 hover:text-primary font-medium hover:scale-[0.98]",
          isChild && "pl-9"
        )}
      >
        <Icon
          className={cn(
            "size-4 shrink-0 transition-colors",
            isActive
              ? "text-primary-foreground"
              : "text-muted-foreground/80 group-hover:text-primary"
          )}
        />
        <span
          className={cn(
            "truncate flex-1",
            isActive && "font-bold text-primary-foreground"
          )}
        >
          {item.label}
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
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex w-full relative">
      <aside
        className={cn(
          "hidden md:flex fixed top-0 bottom-0 left-0 h-screen z-40 select-none border-r border-border/60 bg-background/95 backdrop-blur-xl overflow-hidden transition-all duration-300",
          isRailCollapsed ? "w-[72px]" : "w-[312px]"
        )}
      >
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
                  const Icon = group.icon;
                  const isActive = group.match(pathname);
                  const isSelected = selectedGroupHref === group.href;

                  return (
                    <Tooltip key={group.id}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedGroupHref(group.href);
                            handleNavClick(group.href);
                            router.push(group.href);
                            if (isRailCollapsed) setIsRailCollapsed(false);
                          }}
                          className={cn(
                            "size-10 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer relative",
                            isActive || isSelected
                              ? "bg-primary text-primary-foreground font-bold shadow-sm scale-95"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/70 hover:scale-95"
                          )}
                        >
                          <Icon
                            className={cn(
                              "size-5 transition-colors",
                              (isActive || isSelected) ? "text-primary-foreground" : "text-current"
                            )}
                          />
                          {isSelected && !isActive && (
                            <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-full" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs font-semibold">
                        {group.label}
                      </TooltipContent>
                    </Tooltip>
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
                    href={hasAdminAccess ? "/admin/settings" : "/account/profile/security"}
                    scroll={false}
                    onClick={() =>
                      handleNavClick(
                        hasAdminAccess ? "/admin/settings" : "/account/profile/security"
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
                      href={hasAdminAccess ? "/admin/inbox" : "/account/orders"}
                      className="text-xs font-bold text-primary text-center w-full block py-1 cursor-pointer"
                    >
                      {hasAdminAccess ? "Ver Bandeja Omnicanal" : "Ver Mis Pedidos"}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <ThemeToggle variant="capsule" />
            </TooltipProvider>
          </div>
        </div>

        <div
          className={cn(
            "h-full flex flex-col justify-between bg-background overflow-hidden transition-all duration-300",
            isRailCollapsed
              ? "w-0 p-0 opacity-0 pointer-events-none"
              : "w-[240px] p-4 opacity-100"
          )}
        >
          <div className="flex flex-col min-h-0 flex-1 space-y-4">
            <div className="flex items-center gap-2 w-full shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex-1 min-w-0 rounded-2xl px-3 py-2 border border-border/80 bg-card hover:bg-muted/60 text-foreground flex items-center justify-between text-xs font-bold transition-all cursor-pointer shadow-2xs group hover:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      <div className="size-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        {hasAdminAccess ? (
                          <ShieldCheck className="size-3.5" />
                        ) : (
                          <User className="size-3.5" />
                        )}
                      </div>
                      <div className="flex flex-col text-left truncate">
                        <span className="truncate leading-tight font-extrabold text-foreground">
                          {hasAdminAccess ? "FerroMax Admin" : "Mi Cuenta"}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium leading-none mt-0.5">
                          {hasAdminAccess ? "Panel de Gestión" : "Perfil de Usuario"}
                        </span>
                      </div>
                    </div>
                    <div className="size-5 rounded-full flex items-center justify-center text-xs text-muted-foreground group-hover:text-foreground transition-transform shrink-0 ml-1">
                      <ChevronDown className="size-3.5" />
                    </div>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-64 p-1.5 shadow-xl">
                  <DropdownMenuLabel className="text-[10px] font-black text-muted-foreground uppercase px-2 py-1 tracking-wider">
                    Espacios Disponibles
                  </DropdownMenuLabel>
                  {hasAdminAccess && (
                    <DropdownMenuItem
                      onClick={() => {
                        handleNavClick("/admin");
                        router.push("/admin");
                        setSelectedGroupHref("/admin");
                      }}
                      className={cn(
                        "cursor-pointer text-xs p-2.5 rounded-xl flex items-center gap-2.5 transition-all",
                        isCurrentAdminPath && !isAccountPath
                          ? "bg-primary/10 text-primary font-bold"
                          : "hover:bg-muted/70 text-foreground hover:scale-[0.98]"
                      )}
                    >
                      <div className="size-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                        <LayoutDashboard className="size-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold">FerroMax Admin</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          Gestión comercial, pedidos y catálogo
                        </span>
                      </div>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      handleNavClick("/account/dashboard");
                      router.push("/account/dashboard");
                      setSelectedGroupHref("/account/dashboard");
                    }}
                    className={cn(
                      "cursor-pointer text-xs p-2.5 rounded-xl flex items-center gap-2.5 transition-all",
                      isAccountPath || (!isCurrentAdminPath && !hasAdminAccess)
                        ? "bg-primary/10 text-primary font-bold"
                        : "hover:bg-muted/70 text-foreground hover:scale-[0.98]"
                    )}
                  >
                    <div className="size-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                      <User className="size-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold">Mi Cuenta Personal</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        Mis pedidos, direcciones y favoritos
                      </span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={toggleRailCollapse}
                      className="size-8.5 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 border border-border/70 transition-all cursor-pointer shrink-0 hover:scale-110"
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

            <nav className="space-y-4 overflow-y-auto flex-1 pr-1 scrollbar-none">
              {currentChildren.length > 0 && (
                <div className="space-y-1">
                  <p className="px-3 text-[10px] font-bold text-muted-foreground/70 tracking-wider uppercase">
                    {selectedGroupLabel}
                  </p>
                  <div className="space-y-0.5">
                    {currentChildren.map((item) => (
                      <NavLink key={item.href} item={item} />
                    ))}
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>
      </aside>

      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent
          side="left"
          className="w-[85vw] max-w-[320px] p-0 border-r border-border/60 bg-card/95 backdrop-blur-xl flex flex-col h-full overflow-hidden [&>button]:hidden shadow-2xl"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Menú de navegación</SheetTitle>
            <SheetDescription>Navegación principal de FerroMax en dispositivos móviles</SheetDescription>
          </SheetHeader>

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
                  {isCurrentAdminPath ? "Admin 360" : "Mi Espacio"}
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

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {railGroups.map((group) => {
              const groupItem = currentNavItems.find(item => item.href === group.href);
              const children = (groupItem?.children || []).filter(isAuthorizedItem);

              if (children.length === 0) return null;

              return (
                <div key={group.id} className="space-y-1">
                  <button
                    onClick={() => {
                      setSelectedGroupHref(group.href);
                      handleNavClick(group.href);
                      router.push(group.href);
                      setIsMobileOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 text-[10px] font-bold text-muted-foreground/70 tracking-wider uppercase hover:text-foreground transition-colors flex items-center justify-between"
                  >
                    <span>{group.label}</span>
                    <ChevronRight className="size-3" />
                  </button>
                  <div className="space-y-1">
                    {children.map((item) => {
                      const Icon = item.icon;
                      const isActive = isPathActive(item.href, item.exact);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          scroll={false}
                          onClick={() => {
                            setIsMobileOpen(false);
                            handleNavClick(item.href);
                          }}
                          className={cn(
                            "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all min-h-[42px]",
                            isActive
                              ? "bg-primary text-primary-foreground font-bold shadow-sm scale-[0.98]"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/70 font-medium"
                          )}
                        >
                          <Icon
                            className={cn(
                              "size-4.5 shrink-0 transition-colors",
                              isActive ? "text-primary-foreground" : "text-muted-foreground"
                            )}
                          />
                          <span
                            className={cn(
                              "flex-1 truncate",
                              isActive ? "text-primary-foreground font-bold" : ""
                            )}
                          >
                            {item.label}
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
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-border/70 bg-background/50 space-y-3 shrink-0">
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

            <div className="flex items-center justify-between pt-1">
              <ThemeToggle variant="capsule" />
              <LanguageSwitcher />
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full rounded-xl py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-2 text-red-600 bg-red-500/10 hover:bg-red-500/15 transition-all hover:scale-[0.98] cursor-pointer"
            >
              <LogOut className="size-3.5" />
              <span>{isLoggingOut ? "Cerrando sesión..." : dict.common.logout}</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          "min-w-0 flex-1 w-full min-h-screen flex flex-col bg-muted/20 transition-all duration-300 ease-in-out",
          isRailCollapsed ? "md:pl-[72px]" : "md:pl-[312px]"
        )}
      >
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background/80 backdrop-blur-xl px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden size-9 rounded-lg border border-border/80 flex items-center justify-center text-foreground hover:bg-muted/80 transition-all hover:scale-105 cursor-pointer shrink-0"
              aria-label="Abrir menú"
            >
              <Menu className="size-5" />
            </button>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0 truncate">
              <span className="hidden sm:inline font-medium">
                {isCurrentAdminPath ? dict.common.administration : dict.common.mySpace}
              </span>
              <ChevronRight className="size-3 text-muted-foreground/50 hidden sm:inline shrink-0" />
              <h1 className="text-foreground text-sm font-bold truncate">{currentLabel}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <LanguageSwitcher />

            <Separator orientation="vertical" className="h-5 hidden sm:block" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2.5 rounded-xl p-1 sm:px-2.5 sm:py-1.5 hover:bg-muted/80 transition-all hover:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer group text-left border border-transparent hover:border-border/60"
                >
                  <div className="bg-primary/15 text-primary flex aspect-square size-8 items-center justify-center rounded-lg font-bold text-xs uppercase shrink-0 border border-primary/25 group-hover:bg-primary group-hover:text-primary-foreground transition-all group-hover:scale-110 overflow-hidden">
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

              <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl">
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
                    <Link
                      href="/account/dashboard"
                      scroll={false}
                      onClick={() => handleNavClick("/account/dashboard")}
                      className="cursor-pointer flex items-center gap-2 text-xs"
                    >
                      <LayoutDashboard className="size-3.5 text-muted-foreground" />
                      <span>{dict.common.myAccount}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account/orders"
                      scroll={false}
                      onClick={() => handleNavClick("/account/orders")}
                      className="cursor-pointer flex items-center gap-2 text-xs"
                    >
                      <ShoppingBag className="size-3.5 text-muted-foreground" />
                      <span>Mis Pedidos</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account/favorites"
                      scroll={false}
                      onClick={() => handleNavClick("/account/favorites")}
                      className="cursor-pointer flex items-center gap-2 text-xs"
                    >
                      <Heart className="size-3.5 text-muted-foreground" />
                      <span>{dict.common.favorites}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account/addresses"
                      scroll={false}
                      onClick={() => handleNavClick("/account/addresses")}
                      className="cursor-pointer flex items-center gap-2 text-xs"
                    >
                      <MapPin className="size-3.5 text-muted-foreground" />
                      <span>Mis Direcciones</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account/profile"
                      scroll={false}
                      onClick={() => handleNavClick("/account/profile")}
                      className="cursor-pointer flex items-center gap-2 text-xs"
                    >
                      <User className="size-3.5 text-muted-foreground" />
                      <span>{dict.common.myProfile}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account/profile/security"
                      scroll={false}
                      onClick={() => handleNavClick("/account/profile/security")}
                      className="cursor-pointer flex items-center gap-2 text-xs"
                    >
                      <ShieldCheck className="size-3.5 text-muted-foreground" />
                      <span>{dict.common.securitySessions}</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                {hasAdminAccess && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin"
                          scroll={false}
                          onClick={() => handleNavClick("/admin")}
                          className="cursor-pointer flex items-center gap-2 text-xs font-semibold text-primary"
                        >
                          <Store className="size-3.5 text-primary" />
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

        <main className="flex-1 w-full min-w-0 relative overflow-x-hidden flex flex-col">
          {isNavigating && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 z-20 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary via-orange-400 to-primary animate-pulse" />
            </div>
          )}

          <div
            key={pathname}
            className="flex-1 w-full p-3 sm:p-5 md:p-6 lg:p-8 transition-opacity duration-200"
          >
            {children}
          </div>
        </main>

        <footer className="w-full border-t border-border/40 bg-background/60 backdrop-blur-xl px-4 py-3 mt-auto text-xs text-muted-foreground">
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