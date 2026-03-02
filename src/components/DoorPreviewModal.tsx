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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-foreground/20" />

      <div
        className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row animate-scale-in"
        onClick={(e) => e.stopPropagation()}
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
        <div className="md:w-1/2 flex items-center justify-center bg-secondary/30 p-8 md:p-12 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
          <img
            src={door.image}
            alt={door.name}
            className="max-h-[50vh] md:max-h-[70vh] w-auto object-contain"
          />
        </div>

        {/* Info */}
        <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
          <span
            className="inline-block self-start px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-[hsl(205,85%,45%)] text-white mb-3"
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

          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {door.description}
          </p>

          {/* Specs */}
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

          {/* Color swatches */}
          <div className="mb-6">
            <p
              className="text-xs text-muted-foreground mb-2 tracking-wide uppercase"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Оттенки
            </p>
            <div className="flex gap-2.5">
              {door.colors.map((color, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border border-border shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Action */}
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
      </div>
    </div>
  );
};

export default DoorPreviewModal;
