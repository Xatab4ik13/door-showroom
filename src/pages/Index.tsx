import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ShowroomGrid from '@/components/ShowroomGrid';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ShowroomGrid />
      </main>
      <footer className="px-6 md:px-12 py-16 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="font-serif text-xl tracking-[0.3em] font-light text-foreground mb-2">RUSDOORS</p>
            <p className="text-xs text-muted-foreground">Премиальные двери для вашего пространства</p>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Rusdoors.su — Все права защищены</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
