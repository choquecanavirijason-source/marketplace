"use client";

import { useState, useMemo } from "react";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/Can";
import { useApiQuery, useApiMutation } from "@/hooks/useApi";
import { CategoryService } from "@/services/category.service";
import type { ICategory, ICategoryRequest } from "@/types";
import { ApiError } from "@/config/axios";
import { DataTable, type ColumnDef } from "@/components/common/DataTable";
import { CategoryFormModal } from "./form";

const PAGE_SIZE = 10;

const AdminCategoriesPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);

  const { data, isLoading } = useApiQuery(
    ["admin-categories", search, page],
    () => CategoryService.getPaginated({ search, page, limit: PAGE_SIZE }),
  );

  const createMutation = useApiMutation(
    (request: ICategoryRequest) => CategoryService.create(request),
    { invalidateQueries: [["admin-categories"], ["categories"]] },
  );
  const create = createMutation.mutateAsync;
  const isCreating = createMutation.isLoading;

  const updateMutation = useApiMutation(
    ({ id, request }: { id: number; request: ICategoryRequest }) => CategoryService.update(id, request),
    { invalidateQueries: [["admin-categories"], ["categories"]] },
  );
  const update = updateMutation.mutateAsync;
  const isUpdating = updateMutation.isLoading;

  const removeMutation = useApiMutation((id: number) => CategoryService.remove(id), {
    invalidateQueries: [["admin-categories"], ["categories"]],
  });
  const remove = removeMutation.mutateAsync;
  const isRemoving = removeMutation.isLoading;

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: ICategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setEditingCategory(null);
    }
  };

  const handleSubmit = async (values: ICategoryRequest) => {
    try {
      if (editingCategory) {
        await update({ id: editingCategory.id, request: values });
        toast.success("Categoría actualizada con éxito");
      } else {
        await create(values);
        toast.success("Categoría creada con éxito");
      }
      setIsModalOpen(false);
      setEditingCategory(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Ocurrió un error al guardar la categoría.");
      throw err;
    }
  };

  const handleDelete = async (id: number, categoryName: string) => {
    if (!window.confirm(`¿Eliminar la categoría "${categoryName}"? Esta acción no se puede deshacer.`)) return;
    try {
      await remove(id);
      toast.success("Categoría eliminada con éxito");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo eliminar la categoría.");
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const columns = useMemo<ColumnDef<ICategory>[]>(
    () => [
      {
        header: "Categoría",
        accessorKey: "name",
        cell: (category) => (
          <span className="font-medium text-foreground">{category.name}</span>
        ),
      },
      {
        header: "Slug",
        accessorKey: "slug",
        cell: (category) => (
          <span className="font-mono text-xs text-muted-foreground">{category.slug}</span>
        ),
      },
      {
        header: "Productos",
        cell: (category) => (
          <span className="font-semibold text-foreground">
            {category.products_count ?? category.count ?? 0}
          </span>
        ),
      },
      {
        header: "Acciones",
        align: "right",
        cell: (category) => (
          <div className="flex items-center justify-end gap-2">
            <Can permission="categoria.editar">
              <button
                type="button"
                title="Editar categoría"
                onClick={() => handleOpenEdit(category)}
                className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </Can>
            <Can permission="categoria.eliminar">
              <button
                type="button"
                title="Eliminar categoría"
                disabled={isRemoving}
                onClick={() => handleDelete(category.id, category.name)}
                className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Can>
          </div>
        ),
      },
    ],
    [isRemoving],
  );

  const total = data?.pagination?.total ?? 0;

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

      <CategoryFormModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        initialData={editingCategory}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      <DataTable<ICategory>
        paginated={data}
        onPageChange={setPage}
        columns={columns}
        isLoading={isLoading}
        title="Listado"
        subtitle={isLoading ? "Cargando…" : `${total} categoría${total === 1 ? "" : "s"}`}
        icon={Tags}
        activeRowKey={editingCategory?.id}
        emptyMessage={
          search
            ? "No hay categorías que coincidan con la búsqueda."
            : "No hay categorías todavía."
        }
        search={{
          value: search,
          onChange: handleSearchChange,
          placeholder: "Buscar categoría…",
        }}
      />
    </div>
  );
};

export default AdminCategoriesPage;