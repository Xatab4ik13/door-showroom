import { motion } from 'framer-motion';
import { Ruler, Wrench, Sparkles, CheckCircle2, Building2, Calendar, ShieldCheck, Award } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const whyChoose = [
  { icon: Calendar, text: 'Работаем на рынке дверей с 2014 года' },
  { icon: Building2, text: 'Широкий ассортимент входных и межкомнатных дверей' },
  { icon: ShieldCheck, text: 'Качественная продукция от проверенных производителей' },
  { icon: Award, text: 'Доступные цены и регулярное обновление каталога' },
];

const features = [
  'Помощь в выборе дверей для квартиры, дома или офиса',
  'Удобный заказ через интернет-магазин',
];

const About = () => {
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
                О КОМ<span className="text-[hsl(205,85%,45%)]">П</span>АНИ<span className="text-[hsl(205,85%,45%)]">И</span>
              </motion.h1>
              <motion.p
                custom={1}
                variants={fadeUp}
                className="mt-4 text-lg md:text-xl text-muted-foreground leading-relaxed"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Не просто двери, а полный цикл заботы
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* About intro */}
        <section className="pb-16 md:pb-24 px-4 md:px-8 lg:px-12">
          <div className="max-w-[1600px] mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20"
            >
              <motion.div custom={0} variants={fadeUp} className="space-y-6">
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  Rusdoors — интернет-магазин входных и межкомнатных дверей, работающий на рынке с 2014 года. Мы специализируемся на продаже качественных дверей для квартир, частных домов, офисов и коммерческих помещений.
                </p>
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  В каталоге интернет-магазина Rusdoors представлен широкий выбор продукции: входные металлические двери, межкомнатные двери, современные дизайнерские модели, классические дверные решения, а также дверная фурнитура и комплектующие.
                </p>
              </motion.div>
              <motion.div custom={1} variants={fadeUp} className="space-y-6">
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  Главная задача Rusdoors — сделать процесс покупки дверей удобным и доступным. В нашем интернет-магазине вы можете быстро подобрать и купить входную или межкомнатную дверь, сравнить характеристики моделей, выбрать подходящий дизайн и оформить заказ онлайн.
                </p>
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  Мы постоянно расширяем ассортимент и следим за современными тенденциями в производстве дверей. В каталоге представлены как бюджетные модели, так и премиальные решения для интерьеров любого стиля.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Services: Замеры + Установка */}
        <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12 bg-secondary">
          <div className="max-w-[1600px] mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="text-center mb-12 md:mb-16"
            >
              <motion.h2
                custom={0}
                variants={fadeUp}
                className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-foreground"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                НАШ СЕ<span className="text-[hsl(205,85%,45%)]">Р</span>ВИ<span className="text-[hsl(205,85%,45%)]">С</span>
              </motion.h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Ruler,
                  title: 'Профессиональные замеры',
                  desc: 'Наш мастер приедет, всё тщательно измерит, подскажет оптимальные решения и поможет избежать ошибок. Это гарантирует идеальную посадку двери.',
                },
                {
                  icon: Wrench,
                  title: 'Установка под ключ',
                  desc: 'Мы устанавливаем двери ровно, аккуратно, без пыли и хаоса. Премиальные двери требуют премиального подхода — и мы его обеспечиваем.',
                },
                {
                  icon: Sparkles,
                  title: 'Внимание к деталям',
                  desc: 'Мы работаем не по принципу «продал и забыл». Каждая дверь проходит путь от точного замера до аккуратной установки — всё под контролем наших специалистов.',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-30px' }}
                  custom={i}
                  variants={fadeUp}
                  className="p-8 rounded-xl bg-background border border-border space-y-4"
                >
                  <div className="w-14 h-14 flex items-center justify-center rounded-lg bg-[hsl(205,85%,45%)]/10">
                    <item.icon className="w-7 h-7 text-[hsl(205,85%,45%)]" strokeWidth={1.5} />
                  </div>
                  <h3
                    className="text-base font-bold uppercase tracking-wider text-foreground"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why choose */}
        <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12">
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
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto"
            >
              {whyChoose.map((item, i) => (
                <motion.div
                  key={item.text}
                  custom={i}
                  variants={fadeUp}
                  className="flex items-start gap-4 p-6 rounded-xl bg-secondary border border-border"
                >
                  <item.icon className="w-6 h-6 text-[hsl(205,85%,45%)] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span
                    className="text-sm font-medium text-foreground leading-snug"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                  >
                    {item.text}
                  </span>
                </motion.div>
              ))}
              {features.map((item, i) => (
                <motion.div
                  key={item}
                  custom={i + whyChoose.length}
                  variants={fadeUp}
                  className="flex items-start gap-4 p-6 rounded-xl bg-secondary border border-border"
                >
                  <CheckCircle2 className="w-6 h-6 text-[hsl(205,85%,45%)] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span
                    className="text-sm font-medium text-foreground leading-snug"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                  >
                    {item}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 md:py-20 px-4 md:px-8 lg:px-12 bg-[hsl(205,85%,45%)]">
          <div className="max-w-[1600px] mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.p
                custom={0}
                variants={fadeUp}
                className="text-white/80 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Rusdoors — интернет-магазин, где можно купить входные и межкомнатные двери с гарантией качества и надёжности. С 2014 года мы помогаем клиентам выбирать двери, которые обеспечивают безопасность, комфорт и стильный внешний вид.
              </motion.p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
