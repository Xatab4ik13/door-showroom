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
  'Новый': 'bg-blue-100 text-blue-700',
  'Подтверждён': 'bg-amber-100 text-amber-700',
  'Доставка': 'bg-purple-100 text-purple-700',
  'Завершён': 'bg-green-100 text-green-700',
};

const Dashboard = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-semibold text-foreground">Дашборд</h1>

    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((s) => (
        <Card key={s.label} className="border-border">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between mb-2">
              <s.icon className="h-5 w-5 text-muted-foreground" />
              {s.trend && (
                <span className="text-xs font-medium text-green-600">{s.trend}</span>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Recent orders */}
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg">Последние заказы</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left">
                <th className="pb-3 font-medium">№</th>
                <th className="pb-3 font-medium">Клиент</th>
                <th className="pb-3 font-medium">Статус</th>
                <th className="pb-3 font-medium">Поставщик</th>
                <th className="pb-3 font-medium text-right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 font-medium">{o.id}</td>
                  <td className="py-3">{o.client}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[o.status] || ''}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 text-muted-foreground">{o.supplier}</td>
                  <td className="py-3 text-right font-medium">{o.total}</td>
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
