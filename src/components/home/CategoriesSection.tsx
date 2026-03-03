import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import catMezhkomnatnye from '@/assets/doors/cat-mezhkomnatnye.png';
import catVhodnye from '@/assets/doors/cat-vhodnye.png';
import catPeregorodki from '@/assets/doors/cat-peregorodki.png';

const categoryItems = [
  { key: 'mezhkomnatnye', label: 'Межкомнатные двери', image: catMezhkomnatnye },
  { key: 'vhodnye', label: 'Входные двери', image: catVhodnye },
  { key: 'peregorodki', label: 'Перегородки', image: catPeregorodki },
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

      <div className="flex gap-8 md:gap-12 lg:gap-16 justify-center items-end pb-6">
        {categoryItems.map((cat, i) => (
          <motion.div
            key={cat.key}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <Link
              to={`/catalog?category=${cat.key}`}
              className="group block text-center"
            >
              <div className="h-[280px] md:h-[360px] lg:h-[400px] flex items-end justify-center mb-4">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="h-full w-auto object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-transform duration-500 group-hover:scale-105"
                  draggable={false}
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
