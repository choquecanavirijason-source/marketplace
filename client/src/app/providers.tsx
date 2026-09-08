"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/providers/AuthProvider";

if (typeof window !== "undefined") {
  window.addEventListener(
    "unhandledrejection",
    (event) => {
      const reason = event.reason;
      const stack = reason?.stack || "";
      const message = reason?.message || String(reason || "");
      if (
        stack.includes("chrome-extension://") ||
        message.includes("chrome-extension://") ||
        message.includes("M_ID")
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    },
    true,
  );
}

export const Providers = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
