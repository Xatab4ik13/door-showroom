import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Check, Clock, CreditCard, Truck, PackageCheck, Shield, Loader2, XCircle } from 'lucide-react';
import { z } from 'zod';
import { useCart } from '@/contexts/CartContext';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rusdoors.su';

const checkoutSchema = z.object({
  name: z.string().trim().min(2, 'Укажите ФИО').max(100),
  phone: z.string().trim().min(10, 'Укажите телефон').max(20),
  email: z.string().trim().email('Укажите корректный email').max(255),
  address: z.string().trim().min(5, 'Укажите адрес доставки').max(300),
  comment: z.string().max(500).optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const formatPrice = (price: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price);

const statusSteps = [
  { key: 'pending', label: 'Ожидает', icon: Clock, description: 'Заявка отправлена менеджеру' },
  { key: 'confirmed', label: 'Подтверждён', icon: Check, description: 'Менеджер подтвердил заказ' },
  { key: 'paid', label: 'Оплачен', icon: CreditCard, description: 'Оплата получена' },
  { key: 'shipping', label: 'В доставке', icon: Truck, description: 'Заказ в пути' },
  { key: 'completed', label: 'Завершён', icon: PackageCheck, description: 'Заказ доставлен' },
];

const statusToIndex: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  paid: 2,
  shipping: 3,
  completed: 4,
  cancelled: -1,
};

const Checkout = () => {
  const { items, totalItems, totalPrice, totalDiscount, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState<CheckoutForm>({ name: '', phone: '', email: '', address: '', comment: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderStatus, setOrderStatus] = useState(0);
  const [isCancelled, setIsCancelled] = useState(false);

  // Poll order status from API
  const pollStatus = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'cancelled') {
          setIsCancelled(true);
        } else {
          const idx = statusToIndex[data.status] ?? 0;
          setOrderStatus(idx);
        }
      }
    } catch { /* ignore */ }
  }, [orderId]);

  useEffect(() => {
    if (!submitted || !orderId) return;
    const interval = setInterval(pollStatus, 10000); // every 10s
    return () => clearInterval(interval);
  }, [submitted, orderId, pollStatus]);

  const handleChange = (field: keyof CheckoutForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = checkoutSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CheckoutForm, string>> = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as keyof CheckoutForm;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const orderItems: { name: string; id: string; quantity: number; price: number }[] = [];
      items.forEach(({ product, quantity, accessories }) => {
        orderItems.push({
          name: product.name,
          id: product.id,
          quantity,
          price: product.price,
        });
        accessories.forEach((a) => {
          if (a.quantity > 0) {
            orderItems.push({
              name: `${a.name} (к ${product.name})`,
              id: a.article,
              quantity: a.quantity,
              price: a.price,
            });
          }
        });
      });

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          comment: form.comment,
          items: orderItems,
          total: totalPrice,
          discount: totalDiscount,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Ошибка сервера' }));
        setErrors({ name: errData.error || `Ошибка ${res.status}. Попробуйте ещё раз.` });
        setSubmitting(false);
        return;
      }

      const order = await res.json();
      setOrderNumber(order.order_number);
      setOrderId(order.id);
      setSubmitted(true);
      setOrderStatus(0);
      clearCart();
    } catch (err) {
      console.error('[Checkout] Order submit error:', err);
      setErrors({ name: 'Сервер недоступен. Проверьте подключение и попробуйте ещё раз.' });
    }
    setSubmitting(false);
  };

  if (items.length === 0 && !submitted) {
    return (
      <div className="pt-28 pb-16 px-4 md:px-8 lg:px-12 max-w-[1400px] mx-auto text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" strokeWidth={1} />
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-foreground mb-2" style={{ fontFamily: "'Oswald', sans-serif" }}>
          Корзина пуста
        </h1>
        <p className="text-muted-foreground mb-6">Добавьте товары для оформления заказа</p>
        <Link to="/catalog" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity" style={{ fontFamily: "'Oswald', sans-serif" }}>
          Перейти в каталог
        </Link>
      </div>
    );
  }

  // Order submitted — show status tracker
  if (submitted) {
    return (
      <div className="pt-28 pb-20 px-4 md:px-8 lg:px-12 max-w-[900px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Success header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center"
              >
                {isCancelled ? (
                  <XCircle className="w-10 h-10 text-destructive" />
                ) : (
                  <Check className="w-10 h-10 text-primary" />
                )}
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                {isCancelled ? 'ЗАКАЗ ОТМЕНЁН' : (
                  <>ЗАЯ<span className="text-primary">В</span>КА ОТПРАВЛЕНА</>
                )}
              </h1>
              <p className="mt-3 text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
                Заказ <span className="text-foreground font-semibold">{orderNumber}</span>
                {isCancelled ? ' был отменён' : ' принят в обработку'}
              </p>
            </div>

            {!isCancelled && (
              <>
                {/* Status tracker */}
                <div className="bg-card border border-border rounded-2xl p-6 md:p-10 mb-8">
                  <h2 className="text-lg font-bold uppercase tracking-wider text-foreground mb-8" style={{ fontFamily: "'Oswald', sans-serif" }}>
                    Статус заказа
                  </h2>
                  <div className="space-y-0">
                    {statusSteps.map((step, i) => {
                      const isActive = i === orderStatus;
                      const isDone = i < orderStatus;
                      return (
                        <div key={step.key} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <motion.div
                              initial={false}
                              animate={{
                                backgroundColor: isDone || isActive ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
                                scale: isActive ? 1.15 : 1,
                              }}
                              transition={{ duration: 0.4 }}
                              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative z-10"
                            >
                              <step.icon className={`w-4 h-4 ${isDone || isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                            </motion.div>
                            {i < statusSteps.length - 1 && (
                              <div className={`w-0.5 h-12 transition-colors duration-500 ${isDone ? 'bg-primary' : 'bg-border'}`} />
                            )}
                          </div>
                          <div className="pt-2 pb-6">
                            <span
                              className={`text-sm font-bold uppercase tracking-wider block ${isActive ? 'text-primary' : isDone ? 'text-foreground' : 'text-muted-foreground'}`}
                              style={{ fontFamily: "'Oswald', sans-serif" }}
                            >
                              {step.label}
                            </span>
                            <span className="text-xs text-muted-foreground">{step.description}</span>
                            {isActive && i === 0 && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-xs text-primary mt-1 flex items-center gap-1"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                Ожидаем подтверждения менеджера...
                              </motion.p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Info about tracking */}
                <div className="bg-card border border-border rounded-2xl p-6 mb-8 text-center">
                  <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    Статус обновляется автоматически. Вы также можете отслеживать заказ в{' '}
                    <Link to="/account" className="text-primary hover:underline font-medium">личном кабинете</Link>.
                  </p>
                </div>
              </>
            )}

            <div className="text-center">
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity uppercase tracking-wider"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Продолжить покупки
              </Link>
            </div>
          </motion.div>
      </div>
    );
  }

  // Checkout form
  return (
    <div className="pt-28 pb-20 px-4 md:px-8 lg:px-12 max-w-[1400px] mx-auto">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Вернуться в корзину
        </Link>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-foreground mb-8"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          ОФОРМ<span className="text-primary">Л</span>ЕНИЕ
        </motion.h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="lg:col-span-2 space-y-6"
          >
            {/* Contact info */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-lg font-bold uppercase tracking-wider text-foreground mb-6" style={{ fontFamily: "'Oswald', sans-serif" }}>
                Контактные данные
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <InputField label="ФИО *" value={form.name} error={errors.name} onChange={v => handleChange('name', v)} placeholder="Иванов Иван Иванович" />
                <InputField label="Телефон *" value={form.phone} error={errors.phone} onChange={v => handleChange('phone', v)} placeholder="+7 (999) 123-45-67" type="tel" />
                <InputField label="Email *" value={form.email} error={errors.email} onChange={v => handleChange('email', v)} placeholder="email@example.com" type="email" className="sm:col-span-2" />
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-lg font-bold uppercase tracking-wider text-foreground mb-2" style={{ fontFamily: "'Oswald', sans-serif" }}>
                Доставка
              </h2>
              <p className="text-xs text-muted-foreground mb-6">Способ и стоимость доставки согласуются с менеджером после подтверждения заказа</p>
              <InputField label="Адрес доставки *" value={form.address} error={errors.address} onChange={v => handleChange('address', v)} placeholder="Город, улица, дом, квартира" />
            </div>

            {/* Comment */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-lg font-bold uppercase tracking-wider text-foreground mb-6" style={{ fontFamily: "'Oswald', sans-serif" }}>
                Комментарий
              </h2>
              <textarea
                value={form.comment || ''}
                onChange={e => handleChange('comment', e.target.value)}
                placeholder="Пожелания по доставке, установке или другие комментарии..."
                rows={3}
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                style={{ fontFamily: "'Manrope', sans-serif" }}
                maxLength={500}
              />
            </div>

            {/* Submit — mobile */}
            <div className="lg:hidden">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Отправить заявку
              </button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                После отправки менеджер свяжется с вами для подтверждения
              </p>
            </div>
          </motion.form>

          {/* Sidebar — order summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-28 space-y-4">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>
                  Ваш заказ
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {items.map(({ product, quantity, accessories }) => (
                    <div key={product.id} className="space-y-1">
                      <div className="flex justify-between gap-2">
                        <span className="text-sm text-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
                          {product.name} × {quantity}
                        </span>
                        <span className="text-sm font-semibold text-foreground whitespace-nowrap" style={{ fontFamily: "'Oswald', sans-serif" }}>
                          {formatPrice(product.price * quantity)}
                        </span>
                      </div>
                      {accessories.filter(a => a.quantity > 0).map(a => (
                        <div key={a.article} className="flex justify-between gap-2 pl-3">
                          <span className="text-xs text-muted-foreground">{a.name} × {a.quantity}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{formatPrice(a.price * a.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="border-t border-border mt-4 pt-4 space-y-2">
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Скидка</span>
                      <span className="text-emerald-600 font-medium">−{formatPrice(totalDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-foreground font-medium">Итого</span>
                    <span className="text-lg font-bold text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit — desktop */}
              <div className="hidden lg:block">
                <button
                  type="submit"
                  form=""
                  disabled={submitting}
                  onClick={(e) => {
                    e.preventDefault();
                    const formEl = document.querySelector('form');
                    formEl?.requestSubmit();
                  }}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-xl text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Отправить заявку
                </button>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  После отправки менеджер свяжется с вами для подтверждения
                </p>
              </div>

              <div className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span>Оплата только после подтверждения менеджером</span>
              </div>
            </div>
          </motion.div>
        </div>
    </div>
  );
};

// Reusable input field
const InputField = ({
  label, value, error, onChange, placeholder, type = 'text', className = '',
}: {
  label: string; value: string; error?: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; className?: string;
}) => (
  <div className={className}>
    <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5" style={{ fontFamily: "'Oswald', sans-serif" }}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-3 bg-background border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${error ? 'border-destructive' : 'border-input'}`}
      style={{ fontFamily: "'Manrope', sans-serif" }}
    />
    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
  </div>
);

export default Checkout;