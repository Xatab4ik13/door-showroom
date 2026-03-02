import { useState, useMemo } from 'react';
import type { CatalogProduct } from '@/data/catalog';

interface ProductConfiguratorProps {
  product: CatalogProduct;
}

const sizes = [
  { label: '600×2000', priceAdd: 0 },
  { label: '700×2000', priceAdd: 500 },
  { label: '800×2000', priceAdd: 800 },
  { label: '900×2000', priceAdd: 1200 },
];

const hardwareOptions = [
  { label: 'Без фурнитуры', priceAdd: 0 },
  { label: 'Ручки (комплект)', priceAdd: 2500 },
  { label: 'Ручки + замок', priceAdd: 4200 },
  { label: 'Премиум фурнитура', priceAdd: 8500 },
];

const extras = [
  { id: 'box', label: 'Дверная коробка', price: 3200 },
  { id: 'casings', label: 'Наличники (комплект)', price: 1800 },
  { id: 'threshold', label: 'Порог', price: 900 },
  { id: 'dobor', label: 'Доборы', price: 2400 },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price);

const ProductConfigurator = ({ product }: ProductConfiguratorProps) => {
  const [selectedSize, setSelectedSize] = useState(1);
  const [selectedHardware, setSelectedHardware] = useState(0);
  const [selectedExtras, setSelectedExtras] = useState<string[]>(['box', 'casings']);

  const totalPrice = useMemo(() => {
    let total = product.price;
    total += sizes[selectedSize].priceAdd;
    total += hardwareOptions[selectedHardware].priceAdd;
    selectedExtras.forEach((id) => {
      const extra = extras.find((e) => e.id === id);
      if (extra) total += extra.price;
    });
    return total;
  }, [product.price, selectedSize, selectedHardware, selectedExtras]);

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Size */}
      <div>
        <h4
          className="text-sm font-bold uppercase tracking-wider text-foreground mb-3"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          Размер полотна
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {sizes.map((size, i) => (
            <button
              key={size.label}
              onClick={() => setSelectedSize(i)}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                selectedSize === i
                  ? 'border-[hsl(205,85%,45%)] bg-[hsl(205,85%,45%)] text-white'
                  : 'border-border bg-background text-foreground hover:bg-accent'
              }`}
            >
              {size.label}
              {size.priceAdd > 0 && (
                <span className="text-xs opacity-70 ml-1">+{formatPrice(size.priceAdd)}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Hardware */}
      <div>
        <h4
          className="text-sm font-bold uppercase tracking-wider text-foreground mb-3"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          Фурнитура
        </h4>
        <div className="space-y-2">
          {hardwareOptions.map((hw, i) => (
            <label
              key={hw.label}
              className={`flex items-center justify-between px-3 py-2.5 rounded-md border cursor-pointer transition-colors ${
                selectedHardware === i
                  ? 'border-[hsl(205,85%,45%)] bg-[hsl(205,85%,45%)]/5'
                  : 'border-border hover:bg-accent'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="hardware"
                  checked={selectedHardware === i}
                  onChange={() => setSelectedHardware(i)}
                  className="accent-[hsl(205,85%,45%)]"
                />
                <span className="text-sm">{hw.label}</span>
              </div>
              {hw.priceAdd > 0 && (
                <span className="text-xs text-muted-foreground">+{formatPrice(hw.priceAdd)}</span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Extras */}
      <div>
        <h4
          className="text-sm font-bold uppercase tracking-wider text-foreground mb-3"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          Комплектация
        </h4>
        <div className="space-y-2">
          {extras.map((extra) => (
            <label
              key={extra.id}
              className={`flex items-center justify-between px-3 py-2.5 rounded-md border cursor-pointer transition-colors ${
                selectedExtras.includes(extra.id)
                  ? 'border-[hsl(205,85%,45%)] bg-[hsl(205,85%,45%)]/5'
                  : 'border-border hover:bg-accent'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedExtras.includes(extra.id)}
                  onChange={() => toggleExtra(extra.id)}
                  className="accent-[hsl(205,85%,45%)] w-4 h-4"
                />
                <span className="text-sm">{extra.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">+{formatPrice(extra.price)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-border pt-4">
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-sm text-muted-foreground">Итого:</span>
          <div className="text-right">
            <span className="text-2xl font-bold text-foreground">{formatPrice(totalPrice)}</span>
            {product.oldPrice && (
              <span className="text-sm text-muted-foreground line-through ml-2">
                {formatPrice(product.oldPrice + sizes[selectedSize].priceAdd + hardwareOptions[selectedHardware].priceAdd)}
              </span>
            )}
          </div>
        </div>
        <button
          className="w-full py-3 bg-[hsl(205,85%,45%)] text-white rounded-md font-medium uppercase tracking-wider hover:opacity-90 transition-opacity"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          Добавить в корзину
        </button>
      </div>
    </div>
  );
};

export default ProductConfigurator;
