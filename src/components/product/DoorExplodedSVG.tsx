import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DoorPart {
  id: string;
  num: number;
  label: string;
  description: string;
  dimensions: string;
  material: string;
}

const parts: DoorPart[] = [
  { id: 'korobka', num: 1, label: 'Коробка', description: 'Несущая рама дверного блока', dimensions: '40 × 74 × 2080 мм', material: 'МДФ, шпон или экошпон' },
  { id: 'polotno', num: 2, label: 'Дверное полотно', description: 'Основная подвижная часть двери', dimensions: '36 × 800 × 2000 мм', material: 'МДФ каркас, сотовый наполнитель' },
  { id: 'nalichnik', num: 3, label: 'Наличники', description: 'Декоративная планка по периметру', dimensions: '10 × 70 × 2150 мм', material: 'МДФ с покрытием' },
  { id: 'dobor', num: 4, label: 'Доборный брус', description: 'Расширение коробки при толстых стенах', dimensions: '15 × 100–200 × 2080 мм', material: 'МДФ, ламинат' },
  { id: 'stoevaya', num: 5, label: 'Стоевая', description: 'Вертикальная часть полотна', dimensions: '40 × 74 × 2000 мм', material: 'Массив сосны / МДФ' },
  { id: 'filyonka', num: 6, label: 'Филёнка', description: 'Вставка-заполнение полотна', dimensions: 'По модели двери', material: 'МДФ, стекло или шпон' },
];

// Colors for each part in the isometric view
const partColors: Record<string, { base: string; light: string; dark: string }> = {
  korobka:  { base: '#A89279', light: '#BBA68E', dark: '#8E7A63' },
  polotno:  { base: '#C8BDA8', light: '#D8CEBC', dark: '#B0A590' },
  nalichnik:{ base: '#9A8B74', light: '#AE9E88', dark: '#867860' },
  dobor:    { base: '#B8A88E', light: '#CCBCA2', dark: '#A09478' },
  stoevaya: { base: '#8C7D68', light: '#A09180', dark: '#786A56' },
  filyonka: { base: '#D4C9B4', light: '#E4DAC8', dark: '#C0B49E' },
};

interface Props {
  accentColor?: string;
}

const DoorExplodedSVG = ({ accentColor = '#8B7355' }: Props) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleClick = (id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  const activePart = parts.find((p) => p.id === activeId) || null;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Isometric door view */}
        <div className="lg:col-span-7 flex justify-center">
          <div
            className="relative"
            style={{
              perspective: '1200px',
              width: '100%',
              maxWidth: '500px',
            }}
          >
            <div
              style={{
                transformStyle: 'preserve-3d',
                transform: 'rotateX(5deg) rotateY(-25deg)',
                position: 'relative',
                width: '280px',
                height: '520px',
                margin: '40px auto',
              }}
            >
              {/* Коробка — frame around the door */}
              <IsoPart
                id="korobka"
                activeId={activeId}
                onClick={handleClick}
                accentColor={accentColor}
                colors={partColors.korobka}
                style={{
                  width: '280px',
                  height: '520px',
                  zIndex: 1,
                }}
                borderOnly
                num={1}
              />

              {/* Наличники — thin decorative frame, slightly in front */}
              <IsoPart
                id="nalichnik"
                activeId={activeId}
                onClick={handleClick}
                accentColor={accentColor}
                colors={partColors.nalichnik}
                style={{
                  width: '296px',
                  height: '536px',
                  top: '-8px',
                  left: '-8px',
                  zIndex: 2,
                }}
                borderOnly
                thin
                num={3}
              />

              {/* Добор — extension on the left side */}
              <IsoPart
                id="dobor"
                activeId={activeId}
                onClick={handleClick}
                accentColor={accentColor}
                colors={partColors.dobor}
                style={{
                  width: '30px',
                  height: '520px',
                  top: '0px',
                  left: '-35px',
                  zIndex: 1,
                }}
                num={4}
              />

              {/* Стоевая — vertical stile bars on the slab */}
              <IsoPart
                id="stoevaya"
                activeId={activeId}
                onClick={handleClick}
                accentColor={accentColor}
                colors={partColors.stoevaya}
                style={{
                  width: '28px',
                  height: '460px',
                  top: '20px',
                  left: '20px',
                  zIndex: 4,
                }}
                num={5}
              />

              {/* Дверное полотно — the main slab */}
              <IsoPart
                id="polotno"
                activeId={activeId}
                onClick={handleClick}
                accentColor={accentColor}
                colors={partColors.polotno}
                style={{
                  width: '230px',
                  height: '480px',
                  top: '15px',
                  left: '15px',
                  zIndex: 3,
                }}
                num={2}
              />

              {/* Филёнка — panel insert in the middle of slab */}
              <IsoPart
                id="filyonka"
                activeId={activeId}
                onClick={handleClick}
                accentColor={accentColor}
                colors={partColors.filyonka}
                style={{
                  width: '160px',
                  height: '200px',
                  top: '160px',
                  left: '55px',
                  zIndex: 5,
                }}
                num={6}
              />
            </div>
          </div>
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

/* ---- Isometric Part ---- */
interface IsoPartProps {
  id: string;
  activeId: string | null;
  onClick: (id: string) => void;
  accentColor: string;
  colors: { base: string; light: string; dark: string };
  style: React.CSSProperties;
  borderOnly?: boolean;
  thin?: boolean;
  num: number;
}

const IsoPart = ({ id, activeId, onClick, accentColor, colors, style, borderOnly, thin, num }: IsoPartProps) => {
  const isActive = activeId === id;
  const isOtherActive = activeId !== null && activeId !== id;
  const thickness = thin ? 3 : borderOnly ? 8 : 14;

  return (
    <motion.div
      onClick={(e) => {
        e.stopPropagation();
        onClick(id);
      }}
      className="absolute cursor-pointer"
      style={{
        ...style,
        transformStyle: 'preserve-3d',
      }}
      animate={{
        y: isActive ? -30 : 0,
        z: isActive ? 40 : 0,
        opacity: isOtherActive ? 0.4 : 1,
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ scale: isActive ? 1 : 1.02 }}
    >
      {/* Front face */}
      <div
        className="absolute inset-0 rounded-sm transition-shadow duration-300"
        style={{
          backgroundColor: borderOnly && !thin
            ? 'transparent'
            : colors.base,
          border: borderOnly
            ? `${thin ? 6 : 10}px solid ${colors.base}`
            : 'none',
          boxShadow: isActive ? `0 0 30px ${accentColor}50, inset 0 0 20px ${accentColor}20` : 'none',
          outline: isActive ? `2px solid ${accentColor}` : 'none',
          transform: 'translateZ(0px)',
        }}
      />

      {/* Top face (3D depth) */}
      <div
        className="absolute rounded-sm"
        style={{
          width: '100%',
          height: `${thickness}px`,
          top: `-${thickness}px`,
          left: 0,
          backgroundColor: colors.light,
          transform: `rotateX(90deg) translateZ(0px)`,
          transformOrigin: 'bottom',
          opacity: borderOnly && !thin ? 0 : 1,
        }}
      />

      {/* Right face (3D depth) */}
      <div
        className="absolute rounded-sm"
        style={{
          width: `${thickness}px`,
          height: '100%',
          top: 0,
          right: `-${thickness}px`,
          backgroundColor: colors.dark,
          transform: `rotateY(90deg) translateZ(0px)`,
          transformOrigin: 'left',
          opacity: borderOnly && !thin ? 0 : 1,
        }}
      />

      {/* Number badge */}
      <motion.div
        className="absolute z-10 flex items-center justify-center rounded-full text-xs font-bold shadow-md"
        style={{
          width: '24px',
          height: '24px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: "'Oswald', sans-serif",
          color: 'hsl(38, 33%, 97%)',
        }}
        animate={{
          backgroundColor: isActive ? accentColor : 'hsl(30, 10%, 15%)',
          scale: isActive ? 1.3 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {num}
      </motion.div>
    </motion.div>
  );
};

export default DoorExplodedSVG;
