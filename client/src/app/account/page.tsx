"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const AccountIndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/account/dashboard");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="size-6 animate-spin text-primary" />
      <p className="text-xs font-medium">Redirigiendo a tu panel de cuenta...</p>
    </div>
  );
};

export default AccountIndexPage;
