import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
      <h1 className="text-2xl font-semibold text-foreground">Поставщики</h1>
      <Button className="gap-2">
        <Plus className="w-4 h-4" />
        Добавить поставщика
      </Button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {demoSuppliers.map((s) => (
        <Card key={s.id} className="border-border cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">{s.name}</h3>
              <Badge variant={s.active ? 'default' : 'secondary'}>
                {s.active ? 'Активен' : 'Неактивен'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Товаров</p>
                <p className="font-medium">{s.products}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Формат</p>
                <p className="font-medium">{s.format}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Обновлено: {s.lastUpdate}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default Suppliers;
