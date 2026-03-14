import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from 'lucide-react';
import maxMessengerIcon from '@/assets/icons/max-messenger.png';

const phoneNumbers = [
  { label: 'Корпоративный', number: '8 (800) 302-33-23' },
  { label: 'Сотовый', number: '+7 (925) 741-48-91' },
  { label: 'Многоканальный', number: '8 (495) 131-33-23' },
];

const messengers = [
  {
    name: 'MAX',
    iconType: 'image' as const,
    imageSrc: maxMessengerIcon,
    color: 'hsl(270, 60%, 55%)',
    link: 'https://max.ru/u/f9LHodD0cOKDjN3SkyGYJJLgdHN7HB1yuuFdrWUYgluoj_yaku0MS1MxJG0',
  },
  {
    name: 'Telegram',
    iconType: 'lucide' as const,
    icon: Send,
    color: 'hsl(200, 80%, 50%)',
    link: 'https://t.me/rusdoors',
  },
];

const Contacts = () => {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 md:pt-40 pb-16 md:pb-20 px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-wide text-foreground"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            КОНТА<span className="text-primary">К</span>ТЫ
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl" style={{ fontFamily: "'Manrope', sans-serif" }}>
            Свяжитесь с нами любым удобным способом — мы всегда на связи
          </p>
        </motion.div>
      </section>

      {/* Main content */}
      <section className="px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto pb-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Left — Contact cards */}
          <div className="space-y-6">
            {/* Phones */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-card rounded-2xl border border-border p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <h2
                  className="text-xl font-bold uppercase tracking-wider text-foreground"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  Телефоны
                </h2>
              </div>
              <div className="space-y-4">
                {phoneNumbers.map((p, i) => (
                  <motion.a
                    key={i}
                    href={`tel:${p.number.replace(/\D/g, '')}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="group flex items-center justify-between py-3 px-4 rounded-xl hover:bg-secondary transition-colors duration-300"
                  >
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1" style={{ fontFamily: "'Oswald', sans-serif" }}>
                        {p.label}
                      </span>
                      <span className="text-lg font-medium text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: "'Manrope', sans-serif" }}>
                        {p.number}
                      </span>
                    </div>
                    <Phone className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Messengers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-card rounded-2xl border border-border p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <h2
                  className="text-xl font-bold uppercase tracking-wider text-foreground"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  Мессенджеры
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {messengers.map((m, i) => (
                  <motion.a
                    key={m.name}
                    href={m.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="group flex items-center gap-4 p-5 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${m.color}15` }}
                    >
                      {m.iconType === 'image' ? (
                        <img src={m.imageSrc} alt={m.name} className="w-7 h-7 object-contain" />
                      ) : (
                        m.icon && <m.icon className="w-6 h-6" style={{ color: m.color }} />
                      )}
                    </div>
                    <div>
                      <span
                        className="text-sm font-bold uppercase tracking-wider text-foreground block"
                        style={{ fontFamily: "'Oswald', sans-serif" }}
                      >
                        {m.name}
                      </span>
                      <span className="text-xs text-muted-foreground">Написать нам</span>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="bg-card rounded-2xl border border-border p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <h2
                  className="text-xl font-bold uppercase tracking-wider text-foreground"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  Email
                </h2>
              </div>
              <a
                href="mailto:info@rusdoors.su"
                className="text-lg text-foreground hover:text-primary transition-colors"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                info@rusdoors.su
              </a>
            </motion.div>
          </div>

          {/* Right — Address & Hours + decorative */}
          <div className="space-y-6">
            {/* Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-card rounded-2xl border border-border p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <h2
                  className="text-xl font-bold uppercase tracking-wider text-foreground"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  Адрес
                </h2>
              </div>
              <p className="text-foreground text-lg leading-relaxed" style={{ fontFamily: "'Manrope', sans-serif" }}>
                г. Москва
              </p>
              <p className="text-muted-foreground text-sm mt-2" style={{ fontFamily: "'Manrope', sans-serif" }}>
                Офис продаж
              </p>
            </motion.div>

            {/* Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-card rounded-2xl border border-border p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h2
                  className="text-xl font-bold uppercase tracking-wider text-foreground"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  Часы работы
                </h2>
              </div>
              <div className="space-y-3">
                {[
                  { day: 'Пн — Пт', time: '10:00 — 20:00' },
                  { day: 'Суббота', time: '10:00 — 18:00' },
                  { day: 'Воскресенье', time: 'Выходной' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
                      {row.day}
                    </span>
                    <span
                      className={`text-sm font-medium ${row.time === 'Выходной' ? 'text-muted-foreground' : 'text-foreground'}`}
                      style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: '0.05em' }}
                    >
                      {row.time}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Decorative CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="relative bg-gradient-to-br from-primary via-[hsl(205,70%,35%)] to-[hsl(215,50%,15%)] rounded-2xl p-8 md:p-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10">
                <h3
                  className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-white"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  Нужна консультация?
                </h3>
                <p className="mt-3 text-white/80 leading-relaxed" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  Наши специалисты помогут подобрать дверь, рассчитать стоимость и организовать доставку. Звоните или пишите — мы ответим в течение 15 минут.
                </p>
                <a
                  href="tel:88003023323"
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white/15 backdrop-blur-sm text-white rounded-xl hover:bg-white/25 transition-colors duration-300"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  <Phone className="w-4 h-4" />
                  <span className="uppercase tracking-wider text-sm font-medium">Позвонить</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contacts;
