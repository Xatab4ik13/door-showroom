import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import ProductCard from '@/components/catalog/ProductCard';
import { catalogProducts, type CatalogProduct } from '@/data/catalog';
import { fetchProducts, type ApiProduct } from '@/lib/api';
import { apiProductToCard } from '@/lib/productAdapter';

/** Hand-picked cheap doors with different materials/finishes */
const CURATED_SLUGS = [
  'dvercom-f0000095971', // Лайт-07 экошпон ~3500
  'dvercom-f0000095814', // ПВХ дверь
  'dvercom-f0000096100', // эмаль
  'dvercom-f0000087498', // шпон/массив
];

const PopularProducts = () => {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch cheap interroom doors sorted by price, take first 4 with different specs
    fetchProducts({
      category: 'mezhkomnatnye',
      sort: 'price',
      order: 'asc',
      limit: 20,
      page: 1,
    })
      .then((data) => {
        if (data.products.length > 0) {
          // Pick 4 doors trying to diversify by manufacturer
          const seen = new Set<string>();
          const picked: CatalogProduct[] = [];
          for (const p of data.products) {
            const key = p.manufacturer || p.name;
            if (!seen.has(key) && picked.length < 4) {
              seen.add(key);
              picked.push(apiProductToCard(p));
            }
          }
          // Fill remainder if not enough diversity
          if (picked.length < 4) {
            for (const p of data.products) {
              if (picked.length >= 4) break;
              if (!picked.find(x => x.id === `dvercom-${p.source_sku}`)) {
                picked.push(apiProductToCard(p));
              }
            }
          }
          setProducts(picked);
        } else {
          // Fallback to mock
          setProducts(catalogProducts.filter(p => p.tags.includes('popular')).slice(0, 4));
        }
        setLoading(false);
      })
      .catch(() => {
        setProducts(catalogProducts.filter(p => p.tags.includes('popular')).slice(0, 4));
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-end justify-between mb-10 md:mb-14">
          <h2
            className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-foreground"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            ПОПУ<span className="text-[hsl(205,85%,45%)]">Л</span>ЯРНЫЕ ТОВ<span className="text-[hsl(205,85%,45%)]">А</span>РЫ
          </h2>
          <Link
            to="/catalog"
            className="hidden md:flex items-center gap-2 text-sm font-medium uppercase tracking-[0.12em] text-[hsl(205,85%,45%)] hover:gap-3 transition-all duration-300"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Смотреть все
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, i) => (
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
        )}

        <Link
          to="/catalog"
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
