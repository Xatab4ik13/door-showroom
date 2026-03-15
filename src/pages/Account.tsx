import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, LogOut, ArrowLeft, Loader2, Clock, Check, CreditCard, Truck, PackageCheck, XCircle, Lock, KeyRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const statusLabels: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Ожидает', color: 'bg-primary/10 text-primary', icon: Clock },
  confirmed: { label: 'Подтверждён', color: 'bg-amber-50 text-amber-600', icon: Check },
  paid: { label: 'Оплачен', color: 'bg-emerald-50 text-emerald-600', icon: CreditCard },
  shipping: { label: 'В доставке', color: 'bg-violet-50 text-violet-600', icon: Truck },
  completed: { label: 'Завершён', color: 'bg-muted text-foreground', icon: PackageCheck },
  cancelled: { label: 'Отменён', color: 'bg-destructive/10 text-destructive', icon: XCircle },
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

type Tab = 'profile' | 'orders';

const tabs: { key: Tab; label: string; icon: typeof User }[] = [
  { key: 'orders', label: 'Заказы', icon: Package },
  { key: 'profile', label: 'Профиль', icon: User },
];

const Account = () => {
  const { user, isAuthenticated, loading: authLoading, logout, updateProfile, orders, loadOrders, ordersLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'orders') {
      loadOrders();
    }
  }, [isAuthenticated, activeTab]);

  if (authLoading) {
    return (
      <div className="pt-28 pb-16 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const handleSaveProfile = async () => {
    setSaving(true);
    await updateProfile({ name, phone });
    setSaving(false);
  };

  return (
    <div className="pt-28 pb-16 px-4 md:px-8 lg:px-12 max-w-[1200px] mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </button>

      <div className="flex items-center justify-between mb-8">
        <h1
          className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-foreground"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          Личный кабинет
        </h1>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Выйти
        </button>
      </div>

      <div className="flex gap-8 flex-col lg:flex-row">
        {/* Tab nav */}
        <div className="lg:w-56 shrink-0">
          <div className="flex lg:flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm transition-colors w-full text-left ${
                  activeTab === tab.key
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-card border border-border rounded-lg p-6 space-y-5">
              <h2
                className="text-lg font-bold uppercase tracking-wider text-foreground"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Профиль
              </h2>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1" style={{ fontFamily: "'Oswald', sans-serif" }}>Имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Ваше имя"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1" style={{ fontFamily: "'Oswald', sans-serif" }}>Email</label>
                <input
                  type="text"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-muted text-muted-foreground text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1" style={{ fontFamily: "'Oswald', sans-serif" }}>Телефон</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2
                className="text-lg font-bold uppercase tracking-wider text-foreground"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Мои заказы
              </h2>

              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" strokeWidth={1} />
                  <p className="text-muted-foreground text-sm">Заказов пока нет</p>
                  <button
                    onClick={() => navigate('/catalog')}
                    className="mt-4 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    Перейти в каталог
                  </button>
                </div>
              ) : (
                orders.map((order) => {
                  const st = statusLabels[order.status] || { label: order.status, color: 'bg-muted text-foreground', icon: Clock };
                  const StatusIcon = st.icon;
                  return (
                    <div key={order.id} className="bg-card border border-border rounded-lg p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                            {order.order_number}
                          </span>
                          <span className="text-xs text-muted-foreground">{formatDate(order.created_at)}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${st.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {st.label}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                            <span className="text-foreground">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-border mt-3 pt-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {order.payment_status === 'paid' ? (
                            <span className="text-xs text-emerald-600 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Оплачен
                            </span>
                          ) : order.status === 'confirmed' ? (
                            <span className="text-xs text-primary font-medium flex items-center gap-1">
                              <CreditCard className="w-3 h-3" /> Ожидает оплаты
                            </span>
                          ) : null}
                        </div>
                        <span className="text-sm font-bold text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                          {formatPrice(order.total)}
                        </span>
                      </div>

                      {/* Payment button when confirmed */}
                      {order.status === 'confirmed' && order.payment_status !== 'paid' && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <button
                            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            style={{ fontFamily: "'Oswald', sans-serif" }}
                            onClick={() => {
                              // TODO: integrate real payment
                              alert('Оплата будет подключена позже. Свяжитесь с менеджером.');
                            }}
                          >
                            <CreditCard className="w-4 h-4" />
                            Оплатить {formatPrice(order.total)}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
