import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesBar } from "@/components/home/FeaturesBar";
import { CategorySection } from "@/components/home/CategorySection";
import { FeaturedProductsSection } from "@/components/product/FeaturedProductsSection";
import { PromoBannerGrid } from "@/components/home/PromoBannerGrid";
import { FlashDealsSection } from "@/components/product/FlashDealsSection";
import { BestSellersSection } from "@/components/product/BestSellersSection";
import { BigPromoBanner } from "@/components/home/BigPromoBanner";
import { TrendingNewArrivalsSection } from "@/components/product/TrendingNewArrivalsSection";
import { BrandsStrip } from "@/components/home/BrandsStrip";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export function HomeTemplate({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}) {
  return (
    <>
      <HeroSection />
      <FeaturesBar />
      <CategorySection activeCategory={activeCategory} onCategoryChange={onCategoryChange} />
      <FeaturedProductsSection activeCategory={activeCategory} onCategoryChange={onCategoryChange} />
      <PromoBannerGrid />
      <FlashDealsSection />
      <BestSellersSection />
      <BigPromoBanner />
      <TrendingNewArrivalsSection />
      <BrandsStrip />
      <NewsletterSection />
    </>
  );
}
