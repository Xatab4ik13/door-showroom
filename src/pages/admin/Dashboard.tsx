import { useState, useEffect } from 'react';
import { Package, ShoppingCart, Users, TrendingUp, Truck, Loader2, DollarSign, XCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rusdoors.su';

interface OrderStats {
  total_orders: number;
  pending: number;
  confirmed: number;
  paid: number;
  shipping: number;
  completed: number;
  cancelled: number;
  revenue: number;
  lost_revenue: number;
}

interface MonthlyData {
  month: string;
  total_orders: number;
  paid_orders: number;
  cancelled_orders: number;
  revenue: number;
  lost_revenue: number;
}

interface CatalogData {
  totalProducts: number;
  categories: { slug: string; name: string; count: number }[];
  manufacturers: string[];
}

const formatPrice = (p: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(p);

const monthNames: Record<string, string> = {
  '01': 'Янв', '02': 'Фев', '03': 'Мар', '04': 'Апр',
  '05': 'Май', '06': 'Июн', '07': 'Июл', '08': 'Авг',
  '09': 'Сен', '10': 'Окт', '11': 'Ноя', '12': 'Дек',
};

const Dashboard = () => {
  const [catalogData, setCatalogData] = useState<CatalogData | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('6');

  const token = localStorage.getItem('rusdoors_admin_token');
  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [facetsRes, productsRes, statsRes, monthlyRes] = await Promise.all([
          fetch(`${API_BASE}/api/products/facets`).catch(() => null),
          fetch(`${API_BASE}/api/products?limit=1`).catch(() => null),
          fetch(`${API_BASE}/api/orders/stats`, { headers: authHeaders }).catch(() => null),
          fetch(`${API_BASE}/api/orders/monthly?months=${period}`, { headers: authHeaders }).catch(() => null),
        ]);

        const facets = facetsRes?.ok ? await facetsRes.json() : { categories: [], manufacturers: [] };
        const products = productsRes?.ok ? await productsRes.json() : { total: 0 };
        const stats = statsRes?.ok ? await statsRes.json() : null;
        const monthly = monthlyRes?.ok ? await monthlyRes.json() : [];

        setCatalogData({
          totalProducts: products.total || 0,
          categories: facets.categories || [],
          manufacturers: facets.manufacturers || [],
        });
        setOrderStats(stats);
        setMonthlyData(monthly);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [period]);

  const mainStats = [
    {
      label: 'Выручка',
      value: orderStats ? formatPrice(Number(orderStats.revenue)) : '...',
      icon: DollarSign,
      subtitle: 'Оплаченные заказы',
    },
    {
      label: 'Всего заказов',
      value: orderStats ? String(orderStats.total_orders) : '...',
      icon: ShoppingCart,
      subtitle: orderStats ? `${orderStats.pending} в ожидании` : '',
    },
    {
      label: 'Завершено',
      value: orderStats ? String(orderStats.completed) : '...',
      icon: CheckCircle,
      subtitle: orderStats ? `${orderStats.paid + orderStats.shipping} в работе` : '',
    },
    {
      label: 'Отменено',
      value: orderStats ? String(orderStats.cancelled) : '...',
      icon: XCircle,
      subtitle: orderStats && orderStats.total_orders > 0
        ? `${((orderStats.cancelled / orderStats.total_orders) * 100).toFixed(0)}% отказов`
        : '',
    },
  ];

  const catalogStats = [
    { label: 'Товаров', value: catalogData?.totalProducts || 0, icon: Package },
    { label: 'Категорий', value: catalogData?.categories.length || 0, icon: TrendingUp },
    { label: 'Производителей', value: catalogData?.manufacturers.length || 0, icon: Truck },
  ];

  // Find max revenue for bar chart scaling
  const maxRevenue = Math.max(...monthlyData.map((m) => Number(m.revenue)), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-3xl tracking-wider uppercase text-foreground"
          style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500 }}
        >
          Дашборд
        </h1>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40 bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 месяца</SelectItem>
            <SelectItem value="6">6 месяцев</SelectItem>
            <SelectItem value="12">12 месяцев</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Main stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mainStats.map((s) => (
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
                  <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    {s.label}
                  </p>
                  {s.subtitle && (
                    <p className="text-[10px] text-muted-foreground mt-0.5" style={{ fontFamily: "'Manrope', sans-serif" }}>
                      {s.subtitle}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Monthly chart */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle
                className="text-lg uppercase tracking-wider"
                style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500 }}
              >
                Продажи по месяцам
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyData.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground text-sm">
                  Данные появятся после первых заказов
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Bar chart */}
                  <div className="flex items-end gap-2 h-48">
                    {monthlyData.map((m) => {
                      const revH = (Number(m.revenue) / maxRevenue) * 100;
                      const lostH = maxRevenue > 0 ? (Number(m.lost_revenue) / maxRevenue) * 100 : 0;
                      const monthLabel = monthNames[m.month.split('-')[1]] || m.month;
                      return (
                        <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '160px', justifyContent: 'flex-end' }}>
                            {lostH > 0 && (
                              <div
                                className="w-full max-w-8 bg-destructive/20 rounded-t"
                                style={{ height: `${Math.max(lostH, 4)}%` }}
                                title={`Отказы: ${formatPrice(Number(m.lost_revenue))}`}
                              />
                            )}
                            <div
                              className="w-full max-w-8 bg-primary rounded-t transition-all"
                              style={{ height: `${Math.max(revH, 4)}%` }}
                              title={`Выручка: ${formatPrice(Number(m.revenue))}`}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                            {monthLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 justify-center text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-primary" />
                      <span>Выручка</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-destructive/20" />
                      <span>Отказы от оплаты</span>
                    </div>
                  </div>

                  {/* Monthly table */}
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
                      <thead>
                        <tr className="border-b border-border text-left">
                          {['Месяц', 'Заказов', 'Оплачено', 'Отказов', 'Выручка', 'Потери'].map((h) => (
                            <th key={h} className="pb-2 font-medium text-[10px] uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyData.map((m) => {
                          const label = monthNames[m.month.split('-')[1]] + ' ' + m.month.split('-')[0];
                          return (
                            <tr key={m.month} className="border-b border-border/50 last:border-0">
                              <td className="py-2 font-medium text-foreground">{label}</td>
                              <td className="py-2">{m.total_orders}</td>
                              <td className="py-2 text-emerald-600">{m.paid_orders}</td>
                              <td className="py-2 text-destructive">{m.cancelled_orders}</td>
                              <td className="py-2 font-semibold text-foreground">{formatPrice(Number(m.revenue))}</td>
                              <td className="py-2 text-destructive">{formatPrice(Number(m.lost_revenue))}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Catalog stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {catalogStats.map((s) => (
              <Card key={s.label} className="border-border bg-card">
                <CardContent className="pt-5 pb-4 px-5">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    {s.label}
                  </p>
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
              <div className="space-y-3">
                {catalogData?.categories.map((cat) => {
                  const pct = catalogData.totalProducts > 0 ? (cat.count / catalogData.totalProducts) * 100 : 0;
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
            </CardContent>
          </Card>

          {/* Order pipeline */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle
                className="text-lg uppercase tracking-wider"
                style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500 }}
              >
                Воронка заказов
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orderStats ? (
                <div className="flex items-center gap-2 overflow-x-auto">
                  {[
                    { label: 'Заявки', value: orderStats.pending, color: 'bg-primary' },
                    { label: 'Подтверждено', value: orderStats.confirmed, color: 'bg-amber-500' },
                    { label: 'Оплачено', value: orderStats.paid, color: 'bg-emerald-500' },
                    { label: 'Доставка', value: orderStats.shipping, color: 'bg-violet-500' },
                    { label: 'Завершено', value: orderStats.completed, color: 'bg-foreground' },
                  ].map((step, i) => (
                    <div key={step.label} className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="text-center flex-1">
                        <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                          {step.value}
                        </p>
                        <div className={`h-1.5 rounded-full ${step.color} mt-1`} />
                        <p className="text-[10px] text-muted-foreground mt-1" style={{ fontFamily: "'Oswald', sans-serif" }}>
                          {step.label}
                        </p>
                      </div>
                      {i < 4 && <span className="text-muted-foreground/30 text-lg shrink-0">→</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground text-sm">Нет данных</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;
