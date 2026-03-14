import { useState } from 'react';
import { ShoppingCart, Check, Minus, Plus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import type { CatalogProduct } from '@/data/catalog';

interface ProductConfiguratorProps {
  product: CatalogProduct;
  apiSpecs?: Record<string, string | null> | null;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price);

const ProductConfigurator = ({ product, apiSpecs }: ProductConfiguratorProps) => {
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();

  const totalPrice = product.price * quantity;

  // Extract key summary fields from specs
  const summaryFields: { label: string; value: string }[] = [];
  if (product.manufacturer && product.manufacturer !== 'Не указан') {
    summaryFields.push({ label: 'Производитель', value: product.manufacturer });
  }
  if (apiSpecs) {
    const color = apiSpecs['цвет'] || apiSpecs['Цвет'] || product.finish;
    if (color && color !== 'Не указан') {
      summaryFields.push({ label: 'Цвет', value: color });
    }
    const style = apiSpecs['стиль'] || apiSpecs['Стиль'];
    if (style) summaryFields.push({ label: 'Стиль', value: style });
    const covering = apiSpecs['тип покрытия'] || apiSpecs['Тип покрытия'];
    if (covering) summaryFields.push({ label: 'Покрытие', value: covering });
    const thickness = apiSpecs['толщина'] || apiSpecs['Толщина'];
    if (thickness) summaryFields.push({ label: 'Толщина', value: `${thickness} мм` });
    const availability = apiSpecs['вид номенклатуры'] || apiSpecs['Вид номенклатуры'];
    if (availability) summaryFields.push({ label: 'Наличие', value: availability });
  } else {
    if (product.finish && product.finish !== 'Не указан') {
      summaryFields.push({ label: 'Покрытие / Цвет', value: product.finish });
    }
    if (product.material && product.material !== 'Не указан') {
      summaryFields.push({ label: 'Материал', value: product.material });
    }
  }

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  return (
    <div className="space-y-5">
      {/* Quick summary */}
      {summaryFields.length > 0 && (
        <div className="space-y-2">
          {summaryFields.map((f) => (
            <div key={f.label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{f.label}</span>
              <span className="text-foreground font-medium">{f.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Quantity selector */}
      <div>
        <h4
          className="text-sm font-bold uppercase tracking-wider text-foreground mb-3"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          Количество
        </h4>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 rounded-md border border-border bg-background flex items-center justify-center text-foreground hover:bg-accent transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-lg font-bold text-foreground w-10 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 rounded-md border border-border bg-background flex items-center justify-center text-foreground hover:bg-accent transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-border pt-4">
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-sm text-muted-foreground">Итого:</span>
          <div className="text-right">
            <span className="text-2xl font-bold text-foreground">{formatPrice(totalPrice)}</span>
            {product.oldPrice && discount && (
              <div className="flex items-center justify-end gap-2 mt-1">
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.oldPrice * quantity)}
                </span>
                <span className="text-xs font-bold text-destructive">−{discount}%</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            for (let i = 0; i < quantity; i++) addItem(product);
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
