"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFlashDeals, useProducts } from "@/presentation/hooks/useProducts";
import { useCart } from "@/presentation/hooks/useCart";
import { CompactProductRow } from "@/presentation/molecules/ProductRow";
import type { Product } from "@/domain/entities/Product";

export function TrendingNewArrivalsSection() {
  const { data: products } = useProducts();
  const { data: flashDeals } = useFlashDeals();
  const { addToCart } = useCart();
  const router = useRouter();

  const columns: { title: string; items: Product[] }[] = [
    { title: "Tendencias", items: products?.slice(4, 8) ?? [] },
    { title: "Nuevos Ingresos", items: flashDeals ?? [] },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {columns.map(({ title, items }) => (
          <div key={title}>
            <div className="flex items-end justify-between mb-4">
              <h2 className="text-xl font-black text-foreground">{title}</h2>
              <a href="#" className="text-xs font-semibold text-primary flex items-center gap-1">
                Ver todo <ChevronRight className="w-3 h-3" />
              </a>
            </div>
            <div className="space-y-3">
              {items.map((product) => (
                <CompactProductRow
                  key={product.id}
                  product={product}
                  onSelect={() => router.push(`/product/${product.id}`)}
                  onAddToCart={() => addToCart(product)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
