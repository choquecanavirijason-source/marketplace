"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
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
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/shared/lib/utils";

export const AccountMenu = () => {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isSeller, logout, isLoggingOut, isLoading } = useAuth();
  const { dict } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="hidden md:flex items-center gap-2 h-9 px-2.5 rounded-xl border border-border/40 bg-muted/30 animate-pulse">
        <div className="size-6 rounded-full bg-muted-foreground/20" />
        <div className="h-3 w-14 rounded-md bg-muted-foreground/20" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/account/login"
        className="hidden md:flex items-center gap-1.5 h-9 px-3 rounded-xl border border-border/80 bg-card/80 hover:bg-muted/70 text-foreground transition-all hover:scale-[0.98] text-xs font-bold cursor-pointer shadow-2xs"
      >
        <User className="size-4 text-primary" />
        <span>{dict.common.login}</span>
      </Link>
    );
  }

  const name = user?.name || user?.firstName || dict.common.myAccount;
  const email = user?.email || "";
  const avatarLetter = (name?.[0] || "U").toUpperCase();
  const dashboardHref = isAdmin ? "/admin" : "/account/dashboard";

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.push("/");
    }
  };

  const getRoleLabel = () => {
    if (isAdmin) return dict.common.roleAdmin;
    if (isSeller) return dict.common.roleSeller;
    return dict.common.roleBuyer;
  };

  return (
    <div className="hidden md:flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="group flex items-center gap-2 h-9 pl-1 pr-2.5 rounded-xl border border-border/80 bg-card/80 hover:bg-muted/70 text-foreground transition-all hover:scale-[0.98] cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="size-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-extrabold text-xs uppercase overflow-hidden border border-primary/25 shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={name}
                  className="size-full object-cover"
                />
              ) : (
                <span>{avatarLetter}</span>
              )}
            </div>
            <span className="text-xs font-bold truncate max-w-[90px]">
              {name}
            </span>
            <ChevronDown className="size-3 text-muted-foreground/70 group-hover:text-foreground transition-colors shrink-0" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-60 p-1.5 shadow-2xl">
          <DropdownMenuLabel className="p-2 font-normal">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-extrabold text-sm uppercase overflow-hidden border border-primary/25 shrink-0">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={name}
                    className="size-full object-cover"
                  />
                ) : (
                  <span>{avatarLetter}</span>
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-foreground truncate">{name}</span>
                  <span className={cn(
                    "text-[9px] font-extrabold px-1.5 py-0.2 rounded",
                    isAdmin
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/15 text-primary"
                  )}>
                    {getRoleLabel()}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground truncate">{email}</span>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link
                href={dashboardHref}
                className="cursor-pointer flex items-center gap-2.5 text-xs py-2"
              >
                {isAdmin ? (
                  <Store className="size-4 text-primary" />
                ) : (
                  <LayoutDashboard className="size-4 text-primary" />
                )}
                <span className="font-semibold text-foreground">
                  {isAdmin ? dict.common.adminPanel : dict.common.myAccount}
                </span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/account/orders"
                className="cursor-pointer flex items-center gap-2.5 text-xs py-2"
              >
                <ShoppingBag className="size-4 text-muted-foreground" />
                <span>Mis Pedidos</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/favorites"
                className="cursor-pointer flex items-center gap-2.5 text-xs py-2"
              >
                <Heart className="size-4 text-muted-foreground" />
                <span>{dict.common.favorites}</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/account/profile/security"
                className="cursor-pointer flex items-center gap-2.5 text-xs py-2"
              >
                <ShieldCheck className="size-4 text-muted-foreground" />
                <span>{dict.common.securitySessions}</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="cursor-pointer flex items-center gap-2.5 text-xs text-red-600 focus:text-red-600 focus:bg-red-500/10 py-2"
          >
            <LogOut className="size-4" />
            <span>{isLoggingOut ? "Cerrando sesión..." : dict.common.logout}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};