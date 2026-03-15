import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Clock } from 'lucide-react';

interface NewsArticle {
  id: number;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  content: string;
  readTime: string;
  featured: boolean;
}

const newsItems: NewsArticle[] = [
  {
    id: 1,
    date: '2026-03-12',
    category: 'Обзоры',
    title: 'Как выбрать входную дверь в квартиру в Москве: полный гид 2026 года',
    excerpt: 'Разбираемся, на что обращать внимание при выборе входной двери для московской квартиры — от класса взломостойкости и теплоизоляции до типа замков и отделки. Практические советы от специалистов с 12-летним опытом.',
    content: `Выбор входной двери в квартиру — это вопрос безопасности, тепло- и шумоизоляции, а также эстетики. В Москве, где большинство жилого фонда — многоквартирные дома, требования к дверям имеют свою специфику.

**Класс взломостойкости.** Для квартиры в Москве рекомендуем двери не ниже 3-го класса по ГОСТ 31173-2016. Это означает устойчивость к вскрытию в течение минимум 20 минут. Все модели в каталоге RUSDOORS имеют сертификаты соответствия.

**Теплоизоляция.** В московских подъездах температура зимой может опускаться до +5–10°C. Оптимальный вариант — дверь с двумя контурами уплотнения и наполнителем из минеральной ваты или пенополиуретана толщиной не менее 70 мм.

**Шумоизоляция.** Для комфортного проживания показатель звукоизоляции должен быть не менее 32 дБ. Двери с тройным уплотнительным контуром и толстым полотном (от 80 мм) обеспечивают показатели 36–42 дБ.

**Замки.** Стандартная рекомендация — два замка разных типов: сувальдный (6+ сувальд) и цилиндровый (класс С или D по EN 1303). Многие наши клиенты в Москве выбирают дополнительно электронные замки с управлением через смартфон.

**Отделка.** Для квартирных дверей популярны панели МДФ с покрытием ПВХ или экошпоном — они устойчивы к царапинам и просты в уходе. В премиальном сегменте — натуральный шпон дуба или ореха.

Специалисты RUSDOORS помогут подобрать дверь под ваш бюджет и требования. Бесплатный замер по Москве и Московской области — оставьте заявку на сайте или позвоните по телефону 8 (800) 302-33-23.`,
    readTime: '7 мин',
    featured: true,
  },
  {
    id: 2,
    date: '2026-03-05',
    category: 'Обзоры',
    title: 'Межкомнатные двери для новостройки: какие выбрать и на что обратить внимание',
    excerpt: 'Если вы получили ключи от новостройки в Москве, одна из первых задач — установка межкомнатных дверей. Разбираем типы конструкций, материалы и частые ошибки при выборе.',
    content: `Новостройки в Москве сдаются, как правило, без межкомнатных дверей или с дешёвыми временными полотнами. Правильный выбор дверей на этапе ремонта — это инвестиция в комфорт на долгие годы.

**Усадка дома.** В первые 1–2 года новостройка может давать усадку. Это не повод откладывать установку, но важно учесть при выборе. Двери на регулируемых петлях и с телескопическими наличниками легче адаптируются к небольшим деформациям проёмов.

**Типы конструкций:**
- *Щитовые* — лёгкие и доступные, полотно с ячеистым наполнителем. Подходят для бюджетного ремонта.
- *Царговые* — каркас из вертикальных и горизонтальных планок со вставками. Прочнее щитовых, хороший баланс цены и качества.
- *Филёнчатые* — классические двери из массива или МДФ с декоративными вставками. Солидный внешний вид, долговечность.

**Покрытия:** Экошпон, ПВХ-плёнка, натуральный шпон, эмаль. Для влажных помещений (ванная) выбирайте ПВХ или экошпон — они не боятся влаги. Для гостиной и спальни — натуральный шпон для премиального вида.

**Фурнитура.** Не экономьте на ручках и петлях — это то, с чем вы контактируете каждый день. В RUSDOORS мы предлагаем фурнитуру от проверенных производителей: Morelli, Renz, Archie.

Заказывайте межкомнатные двери с установкой в Москве — доставим и смонтируем в удобное время.`,
    readTime: '6 мин',
    featured: false,
  },
  {
    id: 3,
    date: '2026-02-20',
    category: 'Обзоры',
    title: 'Двери скрытого монтажа: тренд дизайна интерьеров 2026 года в Москве',
    excerpt: 'Двери вровень со стеной без наличников — один из главных трендов интерьерного дизайна. Рассказываем, как устроены двери скрытого монтажа, кому они подходят и сколько стоят в Москве.',
    content: `Двери скрытого монтажа (или двери-невидимки) — это конструкции, которые устанавливаются вровень со стеной. Коробка полностью скрыта в проёме, а полотно можно покрасить или оклеить обоями в цвет стены.

**Как устроены.** Основа — алюминиевый короб, который монтируется на этапе черновой отделки и штукатурится вместе со стеной. Полотно крепится на скрытые петли с регулировкой в трёх плоскостях.

**Преимущества:**
- Визуально расширяют пространство — особенно актуально для московских квартир с типичной площадью 40–70 м²
- Идеально вписываются в минималистичные интерьеры
- Можно красить в любой цвет водоэмульсионной краской
- Подходят для высоких проёмов до потолка

**Кому подходят.** Дизайнеры интерьеров в Москве всё чаще закладывают двери-невидимки в проекты квартир бизнес-класса и выше. Они особенно эффектны в длинных коридорах с несколькими дверями, в гардеробных и технических помещениях.

**Стоимость.** В RUSDOORS двери скрытого монтажа доступны от 18 000 ₽ за полотно. Полный комплект с коробкой и установкой — от 35 000 ₽. Для точного расчёта оставьте заявку на бесплатный замер.

Посмотрите модели в нашем каталоге или запишитесь на консультацию по телефону 8 (800) 302-33-23.`,
    readTime: '5 мин',
    featured: false,
  },
  {
    id: 4,
    date: '2026-02-10',
    category: 'Новинки',
    title: 'Электронные замки для входных дверей: обзор лучших моделей 2026 года',
    excerpt: 'Вход по отпечатку пальца, через приложение или код — электронные замки становятся стандартом в московских новостройках. Обзор популярных моделей, которые мы устанавливаем на входные двери.',
    content: `Электронные замки перестали быть экзотикой — всё больше москвичей выбирают их для входных дверей в квартиру. Удобство, безопасность и возможность управления через смартфон делают их отличным решением для семей и тех, кто часто забывает ключи.

**Типы электронных замков:**

*Биометрические* — открываются по отпечатку пальца. Время распознавания — менее 0,5 секунды. Хранят до 100 отпечатков. Лучшие модели: Samsung SHP-DP609, Xiaomi Aqara Smart Lock D100.

*С цифровым кодом* — PIN-код из 4–8 цифр. Функция «антислежка» добавляет случайные цифры до и после кода, чтобы соседи не подсмотрели комбинацию.

*С управлением через смартфон* — Bluetooth или Wi-Fi подключение. Можно давать временные «электронные ключи» гостям, курьерам, клинингу. Удобно для сдачи квартиры в аренду.

**Важно знать:**
- Электронный замок устанавливается как дополнение к механическому, а не вместо него
- Питание от батареек AA (хватает на 8–12 месяцев) с предупреждением о низком заряде
- При полной разрядке есть аварийное питание через USB-C порт

**Установка в Москве.** RUSDOORS выполняет установку электронных замков на новые и уже установленные входные двери. Стоимость монтажа — от 3 000 ₽. Выезд мастера — бесплатно.`,
    readTime: '6 мин',
    featured: false,
  },
  {
    id: 5,
    date: '2026-01-25',
    category: 'Компания',
    title: 'Бесплатный замер дверей по Москве и Московской области',
    excerpt: 'RUSDOORS предлагает бесплатный выезд замерщика по всей Москве и в пределах 30 км от МКАД. Рассказываем, как записаться, что входит в замер и зачем он нужен.',
    content: `Точный замер дверного проёма — обязательный этап перед покупкой двери. Ошибка даже в 5 мм может привести к проблемам при установке. Именно поэтому RUSDOORS предлагает бесплатный профессиональный замер.

**Что входит в замер:**
- Измерение ширины, высоты и глубины дверного проёма
- Проверка геометрии стен (отклонения, перепады)
- Оценка состояния откосов и смежных конструкций
- Рекомендации по подготовке проёма к монтажу
- Консультация по выбору модели двери и фурнитуры

**Как записаться:**
1. Позвоните по телефону 8 (800) 302-33-23 или +7 (925) 741-48-91
2. Оставьте заявку на сайте rusdoors.su в разделе «Контакты»
3. Напишите нам в Telegram: @rusdoors

Замерщик приедет в согласованное время с образцами покрытий и каталогом. Среднее время визита — 20–30 минут.

**География:** Бесплатный замер действует по всей Москве (включая Новую Москву) и в радиусе 30 км от МКАД. Для более удалённых адресов Московской области стоимость выезда — от 1 000 ₽ (вычитается из суммы заказа).

Мы работаем без выходных с 9:00 до 21:00. Запишитесь на замер уже сегодня!`,
    readTime: '3 мин',
    featured: false,
  },
  {
    id: 6,
    date: '2026-01-15',
    category: 'Обзоры',
    title: 'Шумоизоляция дверей в московской квартире: что реально работает',
    excerpt: 'Шум от соседей и из подъезда — одна из главных проблем многоквартирных домов в Москве. Разбираемся, какие двери действительно изолируют звук, а какие решения — маркетинговый миф.',
    content: `Шумоизоляция — один из ключевых параметров при выборе дверей в московскую квартиру. Особенно это актуально для домов панельного типа, где звукопроводность стен и так высокая.

**Входные двери и шум из подъезда.**

Основной источник шума — щели между дверью и коробкой. Качественная дверь должна иметь:
- Минимум два контура уплотнения (идеально — три)
- Толщину полотна от 80 мм
- Наполнитель из минеральной ваты (не пенопласта!)
- Порог или автоматический уплотнитель снизу

Двери с этими характеристиками обеспечивают звукоизоляцию 36–42 дБ. Это означает, что разговор в подъезде будет практически неслышен.

**Межкомнатные двери.**

Для звукоизоляции между комнатами важны:
- *Полнотелое полотно* — двери с ячеистым наполнителем (сотовые) почти не держат звук. Выбирайте полотна с заполнением ДСП или МДФ
- *Уплотнитель* — даже на межкомнатные двери стоит ставить силиконовый уплотнитель по периметру
- *Порожек или drop-seal* — нижняя щель «пропускает» больше звука, чем кажется

**Что НЕ работает:**
- Декоративные наклейки и обивка двери (эффект менее 2 дБ)
- Второй замок (не влияет на звукоизоляцию)
- Металлическая дверь без наполнителя (металл — отличный проводник звука)

В RUSDOORS вы можете проконсультироваться с нашими специалистами о шумоизоляции и подобрать дверь с оптимальными характеристиками. Звоните 8 (800) 302-33-23.`,
    readTime: '8 мин',
    featured: false,
  },
];

const categories = ['Все', 'Новинки', 'Обзоры', 'Компания'];

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
};


const News = () => {
  const [activeCategory, setActiveCategory] = useState('Все');

  const filtered = activeCategory === 'Все'
    ? newsItems
    : newsItems.filter(n => n.category === activeCategory);

  const featured = filtered.find(n => n.featured) || filtered[0];
  const rest = filtered.filter(n => n.id !== featured?.id);

  return (
    <>

      {/* Hero */}
      <section className="pt-32 md:pt-40 pb-12 md:pb-16 px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-wide text-foreground"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            НОВО<span className="text-[hsl(205,85%,45%)]">С</span>ТИ
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl" style={{ fontFamily: "'Manrope', sans-serif" }}>
            Обзоры, новинки и полезные материалы из мира дверей
          </p>
        </motion.div>

        {/* Category filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-8 flex flex-wrap gap-2"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm uppercase tracking-wider transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-[hsl(205,85%,45%)] text-white'
                  : 'bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
              style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 500 }}
            >
              {cat}
            </button>
          ))}
        </motion.div>
      </section>

      {/* Featured article */}
      {featured && (
        <section className="px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto mb-12">
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="group relative bg-secondary rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-500"
          >
            <div className="grid md:grid-cols-2">
              {/* Gradient placeholder */}
              <div className="aspect-[16/10] md:aspect-auto bg-gradient-to-br from-[hsl(205,85%,45%)] via-[hsl(205,70%,35%)] to-[hsl(215,50%,15%)] relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-white/10 text-[120px] md:text-[180px] font-bold uppercase select-none"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    RD
                  </span>
                </div>
                <div className="absolute top-4 left-4">
                  <span
                    className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs uppercase tracking-widest rounded-full"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    {featured.category}
                  </span>
                </div>
              </div>

              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-4 text-muted-foreground text-sm mb-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(featured.date)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {featured.readTime}
                  </span>
                </div>
                <h2
                  className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-foreground group-hover:text-[hsl(205,85%,45%)] transition-colors duration-300"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  {featured.title}
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {featured.excerpt}
                </p>
                <div className="mt-6 flex items-center gap-2 text-[hsl(205,85%,45%)] group-hover:gap-3 transition-all duration-300">
                  <span
                    className="text-sm uppercase tracking-wider font-medium"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    Читать
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.article>
        </section>
      )}

      {/* News grid */}
      <section className="px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((item, i) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              className="group bg-card rounded-xl border border-border overflow-hidden cursor-pointer hover:border-[hsl(205,85%,45%)]/30 hover:shadow-md transition-all duration-400"
            >
              {/* Mini gradient header */}
              <div className="h-40 bg-gradient-to-br from-secondary via-accent to-muted relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-foreground/5 text-[80px] font-bold uppercase select-none"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    {String(item.id).padStart(2, '0')}
                  </span>
                </div>
                <div className="absolute top-3 left-3">
                  <span
                    className="px-2.5 py-1 bg-background/80 backdrop-blur-sm text-foreground text-[10px] uppercase tracking-widest rounded-full"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 text-muted-foreground text-xs mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.readTime}
                  </span>
                </div>
                <h3
                  className="text-lg font-bold uppercase tracking-wide text-foreground group-hover:text-[hsl(205,85%,45%)] transition-colors duration-300 line-clamp-2"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  {item.title}
                </h3>
                <p
                  className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  {item.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-[hsl(205,85%,45%)] opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-300">
                  <span className="text-xs uppercase tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>
                    Читать далее
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

    </>
  );
};

export default News;
