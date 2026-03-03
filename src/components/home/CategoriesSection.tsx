import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import door01 from '@/assets/doors/door-01.jpg';
import door04 from '@/assets/doors/door-04.jpg';
import door06 from '@/assets/doors/door-06.jpg';
import door09 from '@/assets/doors/door-09.jpg';
import door11 from '@/assets/doors/door-11.jpg';
import door12 from '@/assets/doors/door-12.jpg';

const categoryItems = [
  { key: 'mezhkomnatnye', label: 'Межкомнатные двери', image: door01 },
  { key: 'vhodnye', label: 'Входные двери', image: door04 },
  { key: 'peregorodki', label: 'Перегородки', image: door06 },
  { key: 'specialnye', label: 'Специальные двери', image: door09 },
  { key: 'furnitura', label: 'Фурнитура', image: door11 },
  { key: 'sistemy-otkryvaniya', label: 'Системы открывания', image: door12 },
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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
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
              className="group block relative bg-card border border-border rounded-sm overflow-hidden hover:border-foreground/30 transition-colors duration-300"
            >
              {/* Door image container */}
              <div className="aspect-[3/4] flex items-center justify-center p-6 md:p-8">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="h-full w-auto object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105"
                  draggable={false}
                />
              </div>

              {/* Label */}
              <div className="px-4 pb-4 md:px-5 md:pb-5">
                <span
                  className="text-sm md:text-base font-medium uppercase tracking-[0.1em] text-foreground"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  {cat.label}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CategoriesSection;
