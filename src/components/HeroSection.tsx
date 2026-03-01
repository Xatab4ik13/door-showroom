import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { doors } from '@/data/doors';

const heroDoors = doors.slice(0, 8);

const HeroSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col justify-end pb-16 pt-28 overflow-hidden">
      {/* Slogan */}
      <div className="px-6 md:px-12 mb-12">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xs md:text-sm tracking-[0.2em] uppercase text-muted-foreground"
        >
          Премиальные двери для вашего пространства
        </motion.p>
      </div>

      {/* Door row - horizontal scroll */}
      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex items-end gap-1 md:gap-2 px-6 md:px-12 min-w-max">
          {heroDoors.map((door, i) => (
            <motion.div
              key={door.id}
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.1 }}
              className="flex-shrink-0"
            >
              <img
                src={door.image}
                alt={door.name}
                className="h-[50vh] md:h-[65vh] lg:h-[75vh] w-auto object-contain drop-shadow-lg"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
