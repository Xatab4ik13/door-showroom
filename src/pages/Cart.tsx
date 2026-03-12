import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price);

const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice, totalDiscount } = useCart();

  if (items.length === 0) {
    return (
      <div className="pt-28 pb-16 px-4 md:px-8 lg:px-12 max-w-[1400px] mx-auto text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" strokeWidth={1} />
        <h1
          className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-foreground mb-2"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          Корзина пуста
        </h1>
        <p className="text-muted-foreground mb-6">Добавьте товары из каталога</p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(205,85%,45%)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16 px-4 md:px-8 lg:px-12 max-w-[1400px] mx-auto">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Продолжить покупки
        </Link>

        <h1
          className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-foreground mb-8"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          Корзина
          <span className="text-lg text-muted-foreground font-normal ml-3 normal-case tracking-normal">
            {totalItems} товаров
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map(({ product, quantity }) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="flex gap-4 p-4 bg-card border border-border rounded-lg"
                >
                  <Link to={`/product/${product.id}`} className="shrink-0 w-20 h-28 bg-secondary rounded-md overflow-hidden flex items-center justify-center p-2">
                    <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{product.manufacturer}</p>
                    <h3
                      className="text-sm font-semibold uppercase tracking-wide text-foreground"
                      style={{ fontFamily: "'Oswald', sans-serif" }}
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{product.material} · {product.finish}</p>

                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-border rounded-md">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-foreground">{formatPrice(product.price * quantity)}</span>
                    {product.oldPrice && (
                      <p className="text-xs text-muted-foreground line-through">{formatPrice(product.oldPrice * quantity)}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <button
              onClick={clearCart}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              Очистить корзину
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-card border border-border rounded-lg p-6">
              <h3
                className="text-lg font-bold uppercase tracking-wider text-foreground mb-4"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Итого
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Товары ({totalItems})</span>
                  <span className="text-foreground font-medium">{formatPrice(totalPrice + totalDiscount)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Скидка</span>
                    <span className="text-destructive font-medium">−{formatPrice(totalDiscount)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-semibold text-foreground">К оплате</span>
                  <span
                    className="text-xl font-bold text-foreground"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="block mt-6 w-full py-3 bg-[hsl(205,85%,45%)] text-white rounded-lg text-sm font-medium text-center hover:opacity-90 transition-opacity uppercase tracking-wider"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Оформить заказ
              </Link>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Cart;
