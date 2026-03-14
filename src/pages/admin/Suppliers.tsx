import { useState, useEffect } from 'react';
import { RefreshCw, Loader2, CheckCircle2, AlertCircle, Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rusdoors.su';

interface SupplierDef {
  id: string;
  name: string;
  slug: string;
  format: string;
  active: boolean;
  inDevelopment: boolean;
  syncEndpoint?: string;
}

const suppliers: SupplierDef[] = [
  {
    id: '1',
    name: 'Скамбио Порте',
    slug: 'dvercom',
    format: 'YML (dver.com)',
    active: true,
    inDevelopment: false,
    syncEndpoint: '/api/import/sync/dvercom',
  },
  {
    id: '2',
    name: 'Brandoors',
    slug: 'brandoors',
    format: 'В разработке',
    active: false,
    inDevelopment: true,
  },
  {
    id: '3',
    name: 'Двери Регионов',
    slug: 'dveri-regionov',
    format: 'В разработке',
    active: false,
    inDevelopment: true,
  },
];

interface SupplierStats {
  productCount: number;
  categories: { slug: string; name: string; count: number }[];
  lastSync?: string;
}

const Suppliers = () => {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, SupplierStats>>({});
  const [loadingStats, setLoadingStats] = useState(true);

  // Load real stats from API
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products/facets`);
        if (!res.ok) throw new Error();
        const facets = await res.json();
        
        // Get total products count
        const totalRes = await fetch(`${API_BASE}/api/products?limit=1`);
        const totalData = totalRes.ok ? await totalRes.json() : { total: 0 };

        setStats({
          dvercom: {
            productCount: totalData.total || 0,
            categories: facets.categories || [],
          },
        });
      } catch {
        // Fallback
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  }, []);

  const handleSync = async (supplier: SupplierDef) => {
    if (!supplier.syncEndpoint || syncing) return;
    setSyncing(supplier.slug);
    
    try {
      const res = await fetch(`${API_BASE}${supplier.syncEndpoint}`, {
        method: 'POST',
        headers: { 'x-sync-secret': 'rusdoors-sync-2024' },
      });
      
      if (!res.ok) throw new Error('Ошибка синхронизации');
      
      const data = await res.json();
      toast({
        title: 'Синхронизация запущена',
        description: `${supplier.name}: ${data.message || 'Обработка началась'}`,
      });

      // Refresh stats after a delay
      setTimeout(async () => {
        try {
          const totalRes = await fetch(`${API_BASE}/api/products?limit=1`);
          const totalData = totalRes.ok ? await totalRes.json() : null;
          if (totalData) {
            setStats(prev => ({
              ...prev,
              [supplier.slug]: {
                ...prev[supplier.slug],
                productCount: totalData.total,
                lastSync: new Date().toLocaleString('ru-RU'),
              },
            }));
          }
        } catch {}
      }, 5000);
    } catch (err: any) {
      toast({
        title: 'Ошибка',
        description: err.message || 'Не удалось запустить синхронизацию',
        variant: 'destructive',
      });
    } finally {
      setSyncing(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1
        className="text-3xl tracking-wider uppercase text-foreground"
        style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500 }}
      >
        Поставщики
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {suppliers.map((s) => {
          const supplierStats = stats[s.slug];
          return (
            <Card
              key={s.id}
              className={`border-border bg-card transition-all ${
                s.inDevelopment ? 'opacity-75' : 'hover:shadow-md hover:border-primary/30'
              }`}
            >
              <CardContent className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3
                    className="font-semibold text-foreground uppercase tracking-wider text-lg"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    {s.name}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    {s.inDevelopment ? (
                      <>
                        <Construction className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[11px] text-amber-500 font-medium" style={{ fontFamily: "'Manrope', sans-serif" }}>
                          В разработке
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[11px] text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
                          Активен
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Stats */}
                {s.inDevelopment ? (
                  <div className="flex items-center gap-3 py-6 justify-center">
                    <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                    <span className="text-sm text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
                      Загрузка в разработке...
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                          Товаров
                        </p>
                        <p className="font-semibold text-foreground text-2xl" style={{ fontFamily: "'Oswald', sans-serif" }}>
                          {loadingStats ? '...' : (supplierStats?.productCount || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                          Формат
                        </p>
                        <p className="font-medium text-foreground text-sm mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                          {s.format}
                        </p>
                      </div>
                    </div>

                    {/* Categories breakdown */}
                    {supplierStats?.categories && supplierStats.categories.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                          Категории
                        </p>
                        {supplierStats.categories.map((cat) => (
                          <div key={cat.slug} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
                              {cat.name}
                            </span>
                            <span className="font-semibold text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                              {cat.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {supplierStats?.lastSync && (
                      <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
                        Последняя синхронизация: {supplierStats.lastSync}
                      </p>
                    )}
                  </>
                )}

                {/* Actions */}
                {!s.inDevelopment && s.syncEndpoint && (
                  <Button
                    onClick={() => handleSync(s)}
                    disabled={syncing === s.slug}
                    className="w-full gap-2 bg-primary hover:opacity-90 text-primary-foreground"
                  >
                    {syncing === s.slug ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span style={{ fontFamily: "'Manrope', sans-serif" }}>
                      {syncing === s.slug ? 'Синхронизация...' : 'Запустить синхронизацию'}
                    </span>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Suppliers;
