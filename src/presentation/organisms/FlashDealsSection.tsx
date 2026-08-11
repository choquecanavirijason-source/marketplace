"use client";

import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFlashDeals } from "@/presentation/hooks/useProducts";
import { useCart } from "@/presentation/hooks/useCart";
import { SectionEyebrow } from "@/presentation/atoms/SectionEyebrow";
import { CountdownTimer } from "@/presentation/molecules/CountdownTimer";
import { ProductCard } from "@/presentation/organisms/ProductCard";

const FLASH_DEAL_DURATION_SECS = 4 * 3600 + 23 * 60 + 45;

export function FlashDealsSection() {
  const { data: deals } = useFlashDeals();
  const { addToCart } = useCart();
  const router = useRouter();

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="bg-card rounded-3xl border border-border p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <SectionEyebrow icon={Clock} tone="accent">Tiempo limitado</SectionEyebrow>
            <h2 className="text-2xl font-black text-foreground">Ofertas Flash</h2>
            <p className="text-sm text-muted-foreground mt-1">Termina en:</p>
          </div>
          <CountdownTimer targetSecs={FLASH_DEAL_DURATION_SECS} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {deals?.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              onSelect={(p) => router.push(`/product/${p.id}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
