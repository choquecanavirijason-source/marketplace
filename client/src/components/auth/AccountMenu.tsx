"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";

export function AccountMenu() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, logout, isLoggingOut } = useAuth();
  const { dict } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const authenticated = mounted && isAuthenticated;
  const name = user?.name ?? null;

  if (!authenticated) {
    return (
      <Link href="/account/login" className="hidden md:flex flex-col items-center p-2 hover:text-primary transition-colors text-foreground/70 gap-0.5">
        <User className="w-5 h-5" />
        <span className="text-[10px] font-medium">{dict.common.account}</span>
      </Link>
    );
  }

  const dashboardHref = isAdmin ? "/admin" : "/account/dashboard";

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="hidden md:flex items-center gap-0.5">
      <Link
        href={dashboardHref}
        title={dict.common.myAccount}
        className="flex flex-col items-center p-2 hover:text-primary transition-colors text-foreground/70 gap-0.5"
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-medium max-w-[72px] truncate">{name ?? dict.common.myAccount}</span>
      </Link>
      <Link
        href={dashboardHref}
        title={isAdmin ? dict.common.adminPanel : dict.common.myOrders}
        className="flex flex-col items-center p-2 hover:text-primary transition-colors text-foreground/70 gap-0.5"
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px] font-medium">{isAdmin ? dict.common.dashboard : dict.common.orders}</span>
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        title={dict.common.logout}
        className="flex flex-col items-center p-2 hover:text-primary transition-colors text-foreground/70 gap-0.5"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-[10px] font-medium">{dict.common.logout}</span>
      </button>
    </div>
  );
}