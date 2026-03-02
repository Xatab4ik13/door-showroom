import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import explodedView from '@/assets/door-exploded-view.jpg';

interface DoorPart {
  id: string;
  label: string;
  dimensions: string;
  material: string;
  /** Clickable zone as % of image */
  zone: { left: number; top: number; width: number; height: number };
}

const parts: DoorPart[] = [
  {
    id: 'dobor', label: 'Доборный брус',
    dimensions: '15 × 100–200 × 2080 мм', material: 'МДФ, ламинат',
    zone: { left: 3, top: 8, width: 11, height: 78 },
  },
  {
    id: 'korobka', label: 'Коробка',
    dimensions: '40 × 74 × 2080 мм', material: 'МДФ, шпон или экошпон',
    zone: { left: 18, top: 5, width: 14, height: 82 },
  },
  {
    id: 'nalichnik', label: 'Наличник',
    dimensions: '10 × 70 × 2150 мм', material: 'МДФ с покрытием',
    zone: { left: 35, top: 12, width: 8, height: 72 },
  },
  {
    id: 'stoevaya', label: 'Продольная стоевая',
    dimensions: '40 × 74 × 2000 мм', material: 'Массив сосны / МДФ',
    zone: { left: 46, top: 8, width: 8, height: 78 },
  },
  {
    id: 'filyonka', label: 'Филёнка',
    dimensions: 'По модели двери', material: 'МДФ, стекло или шпон',
    zone: { left: 57, top: 6, width: 14, height: 80 },
  },
  {
    id: 'polotno', label: 'Дверное полотно',
    dimensions: '36 × 800 × 2000 мм', material: 'МДФ каркас, сотовый наполнитель',
    zone: { left: 74, top: 3, width: 22, height: 88 },
  },
];

interface Props {
  accentColor?: string;
}

const DoorExplodedSVG = ({ accentColor = '#8B7355' }: Props) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleClick = (id: string) => {
    setActiveId(prev => (prev === id ? null : id));
  };

  const activePart = parts.find(p => p.id === activeId);

  return (
    <div className="w-full">
      {/* Image with interactive overlay zones */}
      <div className="relative w-full rounded-xl overflow-hidden">
        <img
          src={explodedView}
          alt="Схема дверного блока"
          className="w-full h-auto block"
          draggable={false}
        />

        {/* Clickable zones */}
        {parts.map((part) => {
          const isActive = activeId === part.id;
          const isOther = activeId !== null && !isActive;

          return (
            <motion.div
              key={part.id}
              className="absolute cursor-pointer rounded-md"
              style={{
                left: `${part.zone.left}%`,
                top: `${part.zone.top}%`,
                width: `${part.zone.width}%`,
                height: `${part.zone.height}%`,
              }}
              animate={{
                backgroundColor: isActive
                  ? `${accentColor}20`
                  : 'rgba(0,0,0,0)',
                boxShadow: isActive
                  ? `inset 0 0 0 2px ${accentColor}, 0 0 20px ${accentColor}30`
                  : 'inset 0 0 0 0px transparent',
              }}
              whileHover={{
                backgroundColor: isActive ? `${accentColor}20` : `${accentColor}10`,
                boxShadow: `inset 0 0 0 1px ${accentColor}60`,
              }}
              transition={{ duration: 0.25 }}
              onClick={() => handleClick(part.id)}
            />
          );
        })}

        {/* Dimming overlay with cutout for active zone */}
        <AnimatePresence>
          {activeId && (() => {
            const p = parts.find(pp => pp.id === activeId);
            if (!p) return null;
            // SVG mask: white = visible (dimmed), black rect = transparent hole
            const maskSvg = `url("data:image/svg+xml,${encodeURIComponent(
              `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100' preserveAspectRatio='none'>` +
              `<rect width='100' height='100' fill='white'/>` +
              `<rect x='${p.zone.left}' y='${p.zone.top}' width='${p.zone.width}' height='${p.zone.height}' fill='black' rx='1'/>` +
              `</svg>`
            )}")`;
            return (
              <motion.div
                key="dim"
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  WebkitMaskImage: maskSvg,
                  maskImage: maskSvg,
                  WebkitMaskSize: '100% 100%',
                  maskSize: '100% 100%',
                }}
              />
            );
          })()}
        </AnimatePresence>
      </div>

      {/* Part selector buttons */}
      <div className="flex flex-wrap gap-2 mt-6 justify-center">
        {parts.map((part) => {
          const isActive = activeId === part.id;
          return (
            <motion.button
              key={part.id}
              onClick={() => handleClick(part.id)}
              className="rounded-full px-4 py-2 text-sm border transition-colors"
              animate={{
                borderColor: isActive ? accentColor : 'hsl(var(--border))',
                backgroundColor: isActive ? `${accentColor}15` : 'transparent',
                color: isActive ? accentColor : 'hsl(var(--muted-foreground))',
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              {part.label}
            </motion.button>
          );
        })}
      </div>

      {/* Info card */}
      <AnimatePresence mode="wait">
        {activePart && (
          <motion.div
            key={`info-${activePart.id}`}
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mt-4"
          >
            <div
              className="rounded-lg px-5 py-4 border max-w-md mx-auto text-center"
              style={{ backgroundColor: 'hsl(var(--card))', borderColor: accentColor }}
            >
              <p className="text-base font-bold text-foreground mb-1" style={{ fontFamily: "'Oswald', sans-serif" }}>
                {activePart.label}
              </p>
              <p className="text-sm font-mono text-muted-foreground">{activePart.dimensions}</p>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-semibold">Материал:</span> {activePart.material}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoorExplodedSVG;
