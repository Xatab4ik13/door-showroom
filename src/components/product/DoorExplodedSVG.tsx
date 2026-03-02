import { useState } from 'react';

interface DoorPart {
  id: string;
  label: string;
  dimensions: string;
  tip: string;
  num: number;
}

const parts: DoorPart[] = [
  { id: 'dobor', label: 'Доборный брус', dimensions: '15×100–200×2080 мм', tip: 'Нужен, если стена толще стандартной. Расширяет коробку, чтобы дверь закрывала весь проём.', num: 1 },
  { id: 'korobka', label: 'Коробка', dimensions: '40×74×2080 мм', tip: 'Рама, в которую вставляется дверь. Крепится к стене проёма. Без неё дверь не установить.', num: 2 },
  { id: 'nalichnik', label: 'Наличники', dimensions: '10×70×2150 мм', tip: 'Декоративные планки, которые закрывают щель между коробкой и стеной.', num: 3 },
  { id: 'polotno', label: 'Дверное полотно', dimensions: '36×800×2000 мм', tip: 'Сама дверь — то, что открывается и закрывается. Бывает глухая или со стеклом.', num: 4 },
  { id: 'stoevaya', label: 'Стоевая', dimensions: '40×74×2000 мм', tip: 'Вертикальная часть каркаса полотна. Обеспечивает прочность двери.', num: 5 },
  { id: 'filyonka', label: 'Филёнка', dimensions: 'По модели', tip: 'Вставка в полотно — может быть из МДФ, стекла или шпона. Определяет дизайн двери.', num: 6 },
];

interface Props {
  accentColor?: string;
}

const DoorExplodedSVG = ({ accentColor = '#8B7355' }: Props) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const active = (id: string) => hoveredId === id;
  const faded = (id: string) => hoveredId !== null && hoveredId !== id;

  // Shared transition
  const tr = 'transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.6s ease, fill 0.6s ease';

  const gStyle = (id: string, shiftX: number, shiftY: number): React.CSSProperties => ({
    transform: active(id) ? `translate(${shiftX}px, ${shiftY}px)` : 'translate(0,0)',
    opacity: faded(id) ? 0.12 : 1,
    transition: tr,
    cursor: 'pointer',
  });

  const fill = (id: string, normal: string) => active(id) ? accentColor : normal;
  const stroke = (id: string) => active(id) ? accentColor : '#888';

  // Isometric helpers
  const cos30 = 0.866;
  const sin30 = 0.5;

  // Draw a 3-face isometric box
  const box = (
    id: string, x: number, y: number, w: number, h: number, d: number,
    cTop: string, cFront: string, cSide: string,
  ) => {
    const t1 = `${x},${y}`;
    const t2 = `${x + w * cos30},${y + w * sin30}`;
    const t3 = `${x + w * cos30 - d * cos30},${y + w * sin30 - d * sin30}`;
    const t4 = `${x - d * cos30},${y - d * sin30}`;

    const f1 = t1;
    const f2 = t2;
    const f3 = `${x + w * cos30},${y + w * sin30 + h}`;
    const f4 = `${x},${y + h}`;

    const s1 = t1;
    const s2 = t4;
    const s3 = `${x - d * cos30},${y - d * sin30 + h}`;
    const s4 = f4;

    return (
      <>
        <polygon points={`${s1} ${s2} ${s3} ${s4}`} fill={fill(id, cSide)} stroke="#555" strokeWidth="0.6" style={{ transition: 'fill 0.6s ease' }} />
        <polygon points={`${f1} ${f2} ${f3} ${f4}`} fill={fill(id, cFront)} stroke="#555" strokeWidth="0.6" style={{ transition: 'fill 0.6s ease' }} />
        <polygon points={`${t1} ${t2} ${t3} ${t4}`} fill={fill(id, cTop)} stroke="#555" strokeWidth="0.6" style={{ transition: 'fill 0.6s ease' }} />
      </>
    );
  };

  // Number badge on SVG
  const badge = (id: string, num: number, cx: number, cy: number, shiftX: number, shiftY: number) => {
    const ax = active(id) ? cx + shiftX : cx;
    const ay = active(id) ? cy + shiftY : cy;
    return (
      <g style={{ transition: tr, transform: active(id) ? `translate(${shiftX}px, ${shiftY}px)` : 'translate(0,0)' }}>
        <circle cx={cx} cy={cy} r="12" fill={active(id) ? accentColor : 'hsl(30,10%,15%)'} style={{ transition: 'fill 0.6s ease' }} />
        <text x={cx} y={cy + 4.5} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700"
          style={{ fontFamily: "'Oswald', sans-serif" }}>{num}</text>
      </g>
    );
  };

  return (
    <div className="w-full">
      {/* Full-width SVG schema */}
      <div className="w-full mb-8">
        <svg viewBox="0 0 900 520" className="w-full h-auto" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
          
          {/* ① Доборный брус — 3 планки, far left */}
          <g style={gStyle('dobor', -60, 0)}
            onMouseEnter={() => setHoveredId('dobor')}
            onMouseLeave={() => setHoveredId(null)}>
            {box('dobor', 80, 100, 14, 360, 18, '#E8E4DE', '#DAD6CE', '#CBC7BF')}
            {box('dobor', 100, 90, 14, 360, 18, '#E2DED6', '#D4D0C8', '#C5C1B9')}
            {box('dobor', 120, 80, 18, 360, 22, '#DCD8D0', '#CEC9C2', '#BFB9B3')}
            {badge('dobor', 1, 95, 75, -60, 0)}
          </g>

          {/* ② Коробка — П-frame */}
          <g style={gStyle('korobka', -25, -20)}
            onMouseEnter={() => setHoveredId('korobka')}
            onMouseLeave={() => setHoveredId(null)}>
            {/* Left jamb */}
            {box('korobka', 185, 55, 22, 400, 24, '#7B6B55', '#6B5B45', '#5B4B35')}
            {/* Header */}
            {box('korobka', 185, 55, 130, 20, 24, '#7B6B55', '#6B5B45', '#5B4B35')}
            {/* Right jamb */}
            {box('korobka', 298, 120, 22, 330, 24, '#7B6B55', '#6B5B45', '#5B4B35')}
            {badge('korobka', 2, 210, 42, -25, -20)}
          </g>

          {/* ③ Наличники */}
          <g style={gStyle('nalichnik', 15, -15)}
            onMouseEnter={() => setHoveredId('nalichnik')}
            onMouseLeave={() => setHoveredId(null)}>
            {box('nalichnik', 360, 75, 10, 380, 14, '#F2EEE6', '#EAE6DE', '#DBD7CF')}
            {box('nalichnik', 378, 65, 10, 380, 14, '#EFEBE3', '#E7E3DB', '#D8D4CC')}
            {/* Top trim */}
            {box('nalichnik', 360, 68, 40, 8, 14, '#F2EEE6', '#EAE6DE', '#DBD7CF')}
            {badge('nalichnik', 3, 385, 50, 15, -15)}
          </g>

          {/* ④ Дверное полотно */}
          <g style={gStyle('polotno', 40, 0)}
            onMouseEnter={() => setHoveredId('polotno')}
            onMouseLeave={() => setHoveredId(null)}>
            {box('polotno', 430, 50, 90, 400, 16, '#F7F3ED', '#EFEBe5', '#E3DFD9')}
            {/* Panel grooves */}
            {[40, 145, 250].map((oy, i) => {
              const cx = 430, cy = 50;
              const x1 = cx + 12 * cos30, y1 = cy + 12 * sin30 + oy;
              const x2 = cx + 78 * cos30, y2 = cy + 78 * sin30 + oy;
              return (
                <polygon key={i}
                  points={`${x1},${y1} ${x2},${y2} ${x2},${y2 + 85} ${x1},${y1 + 85}`}
                  fill="none" stroke={active('polotno') ? '#fff' : '#D0CCC6'} strokeWidth="0.8"
                  style={{ transition: 'stroke 0.6s ease' }} />
              );
            })}
            {/* Handle */}
            <rect x={430 + 75 * cos30 - 3} y={50 + 75 * sin30 + 180} width={6} height={22} rx={3}
              fill={active('polotno') ? '#D4AF37' : '#B8A070'} style={{ transition: 'fill 0.6s ease' }} />
            {badge('polotno', 4, 500, 35, 40, 0)}
          </g>

          {/* ⑤ Стоевая */}
          <g style={gStyle('stoevaya', 65, 10)}
            onMouseEnter={() => setHoveredId('stoevaya')}
            onMouseLeave={() => setHoveredId(null)}>
            {box('stoevaya', 565, 65, 12, 370, 18, '#E0DACE', '#D2CCC0', '#C3BDB1')}
            {/* Center line */}
            <line x1={565 + 6 * cos30} y1={65 + 6 * sin30 + 20} x2={565 + 6 * cos30} y2={65 + 6 * sin30 + 340}
              stroke={active('stoevaya') ? '#fff' : '#C0BCB0'} strokeWidth="0.5" style={{ transition: 'stroke 0.6s ease' }} />
            {badge('stoevaya', 5, 575, 50, 65, 10)}
          </g>

          {/* ⑥ Филёнка */}
          <g style={gStyle('filyonka', 70, 30)}
            onMouseEnter={() => setHoveredId('filyonka')}
            onMouseLeave={() => setHoveredId(null)}>
            {box('filyonka', 610, 340, 60, 50, 10, '#FAF6F0', '#F2EEE8', '#EAE6E0')}
            {/* Inner panel line */}
            {(() => {
              const cx = 610, cy = 340;
              const x1 = cx + 8 * cos30, y1 = cy + 8 * sin30 + 6;
              const x2 = cx + 52 * cos30, y2 = cy + 52 * sin30 + 6;
              return (
                <polygon
                  points={`${x1},${y1} ${x2},${y2} ${x2},${y2 + 34} ${x1},${y1 + 34}`}
                  fill="none" stroke={active('filyonka') ? '#fff' : '#D8D4CE'} strokeWidth="0.6"
                  style={{ transition: 'stroke 0.6s ease' }} />
              );
            })()}
            {badge('filyonka', 6, 645, 330, 70, 30)}
          </g>

          {/* Dimension line — overall height */}
          <g style={{ opacity: hoveredId ? 0.3 : 0.6, transition: 'opacity 0.5s ease' }}>
            <line x1="55" y1="100" x2="55" y2="460" stroke="#999" strokeWidth="0.6" strokeDasharray="4,3" />
            <line x1="48" y1="100" x2="62" y2="100" stroke="#999" strokeWidth="0.6" />
            <line x1="48" y1="460" x2="62" y2="460" stroke="#999" strokeWidth="0.6" />
            <text x="42" y="285" fill="#999" fontSize="11" textAnchor="middle" transform="rotate(-90, 42, 285)"
              style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: '0.05em' }}>2080 мм</text>
          </g>

        </svg>
      </div>

      {/* Components table below */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {parts.map((part) => (
          <div
            key={part.id}
            onMouseEnter={() => setHoveredId(part.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="rounded-xl border cursor-pointer overflow-hidden"
            style={{
              backgroundColor: active(part.id) ? 'hsl(30, 10%, 15%)' : 'hsl(38, 33%, 97%)',
              borderColor: active(part.id) ? 'hsl(30, 10%, 25%)' : 'hsl(35, 15%, 88%)',
              color: active(part.id) ? 'hsl(38, 33%, 97%)' : 'hsl(30, 10%, 15%)',
              transition: 'background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease',
            }}
          >
            <div className="px-5 py-4">
              <div className="flex items-center gap-3 mb-1">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    backgroundColor: active(part.id) ? accentColor : 'hsl(30, 10%, 15%)',
                    color: '#fff',
                    transition: 'background-color 0.5s ease',
                    fontFamily: "'Oswald', sans-serif",
                  }}
                >
                  {part.num}
                </span>
                <div>
                  <p className="text-sm font-bold" style={{ fontFamily: "'Oswald', sans-serif" }}>
                    {part.label}
                  </p>
                  <p className="text-xs font-mono" style={{
                    color: active(part.id) ? 'hsl(38, 33%, 70%)' : 'hsl(30, 8%, 55%)',
                    transition: 'color 0.5s ease',
                  }}>
                    {part.dimensions}
                  </p>
                </div>
              </div>
              <p className="text-xs leading-relaxed mt-2" style={{
                color: active(part.id) ? 'hsl(38, 33%, 70%)' : 'hsl(30, 8%, 50%)',
                transition: 'color 0.5s ease',
              }}>
                💡 {part.tip}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoorExplodedSVG;
