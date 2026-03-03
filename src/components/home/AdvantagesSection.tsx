import { motion } from 'framer-motion';
import { Ruler, Truck, ShieldCheck, Wrench, CreditCard } from 'lucide-react';

const advantages = [
  { icon: Ruler, title: 'Бесплатный замер', desc: 'Выезд мастера' },
  { icon: Truck, title: 'Доставка 24ч', desc: 'По Москве и МО' },
  { icon: ShieldCheck, title: 'Гарантия 5 лет', desc: 'На изделия и монтаж' },
  { icon: Wrench, title: 'Монтаж под ключ', desc: 'Профессиональный' },
  { icon: CreditCard, title: 'Оплата частями', desc: 'Сплит без переплат' },
];

const AdvantagesSection = () => {
  return (
    <section className="py-10 md:py-14 px-4 md:px-8 lg:px-12 bg-secondary/50 border-y border-border/50 relative overflow-hidden">

      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-wrap justify-center md:justify-between items-start gap-6 md:gap-4">
          {advantages.map((item, i) => (
            <motion.div
              key={item.title}
              className="flex flex-col items-center text-center w-[140px] md:w-auto md:flex-1 group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {/* Icon container — geometric, logo-like */}
              <motion.div
                className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center mb-3"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                {/* Background shape */}
                <div className="absolute inset-0 rounded-lg bg-[hsl(205,85%,45%)]/10 rotate-3 group-hover:rotate-6 group-hover:bg-[hsl(205,85%,45%)]/20 transition-all duration-500" />
                <div className="absolute inset-0.5 rounded-lg border border-[hsl(205,85%,45%)]/20 -rotate-2 group-hover:rotate-0 transition-all duration-500" />
                
                <item.icon
                  className="relative z-10 w-7 h-7 md:w-8 md:h-8 text-[hsl(205,85%,45%)] group-hover:text-[hsl(205,85%,35%)] transition-colors duration-300"
                  strokeWidth={1.5}
                />
              </motion.div>

              {/* Title */}
              <span
                className="text-xs md:text-sm font-bold uppercase tracking-[0.1em] text-foreground leading-tight"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {item.title}
              </span>

              {/* Description */}
              <span
                className="text-[10px] md:text-xs text-muted-foreground mt-1 tracking-wide"
                style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 300 }}
              >
                {item.desc}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;
