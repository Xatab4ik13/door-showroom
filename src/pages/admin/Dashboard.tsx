import { Package, ShoppingCart, Users, TrendingUp, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
  { label: 'Заказов сегодня', value: '12', icon: ShoppingCart, trend: '+3' },
  { label: 'Товаров в каталоге', value: '248', icon: Package, trend: '+15' },
  { label: 'Клиентов', value: '1 024', icon: Users, trend: '+42' },
  { label: 'Поставщиков', value: '14', icon: Truck, trend: '' },
  { label: 'Выручка за месяц', value: '₽ 2.4M', icon: TrendingUp, trend: '+18%' },
];

const recentOrders = [
  { id: 'ORD-312', client: 'Иванов А.', status: 'Новый', total: '34 500 ₽', supplier: 'Profil Doors' },
  { id: 'ORD-311', client: 'Петрова М.', status: 'Подтверждён', total: '12 900 ₽', supplier: 'Волховец' },
  { id: 'ORD-310', client: 'Сидоров К.', status: 'Доставка', total: '67 200 ₽', supplier: 'Bravo' },
  { id: 'ORD-309', client: 'Козлова Е.', status: 'Завершён', total: '22 400 ₽', supplier: 'Sofia' },
];

const statusColor: Record<string, string> = {
  'Новый': 'bg-[hsl(205,85%,45%)]/10 text-[hsl(205,85%,45%)]',
  'Подтверждён': 'bg-amber-50 text-amber-600',
  'Доставка': 'bg-violet-50 text-violet-600',
  'Завершён': 'bg-emerald-50 text-emerald-600',
};

const Dashboard = () => (
  <div className="space-y-6">
    <h1
      className="text-3xl tracking-wider uppercase text-foreground"
      style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500 }}
    >
      Дашборд
    </h1>

    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((s) => (
        <Card key={s.label} className="border-border bg-card">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-[hsl(205,85%,45%)]/10 flex items-center justify-center">
                <s.icon className="h-4 w-4 text-[hsl(205,85%,45%)]" />
              </div>
              {s.trend && (
                <span
                  className="text-xs font-medium text-emerald-600"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  {s.trend}
                </span>
              )}
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
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Recent orders */}
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle
          className="text-lg uppercase tracking-wider"
          style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500 }}
        >
          Последние заказы
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left">
                <th className="pb-3 font-medium text-xs uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>№</th>
                <th className="pb-3 font-medium text-xs uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>Клиент</th>
                <th className="pb-3 font-medium text-xs uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>Статус</th>
                <th className="pb-3 font-medium text-xs uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>Поставщик</th>
                <th className="pb-3 font-medium text-xs uppercase tracking-wider text-right" style={{ fontFamily: "'Oswald', sans-serif" }}>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors">
                  <td className="py-3.5 font-medium text-foreground">{o.id}</td>
                  <td className="py-3.5 text-foreground">{o.client}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[o.status] || ''}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-muted-foreground">{o.supplier}</td>
                  <td className="py-3.5 text-right font-semibold text-foreground">{o.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default Dashboard;
