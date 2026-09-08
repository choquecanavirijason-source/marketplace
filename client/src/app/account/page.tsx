"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import {
  getDestinationForMode,
  resolveValidMode,
} from "@/shared/lib/marketplaceStorage";

const AccountIndexPage = () => {
  const router = useRouter();
  const { user, activeMode } = useAuth();

  useEffect(() => {
    const validMode = resolveValidMode(activeMode, user);
    const destination = getDestinationForMode(validMode);
    router.replace(destination);
  }, [router, activeMode, user]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="size-6 animate-spin text-primary" />
      <p className="text-xs font-medium">Redirigiendo a tu panel de cuenta...</p>
    </div>
  );
};

export default AccountIndexPage;
