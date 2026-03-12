import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, X, ArrowRight, Phone, Package, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/logo.png';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { label: 'Каталог', href: '/catalog' },
  { label: 'Доставка и оплата', href: '/delivery' },
  { label: 'О компании', href: '/about' },
  { label: 'Новости', href: '/news' },
  { label: 'Контакты', href: '/contacts' },
];

const accountLinks = [
  { label: 'Профиль', href: '/account', icon: User },
  { label: 'Заказы', href: '/account', icon: Package },
  { label: 'Адреса', href: '/account', icon: MapPin },
];

const Header = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 px-4 md:px-6 lg:px-12 py-4 flex items-center justify-between bg-transparent backdrop-blur-[2px]">
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="RUSDOORS"
            className="h-[130px] md:h-[140px] w-auto -my-10"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="relative text-[15px] tracking-[0.12em] uppercase text-[hsl(215,50%,15%)] hover:text-[hsl(205,85%,45%)] transition-colors duration-300 py-1 group whitespace-nowrap"
              style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500, textShadow: '0 0 8px rgba(255,255,255,0.9), 0 0 16px rgba(255,255,255,0.5)' }}
              onMouseEnter={() => setActiveItem(item.label)}
              onMouseLeave={() => setActiveItem(null)}
            >
              {item.label}
              <span
                className={`absolute bottom-0 left-0 h-[2px] bg-[hsl(205,85%,45%)] transition-all duration-300 ${
                  activeItem === item.label ? 'w-full' : 'w-0'
                }`}
              />
            </Link>
          ))}
        </nav>

        {/* Desktop icons */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            to="/cart"
            className="relative p-2 text-[hsl(215,50%,15%)] hover:text-[hsl(205,85%,45%)] transition-colors drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
            aria-label="Корзина"
          >
            <ShoppingCart className="w-7 h-7" strokeWidth={1.5} />
            {totalItems > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[hsl(205,85%,45%)] text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {totalItems}
              </span>
            )}
          </Link>
          <Link
            to={isAuthenticated ? '/account' : '/login'}
            className="p-2 text-[hsl(215,50%,15%)] hover:text-[hsl(205,85%,45%)] transition-colors drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
            aria-label="Личный кабинет"
          >
            <User className="w-7 h-7" strokeWidth={1.5} />
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden relative z-50 w-10 h-10 flex flex-col items-center justify-center gap-[6px] group"
          aria-label="Меню"
        >
          <motion.span
            animate={menuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="block w-7 h-[2px] bg-[hsl(215,50%,15%)] origin-center"
            style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.9))' }}
          />
          <motion.span
            animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.2 }}
            className="block w-7 h-[2px] bg-[hsl(215,50%,15%)] origin-center"
            style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.9))' }}
          />
          <motion.span
            animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="block w-7 h-[2px] bg-[hsl(215,50%,15%)] origin-center"
            style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.9))' }}
          />
        </button>
      </header>

      {/* Mobile fullscreen menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-30 bg-background"
          >
            <div className="h-full flex flex-col pt-28 px-8 pb-8 overflow-y-auto">
              {/* Navigation links */}
              <nav className="flex-1 flex flex-col justify-center -mt-12">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="group flex items-center py-4 border-b border-border"
                    >
                      <span
                        className="text-2xl sm:text-3xl font-bold uppercase tracking-wider text-foreground group-hover:text-[hsl(205,85%,45%)] transition-colors duration-300"
                        style={{ fontFamily: "'Oswald', sans-serif" }}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Bottom section: Cart + Account */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.35, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-3 pt-6"
              >
                <Link
                  to="/cart"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-5 py-4 bg-secondary rounded-xl group hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-5 h-5 text-[hsl(205,85%,45%)]" strokeWidth={1.5} />
                    <span
                      className="text-sm font-medium uppercase tracking-wider text-foreground"
                      style={{ fontFamily: "'Oswald', sans-serif" }}
                    >
                      Корзина
                    </span>
                  </div>
                  {totalItems > 0 && (
                    <span
                      className="w-6 h-6 bg-[hsl(205,85%,45%)] text-white text-xs font-bold rounded-full flex items-center justify-center"
                      style={{ fontFamily: "'Oswald', sans-serif" }}
                    >
                      {totalItems}
                    </span>
                  )}
                </Link>

                <Link
                  to={isAuthenticated ? '/account' : '/login'}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-5 py-4 bg-[hsl(205,85%,45%)] rounded-xl group hover:opacity-90 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-white" strokeWidth={1.5} />
                    <span
                      className="text-sm font-medium uppercase tracking-wider text-white"
                      style={{ fontFamily: "'Oswald', sans-serif" }}
                    >
                      {isAuthenticated ? 'Личный кабинет' : 'Войти'}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/70" />
                </Link>

                {/* Contact info */}
                <div className="flex items-center gap-2 pt-4 justify-center">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a
                    href="tel:+74951234567"
                    className="text-sm text-muted-foreground hover:text-[hsl(205,85%,45%)] transition-colors"
                  >
                    +7 (495) 123-45-67
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
