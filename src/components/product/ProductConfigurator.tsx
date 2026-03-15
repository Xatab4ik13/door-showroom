import { useState, useMemo } from 'react';
import { ShoppingCart, Check, Minus, Plus } from 'lucide-react';
import { useCart, type CartAccessory } from '@/contexts/CartContext';
import type { CatalogProduct } from '@/data/catalog';

interface Accessory {
  name: string;
  article: string;
  price: number;
  description: string;
  default_qty: number;
}

interface CleanAccessory extends Accessory {
  displayName: string;
}

interface ProductConfiguratorProps {
  product: CatalogProduct;
  apiSpecs?: Record<string, string | null> | null;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price);

/**
 * Extract a friendly category name from the raw accessory name.
 * E.g. "Коробка прямая сендвич Лайт nanotex, клен айс 70*30*2070..." → "Коробка"
 */
function getAccessoryDisplayName(raw: string): string {
  const lowerName = raw.toLowerCase();
  
  const categories: [string, string][] = [
    ['коробка', 'Коробка'],
    ['наличник', 'Наличник'],
    ['добор', 'Добор'],
    ['притворн', 'Притворная планка'],
    ['порог', 'Порог'],
    ['петл', 'Петли'],
    ['ручк', 'Ручка'],
    ['замо', 'Замок'],
    ['уплотнител', 'Уплотнитель'],
    ['стекл', 'Стекло'],
    ['капитель', 'Капитель'],
    ['планка', 'Планка'],
  ];

  for (const [keyword, label] of categories) {
    if (lowerName.includes(keyword)) return label;
  }

  // Fallback: take first 2 words
  const words = raw.split(/[\s,]+/).slice(0, 2).join(' ');
  return words || raw;
}

const ProductConfigurator = ({ product, apiSpecs }: ProductConfiguratorProps) => {
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();

  // Parse sizes from specs
  const sizes: string[] = useMemo(() => {
    if (!apiSpecs?._sizes) return [];
    try {
      return JSON.parse(apiSpecs._sizes);
    } catch { return []; }
  }, [apiSpecs]);

  // Parse accessories from specs, clean names, filter out the door itself
  const accessories: CleanAccessory[] = useMemo(() => {
    if (!apiSpecs?._accessories) return [];
    try {
      const parsed: Accessory[] = JSON.parse(apiSpecs._accessories);
      const productSku = product.id?.replace('dvercom-', '') || '';
      
      return parsed
        .filter((a) => {
          // Filter out the door panel itself
          if (a.article === productSku) return false;
          // Filter out items with same price as the door (likely the polotno duplicate)
          if (a.price === product.price && a.default_qty === 1) return false;
          return true;
        })
        .map((a) => ({
          ...a,
          displayName: getAccessoryDisplayName(a.name),
        }));
    } catch { return []; }
  }, [apiSpecs, product.id, product.price]);

  const [selectedSize, setSelectedSize] = useState(
    sizes.length > 0 ? (sizes.find(s => s.includes('200') && s.includes('70')) || sizes[0]) : ''
  );
  const [doorQty, setDoorQty] = useState(1);
  const [accessoryQtys, setAccessoryQtys] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    accessories.forEach(a => { initial[a.article] = a.default_qty; });
    return initial;
  });

  // Calculate total
  const totalPrice = useMemo(() => {
    let total = product.price * doorQty;
    accessories.forEach(a => {
      const qty = accessoryQtys[a.article] || 0;
      total += a.price * qty;
    });
    return total;
  }, [product.price, doorQty, accessories, accessoryQtys]);

  const setAccQty = (article: string, qty: number) => {
    setAccessoryQtys(prev => ({ ...prev, [article]: Math.max(0, qty) }));
  };

  const hasConfigurator = sizes.length > 0 || accessories.length > 0;

  return (
    <div className="space-y-5">
      {/* Size selector */}
      {sizes.length > 0 && (
        <div>
          <h4
            className="text-sm font-bold uppercase tracking-wider text-foreground mb-3"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Размер
          </h4>
          <div className="flex flex-wrap gap-2">
            {sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-3 py-1.5 text-sm rounded border transition-all ${
                  selectedSize === size
                    ? 'border-primary bg-primary text-primary-foreground font-medium'
                    : 'border-border bg-background text-foreground hover:border-primary/50'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Door (Полотно) quantity */}
      <div className="flex items-center justify-between py-2">
        <div className="flex-1">
          <span className="text-sm font-medium text-foreground">Полотно</span>
          <span className="ml-2 text-sm font-bold text-primary">{formatPrice(product.price)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDoorQty(Math.max(1, doorQty - 1))}
            className="w-8 h-8 rounded border border-border bg-background flex items-center justify-center text-foreground hover:bg-accent transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-sm font-bold text-foreground w-6 text-center">{doorQty}</span>
          <button
            onClick={() => setDoorQty(doorQty + 1)}
            className="w-8 h-8 rounded border border-border bg-background flex items-center justify-center text-foreground hover:bg-accent transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Accessories */}
      {accessories.length > 0 && (
        <div className="border-t border-border pt-3 space-y-3">
          <h4
            className="text-sm font-bold uppercase tracking-wider text-foreground"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Комплектующие
          </h4>
          {accessories.map(acc => (
            <div key={acc.article} className="flex items-center justify-between py-1">
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground">{acc.displayName}</span>
                <span className="ml-2 text-sm text-primary font-bold">{formatPrice(acc.price)}</span>
                <span className="text-xs text-muted-foreground ml-0.5">/шт</span>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={() => setAccQty(acc.article, (accessoryQtys[acc.article] || 0) - 1)}
                  className="w-8 h-8 rounded border border-border bg-background flex items-center justify-center text-foreground hover:bg-accent transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-bold text-foreground w-6 text-center">
                  {accessoryQtys[acc.article] || 0}
                </span>
                <button
                  onClick={() => setAccQty(acc.article, (accessoryQtys[acc.article] || 0) + 1)}
                  className="w-8 h-8 rounded border border-border bg-background flex items-center justify-center text-foreground hover:bg-accent transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total & Add to cart */}
      <div className="border-t border-border pt-4">
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            {hasConfigurator ? 'Комплект:' : 'Итого:'}
          </span>
          <span className="text-2xl font-bold text-foreground">{formatPrice(totalPrice)}</span>
        </div>

        {product.oldPrice && (
          <div className="flex items-center justify-end gap-2 -mt-2 mb-4">
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.oldPrice * doorQty)}
            </span>
            <span className="text-xs font-bold text-destructive">
              −{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
            </span>
          </div>
        )}

        <button
          onClick={() => {
            const cartAccessories: CartAccessory[] = accessories
              .filter(a => (accessoryQtys[a.article] || 0) > 0)
              .map(a => ({
                article: a.article,
                name: a.displayName,
                price: a.price,
                quantity: accessoryQtys[a.article] || 0,
              }));
            addItem(product, doorQty, selectedSize, cartAccessories);
            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 2000);
          }}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-md font-medium uppercase tracking-wider transition-all ${
            addedToCart
              ? 'bg-green-600 text-white'
              : 'bg-primary text-primary-foreground hover:opacity-90'
          }`}
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          {addedToCart ? (
            <>
              <Check className="w-4 h-4" />
              Добавлено
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              В корзину
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductConfigurator;
