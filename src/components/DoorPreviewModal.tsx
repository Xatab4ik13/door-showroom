import { AnimatePresence, motion } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Door } from '@/data/doors';

interface Props {
  door: Door | null;
  onClose: () => void;
}

const DoorPreviewModal = ({ door, onClose }: Props) => {
  if (!door) return null;

  return (
    <AnimatePresence>
      {door && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.3 }}
            className="relative bg-card rounded-lg border border-border shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-background/80 text-foreground hover:bg-background transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>

            {/* Image — matches ProductCard aspect ratio */}
            <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
              <img
                src={door.image}
                alt={door.name}
                className="w-full h-full object-cover"
              />
              {/* Collection tag */}
              <span
                className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-[hsl(205,85%,45%)] text-white"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {door.collection}
              </span>
            </div>

            {/* Info — matches ProductCard layout */}
            <div className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{door.finish}</p>
              <h3
                className="text-base font-semibold text-foreground uppercase tracking-wide mb-2"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {door.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                {door.description}
              </p>

              {/* Specs row */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span>{door.material}</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>{door.sizes}</span>
              </div>

              {/* Color swatches */}
              <div className="flex gap-2 mb-4">
                {door.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border border-border shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  className="flex-1 px-4 py-2.5 bg-foreground text-background rounded-lg text-sm font-medium tracking-wide hover:opacity-90 transition-opacity"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  Получить расчёт
                </button>
                <Link
                  to={`/product/${door.id}`}
                  onClick={onClose}
                  className="flex items-center gap-1.5 px-4 py-2.5 border border-border rounded-lg text-sm tracking-wide text-foreground hover:bg-secondary transition-colors"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  Подробнее
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DoorPreviewModal;
