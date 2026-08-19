"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronLeft, ChevronRight, Eye, EyeOff, Package, Pencil, Plus, Trash2, XCircle } from "lucide-react";
import { Button } from "@/presentation/atoms/button";
import { DashboardLayout, adminNavItems } from "@/presentation/organisms/DashboardLayout";
import { useAdminProducts } from "@/presentation/hooks/useAdminProducts";
import { useCategories } from "@/presentation/hooks/useCatalog";
import { getCurrentUser, isCustomerAuthenticated } from "@/shared/lib/marketplaceStorage";
import { ApiError } from "@/infrastructure/http/client";
import { formatPrice } from "@/shared/lib/format";

const PAGE_SIZE = 8;

export default function AdminProductsPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

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

  useEffect(() => {
    if (!isCustomerAuthenticated()) {
      router.push("/cuenta/ingresar?redirect=/admin/products");
      return;
    }
    if (getCurrentUser()?.roleName !== "admin") {
      router.push("/");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthChecked(true);
  }, [router]);

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

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-background px-4 py-24 text-center text-muted-foreground">Verificando sesión…</main>
    );
  }

  return (
    <DashboardLayout navItems={adminNavItems} title="Panel administrador">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Panel administrador</p>
            <h1 className="mt-2 text-3xl font-black text-foreground">Productos</h1>
            <p className="text-sm text-muted-foreground">Buscá, filtrá y gestioná el catálogo</p>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => router.push("/admin/products/crear")}>
              <Plus className="w-4 h-4" /> Nuevo producto
            </Button>
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
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:w-48"
              >
                <option value="">Todas las categorías</option>
                {(categories ?? []).map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                value={String(activeFilter)}
                onChange={(event) => {
                  const value = event.target.value;
                  setActiveFilter(value === "" ? "" : value === "true");
                  setPage(1);
                }}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:w-40"
              >
                <option value="">Todos los estados</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Producto</th>
                  <th className="px-5 py-3 font-semibold">Categoría</th>
                  <th className="px-5 py-3 font-semibold">Precio</th>
                  <th className="px-5 py-3 font-semibold">Stock</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">Cargando productos…</td>
                  </tr>
                ) : data && data.items.length > 0 ? (
                  data.items.map((product) => (
                    <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-12 w-12 rounded-lg border border-border object-cover"
                          />
                          <div className="min-w-0">
                            <p className="max-w-[260px] truncate font-semibold text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.sku ?? "Sin SKU"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{product.category || "—"}</td>
                      <td className="px-5 py-3">
                        <p className="font-bold text-foreground">{formatPrice(product.price)}</p>
                        {product.originalPrice ? (
                          <p className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`font-semibold ${(product.stock ?? 0) > 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {product.stock ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${
                            product.isActive
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-red-200 bg-red-50 text-red-700"
                          }`}
                        >
                          {product.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {product.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            title="Editar producto"
                            onClick={() => router.push(`/admin/products/${product.id}/editar`)}
                            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title={product.isActive ? "Desactivar producto" : "Activar producto"}
                            disabled={isToggling}
                            onClick={() => handleToggleActive(product.id, product.isActive ?? true)}
                            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
                          >
                            {product.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            title="Eliminar producto"
                            disabled={isRemoving}
                            onClick={() => handleDelete(product.id, product.name)}
                            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                      No hay productos que coincidan con los filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-5 py-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              {data ? `${(data.currentPage - 1) * PAGE_SIZE + 1}–${Math.min(data.currentPage * PAGE_SIZE, data.total)} de ${data.total} productos` : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:border-primary disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
              <span className="text-xs font-semibold text-muted-foreground">
                Página {data?.currentPage ?? 1} de {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:border-primary disabled:opacity-40"
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}