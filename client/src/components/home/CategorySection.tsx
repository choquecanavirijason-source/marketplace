"use client";

import { Tag } from "lucide-react";
import { useApiQuery } from "@/hooks/useApi";
import { categoryService } from "@/services/category.service";
import { SectionEyebrow } from "@/components/common/SectionEyebrow";
import { CategoryPill } from "@/components/home/CategoryPill";

export const CategorySection = ({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}) => {
  const { data: categories } = useApiQuery(["categories"], () => categoryService.list());

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 md:py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
        <div>
          <SectionEyebrow icon={Tag}>Explorar por</SectionEyebrow>
          <h2 className="text-xl sm:text-2xl font-black text-foreground">Categorías Populares</h2>
        </div>
        <a href="/categories" className="text-sm font-semibold text-primary flex items-center gap-1 hover:gap-2 transition-all">
          Todas las Categorías
        </a>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3 stagger-children">
        {categories?.map((category, idx) => {
          const categoryKey = category.slug || category.id || category.name || `cat-pill-${idx}`;
          const categoryName = category.name || "Categoría";
          return (
            <CategoryPill
              key={categoryKey}
              category={category}
              active={activeCategory === categoryName}
              onClick={() => onCategoryChange(categoryName === activeCategory ? "Todos" : categoryName)}
            />
          );
        })}
      </div>
    </section>
  );
};
