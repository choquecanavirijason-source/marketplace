import type { ReactNode } from "react";
import { TopBarStrip } from "@/components/layout/TopBarStrip";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export function StorefrontTemplate({ children }: { children: ReactNode }) {
  return (
    <div>
      <TopBarStrip />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
