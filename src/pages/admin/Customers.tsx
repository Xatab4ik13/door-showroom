import { Search, Loader2, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rusdoors.su';

interface Customer {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  order_count: number;
  total_spent: number;
  last_order_at: string | null;
  created_at: string;
}

interface CustomerOrder {
  id: number;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  pending: 'Заявка',
  confirmed: 'Подтверждён',
  paid: 'Оплачен',
  shipping: 'Доставка',
  completed: 'Завершён',
  cancelled: 'Отменён',
};

const statusColors: Record<string, string> = {
  pending: 'bg-primary/10 text-primary',
  confirmed: 'bg-amber-50 text-amber-600',
  paid: 'bg-emerald-50 text-emerald-600',
  shipping: 'bg-violet-50 text-violet-600',
  completed: 'bg-muted text-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
};

const formatPrice = (p: number) => new Intl.NumberFormat('ru-RU').format(p) + ' ₽';
const formatDate = (d: string) => new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

const Customers = () => {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const token = localStorage.getItem('rusdoors_admin_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`${API_BASE}/api/customers?${params}`, { headers });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(loadCustomers, 300);
    return () => clearTimeout(t);
  }, [loadCustomers]);

  const openDetail = async (c: Customer) => {
    setSelectedCustomer(c);
    setLoadingDetail(true);
    try {
      const res = await fetch(`${API_BASE}/api/customers/${c.id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setCustomerOrders(data.orders || []);
      }
    } catch { /* ignore */ }
    setLoadingDetail(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl tracking-wider uppercase text-foreground"
          style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500 }}
        >
          Клиенты
        </h1>
        <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
          {loading ? '...' : `${customers.length} клиентов`}
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по имени, email, телефону..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card border-border focus-visible:ring-primary"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
          {search ? 'Клиенты не найдены' : 'Клиентов пока нет. Они появятся после первого заказа на сайте.'}
        </div>
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
                <thead>
                  <tr className="border-b border-border text-left">
                    {['Имя', 'Email', 'Телефон', 'Заказов', 'Сумма', 'Последний заказ', ''].map((h) => (
                      <th
                        key={h}
                        className="p-4 font-medium text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
                        style={{ fontFamily: "'Oswald', sans-serif" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => openDetail(c)}
                    >
                      <td className="p-4 font-medium text-foreground">{c.name || '—'}</td>
                      <td className="p-4 text-muted-foreground">{c.email}</td>
                      <td className="p-4 text-muted-foreground">{c.phone || '—'}</td>
                      <td className="p-4">
                        <span className="font-semibold text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                          {c.order_count}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-foreground">{formatPrice(c.total_spent)}</td>
                      <td className="p-4 text-muted-foreground text-xs">
                        {c.last_order_at ? formatDate(c.last_order_at) : '—'}
                      </td>
                      <td className="p-4"><ChevronRight className="w-4 h-4 text-muted-foreground" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer detail dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle style={{ fontFamily: "'Oswald', sans-serif" }} className="uppercase tracking-wider">
                  {selectedCustomer.name || 'Клиент'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2 text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
                <div className="bg-muted/30 rounded-lg p-4 space-y-1">
                  <p className="text-foreground">{selectedCustomer.email}</p>
                  {selectedCustomer.phone && <p className="text-muted-foreground">{selectedCustomer.phone}</p>}
                  <p className="text-xs text-muted-foreground">
                    Зарегистрирован: {formatDate(selectedCustomer.created_at)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                      {selectedCustomer.order_count}
                    </p>
                    <p className="text-xs text-muted-foreground">Заказов</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                      {formatPrice(selectedCustomer.total_spent)}
                    </p>
                    <p className="text-xs text-muted-foreground">Сумма</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily: "'Oswald', sans-serif" }}>
                    Заказы
                  </p>
                  {loadingDetail ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  ) : customerOrders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Заказов нет</p>
                  ) : (
                    <div className="space-y-2">
                      {customerOrders.map((o) => (
                        <div key={o.id} className="flex items-center justify-between bg-card border border-border rounded-lg p-3">
                          <div>
                            <span className="font-semibold text-primary text-xs" style={{ fontFamily: "'Oswald', sans-serif" }}>
                              {o.order_number}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">{formatDate(o.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[o.status] || ''}`}>
                              {statusLabels[o.status] || o.status}
                            </span>
                            <span className="font-bold text-xs" style={{ fontFamily: "'Oswald', sans-serif" }}>
                              {formatPrice(o.total)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
