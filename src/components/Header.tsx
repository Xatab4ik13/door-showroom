import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import logo from '@/assets/logo.png';
import door06 from '@/assets/doors/door-06.jpg';

const navItems = ['Каталог', 'Коллекции', 'Дизайнерам', 'Вдохновение', 'Контакты'];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 px-6 md:px-12 py-5 flex items-center justify-between bg-background/70 backdrop-blur-md">
        <a href="/" className="flex items-center">
          <img src={logo} alt="RUSDOORS" className="h-12 md:h-[60px] w-auto" />
        </a>

        <nav className="hidden lg:flex items-center gap-10">
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              {item}
            </a>
          ))}
        </nav>

        <button
          onClick={() => setMenuOpen(true)}
          className="p-2 text-foreground hover:text-muted-foreground transition-colors"
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
            className="fixed inset-0 z-50 bg-background flex"
          >
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-5 right-6 md:right-12 p-2 text-foreground hover:text-muted-foreground transition-colors z-10"
              aria-label="Закрыть меню"
            >
              <X className="w-6 h-6" strokeWidth={1.5} />
            </button>

            <div className="flex-1 flex flex-col justify-center px-8 md:px-20 lg:px-32">
              {navItems.map((item, i) => (
                <motion.a
                  key={item}
                  href="#"
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                  className="font-serif text-4xl md:text-6xl lg:text-7xl font-light text-foreground hover:text-muted-foreground transition-colors duration-300 py-3 md:py-5 block"
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
