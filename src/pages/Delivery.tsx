import { motion } from 'framer-motion';
import { Truck, CreditCard, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const paymentMethods = [
  'Банковские карты',
  'Онлайн‑платежи',
  'Перевод',
  'Оплата при получении',
];

const whyUs = [
  'Честные сроки',
  'Понятный сервис',
  'Широкий выбор дверей под любой интерьер',
  'Поддержка на каждом этапе',
];

const Delivery = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-32 md:pt-40 pb-16 md:pb-24 px-4 md:px-8 lg:px-12">
          <div className="max-w-[1600px] mx-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              className="max-w-3xl"
            >
              <motion.h1
                custom={0}
                variants={fadeUp}
                className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-wide text-foreground leading-[1.1]"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                ДОСТА<span className="text-[hsl(205,85%,45%)]">В</span>КА И ОП<span className="text-[hsl(205,85%,45%)]">Л</span>АТА
              </motion.h1>
              <motion.p
                custom={1}
                variants={fadeUp}
                className="mt-4 text-lg md:text-xl text-muted-foreground leading-relaxed"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Двери, которые приходят вовремя
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Delivery section */}
        <section className="pb-16 md:pb-24 px-4 md:px-8 lg:px-12">
          <div className="max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
              {/* Left — delivery info */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                className="space-y-8"
              >
                <motion.div custom={0} variants={fadeUp} className="flex items-start gap-5">
                  <div className="w-14 h-14 flex items-center justify-center rounded-lg bg-[hsl(205,85%,45%)]/10 shrink-0">
                    <Truck className="w-7 h-7 text-[hsl(205,85%,45%)]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3
                      className="text-lg font-bold uppercase tracking-wider text-foreground"
                      style={{ fontFamily: "'Oswald', sans-serif" }}
                    >
                      Точно в срок
                    </h3>
                    <p className="mt-2 text-muted-foreground leading-relaxed" style={{ fontFamily: "'Manrope', sans-serif" }}>
                      В Rusdoors мы не просто продаём двери — мы доставляем их точно в назначенные сроки, без переносов и сюрпризов. Вы выбираете дату, мы берём обязательство и выполняем его.
                    </p>
                  </div>
                </motion.div>

                <motion.div custom={1} variants={fadeUp} className="flex items-start gap-5">
                  <div className="w-14 h-14 flex items-center justify-center rounded-lg bg-[hsl(205,85%,45%)]/10 shrink-0">
                    <Clock className="w-7 h-7 text-[hsl(205,85%,45%)]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3
                      className="text-lg font-bold uppercase tracking-wider text-foreground"
                      style={{ fontFamily: "'Oswald', sans-serif" }}
                    >
                      Быстрая доставка
                    </h3>
                    <p className="mt-2 text-muted-foreground leading-relaxed" style={{ fontFamily: "'Manrope', sans-serif" }}>
                      Доставка по Москве и Московской области в течение 24 часов. Мы ценим ваше время и делаем всё, чтобы вы получили заказ максимально быстро.
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right — payment */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                className="space-y-8"
              >
                <motion.div custom={0} variants={fadeUp}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 flex items-center justify-center rounded-lg bg-[hsl(205,85%,45%)]/10 shrink-0">
                      <CreditCard className="w-7 h-7 text-[hsl(205,85%,45%)]" strokeWidth={1.5} />
                    </div>
                    <h3
                      className="text-lg font-bold uppercase tracking-wider text-foreground"
                      style={{ fontFamily: "'Oswald', sans-serif" }}
                    >
                      Оплата так, как удобно вам
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    Мы сделали процесс покупки максимально простым. В Rusdoors доступны все современные способы оплаты. Выбирайте то, что комфортно именно вам.
                  </p>
                  <ul className="space-y-3">
                    {paymentMethods.map((method, i) => (
                      <motion.li
                        key={method}
                        custom={i + 1}
                        variants={fadeUp}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle2 className="w-5 h-5 text-[hsl(205,85%,45%)] shrink-0" strokeWidth={1.5} />
                        <span className="text-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
                          {method}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why choose section */}
        <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12 bg-secondary">
          <div className="max-w-[1600px] mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="text-center mb-12"
            >
              <motion.h2
                custom={0}
                variants={fadeUp}
                className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-foreground"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                ПОЧЕ<span className="text-[hsl(205,85%,45%)]">М</span>У ВЫБИРА<span className="text-[hsl(205,85%,45%)]">Ю</span>Т RUSDOORS
              </motion.h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {whyUs.map((item, i) => (
                <motion.div
                  key={item}
                  custom={i}
                  variants={fadeUp}
                  className="flex items-start gap-4 p-6 rounded-xl bg-background border border-border"
                >
                  <ShieldCheck className="w-6 h-6 text-[hsl(205,85%,45%)] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span
                    className="text-sm font-medium uppercase tracking-wider text-foreground"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    {item}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Delivery;
