import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { fetchFacets, type Facets } from '@/lib/api';
import { categories } from '@/data/catalog';

/* ── Dual Range Slider ── */
interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
}

const DualRangeSlider = ({ min, max, step, value, onChange }: SliderProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<'min' | 'max' | null>(null);

  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const snap = (v: number) => Math.round(v / step) * step;

  const getValueFromX = useCallback((clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return min;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return snap(min + ratio * (max - min));
  }, [min, max, step]);

  const handlePointerDown = (thumb: 'min' | 'max') => (e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = thumb;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const raw = getValueFromX(e.clientX);
    if (dragging.current === 'min') {
      onChange([Math.min(raw, value[1] - step), value[1]]);
    } else {
      onChange([value[0], Math.max(raw, value[0] + step)]);
    }
  };

  const handlePointerUp = () => {
    dragging.current = null;
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    const raw = getValueFromX(e.clientX);
    const distMin = Math.abs(raw - value[0]);
    const distMax = Math.abs(raw - value[1]);
    if (distMin <= distMax) {
      onChange([Math.min(raw, value[1] - step), value[1]]);
    } else {
      onChange([value[0], Math.max(raw, value[0] + step)]);
    }
  };

  return (
    <div
      ref={trackRef}
      className="relative h-8 flex items-center cursor-pointer select-none touch-none"
      onClick={handleTrackClick}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="absolute left-0 right-0 h-1.5 bg-border rounded-full" />
      <div
        className="absolute h-1.5 bg-primary rounded-full"
        style={{ left: `${pct(value[0])}%`, right: `${100 - pct(value[1])}%` }}
      />
      <div
        className="absolute w-5 h-5 -translate-x-1/2 rounded-full bg-primary border-[3px] border-white shadow-md z-10 cursor-grab active:cursor-grabbing active:scale-125 hover:scale-110 transition-transform duration-100"
        style={{ left: `${pct(value[0])}%` }}
        onPointerDown={handlePointerDown('min')}
      />
      <div
        className="absolute w-5 h-5 -translate-x-1/2 rounded-full bg-primary border-[3px] border-white shadow-md z-10 cursor-grab active:cursor-grabbing active:scale-125 hover:scale-110 transition-transform duration-100"
        style={{ left: `${pct(value[1])}%` }}
        onPointerDown={handlePointerDown('max')}
      />
    </div>
  );
};

// Fallback data when API is unavailable
const fallbackFacets: Facets = {
  manufacturers: [],
  materials: ['Экошпон', 'Эмаль', 'Шпон', 'ПВХ', 'Массив', 'Стекло', 'Ламинированные'],
  colors: ['Белый', 'Венге', 'Дуб', 'Орех', 'Серый', 'Капучино', 'Беленый дуб', 'Антрацит'],
  categories: [],
};

const DoorCalculator = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('all');
  const [material, setMaterial] = useState('all');
  const [finish, setFinish] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [facets, setFacets] = useState<Facets>(fallbackFacets);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacets()
      .then((data) => {
        // Merge: use API data if non-empty, otherwise keep fallback
        setFacets({
          manufacturers: data.manufacturers.length ? data.manufacturers : fallbackFacets.manufacturers,
          materials: data.materials.length ? data.materials : fallbackFacets.materials,
          colors: data.colors.length ? data.colors : fallbackFacets.colors,
          categories: data.categories.length ? data.categories : fallbackFacets.categories,
        });
        setPriceRange([0, 100000]);
      })
      .catch(() => {
        // API unavailable — use fallback
        setFacets(fallbackFacets);
      })
      .finally(() => setLoading(false));
  }, []);

  // Only show categories that exist in API
  const availableCategories = categories.filter(
    (c) => c.key === 'all' || !facets.categories.length || facets.categories.some((fc) => fc.slug === c.key)
  );

  const handleSubmit = () => {
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (material !== 'all') params.set('material', material);
    if (finish !== 'all') params.set('color', finish);
    params.set('price_min', String(priceRange[0]));
    params.set('price_max', String(priceRange[1]));
    navigate(`/catalog?${params.toString()}`);
  };

  const selectClass =
    'w-full appearance-none bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer';

  return (
    <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12">
      <div className="max-w-[1100px] mx-auto">
        <motion.div
          className="bg-secondary/30 rounded-2xl p-8 md:p-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8 md:mb-10">
            <div className="w-10 h-[3px] bg-primary mb-5" />
            <h2
              className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-foreground"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              ПО<span className="text-primary">Д</span>БЕРИТЕ ДВЕ<span className="text-primary">Р</span>Ь ЗА 5 МИНУТ!
            </h2>
            <p className="text-muted-foreground text-sm md:text-base mt-2" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 300 }}>
              Не тратьте время на поиски, получите выгодные варианты в несколько кликов
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Filters grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-6">
                {/* Тип двери */}
                <div>
                  <label
                    className="block text-xs font-bold uppercase tracking-[0.1em] text-foreground mb-2"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    Тип двери
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={selectClass}
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    {availableCategories.map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Материал */}
                <div>
                  <label
                    className="block text-xs font-bold uppercase tracking-[0.1em] text-foreground mb-2"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    Материал
                  </label>
                  <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className={selectClass}
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    <option value="all">Все</option>
                    {facets?.materials.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Покрытие / Цвет */}
                <div>
                  <label
                    className="block text-xs font-bold uppercase tracking-[0.1em] text-foreground mb-2"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    Покрытие
                  </label>
                  <select
                    value={finish}
                    onChange={(e) => setFinish(e.target.value)}
                    className={selectClass}
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    <option value="all">Все</option>
                    {facets?.colors.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price range */}
              <div className="mb-8">
                <label
                  className="block text-xs font-bold uppercase tracking-[0.1em] text-foreground mb-3"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  Стоимость
                </label>
                <div className="bg-background rounded-lg border border-border px-4 py-3">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-muted-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>от</span>
                    <span className="text-sm font-bold text-primary" style={{ fontFamily: "'Oswald', sans-serif" }}>
                      {priceRange[0].toLocaleString('ru-RU')}
                    </span>
                    <span className="text-sm text-muted-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>₽ — до</span>
                    <span className="text-sm font-bold text-primary" style={{ fontFamily: "'Oswald', sans-serif" }}>
                      {priceRange[1].toLocaleString('ru-RU')}
                    </span>
                    <span className="text-sm text-muted-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>₽</span>
                  </div>
                  <DualRangeSlider
                    min={0}
                    max={100000}
                    step={500}
                    value={priceRange}
                    onChange={setPriceRange}
                  />
                </div>
              </div>

              {/* CTA Button */}
              <motion.button
                onClick={handleSubmit}
                className="w-full md:w-auto px-10 py-4 bg-primary hover:opacity-90 text-primary-foreground rounded-xl flex items-center justify-center gap-3 transition-colors duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                <span className="text-sm font-bold uppercase tracking-[0.15em]">Подобрать дверь</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default DoorCalculator;
