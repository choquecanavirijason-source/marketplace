"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCatalog";
import { apiRequest, ApiError } from "@/config/axios";
import type { Product } from "@/types";
import {
  TextInput,
  NumberInput,
  SelectInput,
  TextareaInput,
  SwitchInput,
} from "@/components/forms";

const defaultImage =
  "https://images.unsplash.com/photo-1581147036324-c17ac5b5df98?w=600&h=600&fit=crop&auto=format";

interface ProductFormProps {
  product?: Product | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export const ProductForm = ({ product, onSuccess, onCancel, isModal }: ProductFormProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();
  const isEditing = Boolean(product);

  const [form, setForm] = useState({
    name: product?.name ?? "",
    categoryId: product?.categoryId ? String(product.categoryId) : "",
    price: product?.price ? String(product.price) : "",
    originalPrice: product?.originalPrice ? String(product.originalPrice) : "",
    image: product?.image || defaultImage,
    description: product?.description ?? "",
    warranty: product?.warranty ?? "12 meses de garantía",
    stock: product?.stock !== undefined ? String(product.stock) : "25",
    isActive: product?.isActive ?? true,
    sku: product?.sku ?? "",
    badge: product?.badge ?? "Nuevo",
    weight: product?.weight ?? "1.0kg",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!product) return;
    setForm({
      name: product.name ?? "",
      categoryId: product.categoryId ? String(product.categoryId) : "",
      price: product.price ? String(product.price) : "",
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      image: product.image || defaultImage,
      description: product.description ?? "",
      warranty: product.warranty ?? "12 meses de garantía",
      stock: product.stock !== undefined ? String(product.stock) : "25",
      isActive: product.isActive ?? true,
      sku: product.sku ?? "",
      badge: product.badge ?? "Nuevo",
      weight: product.weight ?? "1.0kg",
    });
  }, [product]);

  const handleChange = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const price = Number(form.price);
    if (!form.name.trim() || Number.isNaN(price) || price <= 0 || !form.categoryId) {
      setError("Completá el nombre, la categoría y un precio válido.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        image: form.image.trim() || defaultImage,
        description: form.description.trim(),
        warranty: form.warranty.trim(),
        stock: Number(form.stock) || 0,
        isActive: form.isActive,
        sku: form.sku.trim(),
        badge: form.badge.trim(),
        weight: form.weight.trim(),
      };

      if (isEditing && product) {
        await apiRequest(`/products/${product.id}`, {
          method: "PUT",
          body: payload,
          auth: true,
        });
        toast.success("Producto actualizado correctamente.");
      } else {
        await apiRequest("/products", {
          method: "POST",
          body: payload,
          auth: true,
        });
        toast.success("Producto creado correctamente.");
      }

      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });

      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          router.push("/admin/products");
          router.refresh();
        }, 500);
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 400 && err.errors) {
        const messages = Object.entries(err.errors).map(
          ([field, issues]) => `${field}: ${(issues as string[]).join(", ")}`
        );
        setError(messages.join(" "));
      } else {
        setError(err instanceof ApiError ? err.message : "No se pudo guardar el producto.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const categoryOptions = (categories ?? []).map((cat) => ({
    value: cat.id ?? 0,
    label: cat.name,
  }));

  return (
    <form
      onSubmit={handleSubmit}
      className={isModal ? "space-y-4" : "space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm"}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <TextInput
            name="name"
            label="Nombre del producto"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Ej. Taladro profesional 750W"
            required
          />
        </div>

        <SelectInput
          name="categoryId"
          label="Categoría"
          value={form.categoryId}
          onChange={(e) => handleChange("categoryId", e.target.value)}
          options={categoryOptions}
          emptyOptionLabel="Seleccioná una categoría…"
          required
        />

        <TextInput
          name="sku"
          label="SKU"
          value={form.sku}
          onChange={(e) => handleChange("sku", e.target.value)}
          placeholder="MKT-001"
        />

        <NumberInput
          name="price"
          label="Precio"
          min={0}
          step={0.01}
          value={form.price ? Number(form.price) : undefined}
          onChange={(e) => handleChange("price", e.target.value)}
          placeholder="199.99"
          required
        />

        <NumberInput
          name="originalPrice"
          label="Precio anterior"
          min={0}
          step={0.01}
          value={form.originalPrice ? Number(form.originalPrice) : undefined}
          onChange={(e) => handleChange("originalPrice", e.target.value)}
          placeholder="249.99"
        />

        <div className="md:col-span-2">
          <TextInput
            name="image"
            label="URL de imagen"
            value={form.image}
            onChange={(e) => handleChange("image", e.target.value)}
            placeholder="https://..."
          />
        </div>

        <TextInput
          name="weight"
          label="Peso"
          value={form.weight}
          onChange={(e) => handleChange("weight", e.target.value)}
          placeholder="2.5kg"
        />

        <NumberInput
          name="stock"
          label="Stock"
          min={0}
          value={form.stock ? Number(form.stock) : undefined}
          onChange={(e) => handleChange("stock", e.target.value)}
          placeholder="25"
        />

        <TextInput
          name="badge"
          label="Badge"
          value={form.badge}
          onChange={(e) => handleChange("badge", e.target.value)}
          placeholder="Nuevo"
        />

        <TextInput
          name="warranty"
          label="Garantía"
          value={form.warranty}
          onChange={(e) => handleChange("warranty", e.target.value)}
          placeholder="12 meses de garantía"
        />

        <div className="md:col-span-2">
          <TextareaInput
            name="description"
            label="Descripción"
            rows={3}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Describe las características del producto..."
          />
        </div>
      </div>

      <SwitchInput
        name="isActive"
        label="Producto activo"
        description="Visible para los clientes en el marketplace"
        checked={form.isActive}
        onCheckedChange={(checked) => handleChange("isActive", checked)}
      />

      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel ? onCancel : () => router.push("/admin/products")}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Guardando…" : isEditing ? "Guardar cambios" : "Agregar producto al marketplace"}
        </Button>
      </div>
    </form>
  );
};