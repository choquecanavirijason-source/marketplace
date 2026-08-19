"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, LayoutDashboard, LogOut, Package, Store, Tags, TrendingUp, User } from "lucide-react";
import { Separator } from "@/presentation/atoms/separator";
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
} from "@/presentation/atoms/sidebar";
import { useAuth } from "@/presentation/hooks/useAuth";
import { getCurrentUser } from "@/shared/lib/marketplaceStorage";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

export const adminNavItems: DashboardNavItem[] = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: Tags },
  { href: "/admin/metricas", label: "Métricas", icon: TrendingUp },
  { href: "/", label: "Ver tienda", icon: Store },
];

export const customerNavItems: DashboardNavItem[] = [
  { href: "/cuenta/dashboard", label: "Mi cuenta", icon: LayoutDashboard },
  { href: "/favoritos", label: "Favoritos", icon: Heart },
  { href: "/", label: "Ver tienda", icon: Store },
];

export function DashboardLayout({
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
  const { logout, isLoggingOut } = useAuth();
  const user = getCurrentUser();

  const currentLabel = navItems.find((item) => item.href === pathname)?.label ?? title;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.push("/cuenta/ingresar");
    }
  };

  return (
    <SidebarProvider>
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
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
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
      <SidebarInset>
        <header className="bg-background/95 sticky top-0 z-10 flex h-14 items-center gap-2 border-b px-4 backdrop-blur">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-1 h-4" />
          <h1 className="text-foreground text-sm font-semibold">{currentLabel}</h1>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}