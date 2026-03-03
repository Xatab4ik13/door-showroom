import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import catMezhkomnatnye from '@/assets/doors/cat-mezhkomnatnye.png';
import catVhodnye from '@/assets/doors/cat-vhodnye.png';
import catPeregorodki from '@/assets/doors/cat-peregorodki.png';
import catFurnitura from '@/assets/doors/cat-furnitura.png';
import catSpecialnye from '@/assets/doors/cat-specialnye.png';

const categoryItems = [
  { key: 'mezhkomnatnye', label: 'Межкомнатные двери', image: catMezhkomnatnye, scale: 1 },
  { key: 'vhodnye', label: 'Входные двери', image: catVhodnye, scale: 1 },
  { key: 'peregorodki', label: 'Перегородки', image: catPeregorodki, scale: 1.35 },
  { key: 'specialnye', label: 'Специальные двери', image: catSpecialnye, scale: 1 },
  { key: 'furnitura', label: 'Фурнитура', image: catFurnitura, scale: 0.55 },
];

const CategoriesSection = () => {
  return (
    <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto">
      <h2
        className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-foreground mb-10 md:mb-14"
        style={{ fontFamily: "'Oswald', sans-serif" }}
      >
        Категории
      </h2>

      <div className="flex gap-4 md:gap-6 lg:gap-8 justify-center items-end pb-6">
        {categoryItems.map((cat, i) => (
          <motion.div
            key={cat.key}
            className="flex-1 min-w-0 max-w-[240px]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <Link
              to={`/catalog?category=${cat.key}`}
              className="group block text-center"
            >
              <div className="h-[180px] md:h-[240px] lg:h-[280px] flex items-end justify-center mb-4">
                <motion.img
                  src={cat.image}
                  alt={cat.label}
                  className="h-full w-auto object-contain origin-center drop-shadow-[0_8px_20px_rgba(0,0,0,0.15)]"
                  initial={{ scale: cat.scale }}
                  whileHover={{ scale: cat.scale * 1.08 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                />
              </div>

              <span
                className="text-xs md:text-sm font-medium uppercase tracking-[0.1em] text-foreground"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {cat.label}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CategoriesSection;
