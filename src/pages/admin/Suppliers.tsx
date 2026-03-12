import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const demoSuppliers = [
  { id: '1', name: 'Profil Doors', products: 48, format: 'Excel', lastUpdate: '11.03.2026', active: true },
  { id: '2', name: 'Волховец', products: 35, format: 'CSV', lastUpdate: '10.03.2026', active: true },
  { id: '3', name: 'Bravo', products: 62, format: 'Excel', lastUpdate: '09.03.2026', active: true },
  { id: '4', name: 'Porta Prima', products: 28, format: 'PDF (ручной)', lastUpdate: '07.03.2026', active: true },
  { id: '5', name: 'Luxor', products: 41, format: 'Excel', lastUpdate: '05.03.2026', active: false },
  { id: '6', name: 'Sofia', products: 34, format: 'API', lastUpdate: '12.03.2026', active: true },
];

const Suppliers = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1
        className="text-3xl tracking-wider uppercase text-foreground"
        style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500 }}
      >
        Поставщики
      </h1>
      <Button className="gap-2 bg-[hsl(205,85%,45%)] hover:bg-[hsl(205,85%,40%)] text-white">
        <Plus className="w-4 h-4" />
        <span style={{ fontFamily: "'Manrope', sans-serif" }}>Добавить поставщика</span>
      </Button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {demoSuppliers.map((s) => (
        <Card key={s.id} className="border-border bg-card cursor-pointer hover:shadow-md hover:border-[hsl(205,85%,45%)]/30 transition-all">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3
                className="font-semibold text-foreground uppercase tracking-wider"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {s.name}
              </h3>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${s.active ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
                <span
                  className="text-[11px] text-muted-foreground"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  {s.active ? 'Активен' : 'Неактивен'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                  Товаров
                </p>
                <p className="font-semibold text-foreground text-lg" style={{ fontFamily: "'Oswald', sans-serif" }}>
                  {s.products}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                  Формат
                </p>
                <p className="font-medium text-foreground text-sm">{s.format}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Обновлено: {s.lastUpdate}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default Suppliers;
