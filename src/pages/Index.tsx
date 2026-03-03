import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroBanner from '@/components/home/HeroBanner';
import CategoriesSection from '@/components/home/CategoriesSection';
import PopularProducts from '@/components/home/PopularProducts';
import AdvantagesSection from '@/components/home/AdvantagesSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroBanner />
        <CategoriesSection />
        <PopularProducts />
        <AdvantagesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
