"use client";

import { Search } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export function SearchBar({
  value,
  onChange,
  onSearch,
}: {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}) {
  const { dict } = useTranslation();

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
      className="flex-1 relative max-w-xl group"
    >
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={dict.common.searchPlaceholder}
        className="w-full bg-secondary border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-4 py-2.5 pr-12 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-lg hover:bg-orange-700 transition-all active:scale-90"
      >
        <Search className="w-4 h-4" />
      </button>
    </form>
  );
}