import { useState } from 'react';
import { Plus, Upload, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { catalogProducts } from '@/data/catalog';

const Products = () => {
  const [search, setSearch] = useState('');

  const filtered = catalogProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Товары</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Импорт
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Добавить товар
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Поиск товаров..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((p) => (
          <Card key={p.id} className="border-border overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
            <div className="aspect-[3/4] overflow-hidden bg-muted">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
            </div>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{p.name}</h3>
                <Badge variant="secondary" className="text-xs">{p.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{p.manufacturer} · {p.material}</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">
                  {p.price.toLocaleString('ru-RU')} ₽
                </span>
                {p.oldPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {p.oldPrice.toLocaleString('ru-RU')} ₽
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Товары не найдены
        </div>
      )}
    </div>
  );
};

export default Products;
