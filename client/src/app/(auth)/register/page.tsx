"use client";

import React, { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function AuthRegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-center text-muted-foreground">Cargando...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
