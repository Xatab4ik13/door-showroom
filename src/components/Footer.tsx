import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import logo from '@/assets/logo.png';

const footerLinks = [
  {
    title: 'Каталог',
    links: [
      { label: 'Межкомнатные двери', to: '/catalog' },
      { label: 'Входные двери', to: '/catalog' },
      { label: 'Перегородки', to: '/catalog' },
      { label: 'Фурнитура', to: '/catalog' },
    ],
  },
  {
    title: 'Компания',
    links: [
      { label: 'О компании', to: '/' },
      { label: 'Доставка и оплата', to: '/' },
      { label: 'Поставщикам', to: '/' },
      { label: 'Контакты', to: '/' },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img src={logo} alt="RusDoors" className="h-8 brightness-0 invert" />
            </Link>
            <p className="text-sm leading-relaxed opacity-70" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Премиальные двери для вашего интерьера. Широкий ассортимент от ведущих производителей.
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4
                className="text-sm font-bold uppercase tracking-widest mb-4 opacity-90"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm opacity-60 hover:opacity-100 transition-opacity"
                      style={{ fontFamily: "'Manrope', sans-serif" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contacts */}
          <div>
            <h4
              className="text-sm font-bold uppercase tracking-widest mb-4 opacity-90"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Контакты
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 mt-0.5 opacity-60 shrink-0" />
                <a href="tel:+74951234567" className="text-sm opacity-60 hover:opacity-100 transition-opacity">
                  +7 (495) 123-45-67
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 mt-0.5 opacity-60 shrink-0" />
                <a href="mailto:info@rusdoors.su" className="text-sm opacity-60 hover:opacity-100 transition-opacity">
                  info@rusdoors.su
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 opacity-60 shrink-0" />
                <span className="text-sm opacity-60">Москва, ул. Примерная, д. 1</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 mt-0.5 opacity-60 shrink-0" />
                <span className="text-sm opacity-60">Пн–Сб: 10:00–20:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs opacity-40" style={{ fontFamily: "'Manrope', sans-serif" }}>
            © {new Date().getFullYear()} RusDoors. Все права защищены.
          </p>
          <div className="flex gap-6">
            <Link to="/" className="text-xs opacity-40 hover:opacity-70 transition-opacity">
              Политика конфиденциальности
            </Link>
            <Link to="/" className="text-xs opacity-40 hover:opacity-70 transition-opacity">
              Пользовательское соглашение
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
