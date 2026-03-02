import { useState } from 'react';
import { motion } from 'framer-motion';

interface DoorComponent {
  id: string;
  label: string;
  dimensions: string;
  description: string;
}

const doorComponents: DoorComponent[] = [
  { id: 'dobor', label: 'Доборный брус', dimensions: '15×100/150/200×2080 мм', description: 'Расширяет коробку при толстых стенах' },
  { id: 'korobka', label: 'Коробка', dimensions: '40×74×2080 мм', description: 'П-образная рама, основа дверного блока' },
  { id: 'nalichnik', label: 'Наличник', dimensions: '10×70×2150 мм', description: 'Декоративная планка, закрывает зазор между коробкой и стеной' },
  { id: 'polotno', label: 'Дверное полотно', dimensions: '36×800×2000 мм', description: 'Основной элемент — створка двери' },
  { id: 'stoevaya', label: 'Продольная стоевая', dimensions: '40×74×2000 мм', description: 'Деталь вертикальной обвязки полотна' },
  { id: 'filyonka', label: 'Филёнка', dimensions: 'По модели', description: 'Деталь заполнения полотна' },
];

interface DoorExplodedSVGProps {
  accentColor?: string;
}

const DoorExplodedSVG = ({ accentColor = '#8B7355' }: DoorExplodedSVGProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const isActive = (id: string) => hoveredId === id;

  const componentStyle = (id: string) => ({
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    filter: isActive(id) ? `drop-shadow(0 0 8px ${accentColor})` : 'none',
    opacity: hoveredId && !isActive(id) ? 0.35 : 1,
  });

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* SVG Schema */}
        <div className="flex-1 w-full max-w-md mx-auto lg:mx-0">
          <svg
            viewBox="0 0 400 500"
            className="w-full h-auto"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background */}
            <rect width="400" height="500" fill="transparent" />

            {/* Dobor (leftmost, behind everything) */}
            <g
              onMouseEnter={() => setHoveredId('dobor')}
              onMouseLeave={() => setHoveredId(null)}
              style={componentStyle('dobor')}
            >
              <rect x="40" y="30" width="12" height="400" rx="1"
                fill={isActive('dobor') ? accentColor : '#E8E4DE'} stroke="#999" strokeWidth="0.8" />
              <rect x="54" y="30" width="12" height="400" rx="1"
                fill={isActive('dobor') ? accentColor : '#DDD8D0'} stroke="#999" strokeWidth="0.8" />
              <rect x="68" y="30" width="15" height="400" rx="1"
                fill={isActive('dobor') ? accentColor : '#D0CBC3'} stroke="#999" strokeWidth="0.8" />
            </g>

            {/* Korobka (frame - П shape) */}
            <g
              onMouseEnter={() => setHoveredId('korobka')}
              onMouseLeave={() => setHoveredId(null)}
              style={componentStyle('korobka')}
            >
              {/* Left jamb */}
              <rect x="100" y="25" width="16" height="420" rx="1"
                fill={isActive('korobka') ? accentColor : '#6B5B45'} stroke="#444" strokeWidth="0.8" />
              {/* Top */}
              <rect x="100" y="25" width="140" height="16" rx="1"
                fill={isActive('korobka') ? accentColor : '#6B5B45'} stroke="#444" strokeWidth="0.8" />
              {/* Right jamb */}
              <rect x="224" y="25" width="16" height="420" rx="1"
                fill={isActive('korobka') ? accentColor : '#6B5B45'} stroke="#444" strokeWidth="0.8" />
            </g>

            {/* Nalichnik (trim pieces, outer) */}
            <g
              onMouseEnter={() => setHoveredId('nalichnik')}
              onMouseLeave={() => setHoveredId(null)}
              style={componentStyle('nalichnik')}
            >
              {/* Left */}
              <rect x="250" y="55" width="8" height="380" rx="1"
                fill={isActive('nalichnik') ? accentColor : '#F0ECE4'} stroke="#AAA" strokeWidth="0.8" />
              {/* Right */}
              <rect x="262" y="55" width="8" height="380" rx="1"
                fill={isActive('nalichnik') ? accentColor : '#E8E4DC'} stroke="#AAA" strokeWidth="0.8" />
              {/* Top piece */}
              <rect x="250" y="43" width="40" height="8" rx="1"
                fill={isActive('nalichnik') ? accentColor : '#F0ECE4'} stroke="#AAA" strokeWidth="0.8" />
            </g>

            {/* Polotno (door slab) */}
            <g
              onMouseEnter={() => setHoveredId('polotno')}
              onMouseLeave={() => setHoveredId(null)}
              style={componentStyle('polotno')}
            >
              <rect x="295" y="50" width="55" height="380" rx="2"
                fill={isActive('polotno') ? accentColor : '#F5F1EB'} stroke="#888" strokeWidth="1" />
              {/* Panel details */}
              <rect x="305" y="70" width="35" height="100" rx="1"
                fill="none" stroke={isActive('polotno') ? '#fff' : '#CCC'} strokeWidth="0.8" />
              <rect x="305" y="190" width="35" height="100" rx="1"
                fill="none" stroke={isActive('polotno') ? '#fff' : '#CCC'} strokeWidth="0.8" />
              <rect x="305" y="310" width="35" height="100" rx="1"
                fill="none" stroke={isActive('polotno') ? '#fff' : '#CCC'} strokeWidth="0.8" />
              {/* Handle */}
              <rect x="340" y="230" width="4" height="20" rx="2"
                fill={isActive('polotno') ? '#D4AF37' : '#B8A070'} />
            </g>

            {/* Stoevaya (vertical rail, shown separately) */}
            <g
              onMouseEnter={() => setHoveredId('stoevaya')}
              onMouseLeave={() => setHoveredId(null)}
              style={componentStyle('stoevaya')}
            >
              <rect x="362" y="80" width="10" height="330" rx="1"
                fill={isActive('stoevaya') ? accentColor : '#E0DACE'} stroke="#999" strokeWidth="0.8" />
              {/* Rail detail */}
              <line x1="367" y1="100" x2="367" y2="390" stroke={isActive('stoevaya') ? '#fff' : '#BBB'} strokeWidth="0.5" />
            </g>

            {/* Filyonka (panel insert, shown separately) */}
            <g
              onMouseEnter={() => setHoveredId('filyonka')}
              onMouseLeave={() => setHoveredId(null)}
              style={componentStyle('filyonka')}
            >
              <rect x="340" y="458" width="45" height="32" rx="1"
                fill={isActive('filyonka') ? accentColor : '#F8F4EE'} stroke="#AAA" strokeWidth="0.8" />
              <rect x="347" y="463" width="31" height="22" rx="1"
                fill="none" stroke={isActive('filyonka') ? '#fff' : '#D0D0D0'} strokeWidth="0.6" />
            </g>

            {/* Dimension lines */}
            {/* Overall height line */}
            <line x1="25" y1="30" x2="25" y2="430" stroke="#999" strokeWidth="0.5" strokeDasharray="3,3" />
            <line x1="20" y1="30" x2="30" y2="30" stroke="#999" strokeWidth="0.5" />
            <line x1="20" y1="430" x2="30" y2="430" stroke="#999" strokeWidth="0.5" />
            <text x="12" y="235" fill="#999" fontSize="8" transform="rotate(-90, 12, 235)" textAnchor="middle" fontFamily="'Oswald', sans-serif">2080 мм</text>

            {/* Polotno height */}
            <line x1="355" y1="50" x2="355" y2="430" stroke="#999" strokeWidth="0.5" strokeDasharray="3,3" />
            <text x="356" y="460" fill="#999" fontSize="7" textAnchor="middle" fontFamily="'Oswald', sans-serif">2000</text>
          </svg>
        </div>

        {/* Specs table */}
        <div className="flex-1 w-full">
          <h3
            className="text-lg font-bold uppercase tracking-wider text-foreground mb-4"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Компоненты дверного блока
          </h3>
          <div className="space-y-1">
            {doorComponents.map((comp) => (
              <motion.div
                key={comp.id}
                onMouseEnter={() => setHoveredId(comp.id)}
                onMouseLeave={() => setHoveredId(null)}
                animate={{
                  backgroundColor: isActive(comp.id)
                    ? 'hsl(30, 10%, 15%)'
                    : 'transparent',
                  color: isActive(comp.id)
                    ? 'hsl(38, 33%, 97%)'
                    : 'hsl(30, 10%, 15%)',
                }}
                transition={{ duration: 0.2 }}
                className="flex items-start justify-between px-4 py-3 rounded-md cursor-pointer border border-transparent hover:border-border"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ fontFamily: "'Oswald', sans-serif" }}>
                    {comp.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${isActive(comp.id) ? 'opacity-70' : 'text-muted-foreground'}`}>
                    {comp.description}
                  </p>
                </div>
                <span className="text-xs font-mono whitespace-nowrap ml-4 mt-0.5 shrink-0">
                  {comp.dimensions}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoorExplodedSVG;
