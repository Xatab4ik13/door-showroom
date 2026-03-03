import { motion } from 'framer-motion';

const advantages = [
  { num: '01', title: 'Бесплатный замер', desc: 'Выезд мастера в удобное для вас время' },
  { num: '02', title: 'Доставка за 24ч', desc: 'Быстрая доставка по Москве и области' },
  { num: '03', title: 'Гарантия 5 лет', desc: 'Полная гарантия на все изделия и монтаж' },
  { num: '04', title: 'Монтаж под ключ', desc: 'Профессиональная установка от наших мастеров' },
  { num: '05', title: 'Оплата частями', desc: 'Сплит-оплата — разбейте сумму на несколько платежей без переплат' },
];

const AdvantagesSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Accent top stripe */}
      <div className="h-1 bg-[hsl(205,85%,45%)]" />

      <div className="bg-foreground text-background py-14 md:py-20 px-4 md:px-8 lg:px-12">
        <div className="max-w-[1600px] mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold uppercase tracking-wide mb-12 md:mb-16"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            ПР<span className="text-[hsl(205,85%,45%)]">Е</span>ИМУЩЕСТ<span className="text-[hsl(205,85%,45%)]">В</span>А
          </h2>

          <div className="space-y-0">
            {advantages.map((item, i) => (
              <motion.div
                key={item.num}
                className="group border-t border-background/15 py-6 md:py-8 flex items-start md:items-center gap-6 md:gap-10"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                {/* Number */}
                <span
                  className="text-[hsl(205,85%,45%)] text-2xl md:text-3xl font-bold tracking-wider shrink-0 w-12 md:w-16"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  {item.num}
                </span>

                {/* Title */}
                <h3
                  className="text-lg md:text-2xl font-bold uppercase tracking-wide flex-1 min-w-0 group-hover:text-[hsl(205,85%,45%)] transition-colors duration-300"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  {item.title}
                </h3>

                {/* Description */}
                <p
                  className="hidden md:block text-sm text-background/60 max-w-[320px] leading-relaxed"
                  style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 300 }}
                >
                  {item.desc}
                </p>
              </motion.div>
            ))}
            {/* Bottom border */}
            <div className="border-t border-background/15" />
          </div>
        </div>
      </div>

      {/* Accent bottom stripe */}
      <div className="h-1 bg-[hsl(205,85%,45%)]" />
    </section>
  );
};

export default AdvantagesSection;
