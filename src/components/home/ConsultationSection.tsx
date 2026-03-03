import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Send, ArrowRight, CheckCircle2 } from 'lucide-react';
import maxIcon from '@/assets/icons/max-messenger.png';

type ContactMethod = 'phone' | 'telegram' | 'max';

type MethodDef = { key: ContactMethod; label: string; icon?: typeof Phone; img?: string };

const methods: MethodDef[] = [
  { key: 'phone', label: 'Телефон', icon: Phone },
  { key: 'telegram', label: 'Telegram', icon: Send },
  { key: 'max', label: 'Max', img: maxIcon },
];

const ConsultationSection = () => {
  const [method, setMethod] = useState<ContactMethod>('phone');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const placeholder =
    method === 'phone' ? '+7 (___) ___-__-__' :
    method === 'telegram' ? '@username' : 'Ваш ID в Max';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !agreed) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setName('');
    setContact('');
    setAgreed(false);
  };

  return (
    <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12 relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-[hsl(215,50%,12%)] rounded-none" />
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[hsl(205,85%,45%)]" />

      <div className="relative max-w-[900px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8 md:mb-10">
            <div className="w-10 h-[3px] bg-[hsl(205,85%,45%)] mb-5" />
            <h2
              className="text-2xl md:text-4xl font-bold uppercase tracking-wide text-white"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              НУЖНА <span className="text-[hsl(205,85%,45%)]">КОНСУЛЬТАЦИЯ</span>?
            </h2>
            <p
              className="text-white/50 text-sm md:text-base mt-3 max-w-[600px]"
              style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 300 }}
            >
              Наши специалисты помогут подобрать идеальную дверь и рассчитают стоимость с установкой
            </p>
          </div>

          {/* Contact method selector */}
          <div className="mb-6">
            <p
              className="text-xs font-bold uppercase tracking-[0.1em] text-white/70 mb-3"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Выберите удобный способ связи:
            </p>
            <div className="flex gap-2">
              {methods.map((m) => {
                const isActive = method === m.key;
                return (
                  <motion.button
                    key={m.key}
                    type="button"
                    onClick={() => setMethod(m.key)}
                    className={`group flex flex-col items-center gap-1.5 px-5 py-3 rounded-xl border transition-all duration-300 ${
                      isActive
                        ? 'border-[hsl(205,85%,45%)] bg-[hsl(205,85%,45%)]/10 text-[hsl(205,85%,45%)]'
                        : 'border-white/10 text-white/40 hover:border-white/25 hover:text-white/60'
                    }`}
                    data-active={isActive}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {m.img ? (
                      <img src={m.img} alt={m.label} className="w-5 h-5 rounded-sm brightness-0 invert opacity-60 group-data-[active=true]:opacity-100 group-data-[active=true]:brightness-100 group-data-[active=true]:invert-0" />
                    ) : (
                      m.icon && <m.icon className="w-5 h-5" strokeWidth={1.5} />
                    )}
                    <span
                      className="text-[11px] font-medium uppercase tracking-wider"
                      style={{ fontFamily: "'Oswald', sans-serif" }}
                    >
                      {m.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="Представьтесь"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[hsl(205,85%,45%)] transition-colors"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              />
              <input
                type="text"
                placeholder={placeholder}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                maxLength={50}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[hsl(205,85%,45%)] transition-colors"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              />
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              {/* Consent */}
              <label className="flex items-start gap-2.5 cursor-pointer flex-1">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${
                    agreed
                      ? 'bg-[hsl(205,85%,45%)] border-[hsl(205,85%,45%)]'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  onClick={() => setAgreed(!agreed)}
                >
                  {agreed && (
                    <motion.svg
                      width="12" height="12" viewBox="0 0 12 12" fill="none"
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                  )}
                </div>
                <span className="text-xs text-white/40 leading-relaxed" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 300 }}>
                  Даю согласие на обработку персональных данных
                </span>
              </label>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={!name.trim() || !contact.trim() || !agreed}
                className="px-8 py-3.5 bg-[hsl(205,85%,45%)] hover:bg-[hsl(205,85%,38%)] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center gap-2.5 transition-colors duration-300 shrink-0"
                whileHover={name.trim() && contact.trim() && agreed ? { scale: 1.03 } : {}}
                whileTap={name.trim() && contact.trim() && agreed ? { scale: 0.97 } : {}}
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                <span className="text-sm font-bold uppercase tracking-[0.12em]">Заказать</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </form>

          {/* Success message */}
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 flex items-center gap-2 text-emerald-400"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm" style={{ fontFamily: "'Oswald', sans-serif" }}>
                Заявка отправлена! Мы свяжемся с вами в ближайшее время.
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[hsl(205,85%,45%)]" />
    </section>
  );
};

export default ConsultationSection;
