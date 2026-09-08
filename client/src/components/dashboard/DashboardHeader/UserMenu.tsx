"use client";

import Link from "next/link";
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Store,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDashboard } from "../DashboardProvider";

export const UserMenu = () => {
  const {
    user,
    isAdmin,
    isSeller,
    roleBadge,
    handleNavClick,
    handleLogout,
    isLoggingOut,
    dict,
  } = useDashboard();

  return (
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

        {(isAdmin || isSeller) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {isAdmin && (
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
              )}
              {isSeller && (
                <DropdownMenuItem asChild>
                  <Link
                    href="/seller/dashboard"
                    scroll={false}
                    onClick={() => handleNavClick("/seller/dashboard")}
                    className="cursor-pointer flex items-center gap-2 text-xs font-semibold text-primary"
                  >
                    <Store className="size-3.5 text-primary" />
                    <span>Panel de Vendedor</span>
                  </Link>
                </DropdownMenuItem>
              )}
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
  );
};
