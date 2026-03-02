import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import logo from '@/assets/logo.png';
import door06 from '@/assets/doors/door-06.jpg';

const navItems = ['Каталог', 'Коллекции', 'Дизайнерам', 'Вдохновение', 'Контакты'];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 px-6 md:px-12 py-4 flex items-center justify-between bg-transparent backdrop-blur-[2px]">
        <a href="/" className="flex items-center">
          <img src={logo} alt="RUSDOORS" className="h-24 md:h-[120px] w-auto -my-8" />
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              className="relative text-sm tracking-[0.12em] uppercase text-[hsl(215,50%,15%)] hover:text-[hsl(205,85%,45%)] transition-colors duration-300 py-1 group"
              style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500 }}
              onMouseEnter={() => setActiveItem(item)}
              onMouseLeave={() => setActiveItem(null)}
            >
              {item}
              <span
                className={`absolute bottom-0 left-0 h-[2px] bg-[hsl(205,85%,45%)] transition-all duration-300 ${
                  activeItem === item ? 'w-full' : 'w-0'
                }`}
              />
            </a>
          ))}
        </nav>

        <button
          onClick={() => setMenuOpen(true)}
          className="p-2 text-[hsl(215,50%,15%)] hover:text-[hsl(205,85%,45%)] transition-colors"
          aria-label="Открыть меню"
        >
          <Menu className="w-6 h-6" strokeWidth={1.5} />
        </button>
      </header>

      {/* Fullscreen Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 bg-[hsl(215,50%,10%)] flex"
          >
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-5 right-6 md:right-12 p-2 text-white/80 hover:text-[hsl(205,85%,55%)] transition-colors z-10"
              aria-label="Закрыть меню"
            >
              <X className="w-7 h-7" strokeWidth={1.5} />
            </button>

            <div className="flex-1 flex flex-col justify-center px-8 md:px-20 lg:px-32">
              {navItems.map((item, i) => (
                <motion.a
                  key={item}
                  href="#"
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                  className="text-4xl md:text-6xl lg:text-7xl uppercase text-white/90 hover:text-[hsl(205,85%,55%)] transition-colors duration-300 py-3 md:py-5 block tracking-wide"
                  style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700 }}
                  onClick={() => setMenuOpen(false)}
                >
                  {item}
                </motion.a>
              ))}
            </div>

            <div className="hidden lg:block w-[40%] relative overflow-hidden">
              <motion.img
                src={door06}
                alt="Декоративная дверь"
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[hsl(215,50%,10%)]/40" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
