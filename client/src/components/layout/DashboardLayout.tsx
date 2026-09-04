"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Package,
  Store,
  Tags,
  TrendingUp,
  User,
  Users,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  KeyRound,
  Settings,
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
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
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

const getRoleBadgeColor = (user: any, isAdmin: boolean) => {
  if (isAdmin || user?.type === "admin" || user?.type === "superadmin") {
    return "bg-primary text-primary-foreground";
  }
  if (user?.type === "seller_company") {
    return "bg-blue-600/10 text-blue-600 dark:text-blue-400";
  }
  if (user?.type === "seller_individual") {
    return "bg-amber-600/10 text-amber-600 dark:text-amber-400";
  }
  if (user?.type === "support") {
    return "bg-emerald-600/10 text-emerald-600 dark:text-emerald-400";
  }
  return "bg-muted text-muted-foreground";
};

const DashboardLayoutContent = ({
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
  const { setOpenMobile } = useSidebar();
  const { dict } = useTranslation();

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

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  const normalizedPath = pathname.replace(/\/$/, "");

  // Encuentra la única ruta activa más específica entre todos los elementos de navegación
  const allNavItems = [...customerNavItems, ...adminNavItems];

  // 1. Coincidencia exacta primero (evita colisiones como /account/profile vs /account/profile/security)
  const exactActive = allNavItems.find(
    (item) => item.href.replace(/\/$/, "") === normalizedPath
  );

  // 2. Coincidencia por prefijo jerárquico para subpáginas (ej. /admin/products/create)
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

  const isCurrentAdminSection = pathname.startsWith("/admin");
  const hasAdminAccess = isAdmin || adminNavItems.some(isAuthorizedItem);

  const roleBadge = {
    label: getRoleBadgeLabel(user, isAdmin),
    color: getRoleBadgeColor(user, isAdmin),
  };

  const renderNavList = (items: DashboardNavItem[]) => {
    return items.filter(isAuthorizedItem).map((item) => {
      const Icon = item.icon;
      const label = getNavLabel(item.href, item.label);
      const isActive = item.href === activeHref;

      return (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            tooltip={label}
            onClick={() => setOpenMobile(false)}
            className={`relative h-10 px-3 font-medium transition-all rounded-xl group ${
              isActive
                ? "bg-primary/10 text-primary font-bold shadow-xs hover:bg-primary/15"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            <Link href={item.href} scroll={false} className="flex items-center gap-3 w-full">
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full shadow-sm" />
              )}
              <div
                className={`p-1.5 rounded-lg transition-colors shrink-0 flex items-center justify-center ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground group-hover:text-foreground group-hover:bg-muted/80"
                }`}
              >
                <Icon className={`size-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-current"}`} />
              </div>
              <span className={`truncate flex-1 text-xs ${isActive ? "font-bold text-primary" : "font-medium"}`}>
                {label}
              </span>
              {item.badge && (
                <span
                  className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-primary/15 text-primary"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });
  };

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-border/80 bg-sidebar">
        <SidebarHeader className="p-3 border-b border-border/60">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="hover:bg-transparent p-0">
                <Link href="/" scroll={false} className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="bg-primary text-primary-foreground flex aspect-square size-9 items-center justify-center rounded-xl shadow-sm">
                    <Store className="size-4.5" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-tight overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm tracking-tight text-foreground">FerroMax</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground uppercase">
                        360
                      </span>
                    </div>
                    <span className="text-muted-foreground text-[11px] font-medium truncate">{title}</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="px-2 py-3 space-y-4">
          {/* GRUPO 1: Mi Cuenta (Siempre en la posición superior para estabilidad) */}
          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
              {dict.common.myAccount}
            </SidebarGroupLabel>
            <SidebarGroupContent className="pt-1.5">
              <SidebarMenu className="space-y-1">
                {renderNavList(customerNavItems)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* GRUPO 2: Panel Administrador (Fijo en la segunda sección para administradores y vendedores) */}
          {hasAdminAccess && (
            <SidebarGroup className="p-0 pt-2 border-t border-border/50">
              <SidebarGroupLabel className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center justify-between">
                <span>{dict.common.adminPanel}</span>
                <ShieldAlert className="size-3 text-primary/70" />
              </SidebarGroupLabel>
              <SidebarGroupContent className="pt-1.5">
                <SidebarMenu className="space-y-1">
                  {renderNavList(adminNavItems)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter className="p-3 border-t border-border/60 bg-muted/20">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={dict.common.exploreCatalog}
                className="h-9.5 px-3 font-medium transition-all rounded-xl text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              >
                <Link href="/" scroll={false} className="flex items-center gap-3">
                  <Store className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate flex-1 text-sm">{dict.common.exploreCatalog}</span>
                  <ExternalLink className="size-3.5 text-muted-foreground/60" />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarRail />
      <SidebarInset className="min-w-0 flex-1 overflow-x-hidden w-full flex flex-col bg-muted/20 min-h-screen">
        <header className="bg-background/95 sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border/80 px-4 backdrop-blur">
          <div className="flex items-center gap-2 min-w-0">
            <SidebarTrigger className="hover:bg-muted rounded-lg" />
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
              <span>{isCurrentAdminSection ? dict.common.administration : dict.common.mySpace}</span>
              <ChevronRight className="size-3 text-muted-foreground/60" />
              <h1 className="text-foreground text-sm font-bold truncate">{currentLabel}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <LanguageSwitcher />

            <Separator orientation="vertical" className="h-5 hidden sm:block" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2.5 rounded-xl p-1.5 sm:px-2.5 sm:py-1.5 hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer group text-left border border-transparent hover:border-border/60"
                >
                  <div className="bg-primary/10 text-primary flex aspect-square size-8 items-center justify-center rounded-lg font-bold text-xs uppercase shrink-0 border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors overflow-hidden">
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
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${roleBadge.color}`}>
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

        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>

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
      </SidebarInset>
    </>
  );
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
  return (
    <SidebarProvider>
      <DashboardLayoutContent navItems={navItems} title={title}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
};

export default DashboardLayout;