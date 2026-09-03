"use client";

import React, { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function AuthLoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-center text-muted-foreground">Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
