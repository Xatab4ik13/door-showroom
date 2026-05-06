import { useState, useMemo } from 'react';
import { ShoppingCart, Check, Minus, Plus } from 'lucide-react';
import { useCart, type CartAccessory, type CartService, type CartPanelColor } from '@/contexts/CartContext';
import type { CatalogProduct } from '@/data/catalog';
import type { PanelColor, ProductService, RecommendedProduct } from '@/lib/api';

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
  panelColors?: PanelColor[];
  services?: ProductService[];
  recommendations?: RecommendedProduct[];
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price);

function getAccessoryDisplayName(raw: string): string {
  const lowerName = raw.toLowerCase();
  const categories: [string, string][] = [
    ['коробка', 'Коробка'], ['наличник', 'Наличник'], ['добор', 'Добор'],
    ['притворн', 'Притворная планка'], ['порог', 'Порог'], ['петл', 'Петли'],
    ['ручк', 'Ручка'], ['замо', 'Замок'], ['уплотнител', 'Уплотнитель'],
    ['стекл', 'Стекло'], ['капитель', 'Капитель'], ['планка', 'Планка'],
  ];
  for (const [k, l] of categories) if (lowerName.includes(k)) return l;
  const words = raw.split(/[\s,]+/).slice(0, 2).join(' ');
  return words || raw;
}

const ProductConfigurator = ({ product, apiSpecs, panelColors = [], services = [], recommendations = [] }: ProductConfiguratorProps) => {
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();

  const isFurniture = product.category === 'furnitura';

  const sizes: string[] = useMemo(() => {
    if (isFurniture) return [];
    if (!apiSpecs?._sizes) return [];
    try { return JSON.parse(apiSpecs._sizes); } catch { return []; }
  }, [apiSpecs, isFurniture]);

  const accessories: CleanAccessory[] = useMemo(() => {
    if (isFurniture) return [];
    if (!apiSpecs?._accessories) return [];
    try {
      const parsed: Accessory[] = JSON.parse(apiSpecs._accessories);
      const productSku = product.id?.replace('dvercom-', '') || '';
      return parsed
        .filter(a => a.article !== productSku && !(a.price === product.price && a.default_qty === 1))
        .map(a => ({ ...a, displayName: getAccessoryDisplayName(a.name) }));
    } catch { return []; }
  }, [apiSpecs, product.id, product.price, isFurniture]);

  const [selectedSize, setSelectedSize] = useState(
    sizes.length > 0 ? (sizes.find(s => s.includes('200') && s.includes('70')) || sizes[0]) : ''
  );
  const [doorQty, setDoorQty] = useState(1);
  const [accessoryQtys, setAccessoryQtys] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    accessories.forEach(a => { initial[a.article] = a.default_qty; });
    return initial;
  });
  const [selectedColorId, setSelectedColorId] = useState<number | null>(
    panelColors.length > 0 ? panelColors[0].id : null
  );
  const [selectedServices, setSelectedServices] = useState<Set<number>>(new Set());

  const selectedPanel = panelColors.find(c => c.id === selectedColorId) || null;
  const panelMod = selectedPanel ? Number(selectedPanel.price_modifier) || 0 : 0;

  const servicesTotal = useMemo(() => {
    let t = 0;
    services.forEach(s => {
      if (selectedServices.has(s.id)) {
        t += s.price_type === 'per_door' ? Number(s.price) * doorQty : Number(s.price);
      }
    });
    return t;
  }, [services, selectedServices, doorQty]);

  const totalPrice = useMemo(() => {
    let total = (product.price + panelMod) * doorQty;
    accessories.forEach(a => { total += a.price * (accessoryQtys[a.article] || 0); });
    total += servicesTotal;
    return total;
  }, [product.price, panelMod, doorQty, accessories, accessoryQtys, servicesTotal]);

  const setAccQty = (article: string, qty: number) => {
    setAccessoryQtys(prev => ({ ...prev, [article]: Math.max(0, qty) }));
  };
  const toggleService = (id: number) => {
    setSelectedServices(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const hasConfigurator = sizes.length > 0 || accessories.length > 0 || panelColors.length > 0 || services.length > 0;

  return (
    <div className="space-y-5">
      {/* Sizes */}
      {sizes.length > 0 && (
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3" style={{ fontFamily: "'Oswald', sans-serif" }}>Размер</h4>
          <div className="flex flex-wrap gap-2">
            {sizes.map(size => (
              <button key={size} onClick={() => setSelectedSize(size)}
                className={`px-3 py-1.5 text-sm rounded border transition-all ${
                  selectedSize === size
                    ? 'border-primary bg-primary text-primary-foreground font-medium'
                    : 'border-border bg-background text-foreground hover:border-primary/50'
                }`}>{size}</button>
            ))}
          </div>
        </div>
      )}

      {/* Panel colors */}
      {panelColors.length > 0 && (
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3" style={{ fontFamily: "'Oswald', sans-serif" }}>
            Цвет внутренней панели
          </h4>
          <div className="flex flex-wrap gap-2">
            {panelColors.map(c => {
              const active = c.id === selectedColorId;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedColorId(c.id)}
                  title={c.name + (Number(c.price_modifier) ? ` (+${formatPrice(Number(c.price_modifier))})` : '')}
                  className={`relative w-16 h-16 rounded-md overflow-hidden border-2 bg-secondary transition-all ${
                    active ? 'border-primary scale-105' : 'border-border opacity-80 hover:opacity-100'
                  }`}
                >
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground px-1 text-center">{c.name}</span>
                  )}
                </button>
              );
            })}
          </div>
          {selectedPanel && (
            <p className="text-xs text-muted-foreground mt-2">
              {selectedPanel.name}{panelMod ? ` · +${formatPrice(panelMod)}` : ''}
            </p>
          )}
        </div>
      )}

      {/* Quantity */}
      <div className="flex items-center justify-between py-2">
        <div className="flex-1">
          <span className="text-sm font-medium text-foreground">{isFurniture ? 'Количество' : 'Полотно'}</span>
          <span className="ml-2 text-sm font-bold text-primary">{formatPrice(product.price + panelMod)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDoorQty(Math.max(1, doorQty - 1))} className="w-8 h-8 rounded border border-border bg-background flex items-center justify-center text-foreground hover:bg-accent transition-colors"><Minus className="w-3 h-3" /></button>
          <span className="text-sm font-bold text-foreground w-6 text-center">{doorQty}</span>
          <button onClick={() => setDoorQty(doorQty + 1)} className="w-8 h-8 rounded border border-border bg-background flex items-center justify-center text-foreground hover:bg-accent transition-colors"><Plus className="w-3 h-3" /></button>
        </div>
      </div>

      {/* Accessories */}
      {accessories.length > 0 && (
        <div className="border-t border-border pt-3 space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>Комплектующие</h4>
          {accessories.map(acc => (
            <div key={acc.article} className="flex items-center justify-between py-1">
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground">{acc.displayName}</span>
                <span className="ml-2 text-sm text-primary font-bold">{formatPrice(acc.price)}</span>
                <span className="text-xs text-muted-foreground ml-0.5">/шт</span>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <button onClick={() => setAccQty(acc.article, (accessoryQtys[acc.article] || 0) - 1)} className="w-8 h-8 rounded border border-border bg-background flex items-center justify-center text-foreground hover:bg-accent transition-colors"><Minus className="w-3 h-3" /></button>
                <span className="text-sm font-bold text-foreground w-6 text-center">{accessoryQtys[acc.article] || 0}</span>
                <button onClick={() => setAccQty(acc.article, (accessoryQtys[acc.article] || 0) + 1)} className="w-8 h-8 rounded border border-border bg-background flex items-center justify-center text-foreground hover:bg-accent transition-colors"><Plus className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Services */}
      {services.length > 0 && (
        <div className="border-t border-border pt-3 space-y-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>Дополнительные услуги</h4>
          {services.map(s => {
            const checked = selectedServices.has(s.id);
            const total = s.price_type === 'per_door' ? Number(s.price) * doorQty : Number(s.price);
            return (
              <label key={s.id} className="flex items-start gap-3 cursor-pointer py-1.5 group">
                <input type="checkbox" checked={checked} onChange={() => toggleService(s.id)}
                  className="mt-1 w-4 h-4 rounded border-border accent-primary cursor-pointer" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{s.name}</span>
                    <span className="text-sm font-bold text-primary whitespace-nowrap">
                      {formatPrice(total)}
                      {s.price_type === 'per_door' && doorQty > 1 && (
                        <span className="text-xs text-muted-foreground font-normal"> ({formatPrice(Number(s.price))}×{doorQty})</span>
                      )}
                    </span>
                  </div>
                  {s.description && <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>}
                </div>
              </label>
            );
          })}
        </div>
      )}

      {/* Total + add */}
      <div className="border-t border-border pt-4">
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-sm text-muted-foreground">{hasConfigurator ? 'Комплект:' : 'Итого:'}</span>
          <span className="text-2xl font-bold text-foreground">{formatPrice(totalPrice)}</span>
        </div>

        {product.oldPrice && (
          <div className="flex items-center justify-end gap-2 -mt-2 mb-4">
            <span className="text-sm text-muted-foreground line-through">{formatPrice(product.oldPrice * doorQty)}</span>
            <span className="text-xs font-bold text-destructive">−{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%</span>
          </div>
        )}

        <button
          onClick={() => {
            const cartAccessories: CartAccessory[] = accessories
              .filter(a => (accessoryQtys[a.article] || 0) > 0)
              .map(a => ({ article: a.article, name: a.displayName, price: a.price, quantity: accessoryQtys[a.article] || 0 }));
            const cartServices: CartService[] = services
              .filter(s => selectedServices.has(s.id))
              .map(s => ({
                id: s.id,
                name: s.name + (s.price_type === 'per_door' && doorQty > 1 ? ` ×${doorQty}` : ''),
                price: s.price_type === 'per_door' ? Number(s.price) * doorQty : Number(s.price),
              }));
            const cartPanel: CartPanelColor | null = selectedPanel ? {
              id: selectedPanel.id,
              name: selectedPanel.name,
              image_url: selectedPanel.image_url,
              price_modifier: Number(selectedPanel.price_modifier) || 0,
            } : null;
            addItem(product, doorQty, {
              selectedSize, accessories: cartAccessories, panelColor: cartPanel, services: cartServices,
            });
            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 2000);
          }}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-md font-medium uppercase tracking-wider transition-all ${
            addedToCart ? 'bg-green-600 text-white' : 'bg-primary text-primary-foreground hover:opacity-90'
          }`}
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          {addedToCart ? (<><Check className="w-4 h-4" />Добавлено</>) : (<><ShoppingCart className="w-4 h-4" />В корзину</>)}
        </button>
      </div>
    </div>
  );
};

export default ProductConfigurator;
