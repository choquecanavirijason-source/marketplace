"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/domain/entities/Product";
import { ProductStatusBadge } from "@/presentation/atoms/ProductStatusBadge";
import { GalleryThumbnail } from "@/presentation/molecules/GalleryThumbnail";
import { discountPercent } from "@/shared/lib/format";

export function ProductGallery({ product }: { product: Product }) {
  const [activeImg, setActiveImg] = useState(0);
  const images = product.images?.length ? product.images : [product.image];
  const percent = discountPercent(product.price, product.originalPrice);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3 flex-shrink-0">
        {images.map((src, i) => (
          <GalleryThumbnail key={src} src={src} active={activeImg === i} onClick={() => setActiveImg(i)} />
        ))}
      </div>

      <div className="flex-1 relative bg-secondary rounded-3xl overflow-hidden aspect-square group">
        <img
          src={images[activeImg]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && <ProductStatusBadge badge={product.badge} className="absolute top-4 left-4 text-sm" />}
        {percent > 0 && (
          <span className="absolute top-4 right-4 bg-accent text-white text-sm font-bold px-3 py-1 rounded-full">
            -{percent}%
          </span>
        )}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow hover:bg-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveImg((i) => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow hover:bg-white transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
