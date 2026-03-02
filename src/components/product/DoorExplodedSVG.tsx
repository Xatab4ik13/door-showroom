import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import explodedView from '@/assets/door-exploded-view.jpg';

interface DoorPart {
  id: string;
  label: string;
  dimensions: string;
  material: string;
  zone: { left: number; top: number; width: number; height: number };
  /** Point on the part where arrow ends (%) */
  dot: { x: number; y: number };
  /** Where the label card appears (%) */
  card: { x: number; y: number };
}

const parts: DoorPart[] = [
  {
    id: 'dobor', label: 'Доборный брус',
    dimensions: '15 × 100–200 × 2080 мм', material: 'МДФ, ламинат',
    zone: { left: 3, top: 8, width: 11, height: 78 },
    dot: { x: 10, y: 50 },
    card: { x: 2, y: 28 },
  },
  {
    id: 'korobka', label: 'Коробка',
    dimensions: '40 × 74 × 2080 мм', material: 'МДФ, шпон или экошпон',
    zone: { left: 18, top: 5, width: 14, height: 82 },
    dot: { x: 26, y: 45 },
    card: { x: 16, y: 25 },
  },
  {
    id: 'nalichnik', label: 'Наличник',
    dimensions: '10 × 70 × 2150 мм', material: 'МДФ с покрытием',
    zone: { left: 35, top: 12, width: 8, height: 72 },
    dot: { x: 39, y: 50 },
    card: { x: 32, y: 78 },
  },
  {
    id: 'stoevaya', label: 'Продольная стоевая',
    dimensions: '40 × 74 × 2000 мм', material: 'Массив сосны / МДФ',
    zone: { left: 46, top: 8, width: 8, height: 78 },
    dot: { x: 50, y: 45 },
    card: { x: 43, y: 78 },
  },
  {
    id: 'filyonka', label: 'Филёнка',
    dimensions: 'По модели двери', material: 'МДФ, стекло или шпон',
    zone: { left: 57, top: 6, width: 14, height: 80 },
    dot: { x: 64, y: 42 },
    card: { x: 56, y: 78 },
  },
  {
    id: 'polotno', label: 'Дверное полотно',
    dimensions: '36 × 800 × 2000 мм', material: 'МДФ каркас, сотовый наполнитель',
    zone: { left: 74, top: 3, width: 22, height: 88 },
    dot: { x: 85, y: 40 },
    card: { x: 76, y: 22 },
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
      <div className="relative w-full rounded-xl overflow-hidden">
        <img
          src={explodedView}
          alt="Схема дверного блока"
          className="w-full h-auto block"
          draggable={false}
        />

        {/* Clickable zones */}
        {parts.map((part) => (
          <div
            key={part.id}
            className="absolute cursor-pointer z-10"
            style={{
              left: `${part.zone.left}%`,
              top: `${part.zone.top}%`,
              width: `${part.zone.width}%`,
              height: `${part.zone.height}%`,
            }}
            onClick={() => handleClick(part.id)}
          />
        ))}

        {/* Callout: arrow line + dot + label */}
        <AnimatePresence>
          {activePart && (
            <>
              {/* SVG arrow */}
              <motion.svg
                key={`svg-${activePart.id}`}
                className="absolute inset-0 w-full h-full pointer-events-none z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {/* Line from card to dot */}
                <motion.line
                  x1={`${activePart.card.x + 7}%`}
                  y1={`${activePart.card.y}%`}
                  x2={`${activePart.dot.x}%`}
                  y2={`${activePart.dot.y}%`}
                  stroke={accentColor}
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4 }}
                />
                {/* Dot on the part */}
                <motion.circle
                  cx={`${activePart.dot.x}%`}
                  cy={`${activePart.dot.y}%`}
                  r="5"
                  fill={accentColor}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                />
                <motion.circle
                  cx={`${activePart.dot.x}%`}
                  cy={`${activePart.dot.y}%`}
                  r="9"
                  fill="none"
                  stroke={accentColor}
                  strokeWidth="1.5"
                  opacity="0.5"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.35, type: 'spring' }}
                />
              </motion.svg>

              {/* Label card */}
              <motion.div
                key={`label-${activePart.id}`}
                className="absolute z-30 pointer-events-none"
                style={{
                  left: `${activePart.card.x}%`,
                  top: `${activePart.card.y}%`,
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="rounded-lg px-3 py-2 shadow-xl border backdrop-blur-md"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderColor: accentColor,
                    maxWidth: '170px',
                  }}
                >
                  <p
                    className="text-xs font-bold leading-tight"
                    style={{ fontFamily: "'Oswald', sans-serif", color: accentColor }}
                  >
                    {activePart.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                    {activePart.dimensions}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {activePart.material}
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Buttons */}
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
