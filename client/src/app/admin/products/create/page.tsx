"use client";

import { ProductForm } from "@/components/product/ProductForm";

export const AdminCreateProductPage = () => {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Panel administrador</p>
        <h1 className="mt-2 text-3xl font-black text-foreground">Nuevo producto</h1>
        <p className="text-sm text-muted-foreground">Completá los datos para publicar un producto en el marketplace</p>
      </div>

      <ProductForm />
    </div>
  );
};

export default AdminCreateProductPage;

