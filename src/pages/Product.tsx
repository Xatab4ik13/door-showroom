import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ProductGallery from '@/components/product/ProductGallery';
import ProductSpecs from '@/components/product/ProductSpecs';
import ProductConfigurator from '@/components/product/ProductConfigurator';
import ProductSEO from '@/components/product/ProductSEO';

import { catalogProducts } from '@/data/catalog';
import { fetchProduct, type ApiProduct } from '@/lib/api';
import { apiProductToCard } from '@/lib/productAdapter';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price);

const Product = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedColor, setSelectedColor] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiProduct, setApiProduct] = useState<ApiProduct | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchProduct(id)
      .then((data) => {
        setApiProduct(data);
        setLoading(false);
      })
      .catch(() => {
        setApiProduct(null);
        setLoading(false);
      });
  }, [id]);

  const product = apiProduct
    ? apiProductToCard(apiProduct)
    : catalogProducts.find((p) => p.id === id) || null;

  const apiImages = apiProduct?.images && apiProduct.images.length > 0
    ? apiProduct.images
    : null;

  if (loading) {
    return (
      <div className="pt-28 px-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
        <div className="lg:col-span-5">
          <ProductGallery
            product={product}
            selectedColorIndex={selectedColor}
            apiImages={apiImages}
          />
        </div>

        {/* Product info + Specs */}
        <div className="lg:col-span-4">
          <p className="text-sm text-muted-foreground mb-1">{product.manufacturer}</p>
          <h1
            className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-foreground mb-3"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            {product.name}
          </h1>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex gap-2 mb-4">
              {product.tags.includes('new') && (
                <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded bg-[hsl(150,60%,40%)] text-white"
                  style={{ fontFamily: "'Oswald', sans-serif" }}>
                  Новинка
                </span>
              )}
              {product.tags.includes('sale') && (
                <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded bg-destructive text-destructive-foreground"
                  style={{ fontFamily: "'Oswald', sans-serif" }}>
                  Скидка
                </span>
              )}
            </div>
          )}

          {/* Description from API */}
          {apiProduct?.description && (
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {apiProduct.description}
            </p>
          )}

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
          {product.colors.length > 1 && (
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
          )}

          {/* Specs — all from API */}
          <ProductSpecs product={product} apiSpecs={apiProduct?.specs} />
        </div>

        {/* Configurator / Cart widget */}
        <div className="lg:col-span-3">
          <div className="sticky top-28 bg-card border border-border rounded-lg p-6">
            <h3
              className="text-lg font-bold uppercase tracking-wider text-foreground mb-4"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Заказ
            </h3>
            <ProductConfigurator product={product} apiSpecs={apiProduct?.specs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
