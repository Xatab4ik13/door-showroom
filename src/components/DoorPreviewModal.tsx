import { AnimatePresence, motion } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Door } from '@/data/doors';

interface Props {
  door: Door | null;
  isOpen: boolean;
  onClose: () => void;
  onClosed: () => void;
}

const DoorPreviewModal = ({ door, isOpen, onClose, onClosed }: Props) => {
  return (
    <AnimatePresence mode="wait" onExitComplete={onClosed}>
      {isOpen && door && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8" onClick={onClose}>
          <motion.div
            className="absolute inset-0 bg-foreground/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          />

          <motion.div
            className="relative bg-card rounded-2xl border border-border shadow-2xl w-[min(1100px,calc(100vw-2rem))] max-h-[90vh] overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden grid grid-cols-1 md:grid-cols-2"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 text-foreground hover:bg-background transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {/* Image */}
            <div className="flex items-center justify-center bg-secondary/30 p-8 md:p-12 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none min-h-[420px] md:min-h-[640px]">
              <div className="w-full max-w-[420px] aspect-[3/5]">
                <img src={door.image} alt={door.name} width={900} height={1500} className="w-full h-full object-contain" loading="eager" />
              </div>
            </div>

            {/* Info */}
            <div className="p-6 md:p-10 flex flex-col justify-center">
              <span
                className="inline-block self-start px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-primary text-primary-foreground mb-3"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {door.collection}
              </span>

              <h3
                className="text-2xl md:text-3xl font-semibold text-foreground uppercase tracking-wide mb-2"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {door.name}
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">{door.description}</p>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Материал</span>
                  <span className="text-foreground">{door.material}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Размеры</span>
                  <span className="text-foreground">{door.sizes}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Покрытие</span>
                  <span className="text-foreground">{door.finish}</span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs text-muted-foreground mb-2 tracking-wide uppercase" style={{ fontFamily: "'Oswald', sans-serif" }}>
                  Оттенки
                </p>
                <div className="flex gap-2.5">
                  {door.colors.map((color, i) => (
                    <div key={i} className="w-7 h-7 rounded-full border border-border shadow-sm" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>

              <Link
                to={`/product/${door.id}`}
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-foreground text-background rounded-lg text-sm font-medium tracking-wide hover:opacity-90 transition-opacity"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Подробнее
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DoorPreviewModal;
