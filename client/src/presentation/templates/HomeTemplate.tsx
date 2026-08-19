import { HeroSection } from "@/presentation/organisms/HeroSection";
import { FeaturesBar } from "@/presentation/organisms/FeaturesBar";
import { CategorySection } from "@/presentation/organisms/CategorySection";
import { FeaturedProductsSection } from "@/presentation/organisms/FeaturedProductsSection";
import { PromoBannerGrid } from "@/presentation/organisms/PromoBannerGrid";
import { FlashDealsSection } from "@/presentation/organisms/FlashDealsSection";
import { BestSellersSection } from "@/presentation/organisms/BestSellersSection";
import { BigPromoBanner } from "@/presentation/organisms/BigPromoBanner";
import { TrendingNewArrivalsSection } from "@/presentation/organisms/TrendingNewArrivalsSection";
import { BrandsStrip } from "@/presentation/organisms/BrandsStrip";
import { NewsletterSection } from "@/presentation/organisms/NewsletterSection";

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
