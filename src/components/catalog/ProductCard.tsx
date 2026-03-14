import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { CatalogProduct } from '@/data/catalog';

interface ProductCardProps {
  product: CatalogProduct;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price);

const tagStyles: Record<string, string> = {
  popular: 'bg-[hsl(205,85%,45%)] text-white',
  new: 'bg-[hsl(150,60%,40%)] text-white',
  sale: 'bg-destructive text-destructive-foreground',
};

const tagLabels: Record<string, string> = {
  popular: 'Хит',
  new: 'Новинка',
  sale: 'Скидка',
};

const ProductCard = ({ product }: ProductCardProps) => {
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  return (
    <Link to={`/product/${product.id}`}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow duration-300 cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[2/3] overflow-hidden bg-secondary flex items-center justify-center p-4">
        <img
          src={product.image}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
        />
        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${tagStyles[tag]}`}
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {tagLabels[tag]}
              </span>
            ))}
          </div>
        )}
        {/* Discount badge */}
        {discount && (
          <span
            className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            −{discount}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{product.manufacturer}</p>
        <h3
          className="text-base font-semibold text-foreground uppercase tracking-wide mb-2"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="text-sm text-muted-foreground line-through">{formatPrice(product.oldPrice)}</span>
          )}
        </div>
        {(product.material || product.finish) && (
          <p className="text-xs text-muted-foreground mt-1">
            {[product.material, product.finish].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    </motion.div>
    </Link>
  );
};

export default ProductCard;
