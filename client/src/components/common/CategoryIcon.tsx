import type { ComponentType } from "react";
import {
  Wrench,
  Hammer,
  Paintbrush,
  Droplets,
  Zap,
  ShieldCheck,
  Trees,
  HardHat,
  Layers,
  Sparkles,
  Truck,
  Tags,
} from "lucide-react";

interface CategoryLike {
  slug?: string;
  icon?: any;
  image_url?: string | null;
  imageUrl?: string | null;
  color?: string | null;
}

interface CategoryIconProps {
  category?: CategoryLike;
  className?: string;
  strokeWidth?: number;
}

const SLUG_ICON_MAP: Record<string, ComponentType<any>> = {
  "herramientas-electricas": Zap,
  "herramientas-manuales": Hammer,
  "herramientas": Wrench,
  "pinturas": Paintbrush,
  "plomeria": Droplets,
  "electricidad": Zap,
  "construccion": HardHat,
  "seguridad": ShieldCheck,
  "jardineria": Trees,
  "materiales": Layers,
  "accesorios": Sparkles,
  "logistica": Truck,
};

const SLUG_COLOR_MAP: Record<string, string> = {
  "herramientas-electricas": "#ffedd5",
  "herramientas-manuales": "#fef3c7",
  "herramientas": "#ffedd5",
  "pinturas": "#fce7f3",
  "plomeria": "#e0f2fe",
  "electricidad": "#fef9c3",
  "construccion": "#f3e8ff",
  "seguridad": "#dcfce7",
  "jardineria": "#d1fae5",
  "materiales": "#f1f5f9",
};

export const getCategoryColor = (category?: CategoryLike | null): string => {
  if (category?.color) return category.color;
  const slug = category?.slug?.toLowerCase() || "";
  return SLUG_COLOR_MAP[slug] || "#f1f5f9";
};

export const CategoryIcon = ({
  category,
  className = "w-4 h-4 text-foreground/70",
  strokeWidth = 1.75,
}: CategoryIconProps) => {
  if (category?.icon && (typeof category.icon === "function" || typeof category.icon === "object")) {
    const CustomIcon = category.icon;
    return <CustomIcon className={className} strokeWidth={strokeWidth} />;
  }

  const slug = category?.slug?.toLowerCase() || "";
  const IconComponent = SLUG_ICON_MAP[slug] || Tags;

  return <IconComponent className={className} strokeWidth={strokeWidth} />;
};
