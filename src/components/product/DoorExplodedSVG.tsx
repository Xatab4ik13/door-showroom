import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import explodedView from '@/assets/door-exploded-view.jpg';

interface DoorPart {
  id: string;
  label: string;
  dimensions: string;
  material: string;
  /** Zone used for clicks (% based) */
  zone: { left: number; top: number; width: number; height: number };
  /** Exact cut-out shape of the part on the full image */
  clipPath: string;
  /** Where the callout points to (% of image) */
  anchor: { x: number; y: number };
}

const parts: DoorPart[] = [
  {
    id: 'dobor', label: 'Доборный брус',
    dimensions: '15 × 100–200 × 2080 мм', material: 'МДФ, ламинат',
    zone: { left: 7, top: 20, width: 14, height: 64 },
    clipPath: 'polygon(12% 35%, 20% 42%, 20% 77%, 12% 70%)',
    anchor: { x: 16, y: 44 },
  },
  {
    id: 'korobka', label: 'Коробка',
    dimensions: '40 × 74 × 2080 мм', material: 'МДФ, шпон или экошпон',
    zone: { left: 29, top: 18, width: 14, height: 70 },
    clipPath: 'polygon(33% 27%, 37% 23%, 41.5% 27%, 41.5% 80%, 37% 84%, 33% 80%)',
    anchor: { x: 38, y: 38 },
  },
  {
    id: 'nalichnik', label: 'Наличник',
    dimensions: '10 × 70 × 2150 мм', material: 'МДФ с покрытием',
    zone: { left: 39, top: 24, width: 8, height: 55 },
    clipPath: 'polygon(40% 41%, 44% 38%, 44% 70%, 40% 73%)',
    anchor: { x: 42, y: 45 },
  },
  {
    id: 'stoevaya', label: 'Продольная стоевая',
    dimensions: '40 × 74 × 2000 мм', material: 'Массив сосны / МДФ',
    zone: { left: 53.5, top: 20, width: 5, height: 60 },
    clipPath: 'polygon(54.5% 34%, 57% 32%, 57% 73%, 54.5% 75%)',
    anchor: { x: 56, y: 42 },
  },
  {
    id: 'filyonka', label: 'Филёнка',
    dimensions: 'По модели двери', material: 'МДФ, стекло или шпон',
    zone: { left: 59, top: 16, width: 11, height: 66 },
    clipPath: 'polygon(60% 30%, 68% 24%, 68% 71%, 60% 77%)',
    anchor: { x: 64, y: 40 },
  },
  {
    id: 'polotno', label: 'Дверное полотно',
    dimensions: '36 × 800 × 2000 мм', material: 'МДФ каркас, сотовый наполнитель',
    zone: { left: 74, top: 12, width: 11, height: 68 },
    clipPath: 'polygon(74.5% 24%, 83.5% 18%, 83.5% 70%, 74.5% 76%)',
    anchor: { x: 79, y: 34 },
  },
];

interface Props {
  accentColor?: string;
}

const LIFT_PX = 24;

const DoorExplodedSVG = ({ accentColor = '#8B7355' }: Props) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const measure = () => {
      const el = imgRef.current;
      if (!el) return;
      setImgSize({ w: el.offsetWidth, h: el.offsetHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (imgRef.current) ro.observe(imgRef.current);
    return () => ro.disconnect();
  }, []);

  const handleClick = (id: string) => {
    setActiveId(prev => (prev === id ? null : id));
  };

  const activePart = parts.find(p => p.id === activeId);

  return (
    <div className="w-full">
      <div className="relative overflow-visible">
        {/* Base image — dims when a part is active */}
        <motion.div
          animate={{
            filter: activeId ? 'brightness(0.72)' : 'brightness(1)',
          }}
          transition={{ duration: 0.35 }}
        >
          <img
            ref={imgRef}
            src={explodedView}
            alt="Изометрическая проекция дверного блока в разобранном виде"
            className="w-full h-auto rounded-xl"
          />
        </motion.div>

        {/* Invisible click zones (always present) */}
        {imgSize && parts.map((part) => (
          <button
            key={part.id}
            onClick={() => handleClick(part.id)}
            className="absolute cursor-pointer z-10"
            style={{
              left: `${part.zone.left}%`,
              top: `${part.zone.top}%`,
              width: `${part.zone.width}%`,
              height: `${part.zone.height}%`,
              background: 'transparent',
              border: 'none',
            }}
            aria-label={part.label}
          />
        ))}

        {/* Lifted "cut-out" of the active part — a clipped copy of the image */}
        <AnimatePresence>
          {activePart && imgSize && (
            <motion.div
              key={activePart.id}
              initial={{ y: 0, opacity: 0, scale: 1 }}
              animate={{ y: -LIFT_PX, opacity: 1, scale: 1.03 }}
              exit={{ y: 0, opacity: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="absolute inset-0 pointer-events-none"
              style={{
                clipPath: activePart.clipPath,
                transformOrigin: `${activePart.anchor.x}% ${activePart.anchor.y}%`,
                filter: `drop-shadow(0 ${LIFT_PX}px 22px rgba(0,0,0,0.35))`,
              }}
            >
              <img
                src={explodedView}
                alt=""
                className="w-full h-auto"
                aria-hidden
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Callout card with arrow */}
        <AnimatePresence mode="wait">
          {activePart && imgSize && (() => {
            const anchorXpx = (activePart.anchor.x / 100) * imgSize.w;
            const anchorYpx = (activePart.anchor.y / 100) * imgSize.h;

            return (
              <motion.div
                key={`callout-${activePart.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="absolute pointer-events-none z-20"
                style={{
                  left: anchorXpx,
                  top: anchorYpx - LIFT_PX,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                {/* Info card */}
                <div
                  className="pointer-events-auto rounded-lg px-4 py-3 shadow-xl border min-w-[180px] max-w-[250px] text-left mb-1"
                  style={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: accentColor,
                  }}
                >
                  <p
                    className="text-sm font-bold text-foreground mb-1"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    {activePart.label}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {activePart.dimensions}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-semibold">Материал:</span> {activePart.material}
                  </p>
                </div>

                {/* Dashed arrow line + dot */}
                <div className="flex flex-col items-center">
                  <div
                    style={{
                      width: 2,
                      height: 28,
                      background: `repeating-linear-gradient(to bottom, ${accentColor} 0px, ${accentColor} 4px, transparent 4px, transparent 7px)`,
                    }}
                  />
                  <div
                    className="rounded-full"
                    style={{ width: 8, height: 8, backgroundColor: accentColor }}
                  />
                </div>
              </motion.div>
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
    </div>
  );
};

export default DoorExplodedSVG;
