// Schematic diagrams of door opening systems (распашная, купе, рото, пенал, книжка).
// Pure inline SVG line-art, styled via currentColor so it follows the theme.

type OpeningType = {
  key: string;
  label: string;
  svg: JSX.Element;
};

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 2,
  fill: 'none',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const thin = { ...stroke, strokeWidth: 1.2 };

const types: OpeningType[] = [
  {
    key: 'raspashnaya',
    label: 'Распашная',
    svg: (
      <svg viewBox="0 0 120 140" className="w-full h-full">
        {/* floor */}
        <line x1="8" y1="122" x2="112" y2="122" {...stroke} />
        {/* frame */}
        <rect x="38" y="18" width="44" height="104" {...stroke} />
        {/* opened leaf (perspective) */}
        <path d="M38 18 L14 34 L14 138 L38 122 Z" {...stroke} />
        {/* opening arc */}
        <path d="M76 108 A 44 44 0 0 0 42 66" {...thin} strokeDasharray="4 4" />
        <path d="M42 66 l-3 8 M42 66 l6 5" {...thin} />
        {/* handle */}
        <circle cx="20" cy="76" r="2.4" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: 'raspashnaya-double',
    label: 'Распашная двустворчатая',
    svg: (
      <svg viewBox="0 0 120 140" className="w-full h-full">
        <line x1="8" y1="122" x2="112" y2="122" {...stroke} />
        <rect x="26" y="18" width="68" height="104" {...stroke} />
        <line x1="60" y1="18" x2="60" y2="122" {...thin} />
        {/* two opened leaves */}
        <path d="M26 18 L10 30 L10 134 L26 122 Z" {...stroke} />
        <path d="M94 18 L110 30 L110 134 L94 122 Z" {...stroke} />
        <circle cx="55" cy="72" r="2.2" fill="currentColor" />
        <circle cx="65" cy="72" r="2.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: 'roto',
    label: 'Рото дверь',
    svg: (
      <svg viewBox="0 0 120 140" className="w-full h-full">
        <line x1="8" y1="122" x2="112" y2="122" {...stroke} />
        <rect x="32" y="18" width="56" height="104" {...stroke} />
        {/* rotating leaf shown at angle around centre axis */}
        <path d="M60 18 L40 30 L40 134 L60 122" {...stroke} />
        {/* centre axis */}
        <line x1="60" y1="18" x2="60" y2="122" {...thin} strokeDasharray="3 4" />
        {/* rotation arrows */}
        <path d="M78 40 A 20 20 0 0 1 80 62" {...thin} />
        <path d="M80 62 l-5 -1 M80 62 l-1 -6" {...thin} />
        <path d="M42 100 A 20 20 0 0 1 40 78" {...thin} />
        <path d="M40 78 l5 1 M40 78 l1 6" {...thin} />
      </svg>
    ),
  },
  {
    key: 'kupe',
    label: 'Дверь-купе',
    svg: (
      <svg viewBox="0 0 120 140" className="w-full h-full">
        <line x1="8" y1="122" x2="112" y2="122" {...stroke} />
        {/* sliding track */}
        <line x1="16" y1="16" x2="104" y2="16" {...stroke} />
        {/* back leaf */}
        <rect x="24" y="22" width="38" height="100" {...thin} />
        {/* front leaf */}
        <rect x="52" y="22" width="38" height="100" {...stroke} />
        {/* slide arrows */}
        <path d="M18 52 l8 0 M18 52 l4 -4 M18 52 l4 4" {...thin} />
        <path d="M96 88 l8 0 M104 88 l-4 -4 M104 88 l-4 4" {...thin} />
        <circle cx="84" cy="72" r="2.4" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: 'penal',
    label: 'Пенал (кассетная)',
    svg: (
      <svg viewBox="0 0 120 140" className="w-full h-full">
        <line x1="8" y1="122" x2="112" y2="122" {...stroke} />
        {/* wall pocket */}
        <rect x="16" y="18" width="26" height="104" {...stroke} />
        <line x1="22" y1="18" x2="22" y2="122" {...thin} />
        <line x1="36" y1="18" x2="36" y2="122" {...thin} />
        {/* leaf half-hidden, sliding into pocket */}
        <rect x="30" y="24" width="40" height="98" {...stroke} />
        {/* slide arrow into pocket */}
        <path d="M84 70 l-14 0 M70 70 l5 -5 M70 70 l5 5" {...thin} />
        <circle cx="64" cy="72" r="2.4" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: 'knizhka',
    label: 'Книжка / Compact',
    svg: (
      <svg viewBox="0 0 120 140" className="w-full h-full">
        <line x1="8" y1="122" x2="112" y2="122" {...stroke} />
        {/* frame */}
        <rect x="44" y="18" width="48" height="104" {...stroke} />
        {/* folded leaf halves */}
        <path d="M44 18 L26 32 L26 136 L44 122 Z" {...stroke} />
        <path d="M44 18 L62 30 L62 134 L44 122 Z" {...thin} />
        {/* fold arrows */}
        <path d="M30 60 A 26 26 0 0 1 56 52" {...thin} />
        <path d="M56 52 l-7 -1 M56 52 l-3 6" {...thin} />
      </svg>
    ),
  },
];

const ProductOpeningTypes = () => {
  return (
    <section className="mb-16">
      <h2
        className="text-xl md:text-2xl font-bold uppercase tracking-wider text-foreground mb-6"
        style={{ fontFamily: "'Oswald', sans-serif" }}
      >
        Возможные типы открывания
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {types.map((t) => (
          <div
            key={t.key}
            className="flex flex-col items-center gap-3 p-4 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            <div className="w-20 h-24">{t.svg}</div>
            <span className="text-xs font-semibold uppercase tracking-wide text-center leading-tight">
              {t.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductOpeningTypes;
