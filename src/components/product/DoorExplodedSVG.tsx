import { useState } from 'react';
import { Info } from 'lucide-react';

interface DoorPart {
  id: string;
  label: string;
  dimensions: string;
  tip: string; // понятная подсказка для покупателя
  // SVG isometric box params: cx, cy, w, h, d
  boxes: { cx: number; cy: number; w: number; h: number; d: number; top: string; front: string; side: string }[];
  // How much to shift when "exploded" (dx, dy)
  shift: [number, number];
  // Leader line endpoint on the schema (from shifted position)
  leaderTo: [number, number];
  // Extra elements (panel grooves, handle, etc.)
  extras?: 'panels' | 'filyonka-inner';
}

const parts: DoorPart[] = [
  {
    id: 'dobor', label: 'Доборный брус', dimensions: '15×100–200×2080 мм',
    tip: 'Нужен, если стена толще стандартной. Расширяет коробку, чтобы дверь закрывала весь проём.',
    boxes: [
      { cx: 155, cy: 100, w: 8, h: 220, d: 12, top: '#E8E4DE', front: '#D8D4CE', side: '#C8C4BE' },
      { cx: 167, cy: 94, w: 8, h: 220, d: 12, top: '#E0DCD6', front: '#D0CCC6', side: '#C0BCB6' },
      { cx: 179, cy: 88, w: 10, h: 220, d: 14, top: '#D8D4CE', front: '#C8C4BE', side: '#B8B4AE' },
    ],
    shift: [-70, 0],
    leaderTo: [90, 200],
  },
  {
    id: 'korobka', label: 'Коробка', dimensions: '40×74×2080 мм',
    tip: 'Рама, в которую вставляется дверь. Крепится к стене проёма. Без неё дверь не установить.',
    boxes: [
      { cx: 210, cy: 72, w: 14, h: 240, d: 16, top: '#7B6B55', front: '#6B5B45', side: '#5B4B35' },
      { cx: 210, cy: 72, w: 75, h: 14, d: 16, top: '#7B6B55', front: '#6B5B45', side: '#5B4B35' },
      { cx: 275, cy: 110, w: 14, h: 200, d: 16, top: '#7B6B55', front: '#6B5B45', side: '#5B4B35' },
    ],
    shift: [-20, -15],
    leaderTo: [195, 120],
  },
  {
    id: 'nalichnik', label: 'Наличники', dimensions: '10×70×2150 мм',
    tip: 'Декоративные планки, которые закрывают щель между коробкой и стеной. Придают двери законченный вид.',
    boxes: [
      { cx: 310, cy: 88, w: 6, h: 230, d: 10, top: '#F0ECE4', front: '#E8E4DC', side: '#D8D4CC' },
      { cx: 320, cy: 82, w: 6, h: 230, d: 10, top: '#EDE9E1', front: '#E5E1D9', side: '#D5D1C9' },
      { cx: 310, cy: 84, w: 25, h: 6, d: 10, top: '#F0ECE4', front: '#E8E4DC', side: '#D8D4CC' },
    ],
    shift: [15, -10],
    leaderTo: [340, 130],
  },
  {
    id: 'polotno', label: 'Дверное полотно', dimensions: '36×800×2000 мм',
    tip: 'Сама дверь — то, что открывается и закрывается. Бывает глухая или со стеклом.',
    boxes: [
      { cx: 355, cy: 70, w: 50, h: 240, d: 10, top: '#F5F1EB', front: '#EDE9E3', side: '#E0DCD6' },
    ],
    shift: [30, 0],
    leaderTo: [410, 190],
    extras: 'panels',
  },
  {
    id: 'stoevaya', label: 'Стоевая', dimensions: '40×74×2000 мм',
    tip: 'Вертикальная часть каркаса полотна. Обеспечивает прочность двери.',
    boxes: [
      { cx: 425, cy: 80, w: 8, h: 220, d: 12, top: '#E0DACE', front: '#D0CAC0', side: '#C0BAB0' },
    ],
    shift: [50, 5],
    leaderTo: [490, 180],
  },
  {
    id: 'filyonka', label: 'Филёнка', dimensions: 'По модели',
    tip: 'Вставка в полотно — может быть из МДФ, стекла или шпона. Определяет внешний вид двери.',
    boxes: [
      { cx: 440, cy: 290, w: 35, h: 28, d: 6, top: '#F8F4EE', front: '#F0ECE6', side: '#E8E4DE' },
    ],
    shift: [45, 25],
    leaderTo: [500, 310],
    extras: 'filyonka-inner',
  },
];

interface DoorExplodedSVGProps {
  accentColor?: string;
}

const DoorExplodedSVG = ({ accentColor = '#8B7355' }: DoorExplodedSVGProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipId, setTooltipId] = useState<string | null>(null);

  const isActive = (id: string) => hoveredId === id;
  const dimmed = (id: string) => hoveredId !== null && !isActive(id);

  const rx = 0.866;
  const ry = 0.5;

  const isoPolygons = (
    cx: number, cy: number,
    w: number, h: number, d: number,
    fillTop: string, fillFront: string, fillSide: string,
    active: boolean,
  ) => {
    const topPts = `${cx},${cy} ${cx + w * rx},${cy + w * ry} ${cx + w * rx - d * rx},${cy + w * ry - d * ry} ${cx - d * rx},${cy - d * ry}`;
    const frontPts = `${cx},${cy} ${cx + w * rx},${cy + w * ry} ${cx + w * rx},${cy + w * ry + h} ${cx},${cy + h}`;
    const sidePts = `${cx},${cy} ${cx - d * rx},${cy - d * ry} ${cx - d * rx},${cy - d * ry + h} ${cx},${cy + h}`;

    return (
      <>
        <polygon points={sidePts} fill={active ? accentColor : fillSide} stroke="#666" strokeWidth="0.5"
          style={{ transition: 'fill 0.6s ease' }} />
        <polygon points={frontPts} fill={active ? accentColor : fillFront} stroke="#666" strokeWidth="0.5"
          style={{ transition: 'fill 0.6s ease' }} />
        <polygon points={topPts} fill={active ? accentColor : fillTop} stroke="#666" strokeWidth="0.5"
          style={{ transition: 'fill 0.6s ease' }} />
      </>
    );
  };

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* SVG */}
        <div className="flex-1 w-full max-w-xl mx-auto lg:mx-0">
          <svg viewBox="30 20 520 350" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">

            {parts.map((part) => {
              const active = isActive(part.id);
              const faded = dimmed(part.id);
              const [dx, dy] = active ? part.shift : [0, 0];

              return (
                <g
                  key={part.id}
                  onMouseEnter={() => setHoveredId(part.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    transform: `translate(${dx}px, ${dy}px)`,
                    opacity: faded ? 0.15 : 1,
                    transition: 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease',
                    cursor: 'pointer',
                  }}
                >
                  {part.boxes.map((box, i) =>
                    <g key={i}>
                      {isoPolygons(box.cx, box.cy, box.w, box.h, box.d, box.top, box.front, box.side, active)}
                    </g>
                  )}

                  {/* Panel grooves for polotno */}
                  {part.extras === 'panels' && (() => {
                    const cx = 355, baseY = 70;
                    return [25, 90, 155].map((offy, i) => {
                      const x1 = cx + 6 * rx, y1 = baseY + 6 * ry + offy;
                      const x2 = cx + 44 * rx, y2 = baseY + 44 * ry + offy;
                      const pts = `${x1},${y1} ${x2},${y2} ${x2},${y2 + 50} ${x1},${y1 + 50}`;
                      return <polygon key={i} points={pts} fill="none" stroke={active ? '#fff' : '#CCC'} strokeWidth="0.5"
                        style={{ transition: 'stroke 0.6s ease' }} />;
                    });
                  })()}

                  {/* Handle for polotno */}
                  {part.extras === 'panels' && (
                    <rect x={355 + 45 * rx - 2} y={70 + 45 * ry + 100} width={4} height={14} rx={2}
                      fill={active ? '#D4AF37' : '#B8A070'} style={{ transition: 'fill 0.6s ease' }} />
                  )}

                  {/* Filyonka inner */}
                  {part.extras === 'filyonka-inner' && (() => {
                    const cx = 440, cy = 290;
                    const pts = `${cx + 5 * rx},${cy + 5 * ry + 4} ${cx + 30 * rx},${cy + 30 * ry + 4} ${cx + 30 * rx},${cy + 30 * ry + 20} ${cx + 5 * rx},${cy + 5 * ry + 20}`;
                    return <polygon points={pts} fill="none" stroke={active ? '#fff' : '#D0D0D0'} strokeWidth="0.5"
                      style={{ transition: 'stroke 0.6s ease' }} />;
                  })()}

                  {/* Leader line + label when active */}
                  {active && (
                    <g style={{ opacity: 1, transition: 'opacity 0.4s ease 0.2s' }}>
                      {/* Dashed leader line from center of component to label point */}
                      <line
                        x1={part.leaderTo[0] + dx}
                        y1={part.leaderTo[1] + dy}
                        x2={part.leaderTo[0] + dx + (dx < 0 ? -30 : 30)}
                        y2={part.leaderTo[1] + dy - 20}
                        stroke={accentColor}
                        strokeWidth="1"
                        strokeDasharray="3,2"
                      />
                      <circle
                        cx={part.leaderTo[0] + dx}
                        cy={part.leaderTo[1] + dy}
                        r="3"
                        fill={accentColor}
                      />
                    </g>
                  )}
                </g>
              );
            })}

            {/* Dimension line — height */}
            <line x1="130" y1="100" x2="130" y2="320" stroke="#BBB" strokeWidth="0.4" strokeDasharray="2,2" />
            <line x1="125" y1="100" x2="135" y2="100" stroke="#BBB" strokeWidth="0.4" />
            <line x1="125" y1="320" x2="135" y2="320" stroke="#BBB" strokeWidth="0.4" />
            <text x="120" y="215" fill="#AAA" fontSize="7" textAnchor="middle" transform="rotate(-90, 120, 215)"
              style={{ fontFamily: "'Oswald', sans-serif" }}>2080 мм</text>

          </svg>
        </div>

        {/* Table with tooltips */}
        <div className="flex-1 w-full">
          <h3
            className="text-lg font-bold uppercase tracking-wider text-foreground mb-4"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Из чего состоит дверной блок
          </h3>
          <div className="space-y-1">
            {parts.map((part) => (
              <div
                key={part.id}
                onMouseEnter={() => setHoveredId(part.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="rounded-lg border border-transparent"
                style={{
                  backgroundColor: isActive(part.id) ? 'hsl(30, 10%, 15%)' : 'transparent',
                  color: isActive(part.id) ? 'hsl(38, 33%, 97%)' : 'inherit',
                  borderColor: isActive(part.id) ? 'hsl(30, 10%, 25%)' : 'transparent',
                  transition: 'background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease',
                }}
              >
                <div className="flex items-start justify-between px-4 py-3 cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold" style={{ fontFamily: "'Oswald', sans-serif" }}>
                        {part.label}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTooltipId(tooltipId === part.id ? null : part.id);
                        }}
                        className="shrink-0"
                        aria-label="Подробнее"
                      >
                        <Info className="w-3.5 h-3.5" style={{
                          color: isActive(part.id) ? 'hsl(38, 33%, 80%)' : 'hsl(30, 8%, 65%)',
                          transition: 'color 0.5s ease',
                        }} />
                      </button>
                    </div>
                    <p
                      className="text-xs mt-0.5"
                      style={{
                        color: isActive(part.id) ? 'hsl(38, 33%, 75%)' : 'hsl(30, 8%, 55%)',
                        transition: 'color 0.5s ease',
                      }}
                    >
                      {part.dimensions}
                    </p>
                  </div>
                </div>

                {/* Tooltip / expanded info */}
                <div
                  style={{
                    maxHeight: tooltipId === part.id || isActive(part.id) ? '80px' : '0',
                    opacity: tooltipId === part.id || isActive(part.id) ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.5s ease, opacity 0.4s ease',
                  }}
                >
                  <p
                    className="px-4 pb-3 text-xs leading-relaxed"
                    style={{
                      color: isActive(part.id) ? 'hsl(38, 33%, 70%)' : 'hsl(30, 8%, 50%)',
                      transition: 'color 0.5s ease',
                    }}
                  >
                    💡 {part.tip}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoorExplodedSVG;
