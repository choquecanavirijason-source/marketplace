import type { Product } from "@/types";
import { ProductBreadcrumb } from "@/components/product/ProductBreadcrumb";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfoPanel } from "@/components/product/ProductInfoPanel";
import { ProductTabsSection } from "@/components/product/ProductTabsSection";
import { RelatedProductsSection } from "@/components/product/RelatedProductsSection";

export function ProductDetailTemplate({ product }: { product: Product }) {
  return (
    <div>
      <ProductBreadcrumb category={product.category} productName={product.name} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          <ProductGallery product={product} />
          <ProductInfoPanel product={product} />
        </div>

        <ProductTabsSection product={product} />

        <RelatedProductsSection product={product} />
      </div>
    </div>
  );
}
