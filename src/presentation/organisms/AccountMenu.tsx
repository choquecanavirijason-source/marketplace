"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { getCurrentCustomerName, isCustomerAuthenticated, logoutCustomer } from "@/shared/lib/marketplaceStorage";

export function AccountMenu() {
  const [authenticated, setAuthenticated] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loggedIn = isCustomerAuthenticated();
    setAuthenticated(loggedIn);
    setName(loggedIn ? getCurrentCustomerName() : null);
  }, []);

  if (!authenticated) {
    return (
      <Link href="/cuenta/ingresar" className="hidden md:flex flex-col items-center p-2 hover:text-primary transition-colors text-foreground/70 gap-0.5">
        <User className="w-5 h-5" />
        <span className="text-[10px] font-medium">Cuenta</span>
      </Link>
    );
  }

  const handleLogout = () => {
    logoutCustomer();
    setAuthenticated(false);
    setName(null);
    router.push("/");
  };

  return (
    <div className="hidden md:flex items-center gap-0.5">
      <div className="flex flex-col items-center p-2 text-foreground/70 gap-0.5">
        <User className="w-5 h-5" />
        <span className="text-[10px] font-medium max-w-[72px] truncate">{name ?? "Mi cuenta"}</span>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        title="Cerrar sesión"
        className="flex flex-col items-center p-2 hover:text-primary transition-colors text-foreground/70 gap-0.5"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-[10px] font-medium">Salir</span>
      </button>
    </div>
  );
}
