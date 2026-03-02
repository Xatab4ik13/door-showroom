import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DoorPart {
  id: string;
  label: string;
  dimensions: string;
  material: string;
}

const parts: DoorPart[] = [
  { id: 'dobor', label: 'Доборный брус', dimensions: '15 × 100–200 × 2080 мм', material: 'МДФ, ламинат' },
  { id: 'korobka', label: 'Коробка', dimensions: '40 × 74 × 2080 мм', material: 'МДФ, шпон или экошпон' },
  { id: 'nalichnik', label: 'Наличник', dimensions: '10 × 70 × 2150 мм', material: 'МДФ с покрытием' },
  { id: 'stoevaya', label: 'Продольная стоевая', dimensions: '40 × 74 × 2000 мм', material: 'Массив сосны / МДФ' },
  { id: 'filyonka', label: 'Филёнка', dimensions: 'По модели двери', material: 'МДФ, стекло или шпон' },
  { id: 'polotno', label: 'Дверное полотно', dimensions: '36 × 800 × 2000 мм', material: 'МДФ каркас, сотовый наполнитель' },
];

interface Props {
  accentColor?: string;
}

/*
  Isometric helper: converts (x, y, z) into 2D isometric coords.
  Standard isometric: 
    screenX = (x - z) * cos(30°)
    screenY = (x + z) * sin(30°) - y
*/
const COS30 = Math.cos(Math.PI / 6); // ~0.866
const SIN30 = 0.5;

function iso(x: number, y: number, z: number): [number, number] {
  return [
    300 + (x - z) * COS30 * 0.8,
    350 + (x + z) * SIN30 * 0.8 - y * 0.85,
  ];
}

function isoPath(points: [number, number, number][]): string {
  return points
    .map((p, i) => {
      const [sx, sy] = iso(p[0], p[1], p[2]);
      return `${i === 0 ? 'M' : 'L'} ${sx.toFixed(1)},${sy.toFixed(1)}`;
    })
    .join(' ') + ' Z';
}

/* Each part is a 3D box defined by position + size, exploded along Z axis */
interface BoxDef {
  id: string;
  // 3D position (x, y, z) — bottom-left-front corner
  x: number; y: number; z: number;
  // Size
  w: number; h: number; d: number;
  dark?: boolean;
}

const boxes: BoxDef[] = [
  // Dobor — far left (high Z = pushed back)
  { id: 'dobor', x: -10, y: 0, z: 220, w: 15, h: 340, d: 40, dark: true },
  // Korobka — two vertical posts
  { id: 'korobka', x: -5, y: 0, z: 160, w: 12, h: 360, d: 50, dark: true },
  { id: 'korobka', x: 55, y: 0, z: 160, w: 12, h: 360, d: 50, dark: true },
  // Nalichnik — thin strip
  { id: 'nalichnik', x: -8, y: 0, z: 110, w: 8, h: 370, d: 6 },
  // Stoevaya — vertical stile
  { id: 'stoevaya', x: 0, y: 10, z: 60, w: 22, h: 320, d: 22 },
  // Filyonka — panel (shorter, positioned mid-height)
  { id: 'filyonka', x: 5, y: 60, z: 10, w: 55, h: 180, d: 10 },
  // Polotno — full door slab (rightmost, closest)
  { id: 'polotno', x: -15, y: 0, z: -60, w: 90, h: 360, d: 20 },
];

const LIGHT = { front: '#F0ECE6', side: '#DDD8D0', top: '#F8F5F0' };
const DARK = { front: '#4A4038', side: '#332A22', top: '#5A5048' };

const DoorExplodedSVG = ({ accentColor = '#8B7355' }: Props) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleClick = (id: string) => {
    setActiveId(prev => (prev === id ? null : id));
  };

  const activeColors = {
    front: accentColor,
    side: darken(accentColor, 25),
    top: lighten(accentColor, 20),
  };

  // Track which ids we've already labeled (for duplicates like korobka)
  const labeledIds = new Set<string>();

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

        {/* Exploded isometric SVG */}
        <div className="lg:col-span-7 flex justify-center">
          <svg viewBox="40 -20 520 500" className="w-full max-w-xl">
            {boxes.map((box, i) => {
              const isActive = activeId === box.id;
              const isOtherActive = activeId !== null && activeId !== box.id;
              const base = box.dark ? DARK : LIGHT;
              const colors = isActive ? activeColors : base;

              const liftY = isActive ? 25 : 0;

              // Front face: bottom-left to top-right of front plane
              const front = isoPath([
                [box.x, box.y + liftY, box.z],
                [box.x + box.w, box.y + liftY, box.z],
                [box.x + box.w, box.y + box.h + liftY, box.z],
                [box.x, box.y + box.h + liftY, box.z],
              ]);

              // Top face
              const top = isoPath([
                [box.x, box.y + box.h + liftY, box.z],
                [box.x + box.w, box.y + box.h + liftY, box.z],
                [box.x + box.w, box.y + box.h + liftY, box.z + box.d],
                [box.x, box.y + box.h + liftY, box.z + box.d],
              ]);

              // Right side face
              const right = isoPath([
                [box.x + box.w, box.y + liftY, box.z],
                [box.x + box.w, box.y + liftY, box.z + box.d],
                [box.x + box.w, box.y + box.h + liftY, box.z + box.d],
                [box.x + box.w, box.y + box.h + liftY, box.z],
              ]);

              const isFirstOfId = !labeledIds.has(box.id);
              if (isFirstOfId) labeledIds.add(box.id);

              return (
                <motion.g
                  key={i}
                  onClick={(e) => { e.stopPropagation(); handleClick(box.id); }}
                  className="cursor-pointer"
                  animate={{ opacity: isOtherActive ? 0.25 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Right side */}
                  <motion.path
                    d={right}
                    animate={{ fill: colors.side }}
                    transition={{ duration: 0.3 }}
                    stroke={isActive ? darken(accentColor, 30) : 'rgba(0,0,0,0.08)'}
                    strokeWidth={0.5}
                    strokeLinejoin="round"
                  />
                  {/* Front */}
                  <motion.path
                    d={front}
                    animate={{ fill: colors.front }}
                    transition={{ duration: 0.3 }}
                    stroke={isActive ? darken(accentColor, 30) : 'rgba(0,0,0,0.1)'}
                    strokeWidth={0.5}
                    strokeLinejoin="round"
                  />
                  {/* Top */}
                  <motion.path
                    d={top}
                    animate={{ fill: colors.top }}
                    transition={{ duration: 0.3 }}
                    stroke={isActive ? darken(accentColor, 15) : 'rgba(0,0,0,0.06)'}
                    strokeWidth={0.5}
                    strokeLinejoin="round"
                  />
                </motion.g>
              );
            })}
          </svg>
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

/* ---- Color helpers ---- */
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

export default DoorExplodedSVG;
