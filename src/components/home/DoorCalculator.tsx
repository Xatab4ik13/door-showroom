import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { categories, materials, finishes, catalogProducts } from '@/data/catalog';

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
      {/* Track bg */}
      <div className="absolute left-0 right-0 h-1.5 bg-border rounded-full" />
      {/* Active range */}
      <div
        className="absolute h-1.5 bg-[hsl(205,85%,45%)] rounded-full"
        style={{ left: `${pct(value[0])}%`, right: `${100 - pct(value[1])}%` }}
      />
      {/* Min thumb */}
      <div
        className="absolute w-5 h-5 -translate-x-1/2 rounded-full bg-[hsl(205,85%,45%)] border-[3px] border-white shadow-md z-10 cursor-grab active:cursor-grabbing active:scale-125 hover:scale-110 transition-transform duration-100"
        style={{ left: `${pct(value[0])}%` }}
        onPointerDown={handlePointerDown('min')}
      />
      {/* Max thumb */}
      <div
        className="absolute w-5 h-5 -translate-x-1/2 rounded-full bg-[hsl(205,85%,45%)] border-[3px] border-white shadow-md z-10 cursor-grab active:cursor-grabbing active:scale-125 hover:scale-110 transition-transform duration-100"
        style={{ left: `${pct(value[1])}%` }}
        onPointerDown={handlePointerDown('max')}
      />
    </div>
  );
};

const DoorCalculator = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('all');
  const [material, setMaterial] = useState('all');
  const [finish, setFinish] = useState('all');

  const prices = catalogProducts.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);

  const handleSubmit = () => {
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (material !== 'all') params.set('material', material);
    if (finish !== 'all') params.set('finish', finish);
    params.set('minPrice', String(priceRange[0]));
    params.set('maxPrice', String(priceRange[1]));
    navigate(`/catalog?${params.toString()}`);
  };

  const selectClass =
    'w-full appearance-none bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-[hsl(205,85%,45%)] transition-colors cursor-pointer';

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
            <div className="w-10 h-[3px] bg-[hsl(205,85%,45%)] mb-5" />
            <h2
              className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-foreground"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              ПО<span className="text-[hsl(205,85%,45%)]">Д</span>БЕРИТЕ ДВЕ<span className="text-[hsl(205,85%,45%)]">Р</span>Ь ЗА 5 МИНУТ!
            </h2>
            <p className="text-muted-foreground text-sm md:text-base mt-2" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 300 }}>
              Не тратьте время на поиски, получите выгодные варианты в несколько кликов
            </p>
          </div>

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
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={selectClass}
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  {categories.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Материал */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-[0.1em] text-foreground mb-2"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Материал
              </label>
              <div className="relative">
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className={selectClass}
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  <option value="all">Все</option>
                  {materials.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Покрытие */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-[0.1em] text-foreground mb-2"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Покрытие
              </label>
              <div className="relative">
                <select
                  value={finish}
                  onChange={(e) => setFinish(e.target.value)}
                  className={selectClass}
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  <option value="all">Все</option>
                  {finishes.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
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
                <span className="text-sm font-bold text-[hsl(205,85%,45%)]" style={{ fontFamily: "'Oswald', sans-serif" }}>
                  {priceRange[0].toLocaleString('ru-RU')}
                </span>
                <span className="text-sm text-muted-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>₽ — до</span>
                <span className="text-sm font-bold text-[hsl(205,85%,45%)]" style={{ fontFamily: "'Oswald', sans-serif" }}>
                  {priceRange[1].toLocaleString('ru-RU')}
                </span>
                <span className="text-sm text-muted-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>₽</span>
              </div>
              <DualRangeSlider
                min={minPrice}
                max={maxPrice}
                step={100}
                value={priceRange}
                onChange={setPriceRange}
              />
            </div>
          </div>

          {/* CTA Button */}
          <motion.button
            onClick={handleSubmit}
            className="w-full md:w-auto px-10 py-4 bg-[hsl(205,85%,45%)] hover:bg-[hsl(205,85%,38%)] text-white rounded-xl flex items-center justify-center gap-3 transition-colors duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            <span className="text-sm font-bold uppercase tracking-[0.15em]">Подобрать дверь</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default DoorCalculator;
