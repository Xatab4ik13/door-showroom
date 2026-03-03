import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import banner01 from '@/assets/banners/banner-01.jpg';
import banner02 from '@/assets/banners/banner-02.jpg';
import banner03 from '@/assets/banners/banner-03.jpg';

const slides = [
  {
    image: banner01,
    title: 'Премиальные двери',
    subtitle: 'для вашего интерьера',
    cta: 'Смотреть каталог',
    href: '/catalog',
  },
  {
    image: banner02,
    title: 'Входные двери',
    subtitle: 'надёжность и стиль',
    cta: 'Подробнее',
    href: '/catalog',
  },
  {
    image: banner03,
    title: 'Классические двери',
    subtitle: 'элегантность в каждой детали',
    cta: 'Выбрать дверь',
    href: '/catalog',
  },
];

const HeroBanner = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full h-[60vh] md:h-[75vh] lg:h-[85vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].image}
            alt={slides[current].title}
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="absolute inset-0 flex items-end pb-16 md:pb-24 px-6 md:px-12 lg:px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-xl"
          >
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white uppercase tracking-wide leading-tight"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              {slides[current].title}
            </h1>
            <p
              className="text-lg md:text-xl text-white/80 mt-2 tracking-wide"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {slides[current].subtitle}
            </p>
            <Link
              to={slides[current].href}
              className="inline-block mt-6 px-8 py-3 bg-white/95 text-foreground text-sm font-medium uppercase tracking-[0.15em] hover:bg-white transition-colors duration-300"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              {slides[current].cta}
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm hover:bg-white/25 transition-colors rounded-full text-white"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm hover:bg-white/25 transition-colors rounded-full text-white"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-[3px] rounded-full transition-all duration-500 ${
              i === current ? 'w-8 bg-white' : 'w-4 bg-white/40'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;
