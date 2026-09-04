"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Package,
  Pencil,
  Plus,
  Trash2,
  XCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/Can";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import { useCategories } from "@/hooks/useCatalog";
import { ApiError } from "@/config/axios";
import { formatPrice } from "@/shared/lib/format";

const PAGE_SIZE = 8;

type ProductSortField = "name" | "category" | "price" | "stock" | "isActive";
type SortOrder = "asc" | "desc";

const AdminProductsPage = () => {
  const router = useRouter();
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchStatus, setSearchStatus] = useState<"idle" | "cancelled" | "searching">("idle");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<boolean | "">("");
  const [page, setPage] = useState(1);

  const [sortField, setSortField] = useState<ProductSortField | null>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (value: string) => {
    setSearch(value);

    // Cancelación inmediata mientras el usuario continúa escribiendo
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (value.trim().length > 0) {
      setSearchStatus("cancelled");
    } else {
      setSearchStatus("idle");
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value.trim());
      setPage(1);
      setSearchStatus("searching");
      setTimeout(() => setSearchStatus("idle"), 600);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleSort = (field: ProductSortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const renderSortIcon = (field: ProductSortField) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
      );
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-primary" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-primary" />
    );
  };

  const { data: categories } = useCategories();
  const { data, isLoading, toggleActive, isToggling, remove, isRemoving } = useAdminProducts({
    search: debouncedSearch,
    category: categoryFilter,
    isActive: activeFilter,
    sortBy: sortField ?? "name",
    sortOrder,
    page,
    limit: PAGE_SIZE,
  });

  // Los productos vienen ordenados directamente por el backend/servicio antes de paginar
  const sortedProducts = data?.items ?? [];

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await toggleActive({ id, isActive: !isActive });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar el producto.");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`¿Eliminar el producto "${name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await remove(id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar el producto.");
    }
  };

  const totalPages = Math.max(1, data?.lastPage ?? 1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Panel administrador</p>
            <h1 className="mt-2 text-3xl font-black text-foreground">Productos</h1>
            <p className="text-sm text-muted-foreground">Buscá, filtrá y gestioná el catálogo</p>
          </div>

          <div className="flex gap-3">
            <Can permission="producto.crear">
              <Button onClick={() => router.push("/admin/products/create")}>
                <Plus className="w-4 h-4" /> Nuevo producto
              </Button>
            </Can>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}

        <section className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground">Catálogo</h2>
                <p className="text-xs text-muted-foreground">
                  {data ? `${data.total} producto${data.total === 1 ? "" : "s"}` : "Cargando…"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Buscador con estado interactivo cancelled mientras tipea */}
              <div className="relative w-full sm:w-64">
                <input
                  type="search"
                  value={search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary pr-24"
                  placeholder="Buscar producto…"
                />
                {searchStatus === "cancelled" && (
                  <div
                    title="Petición previa cancelada mientras sigues escribiendo"
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20 animate-pulse select-none"
                  >
                    <XCircle className="w-3 h-3 text-amber-500" />
                    <span>cancelled</span>
                  </div>
                )}
                {searchStatus === "searching" && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-md select-none">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span>buscando…</span>
                  </div>
                )}
              </div>

              <select
                value={categoryFilter}
                onChange={(event) => {
                  setCategoryFilter(event.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">Todas las categorías</option>
                {(categories ?? []).map((cat, idx) => (
                  <option key={cat.slug || cat.id || `cat-${idx}`} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={activeFilter === "" ? "" : activeFilter ? "active" : "inactive"}
                onChange={(event) => {
                  const v = event.target.value;
                  setActiveFilter(v === "" ? "" : v === "active");
                  setPage(1);
                }}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>

          {searchStatus === "cancelled" && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2 flex items-center justify-between text-xs text-amber-700 dark:text-amber-400">
              <span className="flex items-center gap-1.5 font-medium">
                <XCircle className="w-3.5 h-3.5 text-amber-500" />
                Petición previa cancelada mientras sigues escribiendo. Esperando pausa para enviar...
              </span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground select-none">
                <tr>
                  <th className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort("name")}
                      className={`flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer group uppercase text-xs font-bold ${
                        sortField === "name" ? "text-primary" : ""
                      }`}
                    >
                      <span>Producto</span>
                      {renderSortIcon("name")}
                    </button>
                  </th>
                  <th className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort("category")}
                      className={`flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer group uppercase text-xs font-bold ${
                        sortField === "category" ? "text-primary" : ""
                      }`}
                    >
                      <span>Categoría</span>
                      {renderSortIcon("category")}
                    </button>
                  </th>
                  <th className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort("price")}
                      className={`flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer group uppercase text-xs font-bold ${
                        sortField === "price" ? "text-primary" : ""
                      }`}
                    >
                      <span>Precio</span>
                      {renderSortIcon("price")}
                    </button>
                  </th>
                  <th className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort("stock")}
                      className={`flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer group uppercase text-xs font-bold ${
                        sortField === "stock" ? "text-primary" : ""
                      }`}
                    >
                      <span>Stock</span>
                      {renderSortIcon("stock")}
                    </button>
                  </th>
                  <th className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort("isActive")}
                      className={`flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer group uppercase text-xs font-bold ${
                        sortField === "isActive" ? "text-primary" : ""
                      }`}
                    >
                      <span>Estado</span>
                      {renderSortIcon("isActive")}
                    </button>
                  </th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        <span className="text-xs font-medium">Cargando productos…</span>
                      </div>
                    </td>
                  </tr>
                ) : !sortedProducts || sortedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                      No se encontraron productos con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  sortedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover bg-muted border border-border flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate max-w-xs">{product.name}</p>
                            <p className="text-xs text-muted-foreground">ID #{product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{product.category}</td>
                      <td className="px-5 py-3 font-semibold text-foreground">
                        {formatPrice(product.price)}
                        {product.originalPrice ? (
                          <span className="ml-1 text-xs line-through text-muted-foreground">
                            {formatPrice(product.originalPrice)}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            (product.stock ?? 0) > 10
                              ? "bg-emerald-50 text-emerald-700"
                              : (product.stock ?? 0) > 0
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {product.stock ?? 0} un.
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {product.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                            <XCircle className="w-3.5 h-3.5" /> Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Can permission="producto.editar">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(product.id, product.isActive ?? true)}
                              disabled={isToggling}
                              title={product.isActive ? "Desactivar" : "Activar"}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                            >
                              {product.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                              title="Editar"
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </Can>
                          <Can permission="producto.eliminar">
                            <button
                              type="button"
                              onClick={() => handleDelete(product.id, product.name)}
                              disabled={isRemoving}
                              title="Eliminar"
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </Can>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border p-4">
              <p className="text-xs text-muted-foreground">
                Página {data?.currentPage ?? page} de {totalPages} ({data?.total ?? 0} resultados)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Siguiente <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
  );
};

export default AdminProductsPage;
