import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type OrderStatus = 'pending' | 'confirmed' | 'paid' | 'shipping' | 'completed';

interface Order {
  id: string;
  client: string;
  phone: string;
  items: string;
  total: string;
  supplier: string;
  date: string;
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Заявка', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  confirmed: { label: 'Подтверждён', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  paid: { label: 'Оплачен', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  shipping: { label: 'Доставка', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  completed: { label: 'Завершён', color: 'bg-green-100 text-green-700 border-green-200' },
};

const demoOrders: Order[] = [
  { id: 'ORD-312', client: 'Иванов А.В.', phone: '+7 900 111-22-33', items: 'Vetro × 2', total: '25 800 ₽', supplier: 'Profil Doors', date: '12.03.2026', status: 'pending' },
  { id: 'ORD-311', client: 'Петрова М.И.', phone: '+7 900 444-55-66', items: 'Nero × 1', total: '34 500 ₽', supplier: 'Porta Prima', date: '11.03.2026', status: 'confirmed' },
  { id: 'ORD-310', client: 'Сидоров К.А.', phone: '+7 900 777-88-99', items: 'Bianco × 3, Ручка × 3', total: '31 200 ₽', supplier: 'Bravo', date: '10.03.2026', status: 'paid' },
  { id: 'ORD-309', client: 'Козлова Е.П.', phone: '+7 900 222-33-44', items: 'Rovere × 1', total: '31 600 ₽', supplier: 'Волховец', date: '09.03.2026', status: 'shipping' },
  { id: 'ORD-308', client: 'Николаев Д.С.', phone: '+7 900 555-66-77', items: 'Classico × 1', total: '22 400 ₽', supplier: 'Luxor', date: '08.03.2026', status: 'completed' },
];

const columns: OrderStatus[] = ['pending', 'confirmed', 'paid', 'shipping', 'completed'];

const Orders = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Заказы</h1>
        <p className="text-sm text-muted-foreground">{demoOrders.length} заказов</p>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {columns.map((status) => {
          const cfg = statusConfig[status];
          const orders = demoOrders.filter((o) => o.status === status);
          return (
            <div key={status} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                  {cfg.label}
                </span>
                <span className="text-xs text-muted-foreground">{orders.length}</span>
              </div>
              <div className="space-y-3 min-h-[200px]">
                {orders.map((order) => (
                  <Card key={order.id} className="border-border cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{order.id}</span>
                        <span className="text-xs text-muted-foreground">{order.date}</span>
                      </div>
                      <p className="text-sm font-medium">{order.client}</p>
                      <p className="text-xs text-muted-foreground">{order.phone}</p>
                      <p className="text-xs text-muted-foreground">{order.items}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-muted-foreground">{order.supplier}</span>
                        <span className="text-sm font-bold">{order.total}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
