"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/presentation/atoms/button";
import { useCategories } from "@/presentation/hooks/useCatalog";
import { apiRequest, ApiError } from "@/infrastructure/http/client";
import type { Product } from "@/domain/entities/Product";

const defaultImage =
  "https://images.unsplash.com/photo-1581147036324-c17ac5b5df98?w=600&h=600&fit=crop&auto=format";

interface ProductFormProps {
  product?: Product | null;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      if (isEditing && product) {
        await apiRequest(`/products/${product.id}`, {
          method: "PUT",
          auth: true,
          body: {
            name: form.name.trim(),
            category_id: Number(form.categoryId),
            price: String(price),
            original_price: form.originalPrice ? String(Number(form.originalPrice)) : null,
            tag: form.badge.trim() || null,
            sku: form.sku.trim() || null,
            stock: Number(form.stock) || 0,
            weight: form.weight.trim() || null,
            warranty: form.warranty.trim() || null,
            is_active: form.isActive,
            description: form.description.trim() || "Producto actualizado desde el panel administrativo.",
            images: [{ url: form.image.trim() || defaultImage, alt: form.name.trim() }],
          },
        });
      } else {
        await apiRequest("/products", {
          method: "POST",
          auth: true,
          body: {
            name: form.name.trim(),
            category_id: Number(form.categoryId),
            price: String(price),
            original_price: form.originalPrice ? String(Number(form.originalPrice)) : null,
            tag: form.badge.trim() || null,
            sku: form.sku.trim() || null,
            stock: Number(form.stock) || 0,
            weight: form.weight.trim() || null,
            warranty: form.warranty.trim() || null,
            is_active: form.isActive,
            description: form.description.trim() || "Producto agregado desde el panel administrativo.",
            images: [{ url: form.image.trim() || defaultImage, alt: form.name.trim() }],
          },
        });
      }

      router.push("/admin/products");
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const messages = Object.values(err.errors).flat();
        setError(messages.join(" "));
      } else {
        setError(err instanceof ApiError ? err.message : "No se pudo guardar el producto.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-foreground">Nombre del producto</label>
          <input
            value={form.name}
            onChange={(event) => handleChange("name", event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            placeholder="Ej. Taladro profesional 750W"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Categoría</label>
          <select
            value={form.categoryId}
            onChange={(event) => handleChange("categoryId", event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="">Seleccioná una categoría…</option>
            {(categories ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">SKU</label>
          <input
            value={form.sku}
            onChange={(event) => handleChange("sku", event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            placeholder="MKT-001"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Precio</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(event) => handleChange("price", event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            placeholder="199.99"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Precio anterior</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.originalPrice}
            onChange={(event) => handleChange("originalPrice", event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            placeholder="249.99"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-foreground">URL de imagen</label>
          <input
            value={form.image}
            onChange={(event) => handleChange("image", event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Peso</label>
          <input
            value={form.weight}
            onChange={(event) => handleChange("weight", event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            placeholder="2.5kg"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Stock</label>
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={(event) => handleChange("stock", event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            placeholder="25"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Badge</label>
          <input
            value={form.badge}
            onChange={(event) => handleChange("badge", event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            placeholder="Nuevo"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Garantía</label>
          <input
            value={form.warranty}
            onChange={(event) => handleChange("warranty", event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            placeholder="12 meses de garantía"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-foreground">Descripción</label>
          <textarea
            value={form.description}
            onChange={(event) => handleChange("description", event.target.value)}
            className="min-h-24 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            placeholder="Describe las características del producto..."
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-foreground">
        <input
          id="is-active"
          type="checkbox"
          checked={form.isActive}
          onChange={(event) => handleChange("isActive", event.target.checked)}
          className="h-4 w-4 rounded border-border"
        />
        <label htmlFor="is-active">Producto activo (visible en la tienda)</label>
      </div>

      {message ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Guardando…" : isEditing ? "Guardar cambios" : "Agregar producto al marketplace"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}