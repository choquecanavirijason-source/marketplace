"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { cancelAllPendingRequests } from "@/config/axios";
import type { DashboardMode } from "@/types";
import {
  useNavItems,
  type RailGroup,
} from "../Navigation/useNavItems";
import type { DashboardNavItem } from "../Navigation/NavItems.config";

interface RoleBadge {
  label: string;
  color: string;
}

interface DashboardContextValue {
  // Navigation & routes
  pathname: string;
  effectiveMode: DashboardMode;
  currentNavItems: DashboardNavItem[];
  railGroups: RailGroup[];
  selectedGroupHref: string;
  selectedGroup?: DashboardNavItem;
  selectedGroupLabel: string;
  currentChildren: DashboardNavItem[];
  currentLabel: string;
  isAuthorizedItem: (item: DashboardNavItem) => boolean;
  isPathActive: (itemHref: string, exact?: boolean) => boolean;
  handleNavClick: (href: string) => void;
  handleTier1Click: (groupHref: string) => void;

  // Rail & responsive states
  isRailCollapsed: boolean;
  toggleRailCollapse: () => void;
  setIsRailCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  isNavigating: boolean;

  // Seller Activation modal
  isActivateModalOpen: boolean;
  setIsActivateModalOpen: (value: boolean) => void;

  // User & Auth
  user: any;
  isAdmin: boolean;
  isSeller: boolean;
  isSellerAvailable: boolean;
  isCompanyAvailable: boolean;
  roleBadge: RoleBadge;
  setActiveMode: (mode: DashboardMode) => void;
  handleLogout: () => Promise<void>;
  isLoggingOut: boolean;
  dict: any;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export interface DashboardProviderProps {
  children: ReactNode;
  navItems?: DashboardNavItem[];
  title?: string;
}

export const DashboardProvider = ({
  children,
  navItems,
  title,
}: DashboardProviderProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    user,
    isAdmin,
    isSeller,
    activeMode,
    setActiveMode,
    logout,
    isLoggingOut,
  } = useAuth();

  const {
    pathname,
    effectiveMode,
    currentNavItems,
    isAuthorizedItem,
    isPathActive,
    railGroups,
    currentLabel,
    isSellerAvailable,
    isCompanyAvailable,
    dict,
  } = useNavItems(navItems, title);

  const [, setIsMounted] = useState(false);
  const [isRailCollapsed, setIsRailCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedGroupHref, setSelectedGroupHref] = useState<string>("");
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const savedCollapse = localStorage.getItem("ferromax-sidebar-collapsed");
      if (savedCollapse === "true") {
        setIsRailCollapsed(true);
      }
    }
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsNavigating(false);

    if (effectiveMode && effectiveMode !== activeMode) {
      if (
        (pathname.startsWith("/seller") && effectiveMode === "seller") ||
        (pathname.startsWith("/admin") && effectiveMode === "admin" && isAdmin) ||
        (pathname.startsWith("/account/company") && effectiveMode === "company")
      ) {
        setActiveMode(effectiveMode);
      }
    }
  }, [pathname, effectiveMode, activeMode, isAdmin, setActiveMode]);

  const toggleRailCollapse = useCallback(() => {
    setIsRailCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("ferromax-sidebar-collapsed", String(next));
      }
      return next;
    });
  }, []);

  const handleNavClick = useCallback(
    (href: string) => {
      if (href !== pathname) {
        queryClient.cancelQueries();
        cancelAllPendingRequests();
        setIsNavigating(true);
      }
    },
    [pathname, queryClient]
  );

  const handleTier1Click = useCallback(
    (groupHref: string) => {
      const group = currentNavItems.find((item) => item.href === groupHref);
      if (!group) {
        handleNavClick(groupHref);
        router.push(groupHref);
        return;
      }

      const authorizedChildren = (group.children || []).filter(isAuthorizedItem);
      const targetHref =
        authorizedChildren.length > 0 ? authorizedChildren[0].href : group.href;

      setSelectedGroupHref(group.href);
      handleNavClick(targetHref);
      router.push(targetHref);
      if (isRailCollapsed) setIsRailCollapsed(false);
    },
    [currentNavItems, isAuthorizedItem, handleNavClick, router, isRailCollapsed]
  );

  useEffect(() => {
    const activeGroup = railGroups.find((g) => g.match(pathname));
    if (activeGroup) {
      setSelectedGroupHref(activeGroup.href);
    } else if (railGroups.length > 0 && !selectedGroupHref) {
      setSelectedGroupHref(railGroups[0].href);
    }
  }, [pathname, railGroups, selectedGroupHref]);

  const selectedGroup = useMemo(() => {
    return currentNavItems.find((item) => item.href === selectedGroupHref);
  }, [currentNavItems, selectedGroupHref]);

  const currentChildren = useMemo(() => {
    return (selectedGroup?.children || []).filter(isAuthorizedItem);
  }, [selectedGroup, isAuthorizedItem]);

  const selectedGroupLabel = selectedGroup?.label || "Menú";

  const getRoleBadgeLabel = useCallback(
    (u: any, isAdm: boolean) => {
      if (isAdm || u?.type === "admin" || u?.type === "superadmin") {
        return dict.common.roleAdmin;
      }
      if (u?.type === "seller_company") {
        return dict.common.roleCompany;
      }
      if (u?.type === "seller_individual") {
        return dict.common.roleSeller;
      }
      if (u?.type === "support") {
        return dict.common.roleSupport;
      }
      return dict.common.roleBuyer;
    },
    [dict]
  );

  const getRoleBadgeColor = useCallback((u: any, isAdm: boolean) => {
    if (isAdm || u?.type === "admin" || u?.type === "superadmin") {
      return "bg-primary text-primary-foreground font-bold";
    }
    if (u?.type === "seller_company") {
      return "bg-blue-600/15 text-blue-600 dark:text-blue-400 font-bold";
    }
    if (u?.type === "seller_individual") {
      return "bg-amber-600/15 text-amber-600 dark:text-amber-400 font-bold";
    }
    if (u?.type === "support") {
      return "bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 font-bold";
    }
    return "bg-muted text-muted-foreground font-medium";
  }, []);

  const roleBadge = useMemo(
    (): RoleBadge => ({
      label: getRoleBadgeLabel(user, isAdmin),
      color: getRoleBadgeColor(user, isAdmin),
    }),
    [getRoleBadgeLabel, getRoleBadgeColor, user, isAdmin]
  );

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } finally {
      router.push("/account/login");
    }
  }, [logout, router]);

  const value = useMemo(
    (): DashboardContextValue => ({
      pathname,
      effectiveMode,
      currentNavItems,
      railGroups,
      selectedGroupHref,
      selectedGroup,
      selectedGroupLabel,
      currentChildren,
      currentLabel,
      isAuthorizedItem,
      isPathActive,
      handleNavClick,
      handleTier1Click,
      isRailCollapsed,
      toggleRailCollapse,
      setIsRailCollapsed,
      isMobileOpen,
      setIsMobileOpen,
      isNavigating,
      isActivateModalOpen,
      setIsActivateModalOpen,
      user,
      isAdmin,
      isSeller,
      isSellerAvailable,
      isCompanyAvailable,
      roleBadge,
      setActiveMode,
      handleLogout,
      isLoggingOut,
      dict,
    }),
    [
      pathname,
      effectiveMode,
      currentNavItems,
      railGroups,
      selectedGroupHref,
      selectedGroup,
      selectedGroupLabel,
      currentChildren,
      currentLabel,
      isAuthorizedItem,
      isPathActive,
      handleNavClick,
      handleTier1Click,
      isRailCollapsed,
      toggleRailCollapse,
      isMobileOpen,
      isNavigating,
      isActivateModalOpen,
      user,
      isAdmin,
      isSeller,
      isSellerAvailable,
      isCompanyAvailable,
      roleBadge,
      setActiveMode,
      handleLogout,
      isLoggingOut,
      dict,
    ]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
