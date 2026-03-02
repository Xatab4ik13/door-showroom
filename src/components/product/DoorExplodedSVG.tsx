import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DoorPart {
  id: string;
  label: string;
  description: string;
  dimensions: string;
  num: number;
}

const parts: DoorPart[] = [
  { id: 'korobka', label: 'Коробка', description: 'Рама, в которую вставляется дверь. Крепится к стене проёма.', dimensions: '40×74×2080 мм', num: 1 },
  { id: 'polotno', label: 'Дверное полотно', description: 'Сама дверь — то, что открывается и закрывается.', dimensions: '36×800×2000 мм', num: 2 },
  { id: 'nalichnik', label: 'Наличники', description: 'Декоративные планки, закрывающие щель между коробкой и стеной.', dimensions: '10×70×2150 мм', num: 3 },
  { id: 'dobor', label: 'Доборный брус', description: 'Расширяет коробку, если стена толще стандартной.', dimensions: '15×100–200×2080 мм', num: 4 },
  { id: 'stoevaya', label: 'Стоевая', description: 'Вертикальная часть каркаса полотна. Обеспечивает прочность.', dimensions: '40×74×2000 мм', num: 5 },
  { id: 'filyonka', label: 'Филёнка', description: 'Декоративная вставка в полотно — МДФ, стекло или шпон.', dimensions: 'По модели', num: 6 },
];

// Offsets for "exploded" state — each part slides away from center
const explodeOffsets: Record<string, { x: number; y: number }> = {
  korobka:  { x: -80, y: -20 },
  polotno:  { x: 0,   y: 0 },
  nalichnik:{ x: 80,  y: -10 },
  dobor:    { x: -120,y: 10 },
  stoevaya: { x: 100, y: 20 },
  filyonka: { x: 60,  y: 50 },
};

interface Props {
  accentColor?: string;
}

const DoorExplodedSVG = ({ accentColor = '#8B7355' }: Props) => {
  const [exploded, setExploded] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const springTransition = { type: 'spring' as const, stiffness: 80, damping: 18, mass: 1 };

  const getOffset = (id: string) => {
    if (!exploded) return { x: 0, y: 0 };
    return explodeOffsets[id] || { x: 0, y: 0 };
  };

  const isActive = (id: string) => hoveredId === id;
  const isFaded = (id: string) => hoveredId !== null && hoveredId !== id;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      {/* Left: SVG diagram */}
      <div className="lg:col-span-3 relative">
        {/* Toggle button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setExploded(!exploded)}
            className="group relative px-8 py-3 rounded-full border-2 border-border bg-card text-foreground transition-all duration-300 hover:border-foreground hover:shadow-lg"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            <span className="text-sm font-semibold uppercase tracking-widest">
              {exploded ? 'Собрать' : 'Разобрать'}
            </span>
          </button>
        </div>

        <svg
          viewBox="0 0 600 700"
          className="w-full h-auto max-h-[80vh]"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="partShadow">
              <feDropShadow dx="2" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* ① Коробка — U-shaped frame */}
          <motion.g
            animate={getOffset('korobka')}
            transition={springTransition}
            onMouseEnter={() => setHoveredId('korobka')}
            onMouseLeave={() => setHoveredId(null)}
            style={{ cursor: 'pointer' }}
            filter="url(#partShadow)"
          >
            <motion.g animate={{ opacity: isFaded('korobka') ? 0.15 : 1 }} transition={{ duration: 0.4 }}>
              {/* Left jamb */}
              <rect x="130" y="60" width="22" height="560" rx="2"
                fill={isActive('korobka') ? accentColor : 'hsl(30, 15%, 45%)'}
                className="transition-colors duration-500" />
              {/* Top header */}
              <rect x="130" y="60" width="260" height="22" rx="2"
                fill={isActive('korobka') ? accentColor : 'hsl(30, 15%, 42%)'}
                className="transition-colors duration-500" />
              {/* Right jamb */}
              <rect x="368" y="60" width="22" height="560" rx="2"
                fill={isActive('korobka') ? accentColor : 'hsl(30, 15%, 45%)'}
                className="transition-colors duration-500" />
              {/* Badge */}
              <circle cx="120" cy="50" r="14" fill={isActive('korobka') ? accentColor : 'hsl(30, 10%, 15%)'} className="transition-colors duration-500" />
              <text x="120" y="55" textAnchor="middle" fill="hsl(38, 33%, 97%)" fontSize="13" fontWeight="700" style={{ fontFamily: "'Oswald', sans-serif" }}>1</text>
            </motion.g>
          </motion.g>

          {/* ② Дверное полотно */}
          <motion.g
            animate={getOffset('polotno')}
            transition={springTransition}
            onMouseEnter={() => setHoveredId('polotno')}
            onMouseLeave={() => setHoveredId(null)}
            style={{ cursor: 'pointer' }}
            filter="url(#partShadow)"
          >
            <motion.g animate={{ opacity: isFaded('polotno') ? 0.15 : 1 }} transition={{ duration: 0.4 }}>
              <rect x="162" y="90" width="200" height="520" rx="3"
                fill={isActive('polotno') ? accentColor : 'hsl(35, 20%, 88%)'}
                stroke={isActive('polotno') ? accentColor : 'hsl(30, 15%, 75%)'}
                strokeWidth="1.5"
                className="transition-colors duration-500" />
              {/* Panel details */}
              {[110, 250, 400].map((py, i) => (
                <rect key={i} x="182" y={py} width="160" height="100" rx="4"
                  fill="none"
                  stroke={isActive('polotno') ? 'hsl(38, 33%, 97%)' : 'hsl(30, 15%, 75%)'}
                  strokeWidth="1"
                  className="transition-colors duration-500" />
              ))}
              {/* Door handle */}
              <rect x="340" y="330" width="8" height="30" rx="4"
                fill={isActive('polotno') ? 'hsl(40, 60%, 65%)' : 'hsl(30, 20%, 55%)'}
                className="transition-colors duration-500" />
              {/* Badge */}
              <circle cx="262" cy="50" r="14" fill={isActive('polotno') ? accentColor : 'hsl(30, 10%, 15%)'} className="transition-colors duration-500" />
              <text x="262" y="55" textAnchor="middle" fill="hsl(38, 33%, 97%)" fontSize="13" fontWeight="700" style={{ fontFamily: "'Oswald', sans-serif" }}>2</text>
            </motion.g>
          </motion.g>

          {/* ③ Наличники — trim strips */}
          <motion.g
            animate={getOffset('nalichnik')}
            transition={springTransition}
            onMouseEnter={() => setHoveredId('nalichnik')}
            onMouseLeave={() => setHoveredId(null)}
            style={{ cursor: 'pointer' }}
            filter="url(#partShadow)"
          >
            <motion.g animate={{ opacity: isFaded('nalichnik') ? 0.15 : 1 }} transition={{ duration: 0.4 }}>
              {/* Left trim */}
              <rect x="105" y="55" width="14" height="570" rx="2"
                fill={isActive('nalichnik') ? accentColor : 'hsl(35, 18%, 82%)'}
                className="transition-colors duration-500" />
              {/* Right trim */}
              <rect x="400" y="55" width="14" height="570" rx="2"
                fill={isActive('nalichnik') ? accentColor : 'hsl(35, 18%, 82%)'}
                className="transition-colors duration-500" />
              {/* Top trim */}
              <rect x="105" y="42" width="309" height="14" rx="2"
                fill={isActive('nalichnik') ? accentColor : 'hsl(35, 18%, 80%)'}
                className="transition-colors duration-500" />
              {/* Badge */}
              <circle cx="424" cy="50" r="14" fill={isActive('nalichnik') ? accentColor : 'hsl(30, 10%, 15%)'} className="transition-colors duration-500" />
              <text x="424" y="55" textAnchor="middle" fill="hsl(38, 33%, 97%)" fontSize="13" fontWeight="700" style={{ fontFamily: "'Oswald', sans-serif" }}>3</text>
            </motion.g>
          </motion.g>

          {/* ④ Доборный брус */}
          <motion.g
            animate={getOffset('dobor')}
            transition={springTransition}
            onMouseEnter={() => setHoveredId('dobor')}
            onMouseLeave={() => setHoveredId(null)}
            style={{ cursor: 'pointer' }}
            filter="url(#partShadow)"
          >
            <motion.g animate={{ opacity: isFaded('dobor') ? 0.15 : 1 }} transition={{ duration: 0.4 }}>
              <rect x="80" y="60" width="16" height="560" rx="2"
                fill={isActive('dobor') ? accentColor : 'hsl(35, 15%, 72%)'}
                className="transition-colors duration-500" />
              <rect x="420" y="60" width="16" height="560" rx="2"
                fill={isActive('dobor') ? accentColor : 'hsl(35, 15%, 72%)'}
                className="transition-colors duration-500" />
              {/* Badge */}
              <circle cx="70" cy="340" r="14" fill={isActive('dobor') ? accentColor : 'hsl(30, 10%, 15%)'} className="transition-colors duration-500" />
              <text x="70" y="345" textAnchor="middle" fill="hsl(38, 33%, 97%)" fontSize="13" fontWeight="700" style={{ fontFamily: "'Oswald', sans-serif" }}>4</text>
            </motion.g>
          </motion.g>

          {/* ⑤ Стоевая — inner frame verticals */}
          <motion.g
            animate={getOffset('stoevaya')}
            transition={springTransition}
            onMouseEnter={() => setHoveredId('stoevaya')}
            onMouseLeave={() => setHoveredId(null)}
            style={{ cursor: 'pointer' }}
            filter="url(#partShadow)"
          >
            <motion.g animate={{ opacity: isFaded('stoevaya') ? 0.15 : 1 }} transition={{ duration: 0.4 }}>
              <rect x="165" y="92" width="10" height="515" rx="1"
                fill={isActive('stoevaya') ? accentColor : 'hsl(30, 12%, 65%)'}
                className="transition-colors duration-500" />
              <rect x="349" y="92" width="10" height="515" rx="1"
                fill={isActive('stoevaya') ? accentColor : 'hsl(30, 12%, 65%)'}
                className="transition-colors duration-500" />
              {/* Badge */}
              <circle cx="450" cy="340" r="14" fill={isActive('stoevaya') ? accentColor : 'hsl(30, 10%, 15%)'} className="transition-colors duration-500" />
              <text x="450" y="345" textAnchor="middle" fill="hsl(38, 33%, 97%)" fontSize="13" fontWeight="700" style={{ fontFamily: "'Oswald', sans-serif" }}>5</text>
            </motion.g>
          </motion.g>

          {/* ⑥ Филёнка — panel inserts */}
          <motion.g
            animate={getOffset('filyonka')}
            transition={springTransition}
            onMouseEnter={() => setHoveredId('filyonka')}
            onMouseLeave={() => setHoveredId(null)}
            style={{ cursor: 'pointer' }}
            filter="url(#partShadow)"
          >
            <motion.g animate={{ opacity: isFaded('filyonka') ? 0.15 : 1 }} transition={{ duration: 0.4 }}>
              {[115, 255, 405].map((py, i) => (
                <rect key={i} x="186" y={py} width="152" height="90" rx="4"
                  fill={isActive('filyonka') ? accentColor : 'hsl(35, 25%, 92%)'}
                  stroke={isActive('filyonka') ? 'hsl(38, 33%, 97%)' : 'hsl(30, 15%, 82%)'}
                  strokeWidth="0.8"
                  className="transition-colors duration-500" />
              ))}
              {/* Badge */}
              <circle cx="262" cy="645" r="14" fill={isActive('filyonka') ? accentColor : 'hsl(30, 10%, 15%)'} className="transition-colors duration-500" />
              <text x="262" y="650" textAnchor="middle" fill="hsl(38, 33%, 97%)" fontSize="13" fontWeight="700" style={{ fontFamily: "'Oswald', sans-serif" }}>6</text>
            </motion.g>
          </motion.g>

          {/* Dimension lines */}
          <g style={{ opacity: exploded ? 0 : 0.5, transition: 'opacity 0.6s ease' }}>
            {/* Height */}
            <line x1="50" y1="42" x2="50" y2="625" stroke="hsl(30, 8%, 55%)" strokeWidth="0.7" strokeDasharray="4,3" />
            <line x1="44" y1="42" x2="56" y2="42" stroke="hsl(30, 8%, 55%)" strokeWidth="0.7" />
            <line x1="44" y1="625" x2="56" y2="625" stroke="hsl(30, 8%, 55%)" strokeWidth="0.7" />
            <text x="38" y="340" fill="hsl(30, 8%, 55%)" fontSize="12" textAnchor="middle" transform="rotate(-90, 38, 340)"
              style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: '0.08em' }}>2080 мм</text>
            {/* Width */}
            <line x1="105" y1="650" x2="414" y2="650" stroke="hsl(30, 8%, 55%)" strokeWidth="0.7" strokeDasharray="4,3" />
            <line x1="105" y1="644" x2="105" y2="656" stroke="hsl(30, 8%, 55%)" strokeWidth="0.7" />
            <line x1="414" y1="644" x2="414" y2="656" stroke="hsl(30, 8%, 55%)" strokeWidth="0.7" />
            <text x="260" y="670" fill="hsl(30, 8%, 55%)" fontSize="12" textAnchor="middle"
              style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: '0.08em' }}>880 мм</text>
          </g>
        </svg>
      </div>

      {/* Right: Parts list */}
      <div className="lg:col-span-2 flex flex-col gap-3">
        <h3
          className="text-xl font-bold uppercase tracking-wider text-foreground mb-2"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          Состав дверного блока
        </h3>

        {parts.map((part) => (
          <motion.div
            key={part.id}
            onMouseEnter={() => setHoveredId(part.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="rounded-xl border border-border cursor-pointer overflow-hidden"
            animate={{
              backgroundColor: isActive(part.id) ? 'hsl(30, 10%, 15%)' : 'hsl(38, 33%, 97%)',
            }}
            transition={{ duration: 0.35 }}
          >
            <div className="px-5 py-4">
              <div className="flex items-start gap-3">
                <motion.span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5"
                  animate={{
                    backgroundColor: isActive(part.id) ? accentColor : 'hsl(30, 10%, 15%)',
                  }}
                  transition={{ duration: 0.35 }}
                  style={{ color: 'hsl(38, 33%, 97%)', fontFamily: "'Oswald', sans-serif" }}
                >
                  {part.num}
                </motion.span>
                <div className="flex-1 min-w-0">
                  <motion.p
                    className="text-sm font-bold"
                    animate={{ color: isActive(part.id) ? 'hsl(38, 33%, 97%)' : 'hsl(30, 10%, 15%)' }}
                    transition={{ duration: 0.35 }}
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    {part.label}
                  </motion.p>
                  <motion.p
                    className="text-xs font-mono mt-0.5"
                    animate={{ color: isActive(part.id) ? 'hsl(35, 30%, 70%)' : 'hsl(30, 8%, 55%)' }}
                    transition={{ duration: 0.35 }}
                  >
                    {part.dimensions}
                  </motion.p>
                  <AnimatePresence>
                    {isActive(part.id) && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-xs leading-relaxed mt-2 overflow-hidden"
                        style={{ color: 'hsl(35, 20%, 70%)' }}
                      >
                        {part.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DoorExplodedSVG;
