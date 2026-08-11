import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "EkoMart — Fresh Organic Groceries",
  description:
    "Your trusted online grocery store. Fresh, organic, and sustainably sourced produce delivered daily.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
