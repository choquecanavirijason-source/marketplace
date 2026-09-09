"use client";

import { useState, useMemo } from "react";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import {
  Package,
  Pencil,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/Can";
import { useApiQuery, useApiMutation } from "@/hooks/useApi";
import { ProductService } from "@/services/product.service";
import type { Product, UpsertProductData } from "@/types";
import { ApiError } from "@/config/axios";
import { formatPrice } from "@/shared/lib/format";
import { DataTable, type ColumnDef } from "@/components/common/DataTable";
import { ProductFormModal } from "./form";

const PAGE_SIZE = 10;

const AdminProductsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const { data, isLoading } = useApiQuery(
    ["admin-products", search, page],
    () => ProductService.getPaginated({ search, page, limit: PAGE_SIZE }),
  );

  const createMutation = useApiMutation(
    (request: UpsertProductData) => ProductService.create(request),
    { invalidateQueries: [["admin-products"], ["products"], ["admin-stats"]] },
  );
  const create = createMutation.mutateAsync;
  const isCreating = createMutation.isLoading;

  const updateMutation = useApiMutation(
    ({ id, data }: { id: number; data: UpsertProductData }) => ProductService.update(id, data),
    { invalidateQueries: [["admin-products"], ["products"], ["admin-stats"]] },
  );
  const update = updateMutation.mutateAsync;
  const isUpdating = updateMutation.isLoading;

  const removeMutation = useApiMutation((id: number) => ProductService.remove(id), {
    invalidateQueries: [["admin-products"], ["products"], ["admin-stats"]]
  },
  );
  const remove = removeMutation.mutateAsync;
  const isRemoving = removeMutation.isLoading;

  const toggleMutation = useApiMutation(
    ({ id, isActive }: { id: number; isActive: boolean }) => ProductService.toggleActive(id, isActive),
    { invalidateQueries: [["admin-products"], ["products"], ["admin-stats"]] },
  );
  const toggleActive = toggleMutation.mutateAsync;

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setEditingProduct(null);
    }
  };

  const handleSubmit = async (values: UpsertProductData) => {
    try {
      if (editingProduct) {
        await update({ id: editingProduct.id, data: values });
        toast.success("Producto actualizado con éxito");
      } else {
        await create(values);
        toast.success("Producto creado con éxito");
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Ocurrió un error al guardar el producto.");
      throw err;
    }
  };

  const handleDelete = async (id: number, productName: string) => {
    if (!window.confirm(`¿Eliminar el producto "${productName}"? Esta acción no se puede deshacer.`)) return;
    try {
      await remove(id);
      toast.success("Producto eliminado con éxito");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo eliminar el producto.");
    }
  };

  const handleToggle = async (product: Product) => {
    setTogglingId(product.id);
    try {
      await toggleActive({ id: product.id, isActive: !product.isActive });
      toast.success(`Producto ${!product.isActive ? "publicado" : "pausado"} con éxito`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo cambiar el estado del producto.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        header: "Producto",
        accessorKey: "name",
        cell: (product) => (
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate max-w-xs">{product.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {product.sku && (
                  <span className="font-mono text-xs text-muted-foreground">{product.sku}</span>
                )}
                {product.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    {product.badge}
                  </span>
                )}
              </div>
            </div>
          </div>
        ),
      },
      {
        header: "Categoría",
        accessorKey: "category",
        cell: (product) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground border border-border">
            {product.category || "Sin categoría"}
          </span>
        ),
      },
      {
        header: "Precio",
        accessorKey: "price",
        cell: (product) => (
          <div>
            <span className="font-bold text-foreground">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="block text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        ),
      },
      {
        header: "Stock",
        accessorKey: "stock",
        cell: (product) => {
          const stock = product.stock ?? 0;
          const isLow = stock > 0 && stock <= 5;
          const isOutOfStock = stock <= 0;

          return (
            <div className="flex items-center gap-1.5">
              <span
                className={`font-semibold ${isOutOfStock
                  ? "text-red-600"
                  : isLow
                    ? "text-amber-600"
                    : "text-foreground"
                  }`}
              >
                {stock} u.
              </span>
              {isLow && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
            </div>
          );
        },
      },
      {
        header: "Estado",
        accessorKey: "isActive",
        cell: (product) => {
          const isActive = product.isActive ?? true;
          const isCurrentToggling = togglingId === product.id;

          return (
            <button
              type="button"
              disabled={isCurrentToggling}
              onClick={() => handleToggle(product)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 ${isActive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-500/20"
                }`}
            >
              {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{isActive ? "Publicado" : "Pausado"}</span>
            </button>
          );
        },
      },
      {
        header: "Acciones",
        align: "right",
        cell: (product) => (
          <div className="flex items-center justify-end gap-2">
            <Can permission="producto.editar">
              <button
                type="button"
                title="Editar producto"
                onClick={() => handleOpenEdit(product)}
                className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </Can>
            <Can permission="producto.eliminar">
              <button
                type="button"
                title="Eliminar producto"
                disabled={isRemoving}
                onClick={() => handleDelete(product.id, product.name)}
                className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Can>
          </div>
        ),
      },
    ],
    [isRemoving, togglingId],
  );

  const total = data?.pagination?.total ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Panel administrador</p>
          <h1 className="mt-2 text-3xl font-black text-foreground">Productos</h1>
          <p className="text-sm text-muted-foreground">Gestioná el catálogo, precios, stock y visibilidad de los productos</p>
        </div>

        <Can permission="producto.crear">
          <Button onClick={handleOpenCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Nuevo producto</span>
          </Button>
        </Can>
      </div>

      <ProductFormModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        initialData={editingProduct}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      <DataTable<Product>
        paginated={data}
        onPageChange={setPage}
        columns={columns}
        isLoading={isLoading}
        title="Catálogo"
        subtitle={isLoading ? "Cargando…" : `${total} producto${total === 1 ? "" : "s"}`}
        icon={Package}
        activeRowKey={editingProduct?.id}
        emptyMessage={
          search
            ? "No hay productos que coincidan con la búsqueda."
            : "No hay productos registrados todavía."
        }
        search={{
          value: search,
          onChange: handleSearchChange,
          placeholder: "Buscar producto por nombre o SKU…",
        }}
      />
    </div>
  );
};

export default AdminProductsPage;
