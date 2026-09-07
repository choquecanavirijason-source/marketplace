"use client";

import { useRouter } from "next/navigation";
import { Tag } from "lucide-react";
import { StorefrontTemplate } from "@/components/layout/StorefrontTemplate";
import { CategoryPill } from "@/components/home/CategoryPill";
import { useApiQuery } from "@/hooks/useApi";
import { CategoryService } from "@/services/category.service";

export default function CategoriesPage() {
  const router = useRouter();
  const { data, isLoading } = useApiQuery(["categories"], () => CategoryService.getPaginated({ page: 1, per_page: 10 }));
  const categories = data?.data;

  return (
    <StorefrontTemplate>
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
            <Tag className="w-4 h-4" /> Explorar
          </p>
          <h1 className="text-3xl font-black text-foreground mt-2">Todas las Categorías</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Cargando categorías…" : `Encontrá lo que buscás en ${categories?.length ?? 0} categorías`}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/*  {(categories ?? []).map((category) => (
            <CategoryPill
              key={category}
              category={category}
              active={false}
              onClick={() => router.push(`/categories/${category.slug}`)}
            />
          ))} */}
        </div>
      </section>
    </StorefrontTemplate>
  );
}