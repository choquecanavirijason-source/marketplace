"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/presentation/atoms/button";
import type { Product } from "@/domain/entities/Product";
import { isCustomerAuthenticated, logoutCustomer, readAddedProducts, writeAddedProducts } from "@/shared/lib/marketplaceStorage";

const defaultImage =
  "https://images.unsplash.com/photo-1581147036324-c17ac5b5df98?w=600&h=600&fit=crop&auto=format";

const initialForm = {
  name: "",
  category: "Herramientas Eléctricas",
  price: "",
  originalPrice: "",
  image: defaultImage,
  description: "",
  warranty: "12 meses de garantía",
  inStock: true,
  sku: "",
  badge: "Nuevo",
  weight: "1.0kg",
};

export default function AdminProductsPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isCustomerAuthenticated()) {
      router.push("/cuenta/ingresar?redirect=/admin/products");
      return;
    }

    setProducts(readAddedProducts());
  }, [router]);

  const totalValue = useMemo(
    () => products.reduce((sum, product) => sum + product.price, 0),
    [products],
  );

  const handleChange = (field: keyof typeof initialForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const price = Number(form.price);
    if (!form.name.trim() || Number.isNaN(price) || price <= 0) {
      setMessage("Completa el nombre y un precio válido.");
      return;
    }

    const newProduct: Product = {
      id: Date.now(),
      name: form.name.trim(),
      price,
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      rating: 5,
      reviews: 0,
      image: form.image.trim() || defaultImage,
      category: form.category,
      badge: form.badge || "Nuevo",
      weight: form.weight || "1.0kg",
      inStock: form.inStock,
      sku: form.sku.trim() || `MKT-${Date.now()}`,
      tags: [form.category.toLowerCase(), form.name.toLowerCase()],
      description: form.description.trim() || "Producto agregado desde el marketplace administrativo.",
      warranty: form.warranty || "12 meses de garantía",
    };

    const nextProducts = [newProduct, ...products];
    setProducts(nextProducts);
    writeAddedProducts(nextProducts);
    setForm(initialForm);
    setMessage(`Producto agregado correctamente: ${newProduct.name}`);
  };

  const logout = () => {
    logoutCustomer();
    router.push("/cuenta/ingresar");
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Panel administrador</p>
            <h1 className="mt-2 text-3xl font-black text-foreground">Marketplace / Productos</h1>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push("/")}>Ver tienda</Button>
            <Button variant="secondary" onClick={logout}>Cerrar sesión</Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
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
                  value={form.category}
                  onChange={(event) => handleChange("category", event.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                >
                  <option>Herramientas Eléctricas</option>
                  <option>Herramientas Manuales</option>
                  <option>Pinturas</option>
                  <option>Plomería</option>
                  <option>Electricidad</option>
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
                <label className="text-sm font-medium text-foreground">Badge</label>
                <input
                  value={form.badge}
                  onChange={(event) => handleChange("badge", event.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="Nuevo"
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

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Garantía</label>
                <input
                  value={form.warranty}
                  onChange={(event) => handleChange("warranty", event.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="12 meses de garantía"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-foreground">
              <input
                id="in-stock"
                type="checkbox"
                checked={form.inStock}
                onChange={(event) => handleChange("inStock", event.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <label htmlFor="in-stock">Disponible en stock</label>
            </div>

            {message ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</div> : null}

            <Button type="submit" className="w-full">Agregar producto al marketplace</Button>
          </form>

          <aside className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Resumen</p>
              <h2 className="mt-2 text-2xl font-black text-foreground">Productos publicados</h2>
            </div>

            <div className="rounded-2xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Total de productos</p>
              <p className="mt-2 text-3xl font-black text-foreground">{products.length}</p>
            </div>

            <div className="rounded-2xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Valor acumulado</p>
              <p className="mt-2 text-3xl font-black text-foreground">${totalValue.toFixed(2)}</p>
            </div>

            <div className="space-y-3">
              {products.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Aún no agregas productos. El listado de la tienda seguirá mostrando solo los productos base.
                </div>
              ) : (
                products.slice(0, 4).map((product) => (
                  <div key={product.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <img src={product.image} alt={product.name} className="h-14 w-14 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                      <p className="mt-1 text-sm font-bold text-primary">${product.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
