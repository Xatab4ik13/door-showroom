import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import explodedView from '@/assets/door-exploded-view.jpg';

interface DoorPart {
  id: string;
  label: string;
  dimensions: string;
  material: string;
  /* Clickable zone on the image (% based) */
  zone: { left: number; top: number; width: number; height: number };
}

const parts: DoorPart[] = [
  {
    id: 'dobor', label: 'Доборный брус',
    dimensions: '15 × 100–200 × 2080 мм', material: 'МДФ, ламинат',
    zone: { left: 2, top: 8, width: 14, height: 82 },
  },
  {
    id: 'korobka', label: 'Коробка',
    dimensions: '40 × 74 × 2080 мм', material: 'МДФ, шпон или экошпон',
    zone: { left: 18, top: 5, width: 18, height: 88 },
  },
  {
    id: 'nalichnik', label: 'Наличник',
    dimensions: '10 × 70 × 2150 мм', material: 'МДФ с покрытием',
    zone: { left: 37, top: 8, width: 8, height: 82 },
  },
  {
    id: 'stoevaya', label: 'Продольная стоевая',
    dimensions: '40 × 74 × 2000 мм', material: 'Массив сосны / МДФ',
    zone: { left: 47, top: 5, width: 8, height: 85 },
  },
  {
    id: 'filyonka', label: 'Филёнка',
    dimensions: 'По модели двери', material: 'МДФ, стекло или шпон',
    zone: { left: 57, top: 5, width: 16, height: 85 },
  },
  {
    id: 'polotno', label: 'Дверное полотно',
    dimensions: '36 × 800 × 2000 мм', material: 'МДФ каркас, сотовый наполнитель',
    zone: { left: 75, top: 3, width: 22, height: 88 },
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

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Image with clickable overlay zones */}
        <div className="lg:col-span-7">
          <div className="relative rounded-xl overflow-hidden bg-secondary/30">
            <img
              src={explodedView}
              alt="Изометрическая проекция дверного блока в разобранном виде"
              className="w-full h-auto"
            />

            {/* Clickable hotspot zones */}
            {parts.map((part) => {
              const isActive = activeId === part.id;
              return (
                <motion.button
                  key={part.id}
                  onClick={() => handleClick(part.id)}
                  className="absolute rounded-md"
                  style={{
                    left: `${part.zone.left}%`,
                    top: `${part.zone.top}%`,
                    width: `${part.zone.width}%`,
                    height: `${part.zone.height}%`,
                    border: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
                    backgroundColor: isActive ? `${accentColor}25` : 'rgba(0,0,0,0)',
                  }}
                  whileHover={{
                    backgroundColor: `${accentColor}15`,
                  }}
                  transition={{ duration: 0.2 }}
                  aria-label={part.label}
                  title={part.label}
                />
              );
            })}
          </div>
        </div>

        {/* Parts list */}
        <div className="lg:col-span-5 flex flex-col gap-2">
          {parts.map((part) => {
            const isActive = activeId === part.id;
            return (
              <motion.button
                key={part.id}
                onClick={() => handleClick(part.id)}
                className="text-left rounded-lg border border-border px-5 py-3 transition-colors w-full"
                animate={{
                  borderColor: isActive ? accentColor : 'hsl(35, 15%, 88%)',
                  backgroundColor: isActive ? `${accentColor}10` : 'hsl(40, 30%, 99%)',
                }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                    {part.label}:
                  </p>
                  <p className="text-sm font-mono text-muted-foreground whitespace-nowrap">
                    {part.dimensions}
                  </p>
                </div>
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                        <span className="font-semibold">Материал:</span> {part.material}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DoorExplodedSVG;
