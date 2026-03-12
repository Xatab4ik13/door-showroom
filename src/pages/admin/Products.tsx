import { useState } from 'react';
import { Plus, Upload, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { catalogProducts } from '@/data/catalog';

const Products = () => {
  const [search, setSearch] = useState('');

  const filtered = catalogProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1
          className="text-3xl tracking-wider uppercase text-foreground"
          style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500 }}
        >
          Товары
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 border-border text-foreground hover:border-[hsl(205,85%,45%)] hover:text-[hsl(205,85%,45%)]"
          >
            <Upload className="w-4 h-4" />
            <span style={{ fontFamily: "'Manrope', sans-serif" }}>Импорт</span>
          </Button>
          <Button className="gap-2 bg-[hsl(205,85%,45%)] hover:bg-[hsl(205,85%,40%)] text-white">
            <Plus className="w-4 h-4" />
            <span style={{ fontFamily: "'Manrope', sans-serif" }}>Добавить товар</span>
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Поиск товаров..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card border-border focus-visible:ring-[hsl(205,85%,45%)]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((p) => (
          <Card key={p.id} className="border-border bg-card overflow-hidden cursor-pointer hover:shadow-md hover:border-[hsl(205,85%,45%)]/30 transition-all group">
            <div className="aspect-[3/4] overflow-hidden bg-muted">
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3
                  className="font-semibold text-foreground uppercase tracking-wider text-sm"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  {p.name}
                </h3>
                <span
                  className="text-[10px] uppercase tracking-wider text-[hsl(205,85%,45%)] px-2 py-0.5 rounded-full bg-[hsl(205,85%,45%)]/10"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  {p.category}
                </span>
              </div>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {p.manufacturer} · {p.material}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className="text-lg font-bold text-foreground"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
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
        <div className="text-center py-12 text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
          Товары не найдены
        </div>
      )}
    </div>
  );
};

export default Products;
