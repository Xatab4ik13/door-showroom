import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* Individual part layer images */
import layerDobor from '@/assets/parts/layer-dobor.png';
import layerKorobka from '@/assets/parts/layer-korobka.png';
import layerNalichnik from '@/assets/parts/layer-nalichnik.png';
import layerStoevaya from '@/assets/parts/layer-stoevaya.png';
import layerFilyonka from '@/assets/parts/layer-filyonka.png';
import layerPolotno from '@/assets/parts/layer-polotno.png';

interface DoorPart {
  id: string;
  label: string;
  dimensions: string;
  material: string;
  image: string;
  /** Position and size of this layer within the assembly (%) */
  pos: { left: number; top: number; width: number; height: number };
}

const parts: DoorPart[] = [
  {
    id: 'dobor', label: 'Доборный брус',
    dimensions: '15 × 100–200 × 2080 мм', material: 'МДФ, ламинат',
    image: layerDobor,
    pos: { left: 2, top: 5, width: 18, height: 85 },
  },
  {
    id: 'korobka', label: 'Коробка',
    dimensions: '40 × 74 × 2080 мм', material: 'МДФ, шпон или экошпон',
    image: layerKorobka,
    pos: { left: 20, top: 2, width: 22, height: 90 },
  },
  {
    id: 'nalichnik', label: 'Наличник',
    dimensions: '10 × 70 × 2150 мм', material: 'МДФ с покрытием',
    image: layerNalichnik,
    pos: { left: 38, top: 25, width: 14, height: 55 },
  },
  {
    id: 'stoevaya', label: 'Продольная стоевая',
    dimensions: '40 × 74 × 2000 мм', material: 'Массив сосны / МДФ',
    image: layerStoevaya,
    pos: { left: 50, top: 2, width: 14, height: 85 },
  },
  {
    id: 'filyonka', label: 'Филёнка',
    dimensions: 'По модели двери', material: 'МДФ, стекло или шпон',
    image: layerFilyonka,
    pos: { left: 62, top: 5, width: 16, height: 82 },
  },
  {
    id: 'polotno', label: 'Дверное полотно',
    dimensions: '36 × 800 × 2000 мм', material: 'МДФ каркас, сотовый наполнитель',
    image: layerPolotno,
    pos: { left: 78, top: 0, width: 20, height: 92 },
  },
];

interface Props {
  accentColor?: string;
}

const LIFT = 30; // px lift on select

const DoorExplodedSVG = ({ accentColor = '#8B7355' }: Props) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleClick = (id: string) => {
    setActiveId(prev => (prev === id ? null : id));
  };

  const activePart = parts.find(p => p.id === activeId);

  return (
    <div className="w-full">
      {/* Assembly container — relative, parts are absolute inside */}
      <div
        className="relative w-full bg-secondary/20 rounded-xl overflow-visible"
        style={{ aspectRatio: '16 / 9' }}
      >
        {parts.map((part) => {
          const isActive = activeId === part.id;
          const isOther = activeId !== null && !isActive;

          return (
            <motion.div
              key={part.id}
              className="absolute cursor-pointer"
              style={{
                left: `${part.pos.left}%`,
                top: `${part.pos.top}%`,
                width: `${part.pos.width}%`,
                height: `${part.pos.height}%`,
                zIndex: isActive ? 20 : 1,
              }}
              animate={{
                y: isActive ? -LIFT : 0,
                scale: isActive ? 1.05 : 1,
                opacity: isOther ? 0.45 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              onClick={() => handleClick(part.id)}
              whileHover={!isActive ? { y: -6, scale: 1.02 } : undefined}
            >
              <img
                src={part.image}
                alt={part.label}
                className="w-full h-full object-contain drop-shadow-md"
                draggable={false}
                style={{
                  filter: isActive
                    ? `drop-shadow(0 ${LIFT}px 18px rgba(0,0,0,0.3))`
                    : 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                }}
              />
            </motion.div>
          );
        })}

        {/* No callout inside the container — it's shown below */}
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

      {/* Info card below buttons */}
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
