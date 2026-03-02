import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InfiniteCanvas from '@/components/InfiniteCanvas';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <InfiniteCanvas />
      <Footer />
    </div>
  );
};

export default Index;
