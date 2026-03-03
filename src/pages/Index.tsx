import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroBanner from '@/components/home/HeroBanner';
import CategoriesSection from '@/components/home/CategoriesSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-[72px]">
        <HeroBanner />
        <CategoriesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
