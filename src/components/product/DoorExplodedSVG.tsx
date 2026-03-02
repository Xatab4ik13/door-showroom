import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import explodedView from '@/assets/door-exploded-view.jpg';

interface DoorPart {
  id: string;
  label: string;
  dimensions: string;
  material: string;
  zone: { left: number; top: number; width: number; height: number };
  /** Callout anchor point (% of image size) */
  anchor: { x: number; y: number };
}

const parts: DoorPart[] = [
  {
    id: 'dobor', label: 'Доборный брус',
    dimensions: '15 × 100–200 × 2080 мм', material: 'МДФ, ламинат',
    zone: { left: 2, top: 8, width: 14, height: 82 },
    anchor: { x: 9, y: 50 },
  },
  {
    id: 'korobka', label: 'Коробка',
    dimensions: '40 × 74 × 2080 мм', material: 'МДФ, шпон или экошпон',
    zone: { left: 18, top: 5, width: 18, height: 88 },
    anchor: { x: 27, y: 50 },
  },
  {
    id: 'nalichnik', label: 'Наличник',
    dimensions: '10 × 70 × 2150 мм', material: 'МДФ с покрытием',
    zone: { left: 37, top: 8, width: 8, height: 82 },
    anchor: { x: 41, y: 50 },
  },
  {
    id: 'stoevaya', label: 'Продольная стоевая',
    dimensions: '40 × 74 × 2000 мм', material: 'Массив сосны / МДФ',
    zone: { left: 47, top: 5, width: 8, height: 85 },
    anchor: { x: 51, y: 50 },
  },
  {
    id: 'filyonka', label: 'Филёнка',
    dimensions: 'По модели двери', material: 'МДФ, стекло или шпон',
    zone: { left: 57, top: 5, width: 16, height: 85 },
    anchor: { x: 65, y: 50 },
  },
  {
    id: 'polotno', label: 'Дверное полотно',
    dimensions: '36 × 800 × 2000 мм', material: 'МДФ каркас, сотовый наполнитель',
    zone: { left: 75, top: 3, width: 22, height: 88 },
    anchor: { x: 86, y: 50 },
  },
];

interface Props {
  accentColor?: string;
}

const CALLOUT_HEIGHT = 90; // approx callout card height in px
const ARROW_LENGTH = 40;

const DoorExplodedSVG = ({ accentColor = '#8B7355' }: Props) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleClick = (id: string) => {
    setActiveId(prev => (prev === id ? null : id));
  };

  const activePart = parts.find(p => p.id === activeId);

  return (
    <div className="w-full">
      {/* Container with extra top padding for callout overflow */}
      <div
        ref={containerRef}
        className="relative rounded-xl bg-secondary/30"
        style={{ paddingTop: CALLOUT_HEIGHT + ARROW_LENGTH + 10 }}
      >
        <img
          src={explodedView}
          alt="Изометрическая проекция дверного блока в разобранном виде"
          className="w-full h-auto rounded-xl"
        />

        {/* Clickable hotspot zones */}
        {parts.map((part) => {
          const isActive = activeId === part.id;
          return (
            <motion.button
              key={part.id}
              onClick={() => handleClick(part.id)}
              className="absolute rounded-md cursor-pointer"
              style={{
                left: `${part.zone.left}%`,
                top: `calc(${CALLOUT_HEIGHT + ARROW_LENGTH + 10}px + ${part.zone.top}%)`,
                width: `${part.zone.width}%`,
                height: `${part.zone.height}%`,
              }}
              animate={{
                y: isActive ? -20 : 0,
                borderColor: isActive ? accentColor : 'transparent',
                backgroundColor: isActive ? `${accentColor}20` : 'rgba(0,0,0,0)',
                boxShadow: isActive
                  ? `0 14px 36px -6px ${accentColor}35`
                  : '0 0 0 0 transparent',
              }}
              whileHover={{
                backgroundColor: `${accentColor}10`,
                y: isActive ? -20 : -5,
              }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              aria-label={part.label}
            >
              <div
                className="absolute inset-0 rounded-md pointer-events-none"
                style={{
                  border: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
                }}
              />
            </motion.button>
          );
        })}

        {/* Callout with arrow */}
        <AnimatePresence mode="wait">
          {activePart && containerSize.w > 0 && (() => {
            // Anchor position in px relative to the padded container
            const padTop = CALLOUT_HEIGHT + ARROW_LENGTH + 10;
            const imgH = containerSize.h - padTop;
            const anchorXpx = (activePart.anchor.x / 100) * containerSize.w;
            const anchorYpx = padTop + (activePart.anchor.y / 100) * imgH - 20; // -20 for lift
            const arrowTopPx = anchorYpx - ARROW_LENGTH;
            const calloutTopPx = arrowTopPx - CALLOUT_HEIGHT;

            return (
              <motion.div
                key={activePart.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.3 }}
                className="absolute pointer-events-none"
                style={{
                  left: anchorXpx,
                  top: calloutTopPx,
                  transform: 'translateX(-50%)',
                }}
              >
                {/* Card */}
                <div
                  className="pointer-events-auto rounded-lg px-4 py-3 shadow-lg border min-w-[190px] max-w-[260px] text-left"
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

                {/* Arrow line + dot */}
                <div className="flex flex-col items-center">
                  <div
                    style={{
                      width: 2,
                      height: ARROW_LENGTH,
                      background: `repeating-linear-gradient(to bottom, ${accentColor} 0px, ${accentColor} 4px, transparent 4px, transparent 7px)`,
                    }}
                  />
                  <div
                    className="rounded-full"
                    style={{
                      width: 8,
                      height: 8,
                      backgroundColor: accentColor,
                    }}
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
