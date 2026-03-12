import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import ProductGallery from '@/components/product/ProductGallery';
import ProductGallery from '@/components/product/ProductGallery';
import ProductSpecs from '@/components/product/ProductSpecs';
import ProductConfigurator from '@/components/product/ProductConfigurator';
import DoorExplodedSVG from '@/components/product/DoorExplodedSVG';
import { catalogProducts } from '@/data/catalog';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price);

const Product = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedColor, setSelectedColor] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();
  const product = catalogProducts.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="pt-28 px-6 text-center">
        <p className="text-lg text-muted-foreground">Товар не найден</p>
        <Link to="/catalog" className="text-primary underline mt-4 inline-block">
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  return (
    <div className="pt-28 pb-16 px-4 md:px-8 lg:px-12 max-w-[1400px] mx-auto">
        {/* Breadcrumb */}
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад в каталог
        </Link>

        {/* Top section: Gallery + Info + Configurator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Gallery */}
          <div className="lg:col-span-4">
            <ProductGallery product={product} selectedColorIndex={selectedColor} />
          </div>

          {/* Product info */}
          <div className="lg:col-span-4">
            <p className="text-sm text-muted-foreground mb-1">{product.manufacturer}</p>
            <h1
              className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-foreground mb-3"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl font-bold text-foreground">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(product.oldPrice)}</span>
                  <span className="text-sm font-bold text-destructive">−{discount}%</span>
                </>
              )}
            </div>

            {/* Color swatches */}
            <div className="mb-6">
              <p
                className="text-sm font-semibold uppercase tracking-wider text-foreground mb-2"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Выберите цвет
              </p>
              <div className="flex gap-2">
                {product.colors.map((c, i) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(i)}
                    className={`w-9 h-9 rounded-full border-2 transition-all duration-200 ${
                      selectedColor === i
                        ? 'border-foreground scale-110 shadow-md'
                        : 'border-border hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Цвет ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Specs */}
            <ProductSpecs product={product} />

            {/* Add to cart */}
            <button
              onClick={() => {
                addItem(product);
                setAddedToCart(true);
                setTimeout(() => setAddedToCart(false), 2000);
              }}
              className={`mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium uppercase tracking-wider transition-all ${
                addedToCart
                  ? 'bg-green-600 text-white'
                  : 'bg-[hsl(205,85%,45%)] text-white hover:opacity-90'
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
                  В корзину — {formatPrice(product.price)}
                </>
              )}
            </button>
          </div>

          {/* Configurator */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-card border border-border rounded-lg p-6">
              <h3
                className="text-lg font-bold uppercase tracking-wider text-foreground mb-4"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Конфигуратор
              </h3>
              <ProductConfigurator product={product} />
            </div>
          </div>
        </div>

        {/* Door Block Schema */}
        <section className="mb-16">
          <h2
            className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-foreground mb-2"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Схема дверного блока
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Нажмите на деталь для подробной информации
          </p>
          <DoorExplodedSVG accentColor={product.colors[0]} />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Product;
