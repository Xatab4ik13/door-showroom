// Animated opening-system diagrams (как на 169.ru): GIF-схемы 70x70,
// показывающие движение полотна при открывании.
import schemeRaspashnaya from '@/assets/opening/scheme_1.gif';
import schemeRaspashnayaDouble from '@/assets/opening/scheme_2.gif';
import schemeKupe from '@/assets/opening/scheme_3.gif';
import schemeRoto from '@/assets/opening/scheme_4.gif';

type OpeningType = {
  key: string;
  label: string;
  src: string;
};

const types: OpeningType[] = [
  { key: 'raspashnaya', label: 'Распашная', src: schemeRaspashnaya },
  { key: 'raspashnaya-double', label: 'Распашная двустворчатая', src: schemeRaspashnayaDouble },
  { key: 'roto', label: 'Рото дверь', src: schemeRoto },
  { key: 'kupe', label: 'Дверь-купе', src: schemeKupe },
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {types.map((t) => (
          <div
            key={t.key}
            className="flex flex-col items-center gap-3 p-4 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            <img
              src={t.src}
              alt={t.label}
              width={70}
              height={70}
              loading="lazy"
              className="w-[70px] h-[70px]"
            />
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
