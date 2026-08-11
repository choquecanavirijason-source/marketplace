"use client";

import { Tag } from "lucide-react";
import { useCategories } from "@/presentation/hooks/useCatalog";
import { SectionEyebrow } from "@/presentation/atoms/SectionEyebrow";
import { CategoryPill } from "@/presentation/molecules/CategoryPill";

export function CategorySection({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}) {
  const { data: categories } = useCategories();

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <SectionEyebrow icon={Tag}>Browse by</SectionEyebrow>
          <h2 className="text-2xl font-black text-foreground">Popular Categories</h2>
        </div>
        <a href="#" className="text-sm font-semibold text-primary flex items-center gap-1 hover:gap-2 transition-all">
          All Categories
        </a>
      </div>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {categories?.map((category) => (
          <CategoryPill
            key={category.name}
            category={category}
            active={activeCategory === category.name}
            onClick={() => onCategoryChange(category.name === activeCategory ? "All" : category.name)}
          />
        ))}
      </div>
    </section>
  );
}
