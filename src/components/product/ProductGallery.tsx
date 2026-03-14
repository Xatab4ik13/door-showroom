import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CatalogProduct } from '@/data/catalog';

interface ProductGalleryProps {
  product: CatalogProduct;
  selectedColorIndex?: number;
  apiImages?: string[] | null;
}

const ProductGallery = ({ product, selectedColorIndex = 0, apiImages }: ProductGalleryProps) => {
  const images = apiImages && apiImages.length > 0 ? apiImages : [product.image];
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="w-full">
      <div
        className="rounded-lg overflow-hidden flex items-center justify-center p-6 min-h-[500px] transition-colors duration-500 bg-secondary"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            src={images[activeIndex]}
            alt={product.name}
            className="max-h-[70vh] w-auto object-contain"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
          />
        </AnimatePresence>
      </div>
      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-16 h-20 rounded-md overflow-hidden border-2 bg-secondary flex items-center justify-center transition-all shrink-0 ${
                activeIndex === i ? 'border-foreground' : 'border-border opacity-60'
              }`}
            >
              <img
                src={img}
                alt=""
                className="max-h-full max-w-full object-contain p-1"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
