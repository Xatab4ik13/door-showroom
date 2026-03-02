import { useState } from 'react';

interface DoorComponent {
  id: string;
  label: string;
  dimensions: string;
  description: string;
}

const doorComponents: DoorComponent[] = [
  { id: 'dobor', label: 'Доборный брус', dimensions: '15×100/150/200×2080 мм', description: 'Расширяет коробку при толстых стенах' },
  { id: 'korobka', label: 'Коробка', dimensions: '40×74×2080 мм', description: 'П-образная рама, основа дверного блока' },
  { id: 'nalichnik', label: 'Наличник', dimensions: '10×70×2150 мм', description: 'Декоративная планка, закрывает зазор' },
  { id: 'polotno', label: 'Дверное полотно', dimensions: '36×800×2000 мм', description: 'Основной элемент — створка двери' },
  { id: 'stoevaya', label: 'Продольная стоевая', dimensions: '40×74×2000 мм', description: 'Деталь вертикальной обвязки полотна' },
  { id: 'filyonka', label: 'Филёнка', dimensions: 'По модели', description: 'Деталь заполнения полотна' },
];

interface DoorExplodedSVGProps {
  accentColor?: string;
}

/*
  Isometric helpers — 30° projection.
  In true isometric the X-axis goes right-down at 30°,
  Y-axis goes left-down at 30°, and Z goes straight up.
  We draw a flat SVG and use transforms to fake it.
*/

const DoorExplodedSVG = ({ accentColor = '#8B7355' }: DoorExplodedSVGProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const isActive = (id: string) => hoveredId === id;
  const dimmed = (id: string) => hoveredId !== null && !isActive(id);

  // Isometric face drawing helpers
  // For a box at position (cx, cy) with width w, height h, depth d
  const isoBox = (
    id: string,
    cx: number, cy: number,
    w: number, h: number, d: number,
    fillTop: string, fillFront: string, fillSide: string,
    activeColor: string,
  ) => {
    const active = isActive(id);
    const faded = dimmed(id);

    // Isometric unit vectors
    const rx = 0.866; // cos(30°)
    const ry = 0.5;   // sin(30°)

    // 4 corners of top face
    const topPts = [
      [cx, cy],
      [cx + w * rx, cy + w * ry],
      [cx + w * rx - d * rx, cy + w * ry - d * ry],
      [cx - d * rx, cy - d * ry],
    ].map(p => p.join(',')).join(' ');

    // Front face
    const frontPts = [
      [cx, cy],
      [cx + w * rx, cy + w * ry],
      [cx + w * rx, cy + w * ry + h],
      [cx, cy + h],
    ].map(p => p.join(',')).join(' ');

    // Side face
    const sidePts = [
      [cx, cy],
      [cx - d * rx, cy - d * ry],
      [cx - d * rx, cy - d * ry + h],
      [cx, cy + h],
    ].map(p => p.join(',')).join(' ');

    const opacity = faded ? 0.2 : 1;
    const glow = active ? `drop-shadow(0 0 6px ${activeColor})` : 'none';

    return (
      <g
        key={id + cx + cy}
        onMouseEnter={() => setHoveredId(id)}
        onMouseLeave={() => setHoveredId(null)}
        style={{
          cursor: 'pointer',
          opacity,
          filter: glow,
          transition: 'opacity 0.5s ease, filter 0.5s ease',
        }}
      >
        {/* Side */}
        <polygon points={sidePts} fill={active ? activeColor : fillSide} stroke="#666" strokeWidth="0.5"
          style={{ transition: 'fill 0.5s ease' }} />
        {/* Front */}
        <polygon points={frontPts} fill={active ? activeColor : fillFront} stroke="#666" strokeWidth="0.5"
          style={{ transition: 'fill 0.5s ease' }} />
        {/* Top */}
        <polygon points={topPts} fill={active ? activeColor : fillTop} stroke="#666" strokeWidth="0.5"
          style={{ transition: 'fill 0.5s ease' }} />
      </g>
    );
  };

  // Layout: components spread left-to-right in isometric space
  // Each component is a set of isoBox calls

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* SVG Isometric Schema */}
        <div className="flex-1 w-full max-w-lg mx-auto lg:mx-0">
          <svg viewBox="0 0 520 420" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">

            {/* === Doborный брус (3 планки, leftmost) === */}
            <g>
              {isoBox('dobor', 60, 130, 8, 240, 12, '#E8E4DE', '#D8D4CE', '#C8C4BE', accentColor)}
              {isoBox('dobor', 75, 123, 8, 240, 12, '#E0DCD6', '#D0CCC6', '#C0BCB6', accentColor)}
              {isoBox('dobor', 90, 116, 10, 240, 14, '#D8D4CE', '#C8C4BE', '#B8B4AE', accentColor)}
            </g>

            {/* === Коробка (П-shape: 2 jambs + header) === */}
            <g>
              {/* Left jamb */}
              {isoBox('korobka', 130, 95, 14, 260, 16, '#7B6B55', '#6B5B45', '#5B4B35', accentColor)}
              {/* Header */}
              {isoBox('korobka', 130, 95, 80, 14, 16, '#7B6B55', '#6B5B45', '#5B4B35', accentColor)}
              {/* Right jamb */}
              {isoBox('korobka', 199, 135, 14, 220, 16, '#7B6B55', '#6B5B45', '#5B4B35', accentColor)}
            </g>

            {/* === Наличники (тонкие планки) === */}
            <g>
              {isoBox('nalichnik', 250, 115, 6, 250, 10, '#F0ECE4', '#E8E4DC', '#D8D4CC', accentColor)}
              {isoBox('nalichnik', 262, 108, 6, 250, 10, '#EDE9E1', '#E5E1D9', '#D5D1C9', accentColor)}
              {/* Top casing */}
              {isoBox('nalichnik', 250, 110, 30, 6, 10, '#F0ECE4', '#E8E4DC', '#D8D4CC', accentColor)}
            </g>

            {/* === Дверное полотно (main slab) === */}
            <g>
              {isoBox('polotno', 300, 95, 55, 260, 10, '#F5F1EB', '#EDE9E3', '#E0DCD6', accentColor)}
              {/* Panel grooves on front face */}
              {(() => {
                const active = isActive('polotno');
                const faded = dimmed('polotno');
                const rx = 0.866;
                const ry = 0.5;
                const cx = 300, baseY = 95;
                const panels = [
                  { offy: 25, h: 60 },
                  { offy: 100, h: 60 },
                  { offy: 175, h: 60 },
                ];
                return panels.map((p, i) => {
                  const x1 = cx + 8 * rx;
                  const y1 = baseY + 8 * ry + p.offy;
                  const x2 = cx + 47 * rx;
                  const y2 = baseY + 47 * ry + p.offy;
                  const pts = [
                    [x1, y1],
                    [x2, y2],
                    [x2, y2 + p.h],
                    [x1, y1 + p.h],
                  ].map(pt => pt.join(',')).join(' ');
                  return (
                    <polygon
                      key={i}
                      points={pts}
                      fill="none"
                      stroke={active ? '#fff' : '#CCC'}
                      strokeWidth="0.6"
                      style={{
                        opacity: faded ? 0.2 : 1,
                        transition: 'opacity 0.5s ease, stroke 0.5s ease',
                      }}
                    />
                  );
                });
              })()}
              {/* Handle */}
              {(() => {
                const active = isActive('polotno');
                const faded = dimmed('polotno');
                const rx = 0.866;
                const ry = 0.5;
                const hx = 300 + 48 * rx;
                const hy = 95 + 48 * ry + 115;
                return (
                  <rect
                    x={hx - 2} y={hy} width={4} height={14} rx={2}
                    fill={active ? '#D4AF37' : '#B8A070'}
                    style={{
                      opacity: faded ? 0.2 : 1,
                      transition: 'opacity 0.5s ease, fill 0.5s ease',
                    }}
                  />
                );
              })()}
            </g>

            {/* === Продольная стоевая === */}
            {isoBox('stoevaya', 380, 105, 8, 240, 12, '#E0DACE', '#D0CAC0', '#C0BAB0', accentColor)}

            {/* === Филёнка === */}
            {isoBox('filyonka', 410, 310, 35, 28, 6, '#F8F4EE', '#F0ECE6', '#E8E4DE', accentColor)}
            {/* Inner panel line */}
            {(() => {
              const active = isActive('filyonka');
              const faded = dimmed('filyonka');
              const rx = 0.866;
              const ry = 0.5;
              const cx = 410, cy = 310;
              const pts = [
                [cx + 5 * rx, cy + 5 * ry + 4],
                [cx + 30 * rx, cy + 30 * ry + 4],
                [cx + 30 * rx, cy + 30 * ry + 20],
                [cx + 5 * rx, cy + 5 * ry + 20],
              ].map(p => p.join(',')).join(' ');
              return (
                <polygon
                  points={pts} fill="none"
                  stroke={active ? '#fff' : '#D0D0D0'} strokeWidth="0.5"
                  style={{ opacity: faded ? 0.2 : 1, transition: 'opacity 0.5s ease' }}
                />
              );
            })()}

            {/* Dimension annotation — overall height */}
            <line x1="42" y1="130" x2="42" y2="370" stroke="#AAA" strokeWidth="0.4" strokeDasharray="2,2" />
            <line x1="37" y1="130" x2="47" y2="130" stroke="#AAA" strokeWidth="0.4" />
            <line x1="37" y1="370" x2="47" y2="370" stroke="#AAA" strokeWidth="0.4" />
            <text x="30" y="255" fill="#999" fontSize="7" textAnchor="middle" transform="rotate(-90, 30, 255)"
              style={{ fontFamily: "'Oswald', sans-serif" }}>2080 мм</text>

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
              <div
                key={comp.id}
                onMouseEnter={() => setHoveredId(comp.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="flex items-start justify-between px-4 py-3 rounded-md cursor-pointer border border-transparent hover:border-border"
                style={{
                  backgroundColor: isActive(comp.id) ? 'hsl(30, 10%, 15%)' : 'transparent',
                  color: isActive(comp.id) ? 'hsl(38, 33%, 97%)' : 'inherit',
                  transition: 'background-color 0.4s ease, color 0.4s ease',
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ fontFamily: "'Oswald', sans-serif" }}>
                    {comp.label}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{
                      opacity: isActive(comp.id) ? 0.7 : 1,
                      color: isActive(comp.id) ? 'inherit' : 'hsl(30, 8%, 55%)',
                      transition: 'color 0.4s ease, opacity 0.4s ease',
                    }}
                  >
                    {comp.description}
                  </p>
                </div>
                <span className="text-xs font-mono whitespace-nowrap ml-4 mt-0.5 shrink-0">
                  {comp.dimensions}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoorExplodedSVG;
