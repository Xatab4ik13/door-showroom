import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageSEO from '@/components/PageSEO';
import { Ruler, Wrench } from 'lucide-react';
import { fetchContent } from '@/lib/api';

interface Block { title: string; text: string; images: string[]; }
interface PageData { title: string; subtitle: string; blocks: Block[]; }

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } }),
};

const Installation = () => {
  const [data, setData] = useState<PageData>({ title: 'Замер и монтаж', subtitle: 'Профессиональная установка дверей под ключ', blocks: [] });

  useEffect(() => { fetchContent<PageData>('page_installation').then((d) => { if (d) setData({ ...data, ...d, blocks: d.blocks || [] }); }); }, []);

  return (
    <>
      <PageSEO
        title="Замер и монтаж дверей в Москве — RUSDOORS"
        description="Бесплатный замер и профессиональный монтаж дверей по Москве и МО. Установка межкомнатных и входных дверей под ключ. Гарантия на монтажные работы."
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
          </div>
        </section>

        <section className="pb-24 px-4 md:px-8 lg:px-12">
          <div className="max-w-[1600px] mx-auto space-y-12">
            {data.blocks.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 flex items-center justify-center rounded-lg bg-[hsl(205,85%,45%)]/10 shrink-0">
                    <Ruler className="w-7 h-7 text-[hsl(205,85%,45%)]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-wider text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>Бесплатный замер</h3>
                    <p className="mt-2 text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>Мастер выезжает в удобное время, делает точные замеры и рассчитывает смету.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 flex items-center justify-center rounded-lg bg-[hsl(205,85%,45%)]/10 shrink-0">
                    <Wrench className="w-7 h-7 text-[hsl(205,85%,45%)]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-wider text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>Монтаж под ключ</h3>
                    <p className="mt-2 text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>Опытная бригада устанавливает двери с гарантией на работы. Чисто и точно в срок.</p>
                  </div>
                </div>
              </div>
            )}

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
      </main>
    </>
  );
};

export default Installation;
