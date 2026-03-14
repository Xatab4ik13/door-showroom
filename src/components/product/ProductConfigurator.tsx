import { useState, useMemo } from 'react';
import { ShoppingCart, Check, Minus, Plus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import type { CatalogProduct } from '@/data/catalog';

interface Accessory {
  name: string;
  article: string;
  price: number;
  description: string;
  default_qty: number;
}

interface ProductConfiguratorProps {
  product: CatalogProduct;
  apiSpecs?: Record<string, string | null> | null;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price);

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

  // Parse accessories from specs
  const accessories: Accessory[] = useMemo(() => {
    if (!apiSpecs?._accessories) return [];
    try {
      const parsed = JSON.parse(apiSpecs._accessories);
      // Filter out the door itself (first item is usually the polotno)
      return parsed.filter((a: Accessory) => a.article !== product.id?.replace('dvercom-', ''));
    } catch { return []; }
  }, [apiSpecs, product.id]);

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
          {accessories.map(acc => (
            <div key={acc.article} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground">{acc.name.split(' (')[0]}</span>
                  <span className="ml-2 text-sm font-bold text-primary">{formatPrice(acc.price)}</span>
                  <span className="text-xs text-muted-foreground ml-1">шт.</span>
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
              {acc.description && acc.description !== acc.name && (
                <p className="text-xs text-muted-foreground truncate">{acc.description}</p>
              )}
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
            for (let i = 0; i < doorQty; i++) addItem(product);
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
              {hasConfigurator ? 'В корзину (комплект)' : 'В корзину'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductConfigurator;
