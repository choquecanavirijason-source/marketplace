"use client";

import { useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePrivileges } from "@/hooks/usePrivileges";
import { useTranslation } from "@/hooks/useTranslation";
import type { DashboardMode } from "@/types";
import {
  adminNavItems,
  companyNavItems,
  customerNavItems,
  sellerNavItems,
  type DashboardNavItem,
} from "./NavItems.config";

export interface RailGroup {
  id: string;
  label: string;
  icon: DashboardNavItem["icon"];
  href: string;
  match: (path: string) => boolean;
}

export const useNavItems = (customNavItems?: DashboardNavItem[], title?: string) => {
  const pathname = usePathname();
  const {
    user,
    isAdmin,
    isSeller,
    hasSellerProfile,
    hasBusinessProfile,
    activeMode,
  } = useAuth();
  const { can, hasAnyRole } = usePrivileges();
  const { dict } = useTranslation();

  const isSellerAvailable = Boolean(hasSellerProfile || user?.sellerProfile || isSeller);
  const isCompanyAvailable = Boolean(hasBusinessProfile || user?.businessProfile);

  const isAuthorizedItem = useCallback(
    (item: DashboardNavItem) => {
      if (item.roles && item.roles.length > 0 && !hasAnyRole(item.roles)) {
        return false;
      }
      if (item.permission && !can(item.permission)) {
        return false;
      }
      return true;
    },
    [hasAnyRole, can]
  );

  const isSellerRoute = pathname.startsWith("/seller");
  const isAdminRoute = pathname.startsWith("/admin");
  const isCompanyRoute = pathname.startsWith("/account/company");

  const effectiveMode = useMemo((): DashboardMode => {
    if (isAdminRoute && isAdmin) return "admin";
    if (isSellerRoute) return "seller";
    if (isCompanyRoute) return "company";
    return activeMode || "buyer";
  }, [isAdminRoute, isAdmin, isSellerRoute, isCompanyRoute, activeMode]);

  const currentNavItems = useMemo(() => {
    if (customNavItems && customNavItems.length > 0) return customNavItems;
    if (effectiveMode === "admin" && isAdmin) return adminNavItems;
    if (effectiveMode === "seller") return sellerNavItems;
    if (effectiveMode === "company") return companyNavItems;
    return customerNavItems;
  }, [customNavItems, effectiveMode, isAdmin]);

  const isPathActive = useCallback(
    (itemHref: string, exact?: boolean) => {
      const normalizedPath = pathname.replace(/\/$/, "");
      const normalizedHref = itemHref.replace(/\/$/, "");

      if (exact) {
        return normalizedPath === normalizedHref;
      }

      if (
        normalizedHref === "/" ||
        normalizedHref === "/admin" ||
        normalizedHref === "/account/dashboard"
      ) {
        return normalizedPath === normalizedHref;
      }

      return (
        normalizedPath === normalizedHref ||
        normalizedPath.startsWith(`${normalizedHref}/`)
      );
    },
    [pathname]
  );

  const railGroups = useMemo((): RailGroup[] => {
    return currentNavItems
      .filter((item) => isAuthorizedItem(item))
      .map((item) => ({
        id: item.href,
        label: item.label,
        icon: item.icon,
        href: item.href,
        match: (path: string) => {
          const normalizedPath = path.replace(/\/$/, "");
          const normalizedItemHref = item.href.replace(/\/$/, "");

          if (normalizedPath === normalizedItemHref) {
            return true;
          }

          if (item.children && item.children.length > 0) {
            return item.children.some((child) => {
              if (!isAuthorizedItem(child)) return false;
              const normalizedChildHref = child.href.replace(/\/$/, "");
              if (child.exact) {
                return normalizedPath === normalizedChildHref;
              }
              return (
                normalizedPath === normalizedChildHref ||
                normalizedPath.startsWith(`${normalizedChildHref}/`)
              );
            });
          }

          if (
            !item.exact &&
            normalizedItemHref !== "/" &&
            normalizedItemHref !== "/admin" &&
            normalizedItemHref !== "/account/dashboard"
          ) {
            return normalizedPath.startsWith(`${normalizedItemHref}/`);
          }

          return false;
        },
      }));
  }, [currentNavItems, isAuthorizedItem]);

  const getCurrentTitle = useCallback(() => {
    const allItems = currentNavItems.flatMap((item) => {
      if (item.children) {
        return [item, ...item.children];
      }
      return [item];
    });

    const found = allItems.find((item) => isPathActive(item.href, item.exact));
    if (found) {
      return found.label;
    }
    return title || (pathname.startsWith("/admin") ? "Panel Administrador" : "Mi Cuenta");
  }, [currentNavItems, pathname, title, isPathActive]);

  const currentLabel = getCurrentTitle();

  return {
    pathname,
    user,
    isAdmin,
    isSeller,
    hasSellerProfile,
    hasBusinessProfile,
    activeMode,
    isSellerAvailable,
    isCompanyAvailable,
    effectiveMode,
    currentNavItems,
    isAuthorizedItem,
    isPathActive,
    railGroups,
    currentLabel,
    dict,
  };
};
