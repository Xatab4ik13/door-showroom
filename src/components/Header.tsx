import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { label: 'Каталог', href: '/catalog' },
  { label: 'Доставка и оплата', href: '#' },
  { label: 'О компании', href: '#' },
  { label: 'Поставщикам', href: '#' },
  { label: 'Контакты', href: '#' },
];

const Header = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const { totalItems } = useCart();
  const { isAuthenticated } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-6 md:px-12 py-4 flex items-center justify-between bg-transparent backdrop-blur-[2px]">
      <Link to="/" className="flex items-center">
        <img src={logo} alt="RUSDOORS" className="h-24 md:h-[120px] w-auto -my-8" />
      </Link>

      <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className="relative text-sm tracking-[0.12em] uppercase text-[hsl(215,50%,15%)] hover:text-[hsl(205,85%,45%)] transition-colors duration-300 py-1 group whitespace-nowrap"
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

      <div className="flex items-center gap-4">
        <Link
          to="/cart"
          className="relative p-2 text-[hsl(215,50%,15%)] hover:text-[hsl(205,85%,45%)] transition-colors drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
          aria-label="Корзина"
        >
          <ShoppingCart className="w-6 h-6" strokeWidth={1.5} />
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
          <User className="w-6 h-6" strokeWidth={1.5} />
        </Link>
      </div>
    </header>
  );
};

export default Header;
