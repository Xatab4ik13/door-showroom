import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/catalog/ProductCard';
import { catalogProducts } from '@/data/catalog';

const PopularProducts = () => {
  const popular = catalogProducts.filter((p) => p.tags.includes('popular')).slice(0, 4);

  return (
    <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-end justify-between mb-10 md:mb-14">
          <h2
            className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-foreground"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Популярные товары
          </h2>
          <Link
            to="/catalog?tag=popular"
            className="hidden md:flex items-center gap-2 text-sm font-medium uppercase tracking-[0.12em] text-[hsl(205,85%,45%)] hover:gap-3 transition-all duration-300"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Смотреть все
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {popular.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <Link
          to="/catalog?tag=popular"
          className="md:hidden flex items-center justify-center gap-2 mt-8 py-3 text-sm font-medium uppercase tracking-[0.12em] text-[hsl(205,85%,45%)] border border-[hsl(205,85%,45%)] rounded-lg hover:bg-[hsl(205,85%,45%)] hover:text-white transition-colors duration-300"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          Смотреть все
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default PopularProducts;
