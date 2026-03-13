import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const Terms = () => {
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
            Пользовательское соглашение
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
                Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между
                <strong className="text-foreground"> ИП Савкин Руслан Игоревич</strong> (ОГРНИП: 321774600133331,
                ИНН: 672708949520), именуемым в дальнейшем «Продавец», и любым физическим лицом, использующим
                интернет-магазин <strong className="text-foreground">rusdoors.su</strong> (далее — «Сайт»),
                именуемым в дальнейшем «Покупатель».
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Настоящее Соглашение является публичной офертой в соответствии со статьёй 437 Гражданского
                кодекса Российской Федерации. Оформление заказа на Сайте означает полное и безоговорочное
                принятие (акцепт) условий настоящего Соглашения.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Соглашение действует в соответствии с Законом РФ от 07.02.1992 № 2300-1 «О защите прав
                потребителей» и Постановлением Правительства РФ от 31.12.2020 № 2463 «Об утверждении Правил
                продажи товаров по договору розничной купли-продажи».
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-light text-foreground">2. Предмет Соглашения</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Продавец предоставляет Покупателю возможность приобретения товаров (дверей, фурнитуры,
                комплектующих и сопутствующих товаров), представленных в каталоге Сайта, на условиях
                дистанционной торговли.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Информация о товарах, размещённая на Сайте, включая описания, характеристики, фотографии
                и цены, не является исчерпывающей и может отличаться от фактических свойств товара.
                Для уточнения характеристик Покупатель может обратиться к Продавцу.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-light text-foreground">3. Порядок оформления заказа</h2>
              <ul className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Покупатель выбирает товар из каталога Сайта и добавляет его в корзину;</li>
                <li>Покупатель заполняет форму заказа, указывая контактные данные и адрес доставки;</li>
                <li>После оформления заказа Покупатель получает подтверждение на указанный адрес электронной почты или по телефону;</li>
                <li>Заказ считается принятым после подтверждения Продавцом наличия товара и согласования условий доставки;</li>
                <li>Продавец оставляет за собой право отказать в исполнении заказа при отсутствии товара на складе или невозможности доставки.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-light text-foreground">4. Цены и оплата</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Цены на товары указаны на Сайте в российских рублях и включают НДС (при применимости).
                Продавец оставляет за собой право изменять цены на товары в одностороннем порядке.
                Цена товара, действующая на момент оформления заказа, является окончательной для данного заказа.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">Оплата может осуществляться следующими способами:</p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Банковской картой на Сайте;</li>
                <li>Безналичный перевод на расчётный счёт Продавца;</li>
                <li>Наложенным платежом при получении (при доступности);</li>
                <li>Наличными при самовывозе.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-light text-foreground">5. Доставка</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Доставка осуществляется по адресу, указанному Покупателем при оформлении заказа. Сроки
                и стоимость доставки зависят от региона и согласовываются с Покупателем при подтверждении заказа.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Риск случайной гибели или повреждения товара переходит к Покупателю с момента передачи
                товара и подписания документов, подтверждающих доставку.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                При получении товара Покупатель обязан осмотреть его на предмет внешних повреждений.
                В случае обнаружения дефектов необходимо указать их в акте приёмки.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-light text-foreground">6. Возврат и обмен товара</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Возврат и обмен товара надлежащего качества осуществляется в соответствии со статьёй 26.1
                Закона РФ «О защите прав потребителей». Покупатель вправе отказаться от товара в любое время
                до его передачи и в течение 7 (семи) дней после передачи.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Возврат товара надлежащего качества возможен при сохранении его товарного вида, потребительских
                свойств и документа, подтверждающего факт покупки.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Товары, изготовленные по индивидуальному заказу (нестандартные размеры, цвет, комплектация),
                возврату и обмену не подлежат, за исключением случаев обнаружения производственного брака.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Возврат товара ненадлежащего качества осуществляется в соответствии со статьями 18–24
                Закона РФ «О защите прав потребителей».
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-light text-foreground">7. Гарантийные обязательства</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Гарантийный срок на товары определяется производителем и указывается в сопроводительной
                документации. Гарантия не распространяется на повреждения, вызванные неправильной
                эксплуатацией, транспортировкой или установкой товара с нарушением рекомендаций производителя.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-light text-foreground">8. Интеллектуальная собственность</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Все материалы, размещённые на Сайте (тексты, фотографии, дизайн, логотипы, графика),
                являются объектами интеллектуальной собственности Продавца или его партнёров и защищены
                законодательством РФ об авторском праве и смежных правах. Любое использование указанных
                материалов без письменного согласия Продавца запрещено.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-light text-foreground">9. Ответственность сторон</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Продавец не несёт ответственности за ущерб, причинённый Покупателю вследствие ненадлежащего
                использования товара, а также за задержки доставки, вызванные обстоятельствами непреодолимой
                силы (форс-мажор).
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Покупатель несёт ответственность за достоверность предоставленных при оформлении заказа
                персональных данных. В случае предоставления недостоверных данных Продавец не несёт
                ответственности за ненадлежащее исполнение заказа.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-light text-foreground">10. Разрешение споров</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Все споры и разногласия, возникающие в связи с исполнением настоящего Соглашения,
                разрешаются путём переговоров. В случае невозможности достижения соглашения спор
                передаётся на рассмотрение в суд по месту нахождения Продавца в соответствии
                с законодательством Российской Федерации.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-light text-foreground">11. Заключительные положения</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Продавец оставляет за собой право вносить изменения в настоящее Соглашение без
                предварительного уведомления Покупателя. Новая редакция Соглашения вступает в силу
                с момента её размещения на Сайте.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                По всем вопросам, не урегулированным настоящим Соглашением, стороны руководствуются
                действующим законодательством Российской Федерации.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-light text-foreground">12. Реквизиты Продавца</h2>
              <div className="bg-secondary rounded-lg p-6 space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">ИП Савкин Руслан Игоревич</strong></p>
                <p>ОГРНИП: 321774600133331 | ИНН: 672708949520</p>
                <p>Адрес: 142720, Московская обл., г. Видное, п. Битца, мкр Южная Битца, ул. Ботаническая, д. 12, кв. 135</p>
                <p>Р/с: 40802810900008233626</p>
                <p>Банк: АО «ТБанк» | БИК: 044525974 | Кор. счёт: 30101810145250000974</p>
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

export default Terms;
