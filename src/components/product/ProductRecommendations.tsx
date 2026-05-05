import { Link } from 'react-router-dom';
import type { RecommendedProduct } from '@/lib/api';

interface Props {
  items: RecommendedProduct[];
  title?: string;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price);

const ProductRecommendations = ({ items, title = 'С этим товаром покупают' }: Props) => {
  if (!items.length) return null;

  return (
    <section className="border-t border-border pt-12 mb-8">
      <h2
        className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-foreground mb-6"
        style={{ fontFamily: "'Oswald', sans-serif" }}
      >
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.slice(0, 8).map((p) => {
          const img = (p.images && p.images[0]) || '/placeholder.svg';
          return (
            <Link
              key={p.id}
              to={`/product/${p.slug}`}
              className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary transition-all"
            >
              <div className="aspect-[3/4] bg-secondary flex items-center justify-center p-4">
                <img
                  src={img}
                  alt={p.name}
                  className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                  {p.name}
                </h3>
                <p className="text-base font-bold text-primary" style={{ fontFamily: "'Oswald', sans-serif" }}>
                  {formatPrice(Number(p.price))}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default ProductRecommendations;
