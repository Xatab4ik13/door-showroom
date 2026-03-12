import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Clock } from 'lucide-react';

const newsItems = [
  {
    id: 1,
    date: '2026-03-10',
    category: 'Новинки',
    title: 'Новая коллекция межкомнатных дверей «Milano» уже в каталоге',
    excerpt: 'Представляем линейку дверей в итальянском стиле — лаконичный дизайн, скрытые петли и покрытие soft-touch. Идеальное сочетание эстетики и функциональности для современных интерьеров.',
    readTime: '3 мин',
    featured: true,
  },
  {
    id: 2,
    date: '2026-02-28',
    category: 'Акции',
    title: 'Весенняя распродажа: скидки до 25% на входные двери',
    excerpt: 'С 1 по 31 марта действуют специальные цены на популярные модели входных дверей для квартир и домов. Успейте заказать с бесплатным замером.',
    readTime: '2 мин',
    featured: false,
  },
  {
    id: 3,
    date: '2026-02-15',
    category: 'Обзоры',
    title: 'Как выбрать межкомнатную дверь: 5 главных критериев',
    excerpt: 'Разбираемся, на что обратить внимание при выборе двери — от типа покрытия до фурнитуры. Экспертный гид от специалистов Rusdoors.',
    readTime: '5 мин',
    featured: false,
  },
  {
    id: 4,
    date: '2026-02-01',
    category: 'Новинки',
    title: 'Двери скрытого монтажа — тренд 2026 года',
    excerpt: 'Двери без наличников, вровень со стеной, с возможностью покраски в любой цвет. Рассказываем, почему архитекторы и дизайнеры выбирают скрытый монтаж.',
    readTime: '4 мин',
    featured: false,
  },
  {
    id: 5,
    date: '2026-01-20',
    category: 'Компания',
    title: 'Rusdoors расширяет географию доставки',
    excerpt: 'Теперь мы доставляем двери по всей Московской области без увеличения сроков. Оформляйте заказ онлайн — привезём точно в срок.',
    readTime: '2 мин',
    featured: false,
  },
  {
    id: 6,
    date: '2026-01-10',
    category: 'Обзоры',
    title: 'Биометрические замки: будущее уже здесь',
    excerpt: 'Вход по отпечатку пальца, через приложение или код — обзор современных биометрических замков, которые мы устанавливаем на входные двери.',
    readTime: '6 мин',
    featured: false,
  },
];

const categories = ['Все', 'Новинки', 'Акции', 'Обзоры', 'Компания'];

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
};

const News = () => {
  const [activeCategory, setActiveCategory] = useState('Все');

  const filtered = activeCategory === 'Все'
    ? newsItems
    : newsItems.filter(n => n.category === activeCategory);

  const featured = filtered.find(n => n.featured) || filtered[0];
  const rest = filtered.filter(n => n.id !== featured?.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-32 md:pt-40 pb-12 md:pb-16 px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-wide text-foreground"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            НОВО<span className="text-[hsl(205,85%,45%)]">С</span>ТИ
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl" style={{ fontFamily: "'Manrope', sans-serif" }}>
            Обзоры, новинки и полезные материалы из мира дверей
          </p>
        </motion.div>

        {/* Category filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-8 flex flex-wrap gap-2"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm uppercase tracking-wider transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-[hsl(205,85%,45%)] text-white'
                  : 'bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
              style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500 }}
            >
              {cat}
            </button>
          ))}
        </motion.div>
      </section>

      {/* Featured article */}
      {featured && (
        <section className="px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto mb-12">
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="group relative bg-secondary rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-500"
          >
            <div className="grid md:grid-cols-2">
              {/* Gradient placeholder */}
              <div className="aspect-[16/10] md:aspect-auto bg-gradient-to-br from-[hsl(205,85%,45%)] via-[hsl(205,70%,35%)] to-[hsl(215,50%,15%)] relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-white/10 text-[120px] md:text-[180px] font-bold uppercase select-none"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    RD
                  </span>
                </div>
                <div className="absolute top-4 left-4">
                  <span
                    className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs uppercase tracking-widest rounded-full"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    {featured.category}
                  </span>
                </div>
              </div>

              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-4 text-muted-foreground text-sm mb-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(featured.date)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {featured.readTime}
                  </span>
                </div>
                <h2
                  className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-foreground group-hover:text-[hsl(205,85%,45%)] transition-colors duration-300"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  {featured.title}
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {featured.excerpt}
                </p>
                <div className="mt-6 flex items-center gap-2 text-[hsl(205,85%,45%)] group-hover:gap-3 transition-all duration-300">
                  <span
                    className="text-sm uppercase tracking-wider font-medium"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    Читать
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.article>
        </section>
      )}

      {/* News grid */}
      <section className="px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((item, i) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              className="group bg-card rounded-xl border border-border overflow-hidden cursor-pointer hover:border-[hsl(205,85%,45%)]/30 hover:shadow-md transition-all duration-400"
            >
              {/* Mini gradient header */}
              <div className="h-40 bg-gradient-to-br from-secondary via-accent to-muted relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-foreground/5 text-[80px] font-bold uppercase select-none"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    {String(item.id).padStart(2, '0')}
                  </span>
                </div>
                <div className="absolute top-3 left-3">
                  <span
                    className="px-2.5 py-1 bg-background/80 backdrop-blur-sm text-foreground text-[10px] uppercase tracking-widest rounded-full"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 text-muted-foreground text-xs mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.readTime}
                  </span>
                </div>
                <h3
                  className="text-lg font-bold uppercase tracking-wide text-foreground group-hover:text-[hsl(205,85%,45%)] transition-colors duration-300 line-clamp-2"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  {item.title}
                </h3>
                <p
                  className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  {item.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-[hsl(205,85%,45%)] opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-300">
                  <span className="text-xs uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>
                    Читать далее
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default News;
