import { useState, useEffect } from 'react';
import { Package, ShoppingCart, Users, TrendingUp, Truck, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rusdoors.su';

interface DashboardData {
  totalProducts: number;
  categories: { slug: string; name: string; count: number }[];
  manufacturers: string[];
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [facetsRes, productsRes] = await Promise.all([
          fetch(`${API_BASE}/api/products/facets`),
          fetch(`${API_BASE}/api/products?limit=1`),
        ]);
        const facets = facetsRes.ok ? await facetsRes.json() : { categories: [], manufacturers: [] };
        const products = productsRes.ok ? await productsRes.json() : { total: 0 };
        setData({
          totalProducts: products.total || 0,
          categories: facets.categories || [],
          manufacturers: facets.manufacturers || [],
        });
      } catch {
        setData({ totalProducts: 0, categories: [], manufacturers: [] });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = [
    { label: 'Товаров в каталоге', value: loading ? '...' : String(data?.totalProducts || 0), icon: Package },
    { label: 'Поставщиков', value: '3', icon: Truck, subtitle: '1 активен, 2 в разработке' },
    { label: 'Категорий', value: loading ? '...' : String(data?.categories.length || 0), icon: ShoppingCart },
    { label: 'Производителей', value: loading ? '...' : String(data?.manufacturers.length || 0), icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <h1
        className="text-3xl tracking-wider uppercase text-foreground"
        style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500 }}
      >
        Дашборд
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border bg-card">
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p
                className="text-2xl font-bold text-foreground"
                style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}
              >
                {s.value}
              </p>
              <p
                className="text-xs text-muted-foreground mt-1"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                {s.label}
              </p>
              {'subtitle' in s && s.subtitle && (
                <p className="text-[10px] text-muted-foreground mt-0.5" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {s.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Categories breakdown */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle
            className="text-lg uppercase tracking-wider"
            style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500 }}
          >
            Товары по категориям
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-3">
              {data?.categories.map((cat) => {
                const pct = data.totalProducts > 0 ? (cat.count / data.totalProducts) * 100 : 0;
                return (
                  <div key={cat.slug} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground font-medium" style={{ fontFamily: "'Manrope', sans-serif" }}>
                        {cat.name}
                      </span>
                      <span className="font-bold text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                        {cat.count}
                        <span className="text-muted-foreground font-normal text-xs ml-1">({pct.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suppliers overview */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle
            className="text-lg uppercase tracking-wider"
            style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500 }}
          >
            Поставщики
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="pb-3 font-medium text-xs uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>Поставщик</th>
                  <th className="pb-3 font-medium text-xs uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>Статус</th>
                  <th className="pb-3 font-medium text-xs uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>Формат</th>
                  <th className="pb-3 font-medium text-xs uppercase tracking-wider text-right" style={{ fontFamily: "'Oswald', sans-serif" }}>Товаров</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 font-medium text-foreground">Скамбио Порте</td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
                      Активен
                    </span>
                  </td>
                  <td className="py-3.5 text-muted-foreground">YML (dver.com)</td>
                  <td className="py-3.5 text-right font-semibold text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                    {loading ? '...' : (data?.totalProducts || 0)}
                  </td>
                </tr>
                <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 font-medium text-foreground">Brandoors</td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
                      В разработке
                    </span>
                  </td>
                  <td className="py-3.5 text-muted-foreground">—</td>
                  <td className="py-3.5 text-right font-semibold text-muted-foreground">—</td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 font-medium text-foreground">Двери Регионов</td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
                      В разработке
                    </span>
                  </td>
                  <td className="py-3.5 text-muted-foreground">—</td>
                  <td className="py-3.5 text-right font-semibold text-muted-foreground">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
