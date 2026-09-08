"use client";

import { useI18nStore } from "@/context/i18nStore";

export const useTranslation = () => {
  const locale = useI18nStore((s) => s.locale);
  const dict = useI18nStore((s) => s.dict);
  const setLocale = useI18nStore((s) => s.setLocale);
  const toggleLocale = useI18nStore((s) => s.toggleLocale);
  const t = useI18nStore((s) => s.t);

  return {
    locale,
    dict,
    setLocale,
    toggleLocale,
    t,
    isSpanish: locale === "es",
    isEnglish: locale === "en",
  };
}
