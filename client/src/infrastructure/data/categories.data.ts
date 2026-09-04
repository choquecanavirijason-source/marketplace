import { Droplets, Flame, Hammer, Lightbulb, Package, Paintbrush, Snowflake, Zap } from "lucide-react";
import type { Category } from "@/types";

export const categoriesSeed: Category[] = [
  { id: 1, slug: "herramientas-electricas", name: "Herramientas Eléctricas", icon: Zap, count: 108, color: "#fff8e1" },
  { id: 2, slug: "herramientas-manuales", name: "Herramientas Manuales", icon: Hammer, count: 91, color: "#efebe9" },
  { id: 3, slug: "pinturas", name: "Pinturas", icon: Paintbrush, count: 62, color: "#fce4ec" },
  { id: 4, slug: "plomeria", name: "Plomería", icon: Droplets, count: 77, color: "#e1f5fe" },
  { id: 5, slug: "electricidad", name: "Electricidad", icon: Lightbulb, count: 84, color: "#fffde7" },
  { id: 6, slug: "accesorios-y-repuestos", name: "Accesorios y Repuestos", icon: Package, count: 73, color: "#f3e5f5" },
  { id: 7, slug: "calefaccion", name: "Calefacción", icon: Flame, count: 65, color: "#fff3e0" },
  { id: 8, slug: "climatizacion", name: "Climatización", icon: Snowflake, count: 58, color: "#e3f2fd" },
];
