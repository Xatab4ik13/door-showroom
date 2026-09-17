import { useState } from 'react';
import type { KitItem } from '@/lib/description';

interface DoorBlockSchemeProps {
  kit?: KitItem[];
}

type DoorType = 'schitovaya' | 'tsargovaya';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price);

const Scheme = ({ type }: { type: DoorType }) => (
  <svg viewBox="0 0 520 300" className="w-full h-auto" role="img" aria-label="Схема дверного блока в разрезе">
    {/* Стена */}
    <rect x="20" y="40" width="130" height="220" className="fill-secondary" />
    <rect x="20" y="40" width="130" height="220" className="fill-none stroke-border" strokeWidth="1.5" />
    <text x="85" y="285" textAnchor="middle" className="fill-muted-foreground" fontSize="12">Стена</text>

    {/* Добор */}
    <rect x="150" y="90" width="120" height="16" className="fill-primary/20 stroke-primary" strokeWidth="1.5" />
    <text x="210" y="82" textAnchor="middle" className="fill-foreground" fontSize="12">Добор</text>
    <text x="210" y="122" textAnchor="middle" className="fill-muted-foreground" fontSize="11">
      100 / 150 / 200 / 250 × 10 мм
    </text>

    {/* Коробка */}
    <rect x="270" y="78" width="32" height="90" className="fill-primary/30 stroke-primary" strokeWidth="1.5" />
    <text x="286" y="70" textAnchor="middle" className="fill-foreground" fontSize="12">Коробка</text>
    <text x="286" y="184" textAnchor="middle" className="fill-muted-foreground" fontSize="11">80 × 32 мм</text>

    {/* Наличник */}
    <rect x="262" y="40" width="10" height="70" className="fill-primary/60 stroke-primary" strokeWidth="1.5" />
    <rect x="300" y="40" width="10" height="70" className="fill-primary/60 stroke-primary" strokeWidth="1.5" />
    <text x="355" y="52" className="fill-foreground" fontSize="12">Наличник 70 × 8 мм</text>
    <line x1="312" y1="60" x2="350" y2="48" className="stroke-border" strokeWidth="1" />

    {/* Полотно */}
    {type === 'schitovaya' ? (
      <>
        <rect x="302" y="96" width="180" height="40" className="fill-secondary stroke-foreground/40" strokeWidth="1.5" />
        <text x="392" y="121" textAnchor="middle" className="fill-foreground" fontSize="12">Щитовое полотно 40 мм</text>
      </>
    ) : (
      <>
        <rect x="302" y="96" width="180" height="40" className="fill-secondary stroke-foreground/40" strokeWidth="1.5" />
        <rect x="302" y="96" width="34" height="40" className="fill-primary/15 stroke-foreground/30" strokeWidth="1" />
        <rect x="448" y="96" width="34" height="40" className="fill-primary/15 stroke-foreground/30" strokeWidth="1" />
        <text x="392" y="121" textAnchor="middle" className="fill-foreground" fontSize="12">Царга + стойки, 40 мм</text>
      </>
    )}

    {/* Размерная линия проёма */}
    <line x1="150" y1="230" x2="302" y2="230" className="stroke-primary" strokeWidth="1.5" />
    <line x1="150" y1="222" x2="150" y2="238" className="stroke-primary" strokeWidth="1.5" />
    <line x1="302" y1="222" x2="302" y2="238" className="stroke-primary" strokeWidth="1.5" />
    <text x="226" y="250" textAnchor="middle" className="fill-muted-foreground" fontSize="11">Толщина стены = добор + коробка</text>
  </svg>
);

const DoorBlockScheme = ({ kit = [] }: DoorBlockSchemeProps) => {
  const [type, setType] = useState<DoorType>('schitovaya');

  return (
    <section className="border-t border-border pt-10 mb-16">
      <h2
        className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-foreground mb-2"
        style={{ fontFamily: "'Oswald', sans-serif" }}
      >
        Схема дверного блока в разрезе
      </h2>
      <p className="text-sm text-muted-foreground mb-6" style={{ fontFamily: "'Manrope', sans-serif" }}>
        Как устроен дверной блок: коробка, добор и наличник с размерами сечения.
      </p>

      <div className="flex gap-2 mb-6">
        {([['schitovaya', 'Щитовая дверь'], ['tsargovaya', 'Царговая дверь']] as [DoorType, string][]).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setType(k)}
            className={`px-4 py-2 text-sm rounded border transition-all ${
              type === k
                ? 'border-primary bg-primary text-primary-foreground font-medium'
                : 'border-border bg-background text-foreground hover:border-primary/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="rounded-lg border border-border bg-card p-4">
          <Scheme type={type} />
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3" style={{ fontFamily: "'Oswald', sans-serif" }}>
            Комплектующие блока
          </h3>
          {kit.length > 0 ? (
            <ul className="space-y-2" style={{ fontFamily: "'Manrope', sans-serif" }}>
              {kit.map((k, i) => (
                <li key={i} className="flex justify-between gap-3 text-sm border-b border-border last:border-0 pb-2">
                  <span className="text-foreground truncate" title={k.name}>{k.label} × {k.qty}</span>
                  <span className="font-semibold text-foreground whitespace-nowrap">{formatPrice(k.price * k.qty)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-2 text-sm text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
              <li className="flex justify-between gap-3 border-b border-border pb-2"><span>Коробка</span><span>80 × 32 × 2100 мм</span></li>
              <li className="flex justify-between gap-3 border-b border-border pb-2"><span>Наличник</span><span>70 × 8 × 2140 мм</span></li>
              <li className="flex justify-between gap-3 border-b border-border pb-2"><span>Добор</span><span>100 / 150 / 200 / 250 × 10 мм</span></li>
              <li className="flex justify-between gap-3"><span>Притворная планка</span><span>30 × 10 × 2100 мм</span></li>
            </ul>
          )}
          <p className="text-xs text-muted-foreground mt-4" style={{ fontFamily: "'Manrope', sans-serif" }}>
            Добор подбирается по толщине стены: коробка закрывает 32 мм, остальную глубину проёма закрывает добор.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DoorBlockScheme;
