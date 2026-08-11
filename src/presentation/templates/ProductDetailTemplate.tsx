import type { Product } from "@/domain/entities/Product";
import { ProductBreadcrumb } from "@/presentation/molecules/ProductBreadcrumb";
import { ProductGallery } from "@/presentation/organisms/ProductGallery";
import { ProductInfoPanel } from "@/presentation/organisms/ProductInfoPanel";
import { ProductTabsSection } from "@/presentation/organisms/ProductTabsSection";
import { RelatedProductsSection } from "@/presentation/organisms/RelatedProductsSection";

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
