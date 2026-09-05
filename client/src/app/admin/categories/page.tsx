"use client";

import { useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Pencil, Plus, Search, Tags, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/forms";
import { Can } from "@/components/auth/Can";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import { ApiError } from "@/config/axios";
import { cn } from "@/shared/lib/utils";

const PAGE_SIZE = 10;

const AdminCategoriesPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  const { data, isLoading, create, isCreating, update, isUpdating, remove, isRemoving } = useAdminCategories({
    search,
    page,
    limit: PAGE_SIZE,
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setName("");
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const value = name.trim();
    if (!value) {
      setError("El nombre de la categoría es obligatorio.");
      return;
    }
    setError("");
    try {
      if (editingId !== null) {
        await update({ id: editingId, name: value });
        toast.success("Categoría actualizada con éxito");
      } else {
        await create(value);
        toast.success("Categoría creada con éxito");
      }
      setName("");
      setEditingId(null);
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar la categoría.");
    }
  };

  const handleEdit = (id: number, currentName: string) => {
    setEditingId(id);
    setName(currentName);
    setError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, categoryName: string) => {
    if (!window.confirm(`¿Eliminar la categoría "${categoryName}"? Esta acción no se puede deshacer.`)) return;
    try {
      await remove(id);
      toast.success("Categoría eliminada con éxito");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar la categoría.");
    }
  };

  const totalPages = Math.max(1, data?.lastPage ?? 1);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Panel administrador</p>
          <h1 className="mt-2 text-3xl font-black text-foreground">Categorías</h1>
          <p className="text-sm text-muted-foreground">Creá, editá y eliminá las categorías del catálogo</p>
        </div>

        <Can permission="categoria.crear">
          <Button onClick={handleOpenCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Nueva categoría</span>
          </Button>
        </Can>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? "Editar categoría" : "Nueva categoría"}
            </DialogTitle>
            <DialogDescription>
              {editingId !== null
                ? "Modificá el nombre de la categoría y guardá los cambios."
                : "Ingresá el nombre para dar de alta una nueva categoría en el catálogo."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <TextInput
              name="name"
              label="Nombre de la categoría"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Ej. Herramientas Eléctricas"
              autoFocus
            />

            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setError("");
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>
              {editingId !== null ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <Plus className="w-4 h-4 mr-1.5" />}
              {editingId !== null ? "Guardar cambios" : "Crear categoría"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

        <section className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Tags className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground">Listado</h2>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? "Cargando…" : `${data?.total ?? 0} categoría${(data?.total ?? 0) === 1 ? "" : "s"}`}
                </p>
              </div>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-primary sm:w-64"
                placeholder="Buscar categoría…"
              />
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
                ) : data && data.items.length > 0 ? (
                  data.items.map((category) => (
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
                          <Can permission="categoria.editar">
                            <button
                              type="button"
                              title="Editar categoría"
                              onClick={() => handleEdit(Number(category.id), category.name)}
                              className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </Can>
                          <Can permission="categoria.eliminar">
                            <button
                              type="button"
                              title="Eliminar categoría"
                              disabled={isRemoving}
                              onClick={() => handleDelete(Number(category.id), category.name)}
                              className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </Can>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                      {search ? "No hay categorías que coincidan con la búsqueda." : "No hay categorías todavía."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-5 py-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              {data
                ? `${(data.currentPage - 1) * PAGE_SIZE + 1}–${Math.min(data.currentPage * PAGE_SIZE, data.total)} de ${data.total} categorías`
                : ""}
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
  );
};

export default AdminCategoriesPage;