"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, LayoutDashboard, LogOut, Package, Store, Tags, TrendingUp, User, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
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
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: string | string[];
  roles?: string[];
};

export const adminNavItems: DashboardNavItem[] = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/products", label: "Productos", icon: Package, permission: "producto.ver", roles: ["admin", "superadmin", "seller", "seller_individual", "seller_empresa"] },
  { href: "/admin/categories", label: "Categorías", icon: Tags, permission: "categoria.ver", roles: ["admin", "superadmin"] },
  { href: "/admin/users", label: "Usuarios", icon: Users, permission: "usuario.ver", roles: ["admin", "superadmin", "support"] },
  { href: "/admin/metrics", label: "Métricas", icon: TrendingUp, permission: "metricas.ver", roles: ["admin", "superadmin", "finance", "seller"] },
  { href: "/", label: "Ver tienda", icon: Store },
];

export const customerNavItems: DashboardNavItem[] = [
  { href: "/account/dashboard", label: "Mi cuenta", icon: LayoutDashboard },
  { href: "/favorites", label: "Favoritos", icon: Heart },
  { href: "/", label: "Ver tienda", icon: Store },
];

function DashboardLayoutContent({
  navItems,
  title,
  children,
}: {
  navItems: DashboardNavItem[];
  title: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, logout, isLoggingOut } = useAuth();
  const { can, hasAnyRole } = usePrivileges();
  const { setOpenMobile } = useSidebar();

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

  const currentLabel =
    navItems.find((item) => item.href === pathname)?.label ??
    adminNavItems.find((item) => item.href === pathname)?.label ??
    title;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.push("/account/login");
    }
  };

  const isCurrentAdminSection = navItems.some((i) => i.href === "/admin/users");

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/">
                  <div className="bg-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Store className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">FerroMax</span>
                    <span className="text-muted-foreground text-xs">{title}</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.filter(isAuthorizedItem).map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin" && item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                        onClick={() => setOpenMobile(false)}
                      >
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {}
          {isAdmin && !isCurrentAdminSection && (
            <SidebarGroup>
              <SidebarGroupLabel>Administración</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNavItems
                    .filter((item) => item.href !== "/")
                    .filter(isAuthorizedItem)
                    .map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/admin" && pathname.startsWith(item.href));
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={item.label}
                            onClick={() => setOpenMobile(false)}
                          >
                            <Link href={item.href}>
                              <Icon />
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" disabled={isLoggingOut} onClick={handleLogout}>
                <div className="bg-muted text-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <User className="size-4" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-none">
                  <span className="truncate font-semibold">{user?.name ?? "Usuario"}</span>
                  <span className="text-muted-foreground truncate text-xs">{user?.email ?? "Sin sesión"}</span>
                </div>
                <LogOut className="text-muted-foreground size-4" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarRail />
      <SidebarInset className="min-w-0 flex-1 overflow-x-hidden w-full flex flex-col">
        <header className="bg-background/95 sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4 backdrop-blur">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-1 h-4" />
          <h1 className="text-foreground text-sm font-semibold truncate">{currentLabel}</h1>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
          </div>
        </header>
        <div className="flex-1 w-full min-w-0 overflow-x-hidden">
          {children}
        </div>
      </SidebarInset>
    </>
  );
}

export function DashboardLayout({
  navItems,
  title,
  children,
}: {
  navItems: DashboardNavItem[];
  title: string;
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent navItems={navItems} title={title}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}