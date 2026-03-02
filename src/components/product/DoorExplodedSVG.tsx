import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DoorPart {
  id: string;
  num: number;
  label: string;
  dimensions: string;
  material: string;
}

const parts: DoorPart[] = [
  { id: 'korobka', num: 1, label: 'Коробка', dimensions: '40 × 74 × 2080 мм', material: 'МДФ, шпон или экошпон' },
  { id: 'polotno', num: 2, label: 'Дверное полотно', dimensions: '36 × 800 × 2000 мм', material: 'МДФ каркас, сотовый наполнитель' },
  { id: 'nalichnik', num: 3, label: 'Наличники', dimensions: '10 × 70 × 2150 мм', material: 'МДФ с покрытием' },
  { id: 'dobor', num: 4, label: 'Доборный брус', dimensions: '15 × 100–200 × 2080 мм', material: 'МДФ, ламинат' },
  { id: 'stoevaya', num: 5, label: 'Стоевая', dimensions: '40 × 74 × 2000 мм', material: 'Массив сосны / МДФ' },
  { id: 'filyonka', num: 6, label: 'Филёнка', dimensions: 'По модели двери', material: 'МДФ, стекло или шпон' },
];

interface Props {
  accentColor?: string;
}

/* Neutral palette for inactive parts */
const NEUTRAL = {
  front: '#E8E4DE',
  top: '#F0ECE6',
  right: '#D8D4CE',
  stroke: '#C8C4BE',
};

/* Generate active colors from accent */
const getActiveColors = (accent: string) => ({
  front: accent,
  top: lighten(accent, 25),
  right: darken(accent, 15),
  stroke: darken(accent, 25),
});

function lighten(hex: string, pct: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    Math.min(255, r + Math.round((255 - r) * pct / 100)),
    Math.min(255, g + Math.round((255 - g) * pct / 100)),
    Math.min(255, b + Math.round((255 - b) * pct / 100)),
  );
}

function darken(hex: string, pct: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    Math.max(0, Math.round(r * (1 - pct / 100))),
    Math.max(0, Math.round(g * (1 - pct / 100))),
    Math.max(0, Math.round(b * (1 - pct / 100))),
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

const DoorExplodedSVG = ({ accentColor = '#8B7355' }: Props) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleClick = (id: string) => {
    setActiveId(prev => (prev === id ? null : id));
  };

  const activeColors = getActiveColors(accentColor);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* SVG isometric door */}
        <div className="lg:col-span-7 flex justify-center py-8">
          <svg
            viewBox="0 0 500 650"
            className="w-full max-w-lg drop-shadow-xl"
            style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.08))' }}
          >
            <defs>
              {/* Subtle wood grain texture */}
              <pattern id="grain" width="4" height="4" patternUnits="userSpaceOnUse">
                <rect width="4" height="4" fill="transparent" />
                <line x1="0" y1="2" x2="4" y2="2" stroke="rgba(0,0,0,0.03)" strokeWidth="0.5" />
              </pattern>
              {/* Shadow filter */}
              <filter id="partShadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="2" dy="4" stdDeviation="6" floodOpacity="0.15" />
              </filter>
              <filter id="liftShadow" x="-15%" y="-10%" width="140%" height="140%">
                <feDropShadow dx="4" dy="8" stdDeviation="12" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Doborny brus — left extension plank */}
            <DoorSVGPart
              id="dobor"
              activeId={activeId}
              onClick={handleClick}
              neutral={NEUTRAL}
              active={activeColors}
              num={4}
              frontPath="M 85,55 L 105,45 L 105,555 L 85,565 Z"
              topPath="M 85,55 L 105,45 L 125,35 L 105,45 Z"
              rightPath=""
              labelX={95} labelY={310}
            />

            {/* Korobka — outer frame */}
            <DoorSVGPart
              id="korobka"
              activeId={activeId}
              onClick={handleClick}
              neutral={NEUTRAL}
              active={activeColors}
              num={1}
              frontPath="M 105,45 L 105,555 L 395,555 L 395,45 Z M 125,65 L 125,535 L 375,535 L 375,65 Z"
              topPath="M 105,45 L 125,35 L 415,35 L 395,45 Z"
              rightPath="M 395,45 L 415,35 L 415,545 L 395,555 Z"
              labelX={110} labelY={300}
            />

            {/* Nalichnik — decorative trim, front plane offset */}
            <DoorSVGPart
              id="nalichnik"
              activeId={activeId}
              onClick={handleClick}
              neutral={NEUTRAL}
              active={activeColors}
              num={3}
              frontPath="M 95,40 L 95,565 L 110,565 L 110,40 Z M 390,40 L 390,565 L 405,565 L 405,40 Z M 95,40 L 405,40 L 405,50 L 95,50 Z"
              topPath=""
              rightPath=""
              labelX={402} labelY={300}
            />

            {/* Polotno — main slab */}
            <DoorSVGPart
              id="polotno"
              activeId={activeId}
              onClick={handleClick}
              neutral={NEUTRAL}
              active={activeColors}
              num={2}
              frontPath="M 135,72 L 135,528 L 365,528 L 365,72 Z"
              topPath="M 135,72 L 150,62 L 380,62 L 365,72 Z"
              rightPath="M 365,72 L 380,62 L 380,518 L 365,528 Z"
              labelX={250} labelY={500}
            />

            {/* Stoevaya — vertical stile on left of slab */}
            <DoorSVGPart
              id="stoevaya"
              activeId={activeId}
              onClick={handleClick}
              neutral={NEUTRAL}
              active={activeColors}
              num={5}
              frontPath="M 135,72 L 165,72 L 165,528 L 135,528 Z"
              topPath="M 135,72 L 150,62 L 180,62 L 165,72 Z"
              rightPath=""
              labelX={150} labelY={300}
            />

            {/* Stoevaya right side (same part) */}
            <g>
              <DoorSVGPart
                id="stoevaya"
                activeId={activeId}
                onClick={handleClick}
                neutral={NEUTRAL}
                active={activeColors}
                num={-1}
                frontPath="M 335,72 L 365,72 L 365,528 L 335,528 Z"
                topPath="M 335,72 L 350,62 L 380,62 L 365,72 Z"
                rightPath="M 365,72 L 380,62 L 380,518 L 365,528 Z"
                labelX={-1} labelY={-1}
              />
            </g>

            {/* Filyonka — panel insert */}
            <DoorSVGPart
              id="filyonka"
              activeId={activeId}
              onClick={handleClick}
              neutral={NEUTRAL}
              active={activeColors}
              num={6}
              frontPath="M 175,120 L 175,350 L 325,350 L 325,120 Z"
              topPath=""
              rightPath=""
              labelX={250} labelY={235}
              inset
            />

            {/* Glass insert in filyonka (decorative) */}
            {activeId !== 'filyonka' && (
              <rect x="185" y="130" width="130" height="210" rx="2" fill="rgba(200,210,220,0.25)" stroke="rgba(180,190,200,0.3)" strokeWidth="0.5" />
            )}

            {/* Door handle */}
            <g opacity={activeId && activeId !== 'polotno' ? 0.3 : 0.8}>
              <rect x="330" y="285" width="8" height="35" rx="3" fill="#888" stroke="#777" strokeWidth="0.5" />
              <rect x="328" y="295" width="12" height="3" rx="1" fill="#999" />
            </g>
          </svg>
        </div>

        {/* Parts list */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {parts.map((part) => {
            const isActive = activeId === part.id;
            return (
              <motion.button
                key={part.id}
                onClick={() => handleClick(part.id)}
                className="text-left rounded-xl border border-border bg-card px-5 py-4 transition-colors"
                animate={{
                  borderColor: isActive ? accentColor : 'hsl(35, 15%, 88%)',
                  boxShadow: isActive ? `0 4px 24px -6px ${accentColor}30` : '0 0 0 0 transparent',
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <motion.span
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    animate={{
                      backgroundColor: isActive ? accentColor : 'hsl(30, 10%, 15%)',
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ color: 'hsl(38, 33%, 97%)', fontFamily: "'Oswald', sans-serif" }}
                  >
                    {part.num}
                  </motion.span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                      {part.label}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">{part.dimensions}</p>
                  </div>
                </div>

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 mt-3 border-t border-border grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5" style={{ fontFamily: "'Oswald', sans-serif" }}>
                            Размеры
                          </p>
                          <p className="text-sm font-mono text-foreground">{part.dimensions}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5" style={{ fontFamily: "'Oswald', sans-serif" }}>
                            Материал
                          </p>
                          <p className="text-sm text-foreground">{part.material}</p>
                        </div>
                      </div>
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

/* ---- SVG Part ---- */
interface DoorSVGPartProps {
  id: string;
  activeId: string | null;
  onClick: (id: string) => void;
  neutral: typeof NEUTRAL;
  active: ReturnType<typeof getActiveColors>;
  num: number;
  frontPath: string;
  topPath: string;
  rightPath: string;
  labelX: number;
  labelY: number;
  inset?: boolean;
}

const DoorSVGPart = ({
  id, activeId, onClick, neutral, active, num,
  frontPath, topPath, rightPath, labelX, labelY, inset,
}: DoorSVGPartProps) => {
  const isActive = activeId === id;
  const isOtherActive = activeId !== null && activeId !== id;
  
  const colors = isActive ? active : neutral;
  const liftY = isActive ? -12 : 0;
  const opacity = isOtherActive ? 0.35 : 1;

  return (
    <motion.g
      onClick={(e) => { e.stopPropagation(); onClick(id); }}
      className="cursor-pointer"
      animate={{ y: liftY, opacity }}
      transition={{ type: 'spring', stiffness: 250, damping: 22 }}
      filter={isActive ? 'url(#liftShadow)' : 'url(#partShadow)'}
    >
      {/* Front face */}
      <motion.path
        d={frontPath}
        fillRule="evenodd"
        animate={{ fill: colors.front }}
        transition={{ duration: 0.3 }}
        stroke={isActive ? colors.stroke : 'rgba(0,0,0,0.08)'}
        strokeWidth={isActive ? 1.5 : 0.5}
      />
      {/* Wood grain overlay */}
      <path d={frontPath} fill="url(#grain)" fillRule="evenodd" pointerEvents="none" />
      
      {/* Top face */}
      {topPath && (
        <motion.path
          d={topPath}
          animate={{ fill: colors.top }}
          transition={{ duration: 0.3 }}
          stroke={isActive ? colors.stroke : 'rgba(0,0,0,0.06)'}
          strokeWidth={0.5}
        />
      )}

      {/* Right face */}
      {rightPath && (
        <motion.path
          d={rightPath}
          animate={{ fill: colors.right }}
          transition={{ duration: 0.3 }}
          stroke={isActive ? colors.stroke : 'rgba(0,0,0,0.06)'}
          strokeWidth={0.5}
        />
      )}

      {/* Inset shadow for filyonka */}
      {inset && !isActive && (
        <path d={frontPath} fill="rgba(0,0,0,0.04)" pointerEvents="none" />
      )}

      {/* Number label */}
      {num > 0 && labelX > 0 && (
        <g>
          <motion.circle
            cx={labelX}
            cy={labelY}
            r="14"
            animate={{
              fill: isActive ? active.front : '#2A2520',
            }}
            transition={{ duration: 0.3 }}
            stroke={isActive ? 'rgba(255,255,255,0.4)' : 'none'}
            strokeWidth={1}
          />
          <text
            x={labelX}
            y={labelY + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#F5F0E8"
            fontSize="12"
            fontWeight="700"
            fontFamily="'Oswald', sans-serif"
          >
            {num}
          </text>
        </g>
      )}
    </motion.g>
  );
};

export default DoorExplodedSVG;
