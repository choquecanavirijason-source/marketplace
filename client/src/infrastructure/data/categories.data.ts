import { Droplets, Flame, Hammer, Lightbulb, Package, Paintbrush, Snowflake, Zap } from "lucide-react";
import type { Category } from "@/domain/entities/Category";

export const categoriesSeed: Category[] = [
  { name: "Herramientas Eléctricas", icon: Zap, count: 108, color: "#fff8e1" },
  { name: "Herramientas Manuales", icon: Hammer, count: 91, color: "#efebe9" },
  { name: "Pinturas", icon: Paintbrush, count: 62, color: "#fce4ec" },
  { name: "Plomería", icon: Droplets, count: 77, color: "#e1f5fe" },
  { name: "Electricidad", icon: Lightbulb, count: 84, color: "#fffde7" },
  { name: "Accesorios y Repuestos", icon: Package, count: 73, color: "#f3e5f5" },
  { name: "Calefacción", icon: Flame, count: 65, color: "#fff3e0" },
  { name: "Climatización", icon: Snowflake, count: 58, color: "#e3f2fd" },
];
