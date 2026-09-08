"use client";

import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { ActivateSellerModal } from "@/components/seller/ActivateSellerModal";
import { DashboardProvider, useDashboard } from "./DashboardProvider";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardMobile } from "./DashboardMobile";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardFooter } from "./DashboardFooter";
import type { DashboardNavItem } from "./Navigation/NavItems.config";

export {
  adminNavItems,
  customerNavItems,
  sellerNavItems,
  companyNavItems,
  type DashboardNavItem,
} from "./Navigation/NavItems.config";

export interface DashboardLayoutProps {
  navItems?: DashboardNavItem[];
  title?: string;
  children: ReactNode;
}

const DashboardLayoutInner = ({ children }: { children: ReactNode }) => {
  const {
    isRailCollapsed,
    isNavigating,
    pathname,
    isActivateModalOpen,
    setIsActivateModalOpen,
  } = useDashboard();

  return (
    <div className="min-h-screen bg-background text-foreground flex w-full relative">
      <DashboardSidebar />
      <DashboardMobile />

      <div
        className={cn(
          "min-w-0 flex-1 w-full min-h-screen flex flex-col bg-muted/20 transition-all duration-300 ease-in-out",
          isRailCollapsed ? "md:pl-[72px]" : "md:pl-[312px]"
        )}
      >
        <DashboardHeader />

        <main className="flex-1 w-full min-w-0 relative overflow-x-hidden flex flex-col">
          {isNavigating && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 z-20 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary via-orange-400 to-primary animate-pulse" />
            </div>
          )}

          <div
            key={pathname}
            className="flex-1 w-full p-3 sm:p-5 md:p-6 lg:p-8 transition-opacity duration-200"
          >
            {children}
          </div>
        </main>

        <DashboardFooter />
      </div>

      <ActivateSellerModal
        open={isActivateModalOpen}
        onOpenChange={setIsActivateModalOpen}
      />
    </div>
  );
};

export const DashboardLayout = ({
  navItems,
  title,
  children,
}: DashboardLayoutProps) => {
  return (
    <DashboardProvider navItems={navItems} title={title}>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </DashboardProvider>
  );
};

export default DashboardLayout;
