import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import logo from '@/assets/logo.png';

const footerLinks = [
  {
    title: 'Каталог',
    links: [
      { label: 'Межкомнатные двери', to: '/catalog?category=mezhkomnatnye' },
      { label: 'Входные двери', to: '/catalog?category=vhodnye' },
      { label: 'Фурнитура', to: '/catalog?category=furnitura' },
    ],
  },
  {
    title: 'Компания',
    links: [
      { label: 'О компании', to: '/about' },
      { label: 'Доставка и оплата', to: '/delivery' },
      { label: 'Новости', to: '/news' },
      { label: 'Контакты', to: '/contacts' },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="bg-secondary border-t border-border">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img src={logo} alt="RusDoors" className="h-24 md:h-[120px] w-auto -my-4" />
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Премиальные двери для вашего интерьера. Широкий ассортимент от ведущих производителей.
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4
                className="text-sm font-bold uppercase tracking-widest mb-4 text-foreground"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
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
              className="text-sm font-bold uppercase tracking-widest mb-4 text-foreground"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Контакты
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <a href="tel:88003023323" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  8 (800) 302-33-23
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <a href="tel:+79257414891" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  +7 (925) 741-48-91
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <a href="mailto:info@rusdoors.su" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  info@rusdoors.su
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">Пн–Сб: 10:00–20:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
            © {new Date().getFullYear()} RusDoors. Все права защищены.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Политика конфиденциальности
            </Link>
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Пользовательское соглашение
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
