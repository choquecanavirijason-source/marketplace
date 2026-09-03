import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: string | number;
  roles?: string[];
  permission?: string;
  exact?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface TabOption<T extends string = string> {
  id: T;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
}
