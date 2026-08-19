"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Pencil, Plus, Tags, Trash2, X } from "lucide-react";
import { Button } from "@/presentation/atoms/button";
import { DashboardLayout, adminNavItems } from "@/presentation/organisms/DashboardLayout";
import { useCategories } from "@/presentation/hooks/useCatalog";
import { getCurrentUser, isCustomerAuthenticated } from "@/shared/lib/marketplaceStorage";
import { ApiError } from "@/infrastructure/http/client";
import { container } from "@/infrastructure/container";
import { cn } from "@/shared/lib/utils";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: categories, isLoading } = useCategories();

  useEffect(() => {
    if (!isCustomerAuthenticated()) {
      router.push("/cuenta/ingresar?redirect=/admin/categorias");
      return;
    }
    if (getCurrentUser()?.roleName !== "admin") {
      router.push("/");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthChecked(true);
  }, [router]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const createMutation = useMutation({
    mutationFn: (value: string) => container.createCategory.execute(value),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, value }: { id: number; value: string }) => container.updateCategory.execute(id, value),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => container.deleteCategory.execute(id),
    onSuccess: invalidate,
  });

  const handleSubmit = async () => {
    const value = name.trim();
    if (!value) {
      setError("El nombre de la categoría es obligatorio.");
      return;
    }
    setError("");
    try {
      if (editingId !== null) {
        await updateMutation.mutateAsync({ id: editingId, value });
      } else {
        await createMutation.mutateAsync(value);
      }
      setName("");
      setEditingId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar la categoría.");
    }
  };

  const handleEdit = (id: number, currentName: string) => {
    setEditingId(id);
    setName(currentName);
    setError("");
  };

  const handleDelete = async (id: number, categoryName: string) => {
    if (!window.confirm(`¿Eliminar la categoría "${categoryName}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar la categoría.");
    }
  };

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-background px-4 py-24 text-center text-muted-foreground">Verificando sesión…</main>
    );
  }

  return (
    <DashboardLayout navItems={adminNavItems} title="Panel administrador">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Panel administrador</p>
            <h1 className="mt-2 text-3xl font-black text-foreground">Categorías</h1>
            <p className="text-sm text-muted-foreground">Creá, editá y eliminá las categorías del catálogo</p>
          </div>
        </div>

        <section className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-bold text-foreground mb-3">
            {editingId !== null ? "Editar categoría" : "Nueva categoría"}
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSubmit();
              }}
              placeholder="Nombre de la categoría (ej. Jardinería)"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId !== null ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingId !== null ? "Guardar cambios" : "Crear categoría"}
              </Button>
              {editingId !== null && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setName("");
                    setError("");
                  }}
                >
                  <X className="w-4 h-4" /> Cancelar
                </Button>
              )}
            </div>
          </div>
          {error ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Tags className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground">Listado</h2>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? "Cargando…" : `${categories?.length ?? 0} categoría${(categories?.length ?? 0) === 1 ? "" : "s"}`}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Categoría</th>
                  <th className="px-5 py-3 font-semibold">Slug</th>
                  <th className="px-5 py-3 font-semibold">Productos</th>
                  <th className="px-5 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">Cargando categorías…</td>
                  </tr>
                ) : categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <tr
                      key={category.id}
                      className={cn("border-b border-border last:border-0 hover:bg-muted/40", editingId === category.id && "bg-primary/5")}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{ background: category.color }}
                          >
                            <category.icon className="w-4 h-4 text-foreground/70" strokeWidth={1.75} />
                          </span>
                          <span className="font-semibold text-foreground">{category.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{category.slug ?? "—"}</td>
                      <td className="px-5 py-3 font-semibold text-foreground">{category.count}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            title="Editar categoría"
                            onClick={() => handleEdit(Number(category.id), category.name)}
                            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Eliminar categoría"
                            disabled={deleteMutation.isPending}
                            onClick={() => handleDelete(Number(category.id), category.name)}
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
                    <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                      No hay categorías todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}