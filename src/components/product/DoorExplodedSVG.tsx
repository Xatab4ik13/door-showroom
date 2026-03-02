import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import partKorobka from '@/assets/parts/part-korobka.jpg';
import partPolotno from '@/assets/parts/part-polotno.jpg';
import partNalichnik from '@/assets/parts/part-nalichnik.jpg';
import partDobor from '@/assets/parts/part-dobor.jpg';
import partStoevaya from '@/assets/parts/part-stoevaya.jpg';
import partFilyonka from '@/assets/parts/part-filyonka.jpg';

interface DoorPart {
  id: string;
  num: number;
  label: string;
  dimensions: string;
  material: string;
  image: string;
}

const parts: DoorPart[] = [
  { id: 'korobka', num: 1, label: 'Коробка', dimensions: '40 × 74 × 2080 мм', material: 'МДФ, шпон или экошпон', image: partKorobka },
  { id: 'polotno', num: 2, label: 'Дверное полотно', dimensions: '36 × 800 × 2000 мм', material: 'МДФ каркас, сотовый наполнитель', image: partPolotno },
  { id: 'nalichnik', num: 3, label: 'Наличники', dimensions: '10 × 70 × 2150 мм', material: 'МДФ с покрытием', image: partNalichnik },
  { id: 'dobor', num: 4, label: 'Доборный брус', dimensions: '15 × 100–200 × 2080 мм', material: 'МДФ, ламинат', image: partDobor },
  { id: 'stoevaya', num: 5, label: 'Стоевая', dimensions: '40 × 74 × 2000 мм', material: 'Массив сосны / МДФ', image: partStoevaya },
  { id: 'filyonka', num: 6, label: 'Филёнка', dimensions: 'По модели двери', material: 'МДФ, стекло или шпон', image: partFilyonka },
];

interface Props {
  accentColor?: string;
  doorImage?: string;
}

const DoorExplodedSVG = ({ accentColor = '#8B7355', doorImage }: Props) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const activePart = parts.find((p) => p.id === activeId) || null;

  // Use the product's first gallery image or fallback
  const mainImage = doorImage || partPolotno;

  return (
    <div className="w-full">
      {/* Main layout: door image center, cards around */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column — parts 1-3 */}
        <div className="lg:col-span-3 flex flex-col gap-3 order-2 lg:order-1">
          {parts.slice(0, 3).map((part) => (
            <PartCard
              key={part.id}
              part={part}
              isActive={activeId === part.id}
              accentColor={accentColor}
              onHover={setActiveId}
            />
          ))}
        </div>

        {/* Center — door render with callout dots */}
        <div className="lg:col-span-6 order-1 lg:order-2 relative flex justify-center">
          <div className="relative w-full max-w-md">
            <img
              src={mainImage}
              alt="Дверной блок"
              className="w-full h-auto rounded-2xl shadow-lg"
            />
            
            {/* Callout dots on the image */}
            <CalloutDot id="korobka" num={1} top="8%" left="5%" activeId={activeId} accentColor={accentColor} onHover={setActiveId} side="left" />
            <CalloutDot id="polotno" num={2} top="45%" left="50%" activeId={activeId} accentColor={accentColor} onHover={setActiveId} side="right" />
            <CalloutDot id="nalichnik" num={3} top="15%" left="92%" activeId={activeId} accentColor={accentColor} onHover={setActiveId} side="right" />
            <CalloutDot id="dobor" num={4} top="70%" left="8%" activeId={activeId} accentColor={accentColor} onHover={setActiveId} side="left" />
            <CalloutDot id="stoevaya" num={5} top="30%" left="18%" activeId={activeId} accentColor={accentColor} onHover={setActiveId} side="left" />
            <CalloutDot id="filyonka" num={6} top="55%" left="50%" activeId={activeId} accentColor={accentColor} onHover={setActiveId} side="right" />
          </div>
        </div>

        {/* Right column — parts 4-6 */}
        <div className="lg:col-span-3 flex flex-col gap-3 order-3">
          {parts.slice(3, 6).map((part) => (
            <PartCard
              key={part.id}
              part={part}
              isActive={activeId === part.id}
              accentColor={accentColor}
              onHover={setActiveId}
            />
          ))}
        </div>
      </div>

      {/* Expanded detail panel */}
      <AnimatePresence>
        {activePart && (
          <motion.div
            key={activePart.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.35 }}
            className="mt-8 rounded-2xl border border-border bg-card overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
              <div className="aspect-square md:aspect-auto overflow-hidden bg-secondary">
                <img
                  src={activePart.image}
                  alt={activePart.label}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:col-span-2 p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-primary-foreground shrink-0"
                    style={{ backgroundColor: accentColor, fontFamily: "'Oswald', sans-serif" }}
                  >
                    {activePart.num}
                  </span>
                  <h4
                    className="text-2xl font-bold uppercase tracking-wide text-foreground"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    {activePart.label}
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1" style={{ fontFamily: "'Oswald', sans-serif" }}>
                      Размеры
                    </p>
                    <p className="text-sm font-mono text-foreground">{activePart.dimensions}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1" style={{ fontFamily: "'Oswald', sans-serif" }}>
                      Материал
                    </p>
                    <p className="text-sm text-foreground">{activePart.material}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ---- Part Card ---- */
interface PartCardProps {
  part: DoorPart;
  isActive: boolean;
  accentColor: string;
  onHover: (id: string | null) => void;
}

const PartCard = ({ part, isActive, accentColor, onHover }: PartCardProps) => (
  <motion.div
    onMouseEnter={() => onHover(part.id)}
    onMouseLeave={() => onHover(null)}
    onClick={() => onHover(isActive ? null : part.id)}
    className="rounded-xl border cursor-pointer overflow-hidden flex items-center gap-3 px-4 py-3"
    animate={{
      borderColor: isActive ? accentColor : 'hsl(35, 15%, 88%)',
      boxShadow: isActive ? `0 4px 20px -4px ${accentColor}40` : '0 0 0 0 transparent',
    }}
    transition={{ duration: 0.3 }}
    style={{ backgroundColor: 'hsl(38, 33%, 97%)' }}
  >
    <motion.span
      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
      animate={{ backgroundColor: isActive ? accentColor : 'hsl(30, 10%, 15%)' }}
      transition={{ duration: 0.3 }}
      style={{ color: 'hsl(38, 33%, 97%)', fontFamily: "'Oswald', sans-serif" }}
    >
      {part.num}
    </motion.span>
    <div className="min-w-0">
      <p className="text-sm font-bold text-foreground truncate" style={{ fontFamily: "'Oswald', sans-serif" }}>
        {part.label}
      </p>
      <p className="text-xs font-mono text-muted-foreground truncate">{part.dimensions}</p>
    </div>
  </motion.div>
);

/* ---- Callout Dot ---- */
interface CalloutDotProps {
  id: string;
  num: number;
  top: string;
  left: string;
  activeId: string | null;
  accentColor: string;
  onHover: (id: string | null) => void;
  side: 'left' | 'right';
}

const CalloutDot = ({ id, num, top, left, activeId, accentColor, onHover }: CalloutDotProps) => {
  const isActive = activeId === id;

  return (
    <motion.div
      className="absolute z-10 cursor-pointer"
      style={{ top, left, transform: 'translate(-50%, -50%)' }}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onHover(isActive ? null : id)}
    >
      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          scale: isActive ? [1, 1.8, 1] : 1,
          opacity: isActive ? [0.5, 0, 0.5] : 0,
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ backgroundColor: accentColor, width: 32, height: 32, margin: '-4px' }}
      />
      {/* Main dot */}
      <motion.div
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md"
        animate={{
          backgroundColor: isActive ? accentColor : 'hsl(30, 10%, 15%)',
          scale: isActive ? 1.3 : 1,
        }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
        style={{ color: 'hsl(38, 33%, 97%)', fontFamily: "'Oswald', sans-serif" }}
      >
        {num}
      </motion.div>
    </motion.div>
  );
};

export default DoorExplodedSVG;
