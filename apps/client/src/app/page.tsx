import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedProperties } from '@/components/home/FeaturedProperties';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { StatsSection } from '@/components/home/StatsSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedProperties />
      <CategoriesSection />
      <StatsSection />
    </>
  );
}

