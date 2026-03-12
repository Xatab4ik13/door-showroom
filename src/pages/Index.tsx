import HeroBanner from '@/components/home/HeroBanner';
import CategoriesSection from '@/components/home/CategoriesSection';
import PopularProducts from '@/components/home/PopularProducts';
import AdvantagesSection from '@/components/home/AdvantagesSection';
import DoorCalculator from '@/components/home/DoorCalculator';
import ConsultationSection from '@/components/home/ConsultationSection';

const Index = () => {
  return (
    <>
      <HeroBanner />
      <CategoriesSection />
      <PopularProducts />
      <AdvantagesSection />
      <DoorCalculator />
      <ConsultationSection />
    </>
  );
};

export default Index;
