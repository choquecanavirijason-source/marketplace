import type { LucideIcon } from "lucide-react";

export interface Category {
  id?: number;
  slug?: string;
  name: string;
  icon: LucideIcon;
  count: number;
  color: string;
}
