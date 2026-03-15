import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, ChevronRight, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rusdoors.su';

type OrderStatus = 'pending' | 'confirmed' | 'paid' | 'shipping' | 'completed' | 'cancelled';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  comment: string;
  status: OrderStatus;
  items: { name: string; quantity: number; price: number; slug?: string }[];
  total: number;
  discount: number;
  payment_status: string;
  manager_name: string | null;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; dot: string }> = {
  pending: { label: 'Заявка', color: 'bg-primary/10 text-primary border-primary/20', dot: 'bg-primary' },
  confirmed: { label: 'Подтверждён', color: 'bg-amber-50 text-amber-600 border-amber-200', dot: 'bg-amber-500' },
  paid: { label: 'Оплачен', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-500' },
  shipping: { label: 'Доставка', color: 'bg-violet-50 text-violet-600 border-violet-200', dot: 'bg-violet-500' },
  completed: { label: 'Завершён', color: 'bg-muted text-foreground border-border', dot: 'bg-foreground' },
  cancelled: { label: 'Отменён', color: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive' },
};

const STATUS_FLOW: Record<string, { status: string; label: string; variant: 'default' | 'outline' }[]> = {
  pending: [
    { status: 'confirmed', label: 'Подтвердить', variant: 'default' },
    { status: 'cancelled', label: 'Отменить', variant: 'outline' },
  ],
  confirmed: [
    { status: 'paid', label: 'Оплачен', variant: 'default' },
    { status: 'cancelled', label: 'Отменить', variant: 'outline' },
  ],
  paid: [{ status: 'shipping', label: 'Отправить', variant: 'default' }],
  shipping: [{ status: 'completed', label: 'Завершить', variant: 'default' }],
  completed: [],
  cancelled: [],
};

const columns: OrderStatus[] = ['pending', 'confirmed', 'paid', 'shipping', 'completed'];

const formatPrice = (p: number) => new Intl.NumberFormat('ru-RU').format(p) + ' ₽';
const formatDate = (d: string) => new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

const Orders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');

  const token = localStorage.getItem('rusdoors_admin_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`${API_BASE}/api/orders?${params}`, { headers });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      // If API fails, show empty
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const changeStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast({ title: `Статус изменён на "${statusConfig[newStatus as OrderStatus]?.label}"` });
      loadOrders();
      setSelectedOrder(null);
    } catch (err: any) {
      toast({ title: err.message || 'Ошибка', variant: 'destructive' });
    }
  };

  const ordersByStatus = (status: OrderStatus) =>
    orders.filter((o) => o.status === status);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-3xl tracking-wider uppercase text-foreground"
            style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500 }}
          >
            Заказы
          </h1>
          <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {loading ? '...' : `${orders.length} заказов`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'kanban' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('kanban')}
            className="text-xs"
          >
            Kanban
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('list')}
            className="text-xs"
          >
            Список
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по номеру, имени, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border focus-visible:ring-primary"
          />
        </div>
        {view === 'list' && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              {Object.entries(statusConfig).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
          {search ? 'Заказы не найдены' : 'Заказов пока нет. Они появятся после оформления первого заказа на сайте.'}
        </div>
      ) : view === 'kanban' ? (
        /* Kanban view */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {columns.map((status) => {
            const cfg = statusConfig[status];
            const col = ordersByStatus(status);
            return (
              <div key={status} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span
                    className="text-xs uppercase tracking-[0.15em] text-muted-foreground"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    {cfg.label}
                  </span>
                  <span className="text-xs text-muted-foreground/60">{col.length}</span>
                </div>
                <div className="space-y-3 min-h-[200px]">
                  {col.map((order) => (
                    <Card
                      key={order.id}
                      className="border-border bg-card cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <CardContent className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-primary" style={{ fontFamily: "'Oswald', sans-serif" }}>
                            {order.order_number}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{formatDate(order.created_at)}</span>
                        </div>
                        <p className="text-sm font-medium text-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
                          {order.customer_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{order.customer_phone || order.customer_email}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-border/50">
                          {order.manager_name && (
                            <span className="text-[11px] text-muted-foreground">{order.manager_name}</span>
                          )}
                          <span className="text-sm font-bold text-foreground ml-auto" style={{ fontFamily: "'Oswald', sans-serif" }}>
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List view */
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
                <thead>
                  <tr className="border-b border-border text-left">
                    {['№', 'Клиент', 'Контакт', 'Сумма', 'Статус', 'Дата', ''].map((h) => (
                      <th key={h} className="p-3 font-medium text-[10px] uppercase tracking-[0.15em] text-muted-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const cfg = statusConfig[o.status];
                    return (
                      <tr key={o.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => setSelectedOrder(o)}>
                        <td className="p-3 font-semibold text-primary" style={{ fontFamily: "'Oswald', sans-serif" }}>{o.order_number}</td>
                        <td className="p-3 font-medium text-foreground">{o.customer_name}</td>
                        <td className="p-3 text-muted-foreground text-xs">{o.customer_phone || o.customer_email}</td>
                        <td className="p-3 font-bold text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>{formatPrice(o.total)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">{formatDate(o.created_at)}</td>
                        <td className="p-3"><ChevronRight className="w-4 h-4 text-muted-foreground" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order detail dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedOrder && (() => {
            const o = selectedOrder;
            const cfg = statusConfig[o.status];
            const actions = STATUS_FLOW[o.status] || [];
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <span style={{ fontFamily: "'Oswald', sans-serif" }} className="uppercase tracking-wider">
                      {o.order_number}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2 text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {/* Customer info */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-1">
                    <p className="font-medium text-foreground">{o.customer_name}</p>
                    <p className="text-muted-foreground">{o.customer_email}</p>
                    {o.customer_phone && <p className="text-muted-foreground">{o.customer_phone}</p>}
                    {o.address && <p className="text-muted-foreground text-xs mt-2">{o.address}</p>}
                    {o.comment && <p className="text-xs text-muted-foreground italic mt-1">«{o.comment}»</p>}
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily: "'Oswald', sans-serif" }}>
                      Товары
                    </p>
                    <div className="space-y-2">
                      {o.items.map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-foreground">{item.name} × {item.quantity}</span>
                          <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold">
                      <span>Итого</span>
                      <span style={{ fontFamily: "'Oswald', sans-serif" }}>{formatPrice(o.total)}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Создан: {formatDate(o.created_at)}</p>
                    {o.manager_name && <p>Менеджер: {o.manager_name}</p>}
                    <p>Оплата: {o.payment_status === 'paid' ? '✅ Оплачен' : '⏳ Не оплачен'}</p>
                  </div>
                </div>

                {/* Actions */}
                {actions.length > 0 && (
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    {actions.map((a) => (
                      <Button
                        key={a.status}
                        variant={a.variant}
                        onClick={() => changeStatus(o.id, a.status)}
                        className={a.variant === 'default' ? 'bg-primary hover:bg-primary/90' : ''}
                      >
                        {a.status === 'confirmed' && <Send className="w-4 h-4 mr-2" />}
                        {a.label}
                      </Button>
                    ))}
                  </DialogFooter>
                )}
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
