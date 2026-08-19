import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "FerroMax — Ferretería, Calefacción y Herramientas",
  description:
    "Tu ferretería de confianza. Herramientas, calefactores, pinturas y accesorios para el hogar, con envío rápido a todo el país.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
