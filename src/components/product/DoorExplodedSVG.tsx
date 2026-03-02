import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import explodedView from '@/assets/door-exploded-view.jpg';

interface DoorPart {
  id: string;
  label: string;
  dimensions: string;
  material: string;
  zone: { left: number; top: number; width: number; height: number };
  /** Where the callout anchor dot sits (% of image) */
  anchor: { x: number; y: number };
}

/*
 * Zone coordinates calibrated to the generated exploded-view render.
 * Left-to-right order matches the image:
 *  1. Доборный брус — dark wood slab, far left
 *  2. Коробка — black П-shaped frame
 *  3. Наличник — two thin silver/metal strips
 *  4. Продольная стоевая — brown wooden piece
 *  5. Филёнка — large glass panel
 *  6. Дверное полотно — dark wood slab, far right
 */
const parts: DoorPart[] = [
  {
    id: 'dobor', label: 'Доборный брус',
    dimensions: '15 × 100–200 × 2080 мм', material: 'МДФ, ламинат',
    zone: { left: 6, top: 14, width: 16, height: 76 },
    anchor: { x: 14, y: 30 },
  },
  {
    id: 'korobka', label: 'Коробка',
    dimensions: '40 × 74 × 2080 мм', material: 'МДФ, шпон или экошпон',
    zone: { left: 24, top: 6, width: 20, height: 86 },
    anchor: { x: 34, y: 22 },
  },
  {
    id: 'nalichnik', label: 'Наличник',
    dimensions: '10 × 70 × 2150 мм', material: 'МДФ с покрытием',
    zone: { left: 45, top: 8, width: 7, height: 82 },
    anchor: { x: 48, y: 25 },
  },
  {
    id: 'stoevaya', label: 'Продольная стоевая',
    dimensions: '40 × 74 × 2000 мм', material: 'Массив сосны / МДФ',
    zone: { left: 53, top: 6, width: 9, height: 84 },
    anchor: { x: 57, y: 22 },
  },
  {
    id: 'filyonka', label: 'Филёнка',
    dimensions: 'По модели двери', material: 'МДФ, стекло или шпон',
    zone: { left: 58, top: 4, width: 15, height: 86 },
    anchor: { x: 65, y: 20 },
  },
  {
    id: 'polotno', label: 'Дверное полотно',
    dimensions: '36 × 800 × 2000 мм', material: 'МДФ каркас, сотовый наполнитель',
    zone: { left: 74, top: 3, width: 20, height: 88 },
    anchor: { x: 84, y: 18 },
  },
];

interface Props {
  accentColor?: string;
}

const DoorExplodedSVG = ({ accentColor = '#8B7355' }: Props) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgRect, setImgRect] = useState<{ w: number; h: number; top: number } | null>(null);

  useEffect(() => {
    const measure = () => {
      const el = imgRef.current;
      if (!el) return;
      setImgRect({ w: el.offsetWidth, h: el.offsetHeight, top: el.offsetTop });
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
      <div className="relative">
        {/* Image */}
        <img
          ref={imgRef}
          src={explodedView}
          alt="Изометрическая проекция дверного блока в разобранном виде"
          className="w-full h-auto rounded-xl"
        />

        {/* Clickable hotspot zones — positioned relative to image */}
        {imgRect && parts.map((part) => {
          const isActive = activeId === part.id;
          return (
            <motion.button
              key={part.id}
              onClick={() => handleClick(part.id)}
              className="absolute rounded-md cursor-pointer"
              style={{
                left: `${part.zone.left}%`,
                top: `${part.zone.top}%`,
                width: `${part.zone.width}%`,
                height: `${part.zone.height}%`,
              }}
              animate={{
                y: isActive ? -16 : 0,
                backgroundColor: isActive ? `${accentColor}18` : 'rgba(0,0,0,0)',
                boxShadow: isActive
                  ? `0 10px 30px -6px ${accentColor}30`
                  : '0 0 0 0 transparent',
              }}
              whileHover={{
                backgroundColor: `${accentColor}0d`,
                y: isActive ? -16 : -3,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              aria-label={part.label}
            >
              <div
                className="absolute inset-0 rounded-md pointer-events-none transition-colors"
                style={{
                  border: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
                }}
              />
            </motion.button>
          );
        })}

        {/* Callout tooltip — rendered outside the image overflow */}
        <AnimatePresence mode="wait">
          {activePart && imgRect && (() => {
            const anchorXpx = (activePart.anchor.x / 100) * imgRect.w;
            const anchorYpx = (activePart.anchor.y / 100) * imgRect.h;

            return (
              <motion.div
                key={activePart.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.25 }}
                className="absolute pointer-events-none z-10"
                style={{
                  left: anchorXpx,
                  top: anchorYpx - 16, // offset for the lift
                  transform: 'translate(-50%, -100%)',
                }}
              >
                {/* Card */}
                <div
                  className="pointer-events-auto rounded-lg px-4 py-3 shadow-lg border min-w-[180px] max-w-[250px] text-left mb-1"
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

                {/* Arrow: dashed line + dot */}
                <div className="flex flex-col items-center">
                  <div
                    style={{
                      width: 2,
                      height: 32,
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
