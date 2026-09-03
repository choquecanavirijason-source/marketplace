import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dictionaries, type Dictionary, type Locale } from "@/locales";

interface I18nState {
  locale: Locale;
  dict: Dictionary;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: <S extends keyof Dictionary, K extends keyof Dictionary[S]>(
    section: S,
    key: K,
  ) => string;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      locale: "es",
      dict: dictionaries.es,

      setLocale: (locale: Locale) => {
        set({
          locale,
          dict: dictionaries[locale] ?? dictionaries.es,
        });
        if (typeof document !== "undefined") {
          document.documentElement.lang = locale;
        }
      },

      toggleLocale: () => {
        const next: Locale = get().locale === "es" ? "en" : "es";
        get().setLocale(next);
      },

      t: (section, key) => {
        const currentDict = get().dict;
        const group = currentDict[section];
        if (group && key in group) {
          return (group as any)[key];
        }
        return String(key);
      },
    }),
    {
      name: "ferromax-locale",
      partialize: (state) => ({ locale: state.locale }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.dict = dictionaries[state.locale] ?? dictionaries.es;
          if (typeof document !== "undefined") {
            document.documentElement.lang = state.locale;
          }
        }
      },
    },
  ),
);
