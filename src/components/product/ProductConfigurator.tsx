import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, Minus, Plus } from 'lucide-react';
import { useCart, type CartAccessory, type CartService, type CartPanelColor } from '@/contexts/CartContext';
import type { CatalogProduct } from '@/data/catalog';
import type { PanelColor, ProductService, RecommendedProduct } from '@/lib/api';
import type { KitItem } from '@/lib/description';
import { extractSize } from '@/lib/description';

const ENTRANCE_SIZES = ['860x2050', '880x2050', '960x2050', '980x2050'];
const ENTRANCE_SIDES = ['Левое (петли слева)', 'Правое (петли справа)'];
const DOBOR_WIDTHS = [100, 150, 200, 250];

interface DoborOption {
  width: number;
  price: number;
  article: string;
}

export interface SizeVariant {
  slug: string;
  size: string;
  price: number;
}

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
  variants?: SizeVariant[];
  kit?: KitItem[];
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

const ProductConfigurator = ({ product, apiSpecs, panelColors = [], services = [], recommendations = [], variants = [], kit = [] }: ProductConfiguratorProps) => {
  const [addedToCart, setAddedToCart] = useState(false);
  const navigate = useNavigate();
  const [withKit, setWithKit] = useState(false);
  useEffect(() => { setWithKit(false); }, [product.id]);
  const kitExtra = useMemo(() => kit.reduce((s, k) => s + k.price * k.qty, 0), [kit]);
  const { addItem } = useCart();

  const isFurniture = product.category === 'furnitura';
  const isEntrance = product.category === 'vhodnye';

  const sizes: string[] = useMemo(() => {
    if (isFurniture) return [];
    let list: string[] = [];
    if (apiSpecs?._sizes) {
      try {
        const parsed = JSON.parse(apiSpecs._sizes);
        if (Array.isArray(parsed)) list = parsed.filter((s): s is string => typeof s === 'string' && !!s.trim());
      } catch { /* ignore */ }
    }
    if (list.length === 0 && isEntrance) list = [...ENTRANCE_SIZES];
    if (list.length === 0) {
      const fromName = extractSize(product.name) || extractSize(apiSpecs?.['Размер'] || '') || '';
      if (fromName) list = [fromName];
    }
    return list;
  }, [apiSpecs, isFurniture, isEntrance, product.name]);

  const allAccessories: CleanAccessory[] = useMemo(() => {
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

  const accessories = useMemo(
    () => allAccessories.filter(a => !a.name.toLowerCase().includes('добор')),
    [allAccessories],
  );

  // Доборы: из данных поставщика (с ценами) либо стандартный набор ширин
  const dobors: DoborOption[] = useMemo(() => {
    if (isFurniture) return [];
    const fromSupplier: DoborOption[] = [];
    allAccessories
      .filter(a => a.name.toLowerCase().includes('добор'))
      .forEach(a => {
        const width = DOBOR_WIDTHS.find(w => a.name.includes(String(w)));
        if (width && !fromSupplier.some(d => d.width === width)) {
          fromSupplier.push({ width, price: a.price, article: a.article });
        }
      });
    let manual: Record<string, number> = {};
    try { manual = JSON.parse(apiSpecs?._dobor_prices || '{}') || {}; } catch { /* ignore */ }
    if (fromSupplier.length > 0) {
      return fromSupplier
        .map(d => (d.price > 0 ? d : { ...d, price: Number(manual[String(d.width)]) || 0 }))
        .sort((a, b) => a.width - b.width);
    }
    return DOBOR_WIDTHS.map(w => ({ width: w, price: Number(manual[String(w)]) || 0, article: `dobor-${w}` }));
  }, [allAccessories, isFurniture, apiSpecs]);

  const techSizes: string[] = useMemo(() => {
    try {
      const a = JSON.parse(apiSpecs?._tech_sizes || '[]');
      return Array.isArray(a) ? a.map(String).filter(Boolean) : [];
    } catch { return []; }
  }, [apiSpecs]);

  // Наличники, заданные вручную в админке
  const nalichniki = useMemo(() => {
    if (isFurniture) return [] as { size: string; price: number; article: string }[];
    try {
      const a = JSON.parse(apiSpecs?._nalichniki || '[]');
      return Array.isArray(a)
        ? a.filter((n: any) => n?.size).map((n: any, i: number) => ({ size: String(n.size), price: Number(n.price) || 0, article: `nalichnik-${i}` }))
        : [];
    } catch { return []; }
  }, [apiSpecs, isFurniture]);
  const [nalQtys, setNalQtys] = useState<Record<string, number>>({});
  useEffect(() => { setNalQtys({}); }, [product.id]);
  const nalTotal = nalichniki.reduce((s, n) => s + n.price * (nalQtys[n.article] || 0), 0);

  const openingSides: string[] = useMemo(() => {
    if (isFurniture) return [];
    let list: string[] = [];
    if (apiSpecs?._opening_sides) {
      try {
        const parsed = JSON.parse(apiSpecs._opening_sides);
        if (Array.isArray(parsed)) list = parsed.filter((s): s is string => typeof s === 'string' && !!s.trim());
      } catch { /* ignore */ }
    }
    if (list.length === 0 && isEntrance) list = [...ENTRANCE_SIDES];
    return list;
  }, [apiSpecs, isFurniture, isEntrance]);

  const [selectedSide, setSelectedSide] = useState('');
  useEffect(() => { setSelectedSide(openingSides[0] || ''); }, [openingSides]);

  const [selectedSize, setSelectedSize] = useState('');
  useEffect(() => {
    setSelectedSize(sizes.find(s => s.includes('200') && s.includes('70')) || sizes[0] || '');
  }, [sizes]);
  const [doorQty, setDoorQty] = useState(1);
  const [doborQtys, setDoborQtys] = useState<Record<number, number>>({});
  useEffect(() => { setDoborQtys({}); }, [product.id]);
  const [accessoryQtys, setAccessoryQtys] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    accessories.forEach(a => { initial[a.article] = a.default_qty; });
    return initial;
  });
  const [selectedColorId, setSelectedColorId] = useState<number | null>(
    panelColors.length > 0 ? panelColors[0].id : null
  );
  const [selectedServices, setSelectedServices] = useState<Set<number>>(new Set());
  const [selectedRecos, setSelectedRecos] = useState<Set<number>>(new Set());

  const recoTotal = useMemo(
    () => recommendations.filter(r => selectedRecos.has(r.id)).reduce((s, r) => s + Number(r.price || 0), 0),
    [recommendations, selectedRecos],
  );
  const toggleReco = (id: number) =>
    setSelectedRecos(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

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

  const doborsTotal = useMemo(
    () => dobors.reduce((s, d) => s + d.price * (doborQtys[d.width] || 0), 0),
    [dobors, doborQtys],
  );

  const totalPrice = useMemo(() => {
    let total = (product.price + panelMod + (withKit ? kitExtra : 0)) * doorQty;
    accessories.forEach(a => { total += a.price * (accessoryQtys[a.article] || 0); });
    total += doborsTotal + nalTotal;
    total += servicesTotal;
    total += recoTotal;
    return total;
  }, [product.price, panelMod, withKit, kitExtra, doorQty, accessories, accessoryQtys, doborsTotal, nalTotal, servicesTotal, recoTotal]);

  const setAccQty = (article: string, qty: number) => {
    setAccessoryQtys(prev => ({ ...prev, [article]: Math.max(0, qty) }));
  };
  const setDoborQty = (width: number, qty: number) => {
    setDoborQtys(prev => ({ ...prev, [width]: Math.max(0, qty) }));
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
      {/* Size grid from sibling variants */}
      {variants.length > 1 && (
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3" style={{ fontFamily: "'Oswald', sans-serif" }}>
            Размер полотна, мм
          </h4>
          <div className="flex flex-wrap gap-2">
            {variants.map(v => {
              const active = v.slug === product.id;
              return (
                <button
                  key={v.slug}
                  onClick={() => { if (!active) navigate(`/product/${v.slug}`); }}
                  title={formatPrice(v.price)}
                  className={`px-3 py-1.5 text-sm rounded border transition-all ${
                    active
                      ? 'border-primary bg-primary text-primary-foreground font-medium'
                      : 'border-border bg-background text-foreground hover:border-primary/50'
                  }`}
                >
                  {v.size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Полотно / Комплект */}
      {kit.length > 0 && (
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3" style={{ fontFamily: "'Oswald', sans-serif" }}>
            Комплектация
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setWithKit(false)}
              className={`px-3 py-2.5 text-sm rounded border text-left transition-all ${
                !withKit ? 'border-primary bg-primary/5 text-foreground' : 'border-border bg-background text-muted-foreground hover:border-primary/50'
              }`}
            >
              <span className="block font-medium">Полотно</span>
              {product.oldPrice ? (
                <span className="block text-xs text-muted-foreground line-through">{formatPrice(product.oldPrice)}</span>
              ) : null}
              <span className="block text-base font-bold text-primary">{formatPrice(product.price + panelMod)}</span>
              <span className="block text-[10px] text-muted-foreground mt-0.5">Под заказ</span>
            </button>
            <button
              onClick={() => setWithKit(true)}
              className={`px-3 py-2.5 text-sm rounded border text-left transition-all ${
                withKit ? 'border-primary bg-primary/5 text-foreground' : 'border-border bg-background text-muted-foreground hover:border-primary/50'
              }`}
            >
              <span className="block font-medium">Комплект</span>
              {product.oldPrice ? (
                <span className="block text-xs text-muted-foreground line-through">{formatPrice(product.oldPrice + kitExtra)}</span>
              ) : null}
              <span className="block text-base font-bold text-primary">{formatPrice(product.price + panelMod + kitExtra)}</span>
              <span className="block text-[10px] text-primary mt-0.5">Что в комплекте?</span>
            </button>
          </div>
          {withKit && (
            <ul className="mt-3 space-y-1">
              <li className="text-xs text-muted-foreground flex justify-between gap-2">
                <span>Полотно × 1</span>
                <span>{formatPrice(product.price)}</span>
              </li>
              {kit.map((k, i) => (
                <li key={i} className="text-xs text-muted-foreground flex justify-between gap-2">
                  <span className="truncate" title={k.name}>{k.label} × {k.qty}</span>
                  <span className="whitespace-nowrap">{formatPrice(k.price * k.qty)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Sizes + технические размеры */}
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
          {techSizes.length > 0 && (
            <ul className="mt-3 space-y-1">
              {techSizes.map((t, i) => (
                <li key={i} className="text-xs text-muted-foreground">{t}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Opening side */}
      {openingSides.length > 0 && (
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3" style={{ fontFamily: "'Oswald', sans-serif" }}>
            Тип открывания двери{selectedSide ? ` — ${selectedSide}` : ''}
          </h4>
          <div className="flex flex-wrap gap-2">
            {openingSides.map(side => (
              <button key={side} onClick={() => setSelectedSide(side)}
                className={`px-3 py-1.5 text-sm rounded border transition-all ${
                  selectedSide === side
                    ? 'border-primary bg-primary text-primary-foreground font-medium'
                    : 'border-border bg-background text-foreground hover:border-primary/50'
                }`}>{side}</button>
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

      {/* Доборы */}
      {dobors.length > 0 && (
        <div className="border-t border-border pt-3 space-y-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>Доборы</h4>
          {dobors.map(d => (
            <div key={d.width} className="flex items-center justify-between py-1">
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground">Добор {d.width} мм</span>
                {d.price > 0 ? (
                  <>
                    <span className="ml-2 text-sm text-primary font-bold">{formatPrice(d.price)}</span>
                    <span className="text-xs text-muted-foreground ml-0.5">/шт</span>
                  </>
                ) : (
                  <span className="ml-2 text-xs text-muted-foreground">цена уточняется менеджером</span>
                )}
              </div>
              <div className="flex items-center gap-2 ml-2">
                <button onClick={() => setDoborQty(d.width, (doborQtys[d.width] || 0) - 1)} className="w-8 h-8 rounded border border-border bg-background flex items-center justify-center text-foreground hover:bg-accent transition-colors"><Minus className="w-3 h-3" /></button>
                <span className="text-sm font-bold text-foreground w-6 text-center">{doborQtys[d.width] || 0}</span>
                <button onClick={() => setDoborQty(d.width, (doborQtys[d.width] || 0) + 1)} className="w-8 h-8 rounded border border-border bg-background flex items-center justify-center text-foreground hover:bg-accent transition-colors"><Plus className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Наличники */}
      {nalichniki.length > 0 && (
        <div className="border-t border-border pt-3 space-y-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>Наличники</h4>
          {nalichniki.map(n => (
            <div key={n.article} className="flex items-center justify-between py-1">
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground">Наличник {n.size}</span>
                {n.price > 0 ? (
                  <>
                    <span className="ml-2 text-sm text-primary font-bold">{formatPrice(n.price)}</span>
                    <span className="text-xs text-muted-foreground ml-0.5">/шт</span>
                  </>
                ) : (
                  <span className="ml-2 text-xs text-muted-foreground">цена уточняется менеджером</span>
                )}
              </div>
              <div className="flex items-center gap-2 ml-2">
                <button onClick={() => setNalQtys(p => ({ ...p, [n.article]: Math.max(0, (p[n.article] || 0) - 1) }))} className="w-8 h-8 rounded border border-border bg-background flex items-center justify-center text-foreground hover:bg-accent transition-colors"><Minus className="w-3 h-3" /></button>
                <span className="text-sm font-bold text-foreground w-6 text-center">{nalQtys[n.article] || 0}</span>
                <button onClick={() => setNalQtys(p => ({ ...p, [n.article]: (p[n.article] || 0) + 1 }))} className="w-8 h-8 rounded border border-border bg-background flex items-center justify-center text-foreground hover:bg-accent transition-colors"><Plus className="w-3 h-3" /></button>
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

      {/* Recommended furniture quick-add */}
      {recommendations.length > 0 && (
        <div className="border-t border-border pt-3 space-y-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>Добавить к заказу</h4>
          {recommendations.slice(0, 6).map(r => {
            const checked = selectedRecos.has(r.id);
            const img = (r.images && r.images[0]) || '/placeholder.svg';
            return (
              <label key={r.id} className="flex items-center gap-3 cursor-pointer py-1 group">
                <input type="checkbox" checked={checked} onChange={() => toggleReco(r.id)}
                  className="w-4 h-4 rounded border-border accent-primary cursor-pointer" />
                <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                  <img src={img} alt="" className="max-w-full max-h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
                </div>
                <div className="flex-1 min-w-0 flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{r.name}</span>
                  <span className="text-sm font-bold text-primary whitespace-nowrap">+{formatPrice(Number(r.price))}</span>
                </div>
              </label>
            );
          })}
        </div>
      )}

      {/* Total + add */}
      <div className="border-t border-border pt-4">
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-sm text-muted-foreground">Итого:</span>
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
            const cartAccessories: CartAccessory[] = [
              ...(withKit
                ? kit.map((k, i) => ({ article: `kit-${i}`, name: k.label, price: k.price, quantity: k.qty * doorQty }))
                : []),
              ...accessories
                .filter(a => (accessoryQtys[a.article] || 0) > 0)
                .map(a => ({ article: a.article, name: a.displayName, price: a.price, quantity: accessoryQtys[a.article] || 0 })),
              ...dobors
                .filter(d => (doborQtys[d.width] || 0) > 0)
                .map(d => ({ article: d.article, name: `Добор ${d.width} мм`, price: d.price, quantity: doborQtys[d.width] || 0 })),
              ...nalichniki
                .filter(n => (nalQtys[n.article] || 0) > 0)
                .map(n => ({ article: n.article, name: `Наличник ${n.size}`, price: n.price, quantity: nalQtys[n.article] || 0 })),
              ...recommendations
                .filter(r => selectedRecos.has(r.id))
                .map(r => ({ article: `reco-${r.id}`, name: r.name, price: Number(r.price), quantity: 1 })),
            ];
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
              selectedSize: selectedSize || variants.find(v => v.slug === product.id)?.size || '',
              openingSide: selectedSide || undefined,
              accessories: cartAccessories, panelColor: cartPanel, services: cartServices,
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
