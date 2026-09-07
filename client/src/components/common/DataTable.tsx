"use client";

import React from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface ColumnDef<T> {
  key?: string;
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  align?: "left" | "center" | "right";
}

export interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export interface DataTableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface DataTablePaginatedPayload<T> {
  data?: T[];
  items?: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  total?: number;
  page?: number;
  currentPage?: number;
  limit?: number;
  pageSize?: number;
  totalPages?: number;
  lastPage?: number;
}

export interface DataTableProps<T> {
  data?: T[];
  paginated?: DataTablePaginatedPayload<T> | null;
  onPageChange?: (page: number) => void;
  columns: ColumnDef<T>[];
  keyExtractor?: (item: T, index: number) => string | number;
  isLoading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  pagination?: DataTablePaginationProps;
  search?: DataTableSearchProps;
  toolbar?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  onRowClick?: (item: T) => void;
  activeRowKey?: string | number | null;
  className?: string;
}

export const DataTable = <T,>({
  data,
  paginated,
  onPageChange,
  columns,
  keyExtractor,
  isLoading = false,
  loadingMessage = "Cargando datos…",
  emptyMessage = "No hay registros disponibles.",
  pagination,
  search,
  toolbar,
  title,
  subtitle,
  icon: Icon,
  onRowClick,
  activeRowKey,
  className,
}: DataTableProps<T>) => {
  const resolvedData: T[] = data ?? paginated?.data ?? paginated?.items ?? [];

  const resolvedPagination: DataTablePaginationProps | undefined =
    pagination ??
    (paginated && (onPageChange || paginated.pagination || paginated.page || paginated.currentPage)
      ? {
          currentPage: paginated.pagination?.page ?? paginated.page ?? paginated.currentPage ?? 1,
          totalPages: Math.max(1, paginated.pagination?.totalPages ?? paginated.totalPages ?? paginated.lastPage ?? 1),
          totalItems: paginated.pagination?.total ?? paginated.total ?? resolvedData.length,
          pageSize: paginated.pagination?.limit ?? paginated.limit ?? paginated.pageSize ?? 10,
          onPageChange: onPageChange ?? (() => {}),
        }
      : undefined);

  const hasHeader = Boolean(title || subtitle || search || toolbar || Icon);

  const getKey = (item: T, index: number): string | number => {
    if (keyExtractor) return keyExtractor(item, index);
    const candidate = (item as any)?.id ?? (item as any)?._id ?? (item as any)?.key;
    if (candidate !== undefined) return candidate;
    return index;
  };

  const getAlignClass = (align?: "left" | "center" | "right") => {
    if (align === "right") return "text-right justify-end";
    if (align === "center") return "text-center justify-center";
    return "text-left justify-start";
  };

  const startItem = resolvedPagination
    ? Math.min((resolvedPagination.currentPage - 1) * resolvedPagination.pageSize + 1, resolvedPagination.totalItems)
    : 1;
  const endItem = resolvedPagination
    ? Math.min(resolvedPagination.currentPage * resolvedPagination.pageSize, resolvedPagination.totalItems)
    : resolvedData.length;

  return (
    <section className={cn("rounded-2xl border border-border bg-card shadow-sm overflow-hidden", className)}>
      {hasHeader && (
        <div className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
            )}
            <div>
              {title && <h2 className="text-xl font-black text-foreground leading-tight">{title}</h2>}
              {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {search && (
              <div className="relative flex-1 md:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={search.value}
                  onChange={(e) => search.onChange(e.target.value)}
                  placeholder={search.placeholder || "Buscar…"}
                  className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
            )}
            {toolbar}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground bg-muted/20">
              {columns.map((col, index) => (
                <th
                  key={col.key || String(col.accessorKey) || index}
                  className={cn(
                    "px-5 py-3 font-semibold",
                    getAlignClass(col.align),
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span className="text-sm font-medium">{loadingMessage}</span>
                  </div>
                </td>
              </tr>
            ) : resolvedData && resolvedData.length > 0 ? (
              resolvedData.map((item, index) => {
                const rowKey = getKey(item, index);
                const isActive = activeRowKey !== undefined && activeRowKey !== null && activeRowKey === rowKey;
                return (
                  <tr
                    key={rowKey}
                    onClick={onRowClick ? () => onRowClick(item) : undefined}
                    className={cn(
                      "border-b border-border last:border-0 transition-colors hover:bg-muted/40",
                      isActive && "bg-primary/5",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {columns.map((col, colIndex) => {
                      const cellContent = col.cell
                        ? col.cell(item, index)
                        : col.accessorKey
                        ? String((item as any)[col.accessorKey] ?? "")
                        : null;

                      return (
                        <td
                          key={col.key || String(col.accessorKey) || colIndex}
                          className={cn("px-5 py-3.5", getAlignClass(col.align), col.className)}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {resolvedPagination && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-5 py-4 sm:flex-row bg-muted/10">
          <p className="text-xs text-muted-foreground font-medium">
            {resolvedPagination.totalItems > 0
              ? `${startItem}–${endItem} de ${resolvedPagination.totalItems} registros`
              : "0 registros"}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={resolvedPagination.currentPage <= 1 || isLoading}
              onClick={() => resolvedPagination.onPageChange(Math.max(1, resolvedPagination.currentPage - 1))}
              className="flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:border-primary disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>

            <span className="text-xs font-semibold text-muted-foreground px-1">
              Página {resolvedPagination.currentPage} de {Math.max(1, resolvedPagination.totalPages)}
            </span>

            <button
              type="button"
              disabled={resolvedPagination.currentPage >= resolvedPagination.totalPages || isLoading}
              onClick={() => resolvedPagination.onPageChange(Math.min(resolvedPagination.totalPages, resolvedPagination.currentPage + 1))}
              className="flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:border-primary disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default DataTable;
