"use client";

import { Loader2 } from "lucide-react";

export function LoadMoreButton({
  hasMore,
  isLoading,
  onLoadMore,
}: {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}) {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center mt-8">
      <button
        type="button"
        onClick={onLoadMore}
        disabled={isLoading}
        className="inline-flex items-center gap-2 border-2 border-primary text-primary font-bold px-8 py-3 rounded-xl hover:bg-primary hover:text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-wait"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isLoading ? "Cargando…" : "Ver más productos"}
      </button>
    </div>
  );
}