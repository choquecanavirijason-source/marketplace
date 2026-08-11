import type { ReactNode } from "react";
import { TopBarStrip } from "@/presentation/molecules/TopBarStrip";
import { SiteHeader } from "@/presentation/organisms/SiteHeader";
import { SiteFooter } from "@/presentation/organisms/SiteFooter";

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
