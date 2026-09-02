import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageSEO from '@/components/PageSEO';
import { Ruler, Wrench, CheckCircle2 } from 'lucide-react';
import { fetchContent } from '@/lib/api';
import MeasureRequestModal from '@/components/MeasureRequestModal';

interface Block { title: string; text: string; images: string[]; }
interface PageData { title: string; subtitle: string; blocks: Block[]; }
interface PriceRow { name: string; unit: string; price: string; }
interface PricingData { title?: string; note?: string; rows: PriceRow[] }

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } }),
};

const defaultRows: PriceRow[] = [
  { name: 'Монтаж межкомнатной двери (полотно, коробка, наличники)', unit: 'комплект', price: '' },
  { name: 'Монтаж двери-купе', unit: 'комплект', price: '' },
  { name: 'Монтаж раздвижной системы (пенал)', unit: 'комплект', price: '' },
  { name: 'Монтаж входной двери', unit: 'шт.', price: '' },
  { name: 'Демонтаж старой двери', unit: 'шт.', price: '' },
  { name: 'Установка доборов', unit: 'п. м.', price: '' },
  { name: 'Установка наличников', unit: 'п. м.', price: '' },
  { name: 'Врезка замка / ручки / петель', unit: 'шт.', price: '' },
  { name: 'Расширение / сужение проёма', unit: 'проём', price: '' },
];

const measureFacts = [
  'Замер межкомнатных дверей в пределах МКАД до 20 проёмов, включая входную дверь — 2 000 ₽',
  'При заказе от 2 дверей в пределах МКАД замер бесплатный: залог 2 000 ₽ возвращается скидкой на заказ',
  'Цена зависит от количества проёмов и удалённости объекта от МКАД',
  'После заявки менеджер уточнит детали и подтвердит стоимость до выезда специалиста',
];

const Installation = () => {
  const [data, setData] = useState<PageData>({ title: 'Замер и монтаж', subtitle: 'Профессиональный замер входных и межкомнатных дверей', blocks: [] });
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchContent<PageData>('page_installation').then((d) => { if (d) setData((prev) => ({ ...prev, ...d, blocks: d.blocks || [] })); });
    fetchContent<PricingData>('installation_pricing').then((d) => { if (d && Array.isArray(d.rows)) setPricing(d); });
  }, []);

  const rows = pricing?.rows?.length ? pricing.rows : defaultRows;

  return (
    <>
      <PageSEO
        title="Замер и монтаж дверей в Москве — RUSDOORS"
        description="Профессиональный замер и монтаж входных и межкомнатных дверей по Москве и МО. Смета монтажных работ, замер от 2 000 ₽, бесплатно при заказе от 2 дверей."
        canonical="https://rusdoors.su/installation"
      />
      <main>
        <section className="pt-32 md:pt-40 pb-12 md:pb-16 px-4 md:px-8 lg:px-12">
          <div className="max-w-[1600px] mx-auto">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-wide text-foreground"
              style={{ fontFamily: "'Oswald', sans-serif" }}>
              {data.title}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="mt-4 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl"
              style={{ fontFamily: "'Manrope', sans-serif" }}>
              {data.subtitle}
            </motion.p>
            <button onClick={() => setModalOpen(true)}
              className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-[hsl(205,85%,45%)] text-white font-semibold uppercase tracking-wider hover:opacity-90 transition"
              style={{ fontFamily: "'Oswald', sans-serif" }}>
              Оставить заявку на замер
            </button>
          </div>
        </section>

        {/* Замер */}
        <section className="pb-16 md:pb-20 px-4 md:px-8 lg:px-12">
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 flex items-center justify-center rounded-lg bg-[hsl(205,85%,45%)]/10 shrink-0">
                <Ruler className="w-7 h-7 text-[hsl(205,85%,45%)]" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold uppercase tracking-wider text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                  Профессиональный замер
                </h2>
                <p className="mt-2 text-muted-foreground leading-relaxed" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  Инженер-замерщик приедет на объект, промерит дверные проёмы, рассчитает комплектацию и поможет избежать ошибки в выборе межкомнатных и входных дверей.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background p-6">
              <h3 className="text-lg font-bold uppercase tracking-wider text-foreground mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>
                Стоимость замера
              </h3>
              <ul className="space-y-3" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {measureFacts.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-[hsl(205,85%,45%)] shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Смета монтажа */}
        <section className="py-16 md:py-20 px-4 md:px-8 lg:px-12 bg-secondary">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-start gap-5 mb-8">
              <div className="w-14 h-14 flex items-center justify-center rounded-lg bg-[hsl(205,85%,45%)]/10 shrink-0">
                <Wrench className="w-7 h-7 text-[hsl(205,85%,45%)]" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                  {pricing?.title || 'Смета монтажных работ'}
                </h2>
                <p className="mt-2 text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  Опытная бригада устанавливает двери с гарантией на работы — чисто и точно в срок.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background overflow-hidden">
              <table className="w-full text-left" style={{ fontFamily: "'Manrope', sans-serif" }}>
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground">Работа</th>
                    <th className="px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground w-32">Ед.</th>
                    <th className="px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground w-40 text-right">Цена</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.name + i} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 text-foreground">{r.name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{r.unit}</td>
                      <td className="px-5 py-3 text-right font-semibold text-foreground whitespace-nowrap">
                        {r.price ? r.price : 'по запросу'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-sm text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
              {pricing?.note || 'Итоговая смета формируется после замера: она зависит от типа двери, состояния проёма и объёма дополнительных работ.'}
            </p>

            <button onClick={() => setModalOpen(true)}
              className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-[hsl(205,85%,45%)] text-white font-semibold uppercase tracking-wider hover:opacity-90 transition"
              style={{ fontFamily: "'Oswald', sans-serif" }}>
              Рассчитать смету — заявка на замер
            </button>
          </div>
        </section>

        {/* CMS-блоки */}
        {data.blocks.length > 0 && (
          <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12">
            <div className="max-w-[1600px] mx-auto space-y-12">
              {data.blocks.map((b, i) => (
                <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
                  custom={i} variants={fadeUp}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start border-t border-border pt-12 first:border-t-0 first:pt-0">
                  <div>
                    {b.title && (
                      <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-foreground mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>
                        {b.title}
                      </h2>
                    )}
                    {b.text && (
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line" style={{ fontFamily: "'Manrope', sans-serif" }}>
                        {b.text}
                      </p>
                    )}
                  </div>
                  {b.images && b.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {b.images.map((img, ii) => (
                        <div key={ii} className="aspect-square rounded-lg overflow-hidden bg-secondary">
                          <img src={img} alt={b.title || 'Монтаж'} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>

      <MeasureRequestModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default Installation;
