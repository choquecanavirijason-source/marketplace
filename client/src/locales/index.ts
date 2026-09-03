import { es, type Dictionary } from "./es";
import { en } from "./en";

export type Locale = "es" | "en";

export const dictionaries: Record<Locale, Dictionary> = {
  es,
  en,
};

export type { Dictionary };
