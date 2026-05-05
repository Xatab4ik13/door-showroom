import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CatalogProduct } from '@/data/catalog';

interface ProductGalleryProps {
  product: CatalogProduct;
  selectedColorIndex?: number;
  apiImages?: string[] | null;
}

const ProductGallery = ({ product, apiImages }: ProductGalleryProps) => {
  const rawImages = apiImages && apiImages.length > 0 ? apiImages : [product.image];
  const images = rawImages.slice(0, 10);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const imgRef = useRef<HTMLImageElement>(null);

  const next = () => setActiveIndex(i => (i + 1) % images.length);
  const prev = () => setActiveIndex(i => (i - 1 + images.length) % images.length);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, images.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
  };

  return (
    <div className="w-full">
      <div
        className="rounded-lg overflow-hidden flex items-center justify-center p-6 min-h-[500px] transition-colors duration-500 bg-secondary relative group cursor-zoom-in"
        onClick={() => setLightboxOpen(true)}
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
        <div className="absolute top-3 right-3 bg-background/80 backdrop-blur p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-4 h-4 text-foreground" />
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-16 h-20 rounded-md overflow-hidden border-2 bg-secondary flex items-center justify-center transition-all shrink-0 ${
                activeIndex === i ? 'border-primary' : 'border-border opacity-60 hover:opacity-100'
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

      {/* Lightbox with zoom */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
              aria-label="Закрыть"
            >
              <X className="w-6 h-6" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); setZoomed(false); }}
                  className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                  aria-label="Предыдущее"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); setZoomed(false); }}
                  className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                  aria-label="Следующее"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div
              className="w-[90vw] h-[90vh] flex items-center justify-center overflow-hidden"
              onClick={(e) => { e.stopPropagation(); setZoomed(z => !z); }}
              onMouseMove={handleMouseMove}
              style={{ cursor: zoomed ? 'zoom-out' : 'zoom-in' }}
            >
              <img
                ref={imgRef}
                src={images[activeIndex]}
                alt={product.name}
                className="max-h-full max-w-full object-contain transition-transform duration-200 select-none"
                style={{
                  transform: zoomed ? 'scale(2.2)' : 'scale(1)',
                  transformOrigin: `${origin.x}% ${origin.y}%`,
                }}
                draggable={false}
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
              />
            </div>

            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
                {activeIndex + 1} / {images.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductGallery;
