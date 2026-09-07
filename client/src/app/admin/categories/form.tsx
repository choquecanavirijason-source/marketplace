"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ICategory, ICategoryRequest } from "@/types";
import { Button } from "@/components/ui/button";
import { TextInput, TextareaInput, SwitchInput } from "@/components/forms";
import { CheckCircle2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre de la categoría es obligatorio").max(150),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional(),
  is_active: z.boolean().optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ICategory | null;
  onSubmit: (values: ICategoryRequest) => Promise<void>;
  isSubmitting?: boolean;
}

export const CategoryFormModal = ({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isSubmitting = false,
}: CategoryFormModalProps) => {
  const isEditing = Boolean(initialData);

  const methods = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      description: initialData?.description ?? "",
      is_active: initialData?.is_active ?? true,
    },
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        name: initialData?.name ?? "",
        slug: initialData?.slug ?? "",
        description: initialData?.description ?? "",
        is_active: initialData?.is_active ?? true,
      });
    }
  }, [open, initialData, methods]);

  const handleFormSubmit = async (values: CategoryFormValues) => {
    const request: ICategoryRequest = {
      name: values.name.trim(),
      slug: values.slug?.trim() || undefined,
      description: values.description?.trim() || null,
      is_active: values.is_active ?? true,
    };
    await onSubmit(request);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar categoría" : "Nueva categoría"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modificá la información de la categoría y guardá los cambios."
              : "Ingresá los datos para dar de alta una nueva categoría en el catálogo."}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleFormSubmit)} className="space-y-4 pt-1">
            <TextInput
              name="name"
              label="Nombre de la categoría"
              placeholder="Ej. Herramientas Eléctricas"
              required
              autoFocus
            />

            <TextInput
              name="slug"
              label="Slug (opcional)"
              placeholder="ej-herramientas-electricas"
            />

            <TextareaInput
              name="description"
              label="Descripción (opcional)"
              placeholder="Descripción breve de la categoría..."
              rows={3}
            />

            <SwitchInput
              name="is_active"
              label="Estado activo"
              description="Define si la categoría se mostrará públicamente"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
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
                <span>{isEditing ? "Guardar cambios" : "Crear categoría"}</span>
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export const CategoryForm = CategoryFormModal;
export default CategoryFormModal;
