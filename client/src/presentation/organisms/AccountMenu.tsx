"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, User } from "lucide-react";
import { getCurrentCustomerName, getCurrentUser, isCustomerAuthenticated } from "@/shared/lib/marketplaceStorage";
import { useAuth } from "@/presentation/hooks/useAuth";

export function AccountMenu() {
  const [authenticated, setAuthenticated] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const { logout, isLoggingOut } = useAuth();

  useEffect(() => {
    const loggedIn = isCustomerAuthenticated();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthenticated(loggedIn);
    setName(loggedIn ? getCurrentCustomerName() : null);
    setIsAdmin(getCurrentUser()?.roleName === "admin");
  }, []);

  if (!authenticated) {
    return (
      <Link href="/cuenta/ingresar" className="hidden md:flex flex-col items-center p-2 hover:text-primary transition-colors text-foreground/70 gap-0.5">
        <User className="w-5 h-5" />
        <span className="text-[10px] font-medium">Cuenta</span>
      </Link>
    );
  }

  const dashboardHref = isAdmin ? "/admin" : "/cuenta/dashboard";

  const handleLogout = async () => {
    await logout();
    setAuthenticated(false);
    setName(null);
    router.push("/");
  };

  return (
    <div className="hidden md:flex items-center gap-0.5">
      <Link
        href={dashboardHref}
        title="Mi cuenta"
        className="flex flex-col items-center p-2 hover:text-primary transition-colors text-foreground/70 gap-0.5"
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-medium max-w-[72px] truncate">{name ?? "Mi cuenta"}</span>
      </Link>
      <Link
        href={dashboardHref}
        title={isAdmin ? "Panel administrador" : "Mis pedidos"}
        className="flex flex-col items-center p-2 hover:text-primary transition-colors text-foreground/70 gap-0.5"
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px] font-medium">{isAdmin ? "Panel" : "Pedidos"}</span>
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        title="Cerrar sesión"
        className="flex flex-col items-center p-2 hover:text-primary transition-colors text-foreground/70 gap-0.5"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-[10px] font-medium">Salir</span>
      </button>
    </div>
  );
}