"use client";

import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function AccountRegisterPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-muted/20">
      <Suspense fallback={<div className="text-center text-xs text-muted-foreground">Cargando formulario...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}