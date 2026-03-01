import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
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
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          onClick={onClose}
        >
          {/* Backdrop blur */}
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4 }}
            className="relative bg-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 text-foreground hover:text-muted-foreground transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {/* Image */}
            <div className="md:w-1/2 p-6 md:p-10 flex items-center justify-center bg-secondary/30 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
              <img
                src={door.image}
                alt={door.name}
                className="max-h-[50vh] md:max-h-[70vh] w-auto object-contain"
              />
            </div>

            {/* Info */}
            <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
              <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">
                {door.collection}
              </p>
              <h3 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-4">
                {door.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                {door.description}
              </p>

              {/* Specs */}
              <div className="space-y-3 mb-8 text-sm">
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

              {/* Color swatches */}
              <div className="mb-8">
                <p className="text-xs text-muted-foreground mb-3 tracking-wide uppercase">Оттенки</p>
                <div className="flex gap-3">
                  {door.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border border-border shadow-sm cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex-1 px-6 py-3 bg-foreground text-background rounded-lg text-sm tracking-wide hover:opacity-90 transition-opacity">
                  Получить расчёт
                </button>
                <button className="flex-1 px-6 py-3 border border-border rounded-lg text-sm tracking-wide text-foreground hover:bg-secondary transition-colors">
                  Подробнее
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DoorPreviewModal;
