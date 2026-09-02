import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ruler, Truck, ShieldCheck, Wrench, CreditCard, Star } from 'lucide-react';
import { fetchContent } from '@/lib/api';

const ICONS = [Ruler, Truck, ShieldCheck, Wrench, CreditCard, Star];

interface Block { title: string; text: string; }
interface PageData { title: string; subtitle: string; blocks: Block[]; }

const defaults: { title: string; desc: string }[] = [
  { title: 'Бесплатный замер', desc: 'Выезд мастера' },
  { title: 'Доставка по Москве и МО', desc: 'В согласованный день' },
  { title: 'Монтаж под ключ', desc: 'Профессиональный' },
  { title: 'Оплата частями', desc: 'Сплит без переплат' },
];

const AdvantagesSection = () => {
  const [data, setData] = useState<PageData | null>(null);
  useEffect(() => { fetchContent<PageData>('page_advantages').then(setData); }, []);

  const items = data?.blocks?.length
    ? data.blocks.map((b, i) => ({ title: b.title, desc: b.text, Icon: ICONS[i % ICONS.length] }))
    : defaults.map((d, i) => ({ title: d.title, desc: d.desc, Icon: ICONS[i % ICONS.length] }));

  const heading = data?.title || 'ПРЕИМУЩЕСТВА';
  const subtitle = data?.subtitle || 'Несколько причин почему стоит выбрать нас';

  return (
    <section className="py-10 md:py-14 px-4 md:px-8 lg:px-12 bg-background relative overflow-hidden">
      <div className="max-w-[1600px] mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-foreground"
            style={{ fontFamily: "'Oswald', sans-serif" }}>
            {heading}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mt-2" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 300 }}>
            {subtitle}
          </p>
        </div>
        <div className="flex flex-wrap justify-center md:justify-between items-start gap-6 md:gap-4">
          {items.map((item, i) => (
            <motion.div key={item.title + i}
              className="flex flex-col items-center text-center w-[140px] md:w-auto md:flex-1 group"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}>
              <motion.div className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center mb-3"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                <div className="absolute inset-0 rounded-lg bg-[hsl(205,85%,45%)]/10 rotate-3 group-hover:rotate-6 group-hover:bg-[hsl(205,85%,45%)]/20 transition-all duration-500" />
                <div className="absolute inset-0.5 rounded-lg border border-[hsl(205,85%,45%)]/20 -rotate-2 group-hover:rotate-0 transition-all duration-500" />
                <item.Icon className="relative z-10 w-7 h-7 md:w-8 md:h-8 text-[hsl(205,85%,45%)] group-hover:text-[hsl(205,85%,35%)] transition-colors duration-300" strokeWidth={1.5} />
              </motion.div>
              <span className="text-xs md:text-sm font-bold uppercase tracking-[0.1em] text-foreground leading-tight"
                style={{ fontFamily: "'Oswald', sans-serif" }}>
                {item.title}
              </span>
              {item.desc && (
                <span className="text-[10px] md:text-xs text-muted-foreground mt-1 tracking-wide"
                  style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 300 }}>
                  {item.desc}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;
