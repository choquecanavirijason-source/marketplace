"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Product, UpsertProductData } from "@/types";
import { Button } from "@/components/ui/button";
import {
  TextInput,
  NumberInput,
  SelectInput,
  TextareaInput,
  SwitchInput,
} from "@/components/forms";
import { CheckCircle2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApiQuery } from "@/hooks/useApi";
import { categoryService } from "@/services/category.service";

import { DEFAULT_PRODUCT_IMAGE } from "@/shared/lib/constants";

const defaultImage = DEFAULT_PRODUCT_IMAGE;

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre del producto es obligatorio").max(200),
  categoryId: z.number().int().positive("Debes seleccionar una categoría"),
  price: z.number().positive("El precio debe ser mayor a 0"),
  originalPrice: z.number().optional().nullable(),
  stock: z.number().int().min(0, "El stock no puede ser negativo"),
  sku: z.string().trim().optional(),
  badge: z.string().trim().optional(),
  weight: z.string().trim().optional(),
  warranty: z.string().trim().optional(),
  image: z.string().trim().optional(),
  description: z.string().trim().optional(),
  isActive: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Product | null;
  onSubmit: (values: UpsertProductData) => Promise<void>;
  isSubmitting?: boolean;
}

export const ProductFormModal = ({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isSubmitting = false,
}: ProductFormModalProps) => {
  const isEditing = Boolean(initialData);
  const { data: categories = [] } = useApiQuery(["categories"], () => categoryService.list());

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      categoryId: initialData?.categoryId ?? 1,
      price: initialData?.price ?? 0,
      originalPrice: initialData?.originalPrice ?? null,
      stock: initialData?.stock ?? 0,
      sku: initialData?.sku ?? "",
      badge: initialData?.badge ?? "",
      weight: initialData?.weight ?? "",
      warranty: initialData?.warranty ?? "",
      image: initialData?.image || defaultImage,
      description: initialData?.description ?? "",
      isActive: initialData?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        name: initialData?.name ?? "",
        categoryId: initialData?.categoryId ?? 1,
        price: initialData?.price ?? 0,
        originalPrice: initialData?.originalPrice ?? null,
        stock: initialData?.stock ?? 0,
        sku: initialData?.sku ?? "",
        badge: initialData?.badge ?? "",
        weight: initialData?.weight ?? "",
        warranty: initialData?.warranty ?? "",
        image: initialData?.image || defaultImage,
        description: initialData?.description ?? "",
        isActive: initialData?.isActive ?? true,
      });
    }
  }, [open, initialData, methods]);

  const handleFormSubmit = async (values: ProductFormValues) => {
    const data: UpsertProductData = {
      name: values.name.trim(),
      categoryId: Number(values.categoryId),
      price: String(values.price),
      originalPrice: values.originalPrice ? String(values.originalPrice) : null,
      stock: Number(values.stock) || 0,
      sku: values.sku?.trim() || null,
      tag: values.badge?.trim() || null,
      weight: values.weight?.trim() || null,
      warranty: values.warranty?.trim() || null,
      image: values.image?.trim() || defaultImage,
      description: values.description?.trim() || "",
      isActive: values.isActive,
    };
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar producto" : "Nuevo producto"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modificá la información del producto y guardá los cambios."
              : "Ingresá los datos del nuevo producto para publicarlo en el catálogo."}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit((values) => handleFormSubmit(values))} className="space-y-4 pt-1">
            <TextInput
              name="name"
              label="Nombre del producto"
              placeholder="Ej. Taladro Percutor 750W"
              required
              autoFocus
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectInput
                name="categoryId"
                label="Categoría"
                options={categoryOptions}
                emptyOptionLabel="Seleccionar categoría..."
                required
                onChange={(e) => methods.setValue("categoryId", Number(e.target.value), { shouldValidate: true })}
              />

              <NumberInput
                name="price"
                label="Precio ($)"
                placeholder="Ej. 12500"
                min={0}
                step="0.01"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumberInput
                name="originalPrice"
                label="Precio original o tachado ($)"
                placeholder="Opcional. Ej. 15000"
                min={0}
                step="0.01"
              />

              <NumberInput
                name="stock"
                label="Stock disponible"
                placeholder="Ej. 50"
                min={0}
                step="1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput
                name="sku"
                label="Código SKU"
                placeholder="Ej. FER-TAL-750"
              />

              <TextInput
                name="badge"
                label="Etiqueta / Badge"
                placeholder="Ej. Oferta, Nuevo, Destacado"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput
                name="weight"
                label="Peso"
                placeholder="Ej. 2.4 kg"
              />

              <TextInput
                name="warranty"
                label="Garantía"
                placeholder="Ej. 12 meses de fábrica"
              />
            </div>

            <TextInput
              name="image"
              label="URL de imagen principal"
              placeholder="https://images.unsplash.com/..."
            />

            <TextareaInput
              name="description"
              label="Descripción del producto"
              placeholder="Detalles, especificaciones y características..."
              rows={3}
            />

            <SwitchInput
              name="isActive"
              label="Publicado y activo"
              description="Define si el producto estará visible para compra en la tienda"
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="rounded-xl font-bold cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl font-bold gap-1.5 cursor-pointer shadow-sm"
              >
                {isEditing ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{isEditing ? "Guardar cambios" : "Crear producto"}</span>
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export const ProductForm = ProductFormModal;
export default ProductFormModal;
