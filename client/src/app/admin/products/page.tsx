"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronLeft, ChevronRight, Eye, EyeOff, Package, Pencil, Plus, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/Can";
import { DashboardLayout, adminNavItems } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import { useCategories } from "@/hooks/useCatalog";
import { ApiError } from "@/config/axios";
import { formatPrice } from "@/shared/lib/format";

const PAGE_SIZE = 8;

export default function AdminProductsPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<boolean | "">("");
  const [page, setPage] = useState(1);

  const { data: categories } = useCategories();
  const { data, isLoading, toggleActive, isToggling, remove, isRemoving } = useAdminProducts({
    search,
    category: categoryFilter,
    isActive: activeFilter,
    page,
    limit: PAGE_SIZE,
  });

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
    <ProtectedRoute roles={["admin", "superadmin"]} redirectTo="/account/login?redirect=/admin/products">
      <DashboardLayout navItems={adminNavItems} title="Panel administrador">
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

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:w-56"
                placeholder="Buscar producto…"
              />
              <select
                value={categoryFilter}
                onChange={(event) => {
                  setCategoryFilter(event.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">Todas las categorías</option>
                {(categories ?? []).map((cat) => (
                  <option key={cat.slug} value={cat.name}>
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

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Producto</th>
                  <th className="px-5 py-3">Categoría</th>
                  <th className="px-5 py-3">Precio</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                      Cargando productos…
                    </td>
                  </tr>
                ) : !data || data.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                      No se encontraron productos con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  data.items.map((product) => (
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
    </DashboardLayout>
  </ProtectedRoute>
);
}
