"use client";

import { Search } from "lucide-react";

export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex-1 relative max-w-xl">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search for products, brands and more..."
        className="w-full bg-secondary border-2 border-transparent focus:border-primary rounded-xl px-4 py-2.5 pr-12 text-sm outline-none transition-colors placeholder:text-muted-foreground"
      />
      <button
        type="button"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
      >
        <Search className="w-4 h-4" />
      </button>
    </div>
  );
}
