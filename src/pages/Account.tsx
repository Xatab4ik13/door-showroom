import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, MapPin, LogOut, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth, type Address } from '@/contexts/AuthContext';
import { useAuth, type Address } from '@/contexts/AuthContext';

const statusLabels: Record<string, string> = {
  processing: 'В обработке',
  shipped: 'Доставляется',
  delivered: 'Доставлен',
};

const statusColors: Record<string, string> = {
  processing: 'bg-amber-100 text-amber-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price);

type Tab = 'profile' | 'orders' | 'addresses';

const tabs: { key: Tab; label: string; icon: typeof User }[] = [
  { key: 'profile', label: 'Профиль', icon: User },
  { key: 'orders', label: 'Заказы', icon: Package },
  { key: 'addresses', label: 'Адреса', icon: MapPin },
];

const Account = () => {
  const { user, isAuthenticated, logout, updateProfile, addAddress, removeAddress, orders } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [name, setName] = useState(user?.name || '');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({ label: '', city: '', street: '', apartment: '' });

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleSaveProfile = () => {
    updateProfile({ name });
  };

  const handleAddAddress = () => {
    if (newAddress.city && newAddress.street) {
      addAddress(newAddress);
      setNewAddress({ label: '', city: '', street: '', apartment: '' });
      setShowAddAddress(false);
    }
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
                      ? 'bg-[hsl(205,85%,45%)] text-white font-medium'
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
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(205,85%,45%)]/30"
                    placeholder="Ваше имя"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1" style={{ fontFamily: "'Oswald', sans-serif" }}>Телефон</label>
                  <input
                    type="text"
                    value={user?.phone || ''}
                    disabled
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-muted text-muted-foreground text-sm"
                  />
                </div>
                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-2.5 bg-[hsl(205,85%,45%)] text-white rounded-lg text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  Сохранить
                </button>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h2
                  className="text-lg font-bold uppercase tracking-wider text-foreground"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  История заказов
                </h2>
                {orders.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Заказов пока нет</p>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="bg-card border border-border rounded-lg p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-sm font-bold text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                            {order.id}
                          </span>
                          <span className="text-xs text-muted-foreground ml-3">{order.date}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
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
                      <div className="border-t border-border mt-3 pt-3 flex justify-between">
                        <span className="text-sm font-medium text-foreground">Итого</span>
                        <span className="text-sm font-bold text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2
                    className="text-lg font-bold uppercase tracking-wider text-foreground"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    Адреса доставки
                  </h2>
                  <button
                    onClick={() => setShowAddAddress(true)}
                    className="flex items-center gap-1.5 text-sm text-[hsl(205,85%,45%)] hover:opacity-80 transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                    Добавить
                  </button>
                </div>

                {showAddAddress && (
                  <div className="bg-card border border-border rounded-lg p-5 space-y-3">
                    <input
                      type="text"
                      value={newAddress.label}
                      onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      placeholder="Название (Дом, Офис...)"
                      className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(205,85%,45%)]/30"
                    />
                    <input
                      type="text"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      placeholder="Город"
                      className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(205,85%,45%)]/30"
                    />
                    <input
                      type="text"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      placeholder="Улица, дом"
                      className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(205,85%,45%)]/30"
                    />
                    <input
                      type="text"
                      value={newAddress.apartment}
                      onChange={(e) => setNewAddress({ ...newAddress, apartment: e.target.value })}
                      placeholder="Квартира / офис"
                      className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(205,85%,45%)]/30"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddAddress}
                        className="px-5 py-2 bg-[hsl(205,85%,45%)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                        style={{ fontFamily: "'Oswald', sans-serif" }}
                      >
                        Сохранить
                      </button>
                      <button
                        onClick={() => setShowAddAddress(false)}
                        className="px-5 py-2 border border-border text-muted-foreground rounded-lg text-sm hover:text-foreground transition-colors"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                )}

                {user?.addresses.length === 0 && !showAddAddress && (
                  <p className="text-muted-foreground text-sm">Адресов пока нет</p>
                )}

                {user?.addresses.map((addr) => (
                  <div key={addr.id} className="bg-card border border-border rounded-lg p-5 flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                        {addr.label || 'Адрес'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {addr.city}, {addr.street}{addr.apartment ? `, кв. ${addr.apartment}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => removeAddress(addr.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
