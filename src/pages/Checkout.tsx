import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Check, Clock, CreditCard, Truck, PackageCheck, Shield } from 'lucide-react';
import { z } from 'zod';
import { useCart } from '@/contexts/CartContext';

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

const Checkout = () => {
  const { items, totalItems, totalPrice, totalDiscount, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState<CheckoutForm>({ name: '', phone: '', email: '', address: '', comment: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  // Mock: after submission, simulate manager confirmation for demo
  const [orderStatus, setOrderStatus] = useState(0); // index in statusSteps

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

    // Send order to API
    const API_BASE = import.meta.env.VITE_API_URL || 'https://api.rusdoors.su';
    try {
      const orderItems: { name: string; id: string; quantity: number; price: number }[] = [];
      items.forEach(({ product, quantity, accessories }) => {
        orderItems.push({
          name: product.name,
          id: product.id,
          quantity,
          price: product.price,
        });
        // Add accessories as separate line items
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

      if (res.ok) {
        const order = await res.json();
        setOrderNumber(order.order_number);
      } else {
        setOrderNumber(`RD-${Date.now().toString().slice(-6)}`);
      }
    } catch {
      setOrderNumber(`RD-${Date.now().toString().slice(-6)}`);
    }

    setSubmitted(true);
    setOrderStatus(0);
  };

  const handleMockPayment = () => {
    setOrderStatus(2);
    clearCart();
    // Mock shipping after 2s
    setTimeout(() => setOrderStatus(3), 2000);
  };

  if (items.length === 0 && !submitted) {
    return (
      <div className="pt-28 pb-16 px-4 md:px-8 lg:px-12 max-w-[1400px] mx-auto text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" strokeWidth={1} />
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-foreground mb-2" style={{ fontFamily: "'Oswald', sans-serif" }}>
          Корзина пуста
        </h1>
        <p className="text-muted-foreground mb-6">Добавьте товары для оформления заказа</p>
        <Link to="/catalog" className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(205,85%,45%)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity" style={{ fontFamily: "'Oswald', sans-serif" }}>
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
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-[hsl(205,85%,45%)]/10 flex items-center justify-center"
              >
                <Check className="w-10 h-10 text-[hsl(205,85%,45%)]" />
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                ЗАЯ<span className="text-[hsl(205,85%,45%)]">В</span>КА ОТПРАВЛЕНА
              </h1>
              <p className="mt-3 text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
                Заказ <span className="text-foreground font-semibold">{orderNumber}</span> принят в обработку
              </p>
            </div>

            {/* Status tracker */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-10 mb-8">
              <h2 className="text-lg font-bold uppercase tracking-wider text-foreground mb-8" style={{ fontFamily: "'Oswald', sans-serif" }}>
                Статус заказа
              </h2>
              <div className="space-y-0">
                {statusSteps.map((step, i) => {
                  const isActive = i === orderStatus;
                  const isDone = i < orderStatus;
                  const isFuture = i > orderStatus;
                  return (
                    <div key={step.key} className="flex gap-4">
                      {/* Timeline */}
                      <div className="flex flex-col items-center">
                        <motion.div
                          initial={false}
                          animate={{
                            backgroundColor: isDone ? 'hsl(205,85%,45%)' : isActive ? 'hsl(205,85%,45%)' : 'hsl(var(--secondary))',
                            scale: isActive ? 1.15 : 1,
                          }}
                          transition={{ duration: 0.4 }}
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative z-10"
                        >
                          <step.icon className={`w-4 h-4 ${isDone || isActive ? 'text-white' : 'text-muted-foreground'}`} />
                        </motion.div>
                        {i < statusSteps.length - 1 && (
                          <div className={`w-0.5 h-12 transition-colors duration-500 ${isDone ? 'bg-[hsl(205,85%,45%)]' : 'bg-border'}`} />
                        )}
                      </div>
                      {/* Label */}
                      <div className="pt-2 pb-6">
                        <span
                          className={`text-sm font-bold uppercase tracking-wider block ${isActive ? 'text-[hsl(205,85%,45%)]' : isDone ? 'text-foreground' : 'text-muted-foreground'}`}
                          style={{ fontFamily: "'Oswald', sans-serif" }}
                        >
                          {step.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{step.description}</span>
                        {isActive && i === 0 && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-[hsl(205,85%,45%)] mt-1 flex items-center gap-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(205,85%,45%)] animate-pulse" />
                            Ожидаем подтверждения менеджера...
                          </motion.p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment block — visible only when confirmed */}
            {orderStatus === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border-2 border-[hsl(205,85%,45%)]/30 rounded-2xl p-6 md:p-8 mb-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(205,85%,45%)]/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-[hsl(205,85%,45%)]" />
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-wider text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                    Оплата доступна
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  Менеджер подтвердил ваш заказ. Выберите удобный способ оплаты:
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleMockPayment}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-[hsl(205,85%,45%)] text-white rounded-xl hover:opacity-90 transition-opacity"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="uppercase tracking-wider text-sm font-medium">Оплатить онлайн</span>
                  </button>
                  <button
                    onClick={() => { setOrderStatus(3); clearCart(); }}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-secondary text-foreground rounded-xl hover:bg-accent transition-colors"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    <Truck className="w-4 h-4" />
                    <span className="uppercase tracking-wider text-sm font-medium">При получении</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Безопасная оплата через защищённое соединение</span>
                </div>
              </motion.div>
            )}

            {/* Order completed */}
            {orderStatus >= 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(205,85%,45%)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity uppercase tracking-wider"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  Продолжить покупки
                </Link>
              </motion.div>
            )}
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
          ОФОРМ<span className="text-[hsl(205,85%,45%)]">Л</span>ЕНИЕ
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
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(205,85%,45%)]/30 focus:border-[hsl(205,85%,45%)] transition-all resize-none"
                style={{ fontFamily: "'Manrope', sans-serif" }}
                maxLength={500}
              />
            </div>

            {/* Submit — mobile */}
            <div className="lg:hidden">
              <button
                type="submit"
                className="w-full py-4 bg-[hsl(205,85%,45%)] text-white rounded-xl text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
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
                <h3 className="text-lg font-bold uppercase tracking-wider text-foreground mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>
                  Ваш заказ
                </h3>

                {/* Items */}
                <div className="space-y-3 max-h-[280px] overflow-y-auto mb-4 pr-1" style={{ scrollbarWidth: 'thin' }}>
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex gap-3 items-center">
                      <div className="w-12 h-16 bg-secondary rounded-lg overflow-hidden flex items-center justify-center p-1 shrink-0">
                        <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate" style={{ fontFamily: "'Oswald', sans-serif" }}>
                          {product.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{quantity} шт.</p>
                      </div>
                      <span className="text-xs font-medium text-foreground shrink-0">{formatPrice(product.price * quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Товары ({totalItems})</span>
                    <span className="text-foreground">{formatPrice(totalPrice + totalDiscount)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Скидка</span>
                      <span className="text-destructive">−{formatPrice(totalDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Доставка</span>
                    <span className="text-muted-foreground text-xs">Рассчитает менеджер</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-semibold text-foreground">Итого</span>
                    <span className="text-xl font-bold text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit — desktop */}
              <button
                type="submit"
                form=""
                onClick={(e) => {
                  e.preventDefault();
                  const formEl = document.querySelector('form');
                  if (formEl) formEl.requestSubmit();
                }}
                className="hidden lg:block w-full py-4 bg-[hsl(205,85%,45%)] text-white rounded-xl text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Отправить заявку
              </button>
              <p className="hidden lg:block text-xs text-center text-muted-foreground">
                После отправки менеджер свяжется с вами для подтверждения
              </p>

              {/* How it works */}
              <div className="bg-secondary rounded-2xl p-5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-3" style={{ fontFamily: "'Oswald', sans-serif" }}>
                  Как это работает
                </h4>
                <div className="space-y-2.5">
                  {[
                    'Вы отправляете заявку',
                    'Менеджер подтверждает заказ',
                    'Вы оплачиваете онлайн или при получении',
                    'Мы доставляем точно в срок',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span
                        className="w-5 h-5 shrink-0 rounded-full bg-[hsl(205,85%,45%)]/10 text-[hsl(205,85%,45%)] text-[10px] font-bold flex items-center justify-center mt-0.5"
                        style={{ fontFamily: "'Oswald', sans-serif" }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-xs text-muted-foreground">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
    </div>
  );
};

// Reusable input field
const InputField = ({
  label, value, error, onChange, placeholder, type = 'text', className = ''
}: {
  label: string; value: string; error?: string; onChange: (v: string) => void; placeholder: string; type?: string; className?: string;
}) => (
  <div className={className}>
    <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2" style={{ fontFamily: "'Oswald', sans-serif" }}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-3 bg-background border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(205,85%,45%)]/30 focus:border-[hsl(205,85%,45%)] transition-all ${error ? 'border-destructive' : 'border-input'}`}
      style={{ fontFamily: "'Manrope', sans-serif" }}
    />
    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
  </div>
);

export default Checkout;
