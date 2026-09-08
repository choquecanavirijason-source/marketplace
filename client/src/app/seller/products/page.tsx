"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Store,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { useAuth } from "@/hooks/useAuth";
import { useApiQuery, useApiMutation } from "@/hooks/useApi";
import { sellerService } from "@/services/seller.service";
import { ProductService } from "@/services/product.service";
import { formatPrice } from "@/shared/lib/format";
import { ProductFormModal } from "@/app/admin/products/form";
import type { Product, UpsertProductData } from "@/types";

export const SellerProductsPage = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const {
    data: products = [],
    isLoading,
    refetch,
  } = useApiQuery(["seller-products"], () => sellerService.getProducts());

  const createMutation = useApiMutation(
    (data: UpsertProductData) => ProductService.create(data),
    {
      invalidateQueries: [["seller-products"], ["seller-dashboard"]],
    }
  );

  const updateMutation = useApiMutation(
    ({ id, data }: { id: number; data: UpsertProductData }) =>
      ProductService.update(id, data),
    {
      invalidateQueries: [["seller-products"], ["seller-dashboard"]],
    }
  );

  const handleCreateOrUpdate = async (values: UpsertProductData) => {
    try {
      if (editingProduct) {
        await updateMutation.mutateAsync({ id: editingProduct.id, data: values });
        toast.success("Producto actualizado correctamente.");
      } else {
        await createMutation.mutateAsync(values);
        toast.success("Producto creado y añadido al catálogo de tu tienda.");
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      refetch();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          err?.message ||
          "Error al guardar el producto."
      );
    }
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const storeName = user?.sellerProfile?.storeName || "Mi Tienda";

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Mis Productos</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gestiona el inventario y precios de {storeName}
          </p>
        </div>

        <Button
          onClick={handleOpenNew}
          className="h-10 rounded-xl text-xs font-bold gap-2 self-start sm:self-auto"
        >
          <Plus className="size-4" />
          Publicar Nuevo Producto
        </Button>
      </div>

      <Card className="rounded-3xl border-border bg-card overflow-hidden">
        <CardHeader className="p-6 border-b border-border flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Catálogo de la Tienda ({products.length})
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Todos los artículos que tienes visibles o pausados para los clientes
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              Cargando tus productos…
            </div>
          ) : products.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Package className="size-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">
                  Tu catálogo está vacío
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Comienza publicando tus artículos. Podrás definir fotos, stock, precio y categoría.
                </p>
              </div>
              <Button
                onClick={handleOpenNew}
                className="h-10 text-xs font-bold rounded-xl gap-2"
              >
                <Plus className="size-4" />
                Publicar mi Primer Producto
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold">
                    <th className="py-3 px-4">Producto</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4">Precio</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((p, idx) => (
                    <tr
                      key={p.id || `seller-table-prod-${idx}`}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <ImageWithFallback
                            src={p.image}
                            alt={p.name}
                            className="size-11 rounded-xl object-cover bg-secondary shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-foreground block truncate max-w-[220px]">
                              {p.name}
                            </span>
                            {p.sku && (
                              <span className="text-[10px] text-muted-foreground">
                                SKU: {p.sku}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-medium">
                        {p.category}
                      </td>
                      <td className="py-3 px-4 font-bold text-foreground">
                        {formatPrice(p.price)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={
                            (p.stock ?? 0) > 5
                              ? "text-foreground font-semibold"
                              : (p.stock ?? 0) > 0
                              ? "text-amber-600 font-bold"
                              : "text-destructive font-bold"
                          }
                        >
                          {p.stock ?? 0} un.
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {p.status === "published" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="size-3" /> Publicado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full">
                            <Clock className="size-3" /> Pausado
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                            title="Ver en la tienda"
                          >
                            <Link href={`/products/${p.id}`} target="_blank">
                              <Eye className="size-3.5" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenEdit(p)}
                            className="size-8 rounded-lg text-muted-foreground hover:text-primary hover:border-primary/50"
                            title="Editar"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ProductFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialData={editingProduct}
        onSubmit={handleCreateOrUpdate}
        isSubmitting={createMutation.isLoading || updateMutation.isLoading}
      />
    </div>
  );
};

export default SellerProductsPage;
