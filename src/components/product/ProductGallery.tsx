import { motion, AnimatePresence } from 'framer-motion';
import type { CatalogProduct } from '@/data/catalog';

interface ProductGalleryProps {
  product: CatalogProduct;
  selectedColorIndex?: number;
}

const ProductGallery = ({ product, selectedColorIndex = 0 }: ProductGalleryProps) => {
  return (
    <div className="w-full">
      <div
        className="rounded-lg overflow-hidden flex items-center justify-center p-6 min-h-[500px] transition-colors duration-500"
        style={{ backgroundColor: `${product.colors[selectedColorIndex]}22` }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedColorIndex}
            src={product.image}
            alt={product.name}
            className="max-h-[70vh] w-auto object-contain"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>
      </div>
      {/* Thumbnail strip */}
      <div className="flex gap-2 mt-3">
        {product.colors.map((color, i) => (
          <div
            key={i}
            className={`w-16 h-20 rounded-md overflow-hidden border-2 bg-secondary flex items-center justify-center transition-all ${
              selectedColorIndex === i ? 'border-foreground' : 'border-border opacity-60'
            }`}
            style={{ backgroundColor: `${color}22` }}
          >
            <img src={product.image} alt="" className="max-h-full max-w-full object-contain p-1" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
