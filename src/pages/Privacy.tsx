import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const Privacy = () => {
  return (
    <main>
      <section className="pt-32 md:pt-40 pb-16 md:pb-24 px-4 md:px-8 lg:px-12">
        <div className="max-w-[900px] mx-auto">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground mb-6"
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
          >
            Политика конфиденциальности
          </motion.h1>

          <motion.p
            className="text-muted-foreground mb-12"
            style={{ fontFamily: "'Manrope', sans-serif" }}
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
          >
            Дата последнего обновления: 13 марта 2026 г.
          </motion.p>

          <motion.div
            className="prose prose-neutral max-w-none space-y-8"
            style={{ fontFamily: "'Manrope', sans-serif" }}
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
          >
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-light text-foreground">1. Общие положения</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки и защиты
                персональных данных пользователей (далее — «Пользователь») интернет-магазина RusDoors, расположенного
                по адресу <strong className="text-foreground">rusdoors.su</strong> (далее — «Сайт»).
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Оператором персональных данных является <strong className="text-foreground">ИП Савкин Руслан Игоревич</strong>,
                ОГРНИП: 321774600133331, ИНН: 672708949520, адрес: 142720, Московская обл., г. Видное, п. Битца,
                мкр Южная Битца, ул. Ботаническая, д. 12, кв. 135.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Используя Сайт, Пользователь выражает своё согласие с условиями настоящей Политики. В случае несогласия
                с условиями Политики Пользователь должен прекратить использование Сайта.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-light text-foreground">2. Цели сбора персональных данных</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">Оператор собирает и обрабатывает персональные данные Пользователя в следующих целях:</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Оформление и обработка заказов на товары, представленные на Сайте;</li>
                <li>Связь с Пользователем для подтверждения заказа, уточнения деталей доставки и оплаты;</li>
                <li>Предоставление информации о товарах, акциях и специальных предложениях (при согласии Пользователя);</li>
                <li>Улучшение качества обслуживания и работы Сайта;</li>
                <li>Исполнение обязательств перед Пользователем, в том числе по договору купли-продажи;</li>
                <li>Соблюдение требований законодательства Российской Федерации.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-light text-foreground">3. Перечень собираемых данных</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">Оператор может собирать следующие персональные данные:</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Фамилия, имя, отчество;</li>
                <li>Номер телефона;</li>
                <li>Адрес электронной почты;</li>
                <li>Адрес доставки;</li>
                <li>Данные о заказах и истории покупок;</li>
                <li>IP-адрес, данные файлов cookie и аналитические данные о взаимодействии с Сайтом.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-light text-foreground">4. Порядок обработки данных</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Обработка персональных данных осуществляется на законной и справедливой основе, в соответствии
                с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных». Обработка включает сбор,
                запись, систематизацию, накопление, хранение, уточнение, извлечение, использование, передачу,
                обезличивание, блокирование, удаление и уничтожение персональных данных.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Персональные данные не передаются третьим лицам, за исключением случаев, предусмотренных
                законодательством РФ, а также при необходимости передачи данных службам доставки для
                исполнения заказа Пользователя.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-light text-foreground">5. Защита персональных данных</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Оператор принимает необходимые организационные и технические меры для защиты персональных
                данных от неправомерного или случайного доступа, уничтожения, изменения, блокирования,
                копирования, распространения, а также от иных неправомерных действий третьих лиц.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-light text-foreground">6. Использование файлов cookie</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Сайт использует файлы cookie для обеспечения корректной работы, персонализации контента
                и анализа трафика. Пользователь может отключить использование cookie в настройках браузера,
                однако это может повлиять на функциональность Сайта.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-light text-foreground">7. Права Пользователя</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">Пользователь имеет право:</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Запросить информацию о своих персональных данных, обрабатываемых Оператором;</li>
                <li>Требовать уточнения, блокирования или уничтожения персональных данных;</li>
                <li>Отозвать согласие на обработку персональных данных, направив запрос на электронную почту;</li>
                <li>Обратиться в уполномоченный орган по защите прав субъектов персональных данных (Роскомнадзор).</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-light text-foreground">8. Сроки хранения данных</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Персональные данные Пользователя хранятся до момента достижения целей обработки или до
                отзыва согласия Пользователем, но не более срока, установленного законодательством РФ.
                По истечении срока хранения данные подлежат уничтожению.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-light text-foreground">9. Изменение Политики</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Оператор оставляет за собой право вносить изменения в настоящую Политику. Новая редакция
                Политики вступает в силу с момента её размещения на Сайте. Продолжение использования Сайта
                после внесения изменений означает согласие Пользователя с новой редакцией Политики.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-light text-foreground">10. Контактные данные</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                По всем вопросам, связанным с обработкой персональных данных, Пользователь может обратиться к Оператору:
              </p>
              <div className="bg-secondary rounded-lg p-6 space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">ИП Савкин Руслан Игоревич</strong></p>
                <p>ОГРНИП: 321774600133331 | ИНН: 672708949520</p>
                <p>Адрес: 142720, Московская обл., г. Видное, п. Битца, мкр Южная Битца, ул. Ботаническая, д. 12, кв. 135</p>
                <p>Телефон: <a href="tel:+79261234543" className="text-[hsl(205,85%,45%)] hover:underline">+7 (926) 123-45-43</a></p>
                <p>E-mail: <a href="mailto:rusdoors.su@mail.ru" className="text-[hsl(205,85%,45%)] hover:underline">rusdoors.su@mail.ru</a></p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Privacy;
