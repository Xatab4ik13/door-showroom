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
  { name: 'Стандартный монтаж двери INVISIBLE (выезд на одну дверь)', unit: 'шт.', price: '8 500 ₽' },
  { name: 'Стандартный монтаж 1-й двери: шпон, плёнка, массив, эмаль, глянец', unit: 'шт.', price: '7 500 ₽' },
  { name: 'Стандартный монтаж от 2-х дверей: шпон, плёнка/массив, эмаль, глянец / компланар AVERS', unit: 'шт.', price: '5 500 / 6 500 ₽' },
  { name: 'Стандартный монтаж дверей ProfilDoors с коробом Моноблок, Integral, SLIM, ROTO, MAGIC, DIVA AIR, INFINITY', unit: 'шт.', price: '8 500 ₽' },
  { name: 'Стандартный монтаж двери компланар REVERS', unit: 'шт.', price: '8 500 ₽' },
  { name: 'Установка двери Книжка / Компакт', unit: 'шт.', price: '8 500 ₽' },
  { name: 'Установка двери INVISIBLE AVERS / REVERSE', unit: 'шт.', price: '6 500 ₽' },
  { name: 'Установка декоративных реек / стеновых панелей', unit: 'м²', price: '2 000 / 2 750 ₽' },
  { name: 'Установка КАССЕТОНА без обрамления: под одно полотно / под два полотна', unit: 'шт.', price: '8 500 / 10 000 ₽' },
  { name: 'Установка ПЕРЕГОРОДОК 2-х, 3-х, 4-хстворчатой до 2100 мм (без обрамления проёма)', unit: 'шт.', price: '15 000 / 22 500 / 32 500 ₽' },
  { name: 'Установка межкомнатной складной гармошки', unit: 'м²', price: '5 500 ₽' },
  { name: 'Выезд бригады на установку трека под дверь купе Invisible (1–2–3 ств. полотно)', unit: 'выезд', price: '18 000 ₽' },
  { name: 'Установка двери КУПЕ 1 ств. (без отделки проёма)', unit: 'шт.', price: '8 000 ₽' },
  { name: 'Установка двери КУПЕ 2 ств. (без отделки проёма)', unit: 'шт.', price: '14 000 ₽' },
  { name: 'Установка синхронного механизма', unit: 'шт.', price: '2 000 ₽' },
  { name: 'Установка НЕСТАНДАРТНЫХ дверей / перегородок: 2110–2400 мм / 2410–3000 мм', unit: 'к смете', price: '+30% / +50%' },
  { name: 'Установка ДОБОРА до 10 см', unit: 'шт.', price: '1 500 ₽' },
  { name: 'Установка ДОБОРА от 10 до 20 см / добор под выключатель', unit: 'шт.', price: '2 000 / 2 500 ₽' },
  { name: 'Установка ДОБОРА от 20 до 30 см / от 30 до 50 см', unit: 'шт.', price: '3 000 / 4 000 ₽' },
  { name: 'Установка декоративных элементов / капитель (на одну сторону)', unit: 'шт.', price: '350 / 700 ₽' },
  { name: 'Корректировка полотна по высоте (подрезка с одной стороны)', unit: 'шт.', price: '1 500 ₽' },
  { name: 'Корректировка полотна по высоте (подрезка с двух сторон)', unit: 'шт.', price: '2 500 ₽' },
  { name: 'Корректировка коробки по толщине / подготовка короба с наличником под открывание 180°', unit: 'шт.', price: '750 / 1 500 ₽' },
  { name: 'Обрамление проёма в арку (портал) без полотна: добор + наличник до 20 см', unit: 'проём', price: '3 500 ₽' },
  { name: 'Обрамление проёма в арку (портал) без полотна: от 20 до 30 см', unit: 'проём', price: '4 000 ₽' },
  { name: 'Обрамление проёма в арку (портал) без полотна: от 30 до 50 см', unit: 'проём', price: '4 500 ₽' },
  { name: 'Расширение проёма (бетон, кирпич, гипсокартон, газоблок), одна сторона', unit: 'сторона', price: '1 500 ₽' },
  { name: 'Сужение проёма брусом за одну сторону (без материала)', unit: 'сторона', price: '1 000 ₽' },
  { name: 'Подрезка плинтуса', unit: 'шт.', price: '200 ₽' },
  { name: 'Установка плинтуса (подрезка углов еврозапил входит в стоимость)', unit: 'п. м.', price: '700 ₽' },
  { name: 'Врезка замка / ответной части в алюминий / ответной части', unit: 'шт.', price: '750 / 600 / 300 ₽' },
  { name: 'Установка деревянного порога / врезка автопорога / врезка автопорога в алюминий', unit: 'шт.', price: '750 / 2 000 / 3 000 ₽' },
  { name: 'Роспуск наличника вдоль', unit: 'шт.', price: '500 ₽' },
  { name: 'Установка ограничителя / доводчика, магнитного ограничителя', unit: 'шт.', price: '500 / 1 000 ₽' },
  { name: 'Установка фиксатора / цилиндра', unit: 'шт.', price: '500 ₽' },
  { name: 'Врезка скрытой петли', unit: 'шт.', price: '750 ₽' },
  { name: 'Врезка замка, скрытой петли в алюминий / врезка замка для двери купе', unit: 'шт.', price: '1 500 ₽' },
  { name: 'Врезка ригеля / установка притворной планки', unit: 'шт.', price: '750 / 750 ₽' },
  { name: 'Врезка 3-й дополнительной петли (карточной)', unit: 'шт.', price: '500 ₽' },
  { name: 'Демонтаж дверного блока без сохранения / с сохранением', unit: 'шт.', price: '750 / 1 000 ₽' },
  { name: 'Установка нестандартных наличников (от 110 мм) / наличников на клей, одна сторона', unit: 'сторона', price: '350 / 350 ₽' },
  { name: 'Расходные материалы', unit: 'комплект', price: '750 ₽' },
  { name: 'Монтаж ручек Luxury (комплект) / врезка нижней направляющей под дверь купе', unit: 'шт.', price: '1 500 ₽' },
  { name: 'Выезд за МКАД', unit: 'км', price: '50 ₽' },
  { name: 'Оплата парковки за каждый час (оплачивает заказчик)', unit: 'час', price: 'по тарифу' },
  { name: 'Повторный выезд по просьбе клиента (добивка наличника / доборов)', unit: 'выезд', price: '3 500 ₽' },
  { name: 'Выезд бригады на объект без замера — не подготовлены стены и полы по вине заказчика', unit: 'выезд', price: '1 500 ₽' },
  { name: 'Монтаж одностворчатой двери с фрамугой / двухстворчатой с фрамугой', unit: 'шт.', price: '18 000 / 28 000 ₽' },
  { name: 'Монтаж трёхстворчатой двери с фрамугой / четырёхстворчатой с фрамугой', unit: 'шт.', price: '35 000 / 48 000 ₽' },
  { name: 'Монтаж трёхстворчатой двери / четырёхстворчатой двери', unit: 'шт.', price: '30 000 / 38 000 ₽' },
  { name: 'Врезка системы книжка / системы компакт, системы magic', unit: 'шт.', price: '3 500 / 8 000 ₽' },
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
