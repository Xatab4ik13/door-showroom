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
  True isometric projection.
  X = width (left-right on screen)
  Y = height (up on screen)
  Z = depth (into screen, used to spread parts apart)
*/
const S = 0.55; // scale

function iso(x: number, y: number, z: number): [number, number] {
  const sx = 420 + (x - z) * 0.866 * S;
  const sy = 500 + (x + z) * 0.5 * S - y * S;
  return [sx, sy];
}

function poly(pts: [number, number, number][]): string {
  return pts.map((p, i) => `${i ? 'L' : 'M'}${iso(...p).map(v => v.toFixed(1)).join(',')}`).join(' ') + 'Z';
}

/* A 3D box: front, top, right faces */
interface Box {
  id: string;
  x: number; y: number; z: number;
  w: number; h: number; d: number;
  dark?: boolean;
}

// Parts spread along Z axis with BIG gaps so each is clearly separate
const allBoxes: Box[] = [
  // 1. Dobor — thin tall dark plank, furthest back
  { id: 'dobor', x: 0, y: 0, z: 500, w: 100, h: 380, d: 15, dark: true },

  // 2. Korobka — U-shaped frame (3 pieces), next layer
  { id: 'korobka', x: -5, y: 0, z: 380, w: 15, h: 400, d: 40, dark: true },   // left post
  { id: 'korobka', x: 90, y: 0, z: 380, w: 15, h: 400, d: 40, dark: true },   // right post
  { id: 'korobka', x: -5, y: 370, z: 380, w: 110, h: 30, d: 40, dark: true }, // top beam

  // 3. Nalichnik — thin decorative trim
  { id: 'nalichnik', x: -10, y: 0, z: 270, w: 8, h: 410, d: 5 },
  { id: 'nalichnik', x: 102, y: 0, z: 270, w: 8, h: 410, d: 5 },

  // 4. Stoevaya — vertical stile
  { id: 'stoevaya', x: 5, y: 5, z: 170, w: 18, h: 350, d: 18 },

  // 5. Filyonka — panel insert (shorter, mid)
  { id: 'filyonka', x: 15, y: 40, z: 80, w: 70, h: 200, d: 8 },

  // 6. Polotno — full door slab, closest
  { id: 'polotno', x: -5, y: 0, z: -30, w: 110, h: 390, d: 18 },
];

const DoorExplodedSVG = ({ accentColor = '#8B7355' }: Props) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleClick = (id: string) => {
    setActiveId(prev => (prev === id ? null : id));
  };

  const seen = new Set<string>();

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

        <div className="lg:col-span-7 flex justify-center">
          <svg viewBox="100 170 530 420" className="w-full max-w-2xl">
            {/* Render back-to-front (highest Z first) for proper layering */}
            {[...allBoxes].sort((a, b) => b.z - a.z).map((box, i) => {
              const isActive = activeId === box.id;
              const isOther = activeId !== null && !isActive;

              const lift = isActive ? 30 : 0;
              const bx = box.x, by = box.y + lift, bz = box.z;
              const { w, h, d } = box;

              const front = poly([
                [bx, by, bz], [bx + w, by, bz],
                [bx + w, by + h, bz], [bx, by + h, bz],
              ]);
              const top = poly([
                [bx, by + h, bz], [bx + w, by + h, bz],
                [bx + w, by + h, bz + d], [bx, by + h, bz + d],
              ]);
              const right = poly([
                [bx + w, by, bz], [bx + w, by, bz + d],
                [bx + w, by + h, bz + d], [bx + w, by + h, bz],
              ]);

              const fc = isActive
                ? accentColor
                : box.dark ? '#3D3229' : '#EDE9E3';
              const tc = isActive
                ? lighten(accentColor, 20)
                : box.dark ? '#504538' : '#F5F1EB';
              const rc = isActive
                ? darken(accentColor, 20)
                : box.dark ? '#2A2018' : '#D8D4CE';
              const stroke = isActive
                ? darken(accentColor, 30)
                : box.dark ? '#1A1008' : '#C8C4BE';

              return (
                <motion.g
                  key={i}
                  onClick={(e) => { e.stopPropagation(); handleClick(box.id); }}
                  className="cursor-pointer"
                  animate={{ opacity: isOther ? 0.2 : 1 }}
                  transition={{ duration: 0.35 }}
                >
                  <path d={right} fill={rc} stroke={stroke} strokeWidth={0.5} strokeLinejoin="round" />
                  <path d={front} fill={fc} stroke={stroke} strokeWidth={0.5} strokeLinejoin="round" />
                  <path d={top} fill={tc} stroke={stroke} strokeWidth={0.5} strokeLinejoin="round" />
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
