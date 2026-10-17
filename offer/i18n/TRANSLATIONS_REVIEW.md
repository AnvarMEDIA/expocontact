# /offer — переводы на проверку

Все тексты лендинга для зарубежных организаторов на пяти языках. Мастер —
русский, английский дан в брифе; турецкий, китайский (упрощённый) и
узбекский (латиница) переведены и **нуждаются в проверке носителями**.

Как читать:
- `[квадратные скобки]` — выделенная оранжевым часть заголовка. Скобки
  можно переставить, если в языке другой порядок слов.
- `⏎` — принудительный перенос строки.
- `{n}`, `{from}`, `{to}`, `{name}`, `{link}` — подставляемые значения, не переводить.
- Не переводятся: названия пакетов (Local Partner, Turnkey Build, Full House),
  площадки и компании, ExpoContact, Meta / Telegram / Google / WhatsApp.
- Узбекский: оʻ и gʻ пишутся с U+02BB (ʻ), разделительный знак — U+02BC (ʼ).

Как внести правку: исправить строку в `offer/i18n/<язык>.ts`. После правки
китайского запустить `node offer/scripts/build-zh-font.mjs` — шрифт
собирается ровно из иероглифов словаря. Этот файл пересобирается командой
`node offer/scripts/translations-review.mjs`.

Всего строк: 235 × 5 языков.

## Мета-теги и соцсети

**`meta.title`**

- RU: Организация выставок в Узбекистане под ключ | ExpoContact
- EN: Trade Show Organiser in Uzbekistan — Turnkey | ExpoContact
- TR: Özbekistan'da Anahtar Teslim Fuar Organizasyonu | ExpoContact
- ZH: 乌兹别克斯坦展会本地主办伙伴——一站式交付，观众满馆 | ExpoContact
- UZ: Oʻzbekistonda koʻrgazmalarni toʻliq tashkil etish | ExpoContact

**`meta.description`**

- RU: Местный партнёр-организатор выставок в Ташкенте: разрешения, площадка, застройка павильона, реклама и посетители с регистрацией. Всё по одному договору.
- EN: Your local organising partner in Tashkent: permits, venue, pavilion build, promotion and registered visitors for a trade show in Uzbekistan. One contract.
- TR: Taşkent'te yerel organizasyon ortağınız: izinler, mekân, pavyon kurulumu, tanıtım ve kayıtlı ziyaretçi akışı. Özbekistan'daki fuarınız için tek sözleşme.
- ZH: ExpoContact 是您在塔什干和乌兹别克斯坦的本地主办合作伙伴：许可审批、场馆、展馆搭建、宣传推广，以及每位观众实名登记的观众引流。一份合同全部搞定。
- UZ: Toshkentdagi mahalliy hamkoringiz: ruxsatnomalar, maydoncha, pavilyon qurilishi, reklama va roʻyxatga olingan tashrif buyuruvchilar. Bitta shartnoma asosida.

**`meta.ogTitle`**

- RU: Ваша выставка в Узбекистане. Под ключ. С полными залами.
- EN: Your trade show in Uzbekistan. Turnkey. With full halls.
- TR: Özbekistan'da fuarınız. Anahtar teslim. Dolu salonlarla.
- ZH: 您在乌兹别克斯坦的展会。一站式交付。观众满馆。
- UZ: Koʻrgazmangiz — Oʻzbekistonda. Boshidan oxirigacha. Zallar toʻla boʻladi.

**`meta.ogDescription`**

- RU: Разрешения, площадка, застройка, реклама и поток посетителей — по одному договору.
- EN: Permits, venue, build, promotion and visitor flow — under one contract.
- TR: İzinler, mekân, kurulum, tanıtım ve ziyaretçi akışı — tek sözleşmeyle.
- ZH: 许可、场馆、搭建、宣传与观众引流——一份合同全部搞定。
- UZ: Ruxsatnomalar, maydoncha, qurilish, reklama va tashrif buyuruvchilar oqimi — barchasi bitta shartnomada.

**`meta.ogKicker`**

- RU: Местный партнёр-организатор · Узбекистан
- EN: Local organising partner · Uzbekistan
- TR: Yerel organizasyon ortağı · Özbekistan
- ZH: 本地主办合作伙伴 · 乌兹别克斯坦
- UZ: Oʻzbekistondagi mahalliy hamkoringiz

## Подписи для скринридеров

**`a11y.skip`**

- RU: Перейти к содержанию
- EN: Skip to content
- TR: İçeriğe geç
- ZH: 跳到正文
- UZ: Asosiy mazmunga oʻtish

**`a11y.home`**

- RU: ExpoContact — в начало страницы
- EN: ExpoContact — back to top
- TR: ExpoContact — sayfa başına dön
- ZH: ExpoContact——返回页首
- UZ: ExpoContact — sahifa boshiga qaytish

**`a11y.menu`**

- RU: Открыть меню
- EN: Open menu
- TR: Menüyü aç
- ZH: 打开菜单
- UZ: Menyuni ochish

**`a11y.closeMenu`**

- RU: Закрыть меню
- EN: Close menu
- TR: Menüyü kapat
- ZH: 关闭菜单
- UZ: Menyuni yopish

**`a11y.language`**

- RU: Язык страницы
- EN: Page language
- TR: Sayfa dili
- ZH: 页面语言
- UZ: Sahifa tili

**`a11y.close`**

- RU: Закрыть
- EN: Close
- TR: Kapat
- ZH: 关闭
- UZ: Yopish

**`a11y.included`**

- RU: входит
- EN: included
- TR: dahil
- ZH: 包含
- UZ: kiradi

**`a11y.notIncluded`**

- RU: не входит
- EN: not included
- TR: dahil değil
- ZH: 不包含
- UZ: kirmaydi

**`a11y.pauseMotion`**

- RU: Остановить прокрутку
- EN: Pause scrolling
- TR: Kaydırmayı durdur
- ZH: 暂停滚动
- UZ: Aylantirishni toʻxtatish

**`a11y.playMotion`**

- RU: Продолжить прокрутку
- EN: Resume scrolling
- TR: Kaydırmayı sürdür
- ZH: 继续滚动
- UZ: Aylantirishni davom ettirish

## Шапка

**`nav.services`**

- RU: Услуги
- EN: Services
- TR: Hizmetler
- ZH: 服务
- UZ: Xizmatlar

**`nav.visitors`**

- RU: Посетители
- EN: Visitors
- TR: Ziyaretçiler
- ZH: 观众
- UZ: Tashrif buyuruvchilar

**`nav.plan`**

- RU: План
- EN: Plan
- TR: Plan
- ZH: 计划
- UZ: Reja

**`nav.experience`**

- RU: Опыт
- EN: Experience
- TR: Deneyim
- ZH: 经验
- UZ: Tajriba

**`nav.formats`**

- RU: Форматы
- EN: Formats
- TR: Formatlar
- ZH: 合作模式
- UZ: Formatlar

**`nav.cta`**

- RU: Обсудить выставку
- EN: Discuss your show
- TR: Fuarınızı konuşalım
- ZH: 洽谈您的展会
- UZ: Koʻrgazmani muhokama qilish

## 1. Hero

**`hero.kicker`**

- RU: Местный партнёр-организатор · Узбекистан
- EN: Local organising partner · Uzbekistan
- TR: Yerel organizasyon ortağı · Özbekistan
- ZH: 本地主办合作伙伴 · 乌兹别克斯坦
- UZ: Oʻzbekistondagi mahalliy hamkoringiz

**`hero.title.0`**

- RU: Ваша выставка в Узбекистане.
- EN: Your trade show in Uzbekistan.
- TR: Özbekistan'da fuarınız.
- ZH: 您在乌兹别克斯坦的展会。
- UZ: Koʻrgazmangiz — Oʻzbekistonda.

**`hero.title.1`**

- RU: Под ключ.
- EN: Turnkey.
- TR: Anahtar teslim.
- ZH: 一站式交付。
- UZ: Boshidan oxirigacha.

**`hero.title.2`**

- RU: С полными залами.
- EN: With full halls.
- TR: Dolu salonlarla.
- ZH: 观众满馆。
- UZ: Zallar toʻla boʻladi.

**`hero.lead`**

- RU: От разрешений и площадки до застройки, рекламы и потока посетителей — по одному договору.
- EN: From permits and venue to pavilion build, promotion and visitor flow — under one contract.
- TR: İzinlerden mekâna, pavyon kurulumundan tanıtıma ve ziyaretçi akışına kadar — tek sözleşmeyle.
- ZH: 从许可审批、场馆到展馆搭建、宣传推广和观众引流——一份合同全部搞定。
- UZ: Ruxsatnomalar va maydonchadan tortib pavilyon qurilishi, reklama va tashrif buyuruvchilargacha — barchasi bitta shartnoma asosida.

**`hero.ctaPrimary`**

- RU: Обсудить выставку
- EN: Discuss your show
- TR: Fuarınızı konuşalım
- ZH: 洽谈您的展会
- UZ: Koʻrgazmani muhokama qilish

**`hero.ctaSecondary`**

- RU: Как мы приводим посетителей
- EN: How we bring visitors
- TR: Ziyaretçileri nasıl getiriyoruz
- ZH: 我们如何吸引观众
- UZ: Tashrif buyuruvchilarni qanday jalb qilamiz

**`hero.stats.since`**

- RU: работаем с этого года
- EN: in business since
- TR: yılından beri faaliyetteyiz
- ZH: 成立年份
- UZ: yildan beri faoliyatdamiz

**`hero.stats.stands`**

- RU: построенных стендов
- EN: stands built
- TR: kurulan stant
- ZH: 已搭建展位
- UZ: qurilgan stendlar

**`hero.stats.clients`**

- RU: клиентов
- EN: clients
- TR: müşteri
- ZH: 客户
- UZ: mijozlar

**`hero.stats.support`**

- RU: техподдержка на выставке
- EN: on-site technical support
- TR: fuarda teknik destek
- ZH: 展会现场技术支持
- UZ: koʻrgazmada texnik yordam

## 2. Услуги

**`services.kicker`**

- RU: Услуги
- EN: Services
- TR: Hizmetler
- ZH: 服务
- UZ: Xizmatlar

**`services.title`**

- RU: Если вы собираетесь провести выставку в Ташкенте или Узбекистане — [мы обеспечим всё на месте.]
- EN: If you plan to run a trade show in Tashkent or Uzbekistan, [we handle everything on the ground.]
- TR: Taşkent'te ya da Özbekistan'da fuar düzenlemeyi planlıyorsanız, [sahadaki her şeyi biz üstleniyoruz.]
- ZH: 如果您计划在塔什干或乌兹别克斯坦举办展会，[现场的一切都由我们负责。]
- UZ: Toshkent yoki Oʻzbekistonda koʻrgazma oʻtkazishni rejalashtirayotgan boʻlsangiz, [joyidagi barcha ishlarni biz bajaramiz.]

**`services.cards.0.title`**

- RU: Разрешения
- EN: Permits
- TR: İzinler
- ZH: 许可审批
- UZ: Ruxsatnomalar

**`services.cards.0.text`**

- RU: Юридические вопросы и согласования с госорганами
- EN: Legal matters and approvals with state authorities
- TR: Hukuki konular ve devlet kurumlarıyla onay süreçleri
- ZH: 法律事务及与政府部门的审批协调
- UZ: Huquqiy masalalar va davlat idoralari bilan kelishuvlar

**`services.cards.1.title`**

- RU: Площадка
- EN: Venue
- TR: Mekân
- ZH: 场馆
- UZ: Maydoncha

**`services.cards.1.text`**

- RU: Подбор, переговоры и бронирование
- EN: Selection, negotiation and booking
- TR: Seçim, müzakere ve rezervasyon
- ZH: 选址、谈判与预订
- UZ: Tanlash, muzokaralar va band qilish

**`services.cards.2.title`**

- RU: Павильон
- EN: Pavilion
- TR: Pavyon
- ZH: 展馆
- UZ: Pavilyon

**`services.cards.2.text`**

- RU: Проект и застройка под ключ
- EN: Design and turnkey build
- TR: Tasarım ve anahtar teslim kurulum
- ZH: 设计与交钥匙搭建
- UZ: Loyihalash va toʻliq qurib berish

**`services.cards.3.title`**

- RU: Стенды участников
- EN: Exhibitor stands
- TR: Katılımcı stantları
- ZH: 参展商展位
- UZ: Ishtirokchilar stendlari

**`services.cards.3.text`**

- RU: Изготовление, монтаж, демонтаж
- EN: Production, set-up, dismantling
- TR: Üretim, kurulum, söküm
- ZH: 制作、安装与拆除
- UZ: Tayyorlash, montaj va demontaj

**`services.cards.4.title`**

- RU: Реклама заранее
- EN: Early promotion
- TR: Erken tanıtım
- ZH: 提前宣传
- UZ: Oldindan reklama

**`services.cards.4.text`**

- RU: Кампания до открытия на максимальный охват
- EN: Pre-show campaign for maximum reach
- TR: Maksimum erişim için fuar öncesi kampanya
- ZH: 开幕前推广，实现最大覆盖
- UZ: Ochilishdan oldin keng auditoriyani qamrab oluvchi kampaniya

**`services.cards.5.title`**

- RU: Поток посетителей
- EN: Visitor flow
- TR: Ziyaretçi akışı
- ZH: 观众引流
- UZ: Tashrif buyuruvchilar oqimi

**`services.cards.5.text`**

- RU: Регистрация каждого и полная база
- EN: Every visitor registered, full database
- TR: Her ziyaretçi kayıtlı, eksiksiz veri tabanı
- ZH: 每位观众实名登记，完整数据库
- UZ: Har biri roʻyxatga olinadi, toʻliq baza beriladi

## 3. Проблемы → решения

**`problems.kicker`**

- RU: Риски нового рынка
- EN: New-market risks
- TR: Yeni pazarın riskleri
- ZH: 新市场的风险
- UZ: Yangi bozordagi xatarlar

**`problems.title`**

- RU: Что мешает выставке в новом регионе — [и как мы это убираем]
- EN: What holds a show back in a new market — [and how we remove it]
- TR: Yeni bir pazarda fuarın önündeki engeller — [ve onları nasıl ortadan kaldırıyoruz]
- ZH: 新市场办展的障碍——[以及我们如何消除]
- UZ: Yangi bozorda koʻrgazmaga nimalar toʻsqinlik qiladi — [va biz ularni qanday bartaraf etamiz]

**`problems.problemLabel`**

- RU: Проблема
- EN: Problem
- TR: Sorun
- ZH: 问题
- UZ: Muammo

**`problems.solutionLabel`**

- RU: Решение
- EN: Solution
- TR: Çözüm
- ZH: 解决方案
- UZ: Yechim

**`problems.pairs.0.problem`**

- RU: Незнакомые правила, органы и подрядчики
- EN: Unfamiliar rules, authorities and contractors
- TR: Bilinmeyen kurallar, kurumlar ve yükleniciler
- ZH: 陌生的法规、政府部门和承包商
- UZ: Notanish qoidalar, idoralar va pudratchilar

**`problems.pairs.0.solution`**

- RU: Разрешения и переговоры с госорганами берём на себя
- EN: We handle permits and negotiations with the authorities
- TR: İzinleri ve devlet kurumlarıyla görüşmeleri biz üstleniyoruz
- ZH: 许可审批及与政府部门的沟通由我们承担
- UZ: Ruxsatnomalar va davlat idoralari bilan muzokaralarni oʻz zimmamizga olamiz

**`problems.pairs.1.problem`**

- RU: Пустые проходы — экспоненты не возвращаются
- EN: Empty aisles — exhibitors don't come back
- TR: Boş koridorlar — katılımcılar bir daha gelmiyor
- ZH: 过道冷清——参展商不再回来
- UZ: Yoʻlaklar boʻsh — ishtirokchilar keyingi yil qaytmaydi

**`problems.pairs.1.solution`**

- RU: Приводим целевых посетителей и показываем цифры
- EN: We bring targeted visitors and show the numbers
- TR: Hedef ziyaretçileri getiriyor, rakamları gösteriyoruz
- ZH: 我们带来精准观众，并用数据说话
- UZ: Maqsadli tashrif buyuruvchilarni olib kelamiz va natijani raqamlarda koʻrsatamiz

**`problems.pairs.2.problem`**

- RU: Пять подрядчиков — пять оправданий
- EN: Five contractors — five excuses
- TR: Beş yüklenici — beş bahane
- ZH: 五家承包商——五种借口
- UZ: Beshta pudratchi — beshta bahona

**`problems.pairs.2.solution`**

- RU: Один договор, одна команда, одна ответственность
- EN: One contract, one team, one point of responsibility
- TR: Tek sözleşme, tek ekip, tek sorumlu
- ZH: 一份合同、一个团队、一方负责
- UZ: Bitta shartnoma, bitta jamoa, bitta javobgar

## 4. Один договор вместо пяти

**`contract.kicker`**

- RU: Как это устроено
- EN: How it works
- TR: Nasıl çalışıyoruz
- ZH: 合作方式
- UZ: Qanday ishlaymiz

**`contract.title`**

- RU: Один договор [вместо пяти]
- EN: One contract [instead of five]
- TR: Beş sözleşme yerine [tek sözleşme]
- ZH: [一份合同]取代五份
- UZ: Beshta shartnoma oʻrniga [bittasi]

**`contract.usualLabel`**

- RU: Обычно
- EN: Usually
- TR: Genellikle
- ZH: 通常
- UZ: Odatda

**`contract.usual.0`**

- RU: Площадка
- EN: Venue
- TR: Mekân
- ZH: 场馆
- UZ: Maydoncha

**`contract.usual.1`**

- RU: Застройщик
- EN: Builder
- TR: Kurulum firması
- ZH: 搭建商
- UZ: Quruvchi

**`contract.usual.2`**

- RU: Юристы
- EN: Lawyers
- TR: Hukukçular
- ZH: 律师
- UZ: Yuristlar

**`contract.usual.3`**

- RU: Реклама
- EN: Promotion
- TR: Tanıtım
- ZH: 宣传
- UZ: Reklama

**`contract.usual.4`**

- RU: Регистрация
- EN: Registration
- TR: Kayıt
- ZH: 观众登记
- UZ: Roʻyxatga olish

**`contract.usualCaption`**

- RU: 5 договоров · 5 менеджеров · 5 оправданий
- EN: 5 contracts · 5 managers · 5 excuses
- TR: 5 sözleşme · 5 yönetici · 5 bahane
- ZH: 5 份合同 · 5 位经理 · 5 种借口
- UZ: 5 ta shartnoma · 5 ta menejer · 5 ta bahona

**`contract.withLabel`**

- RU: С ExpoContact
- EN: With ExpoContact
- TR: ExpoContact ile
- ZH: 选择 ExpoContact
- UZ: ExpoContact bilan

**`contract.with.0`**

- RU: Один менеджер проекта
- EN: One project manager
- TR: Tek proje yöneticisi
- ZH: 一位项目经理
- UZ: Bitta loyiha menejeri

**`contract.with.1`**

- RU: Один договор и один счёт
- EN: One contract, one invoice
- TR: Tek sözleşme, tek fatura
- ZH: 一份合同，一张发票
- UZ: Bitta shartnoma va bitta hisob-faktura

**`contract.with.2`**

- RU: Одна ответственность за результат
- EN: One party accountable for results
- TR: Sonuçtan sorumlu tek taraf
- ZH: 对结果全权负责
- UZ: Natija uchun bitta javobgar

**`contract.with.3`**

- RU: Отчёт с цифрами после выставки
- EN: Post-show report with hard numbers
- TR: Fuar sonrası rakamlarla rapor
- ZH: 展后提供数据报告
- UZ: Koʻrgazmadan soʻng raqamlar bilan hisobot

## 5. Посетители

**`visitors.kicker`**

- RU: Посетители
- EN: Visitors
- TR: Ziyaretçiler
- ZH: 观众
- UZ: Tashrif buyuruvchilar

**`visitors.title`**

- RU: Мы не только строим залы. ⏎ [Мы их заполняем.]
- EN: We don't just build halls. ⏎ [We fill them.]
- TR: Sadece salon kurmuyoruz. ⏎ [Salonları dolduruyoruz.]
- ZH: 我们不只搭建展馆。 ⏎ [我们让展馆座无虚席。]
- UZ: Biz nafaqat zallar quramiz. ⏎ [Biz ularni odamlar bilan toʻldiramiz.]

**`visitors.steps.0.title`**

- RU: Реклама
- EN: Promotion
- TR: Tanıtım
- ZH: 宣传推广
- UZ: Reklama

**`visitors.steps.0.text`**

- RU: Meta, Telegram, Google, отраслевые СМИ
- EN: Meta, Telegram, Google, trade media
- TR: Meta, Telegram, Google, sektör medyası
- ZH: Meta、Telegram、Google、行业媒体
- UZ: Meta, Telegram, Google va soha nashrlari

**`visitors.steps.1.title`**

- RU: Предрегистрация
- EN: Early sign-up
- TR: Ön kayıt
- ZH: 预登记
- UZ: Oldindan roʻyxatga olish

**`visitors.steps.1.text`**

- RU: Лендинг выставки и Telegram-бот
- EN: Show landing page and Telegram bot
- TR: Fuarın açılış sayfası ve Telegram botu
- ZH: 展会落地页和 Telegram 机器人
- UZ: Koʻrgazma sahifasi va Telegram-bot orqali

**`visitors.steps.2.title`**

- RU: Приглашения
- EN: Invitations
- TR: Davetler
- ZH: 定向邀请
- UZ: Taklifnomalar

**`visitors.steps.2.text`**

- RU: Адресно целевым компаниям, делегации из регионов
- EN: Personal invitations to target companies, regional delegations
- TR: Hedef şirketlere doğrudan davet, bölgelerden heyetler
- ZH: 直接邀请目标企业，组织各地区代表团
- UZ: Maqsadli kompaniyalarga shaxsiy taklif, viloyatlardan delegatsiyalar

**`visitors.steps.3.title`**

- RU: QR-учёт
- EN: QR check-in
- TR: QR giriş
- ZH: 二维码签到
- UZ: QR orqali kirish

**`visitors.steps.3.text`**

- RU: Бейджи и сканирование на входе
- EN: Badges and scanning at the entrance
- TR: Yaka kartları ve girişte tarama
- ZH: 胸卡与入口扫码
- UZ: Beyjlar va kirishda QR-kodni skanerlash

**`visitors.steps.4.title`**

- RU: Отчёт и база
- EN: Report & database
- TR: Rapor ve veri tabanı
- ZH: 报告与数据库
- UZ: Hisobot va baza

**`visitors.steps.4.text`**

- RU: Посетители по дням, отраслям, должностям
- EN: Visitors by day, industry and job title
- TR: Güne, sektöre ve unvana göre ziyaretçiler
- ZH: 按日期、行业、职位统计观众
- UZ: Kunlar, sohalar va lavozimlar kesimida tashrif buyuruvchilar

**`visitors.note`**

- RU: Целевое число посетителей фиксируем в договоре.
- EN: The target visitor count is fixed in the contract.
- TR: Hedef ziyaretçi sayısı sözleşmede belirlenir.
- ZH: 目标观众人数写入合同。
- UZ: Tashrif buyuruvchilarning maqsadli soni shartnomada qayd etiladi.

## 6. Отчёт организатору

**`report.kicker`**

- RU: Отчёт организатору
- EN: Organiser report
- TR: Organizatör raporu
- ZH: 主办方报告
- UZ: Tashkilotchiga hisobot

**`report.title`**

- RU: Вы видите [каждого посетителя]
- EN: You see [every visitor]
- TR: [Her ziyaretçiyi] görürsünüz
- ZH: 您能看到[每一位观众]
- UZ: Siz [har bir tashrif buyuruvchini] koʻrasiz

**`report.demo`**

- RU: пример · демо-данные
- EN: sample · demo data
- TR: örnek · demo veriler
- ZH: 示例 · 演示数据
- UZ: namuna · demo-maʼlumotlar

**`report.dashboard`**

- RU: Дашборд выставки
- EN: Show dashboard
- TR: Fuar paneli
- ZH: 展会数据看板
- UZ: Koʻrgazma dashbordi

**`report.kpi.registered`**

- RU: зарегистрировано
- EN: registered
- TR: kayıtlı
- ZH: 已登记
- UZ: roʻyxatdan oʻtdi

**`report.kpi.attended`**

- RU: пришли
- EN: attended
- TR: katılan
- ZH: 实际到场
- UZ: tashrif buyurdi

**`report.kpi.turnout`**

- RU: доходимость
- EN: turnout
- TR: katılım oranı
- ZH: 到场率
- UZ: kelganlar ulushi

**`report.kpi.companies`**

- RU: компаний
- EN: companies
- TR: şirket
- ZH: 家企业
- UZ: kompaniya

**`report.byDay`**

- RU: Посетители по дням
- EN: Visitors by day
- TR: Günlere göre ziyaretçiler
- ZH: 每日观众
- UZ: Kunlar kesimida tashriflar

**`report.day`**

- RU: День {n}
- EN: Day {n}
- TR: {n}. gün
- ZH: 第 {n} 天
- UZ: {n}-kun

**`report.industriesTitle`**

- RU: Отрасли
- EN: Industries
- TR: Sektörler
- ZH: 行业
- UZ: Sohalar

**`report.industries.0`**

- RU: Производство
- EN: Manufacturing
- TR: Üretim
- ZH: 制造业
- UZ: Ishlab chiqarish

**`report.industries.1`**

- RU: Дистрибуция и ритейл
- EN: Distribution & retail
- TR: Dağıtım ve perakende
- ZH: 分销与零售
- UZ: Distribyutsiya va chakana savdo

**`report.industries.2`**

- RU: Строительство
- EN: Construction
- TR: İnşaat
- ZH: 建筑业
- UZ: Qurilish

**`report.industries.3`**

- RU: Госсектор
- EN: Public sector
- TR: Kamu sektörü
- ZH: 政府部门
- UZ: Davlat sektori

**`report.industries.4`**

- RU: Другое
- EN: Other
- TR: Diğer
- ZH: 其他
- UZ: Boshqalar

**`report.rolesTitle`**

- RU: Должности
- EN: Job titles
- TR: Unvanlar
- ZH: 职位
- UZ: Lavozimlar

**`report.roles.0`**

- RU: Собственники и директора
- EN: Owners & directors
- TR: Şirket sahipleri ve yöneticiler
- ZH: 企业主与总经理
- UZ: Kompaniya egalari va rahbarlar

**`report.roles.1`**

- RU: Закупки и снабжение
- EN: Procurement & supply
- TR: Satın alma ve tedarik
- ZH: 采购与供应
- UZ: Xarid va taʼminot

**`report.roles.2`**

- RU: Специалисты
- EN: Specialists
- TR: Uzmanlar
- ZH: 专业人员
- UZ: Mutaxassislar

**`report.roles.3`**

- RU: Другие
- EN: Others
- TR: Diğer
- ZH: 其他
- UZ: Boshqalar

**`report.receiveTitle`**

- RU: После выставки вы получаете
- EN: After the show you receive
- TR: Fuardan sonra elinize geçenler
- ZH: 展会结束后您将获得
- UZ: Koʻrgazmadan soʻng sizga beriladi

**`report.receive.0.title`**

- RU: База контактов
- EN: Contact database
- TR: İletişim veri tabanı
- ZH: 联系人数据库
- UZ: Kontaktlar bazasi

**`report.receive.0.text`**

- RU: с согласием посетителей
- EN: with visitor consent
- TR: ziyaretçilerin onayıyla
- ZH: 经观众同意
- UZ: tashrif buyuruvchilar roziligi bilan

**`report.receive.1.title`**

- RU: Аналитика
- EN: Analytics
- TR: Analitik
- ZH: 数据分析
- UZ: Tahlil

**`report.receive.1.text`**

- RU: по дням, отраслям, должностям, регионам
- EN: by day, industry, job title and region
- TR: güne, sektöre, unvana ve bölgeye göre
- ZH: 按日期、行业、职位和地区
- UZ: kunlar, sohalar, lavozimlar va hududlar kesimida

**`report.receive.2.title`**

- RU: Онлайн-дашборд
- EN: Live dashboard
- TR: Canlı panel
- ZH: 在线看板
- UZ: Onlayn-dashbord

**`report.receive.2.text`**

- RU: во время выставки
- EN: during the show
- TR: fuar süresince
- ZH: 展会期间实时查看
- UZ: koʻrgazma davomida real vaqtda

**`report.receive.3.title`**

- RU: Аргумент для экспонентов
- EN: Proof for exhibitors
- TR: Katılımcılar için kanıt
- ZH: 招展依据
- UZ: Ishtirokchilar uchun dalil

**`report.receive.3.text`**

- RU: на продажу площади в следующем году
- EN: to sell next year's floor space
- TR: gelecek yılın stant alanlarını satmak için
- ZH: 用于销售明年的展位面积
- UZ: keyingi yilgi maydonlarni sotishda

## 7. План запуска

**`plan.kicker`**

- RU: План
- EN: Plan
- TR: Plan
- ZH: 计划
- UZ: Reja

**`plan.title`**

- RU: Запуск выставки — [по понятному плану]
- EN: Launching your show — [with a clear plan]
- TR: Fuarınızın lansmanı — [net bir planla]
- ZH: 展会启动——[按清晰计划推进]
- UZ: Koʻrgazmani ishga tushirish — [aniq reja asosida]

**`plan.months`**

- RU: мес.
- EN: mo.
- TR: ay
- ZH: 个月
- UZ: oy

**`plan.opening`**

- RU: Открытие
- EN: Opening
- TR: Açılış
- ZH: 开幕
- UZ: Ochilish

**`plan.range`**

- RU: {from} → {to} мес.
- EN: {from} → {to} mo.
- TR: {from} → {to} ay
- ZH: {from} → {to} 个月
- UZ: {from} → {to} oy

**`plan.stages.0`**

- RU: Стратегия, площадка, даты
- EN: Strategy, venue, dates
- TR: Strateji, mekân, tarihler
- ZH: 策略、场馆、日期
- UZ: Strategiya, maydoncha, sanalar

**`plan.stages.1`**

- RU: Разрешения и согласования
- EN: Permits and approvals
- TR: İzinler ve onaylar
- ZH: 许可与审批
- UZ: Ruxsatnomalar va kelishuvlar

**`plan.stages.2`**

- RU: Проект павильона и стендов
- EN: Pavilion and stand design
- TR: Pavyon ve stant tasarımı
- ZH: 展馆与展位设计
- UZ: Pavilyon va stendlar loyihasi

**`plan.stages.3`**

- RU: Реклама и предрегистрация
- EN: Promotion and pre-registration
- TR: Tanıtım ve ön kayıt
- ZH: 宣传与预登记
- UZ: Reklama va oldindan roʻyxatga olish

**`plan.stages.4`**

- RU: Застройка и монтаж
- EN: Build and set-up
- TR: Kurulum ve montaj
- ZH: 搭建与安装
- UZ: Qurilish va montaj

**`plan.stages.5`**

- RU: Отчёт и база посетителей
- EN: Report and visitor database
- TR: Rapor ve ziyaretçi veri tabanı
- ZH: 报告与观众数据库
- UZ: Hisobot va tashrif buyuruvchilar bazasi

**`plan.note`**

- RU: Сжатые сроки? Запускаем и в ускоренном режиме.
- EN: Tight timeline? We also run fast-track launches.
- TR: Zaman mı dar? Hızlandırılmış lansman da yapıyoruz.
- ZH: 时间紧？我们也可加急启动。
- UZ: Muddatlar qisqami? Tezlashtirilgan tartibda ham ishga tushiramiz.

## 8. Опыт

**`experience.kicker`**

- RU: Опыт
- EN: Experience
- TR: Deneyim
- ZH: 经验
- UZ: Tajriba

**`experience.title`**

- RU: 22 года на выставочных [площадках Центральной Азии]
- EN: 22 years on the exhibition floors [of Central Asia]
- TR: [Orta Asya] fuar alanlarında 22 yıl
- ZH: 深耕[中亚展会现场] 22 年
- UZ: [Markaziy Osiyo] koʻrgazma maydonlarida 22 yil

**`experience.big`**

- RU: стендов построено с 2004 года
- EN: stands built since 2004
- TR: 2004'ten bu yana kurulan stant
- ZH: 自 2004 年以来搭建的展位
- UZ: 2004-yildan beri qurilgan stendlar

**`experience.clients`**

- RU: клиентов
- EN: clients
- TR: müşteri
- ZH: 客户
- UZ: mijozlar

**`experience.sqm`**

- RU: м²
- EN: m²
- TR: m²
- ZH: m²
- UZ: m²

**`experience.production`**

- RU: собственное производство
- EN: in-house production
- TR: kendi üretim tesisimiz
- ZH: 自有生产车间
- UZ: oʻz ishlab chiqarishimiz

**`experience.support`**

- RU: техподдержка
- EN: technical support
- TR: teknik destek
- ZH: 技术支持
- UZ: texnik yordam

**`experience.venues`**

- RU: ключевых площадок Ташкента
- EN: key venues in Tashkent
- TR: Taşkent'te kilit etkinlik mekânı
- ZH: 塔什干核心场馆
- UZ: Toshkentdagi asosiy maydonchalar

**`experience.venuesTitle`**

- RU: Площадки
- EN: Venues
- TR: Mekânlar
- ZH: 场馆
- UZ: Maydonchalar

**`experience.partnersTitle`**

- RU: Сотрудничаем
- EN: Partners
- TR: İş birliği
- ZH: 合作伙伴
- UZ: Hamkorlik

**`experience.partnersText`**

- RU: Тесно работаем с государственными учреждениями, министерствами, ассоциациями и компаниями любого масштаба
- EN: We work closely with government institutions, ministries, associations and companies of every size
- TR: Devlet kurumları, bakanlıklar, dernekler ve her ölçekten şirketle yakın çalışıyoruz
- ZH: 我们与政府机构、各部委、行业协会以及各种规模的企业密切合作
- UZ: Davlat muassasalari, vazirliklar, uyushmalar va turli miqyosdagi kompaniyalar bilan yaqin hamkorlik qilamiz

## 9. Форматы

**`formats.kicker`**

- RU: Форматы
- EN: Formats
- TR: Formatlar
- ZH: 合作模式
- UZ: Formatlar

**`formats.title`**

- RU: Выберите [свой формат]
- EN: Choose [your format]
- TR: [Formatınızı] seçin
- ZH: 选择[适合您的模式]
- UZ: [Oʻzingizga mos formatni] tanlang

**`formats.recommended`**

- RU: Рекомендуем
- EN: Recommended
- TR: Önerilen
- ZH: 推荐
- UZ: Tavsiya etamiz

**`formats.choose`**

- RU: Выбрать
- EN: Choose
- TR: Seç
- ZH: 选择
- UZ: Tanlash

**`formats.chosen`**

- RU: Формат выбран: {name}
- EN: Format selected: {name}
- TR: Seçilen format: {name}
- ZH: 已选择：{name}
- UZ: Tanlangan format: {name}

**`formats.feature`**

- RU: Что входит
- EN: What's included
- TR: Neler dahil
- ZH: 服务内容
- UZ: Nimalar kiradi

**`formats.taglines.local`**

- RU: Вы строите сами — мы решаем всё на месте
- EN: You build — we handle everything on the ground
- TR: Kurulumu siz yaparsınız — sahadaki her şeyi biz hallederiz
- ZH: 您自行搭建——现场事务由我们全部解决
- UZ: Stendni oʻzingiz qurasiz — joyidagi barcha masalalarni biz hal qilamiz

**`formats.taglines.turnkey`**

- RU: Выставка под ключ
- EN: Turnkey trade show
- TR: Anahtar teslim fuar
- ZH: 交钥匙展会
- UZ: Koʻrgazmani toʻliq tashkil etamiz

**`formats.taglines.full`**

- RU: Под ключ + полные залы
- EN: Turnkey + full halls
- TR: Anahtar teslim + dolu salonlar
- ZH: 交钥匙 + 观众满馆
- UZ: Toʻliq tashkil etish + toʻla zallar

**`formats.rows.0`**

- RU: Разрешения и госорганы
- EN: Permits and state authorities
- TR: İzinler ve devlet kurumları
- ZH: 许可审批与政府对接
- UZ: Ruxsatnomalar va davlat idoralari

**`formats.rows.1`**

- RU: Подбор и бронирование площадки
- EN: Venue selection and booking
- TR: Mekân seçimi ve rezervasyonu
- ZH: 场馆选址与预订
- UZ: Maydonchani tanlash va band qilish

**`formats.rows.2`**

- RU: Таможня и логистика экспонатов
- EN: Customs and exhibit logistics
- TR: Gümrük ve sergi ürünlerinin lojistiği
- ZH: 展品清关与物流
- UZ: Bojxona va eksponatlar logistikasi

**`formats.rows.3`**

- RU: Проект и застройка павильона
- EN: Pavilion design and build
- TR: Pavyon tasarımı ve kurulumu
- ZH: 展馆设计与搭建
- UZ: Pavilyonni loyihalash va qurish

**`formats.rows.4`**

- RU: Стенды для участников
- EN: Exhibitor stands
- TR: Katılımcı stantları
- ZH: 参展商展位
- UZ: Ishtirokchilar uchun stendlar

**`formats.rows.5`**

- RU: Техподдержка 24/7
- EN: 24/7 technical support
- TR: 7/24 teknik destek
- ZH: 7×24 小时技术支持
- UZ: 24/7 texnik yordam

**`formats.rows.6`**

- RU: Рекламная кампания заранее
- EN: Early promotion campaign
- TR: Erken tanıtım kampanyası
- ZH: 提前宣传推广
- UZ: Oldindan reklama kampaniyasi

**`formats.rows.7`**

- RU: Регистрация и QR-учёт
- EN: Registration and QR check-in
- TR: Kayıt ve QR giriş
- ZH: 观众登记与二维码签到
- UZ: Roʻyxatga olish va QR orqali kirish

**`formats.rows.8`**

- RU: Приглашения и делегации
- EN: Invitations and delegations
- TR: Davetler ve heyetler
- ZH: 邀请与代表团
- UZ: Taklifnomalar va delegatsiyalar

**`formats.rows.9`**

- RU: Отчёт и база посетителей
- EN: Report and visitor database
- TR: Rapor ve ziyaretçi veri tabanı
- ZH: 报告与观众数据库
- UZ: Hisobot va tashrif buyuruvchilar bazasi

## faq

**`faq.kicker`**

- RU: Вопросы и ответы
- EN: Questions & answers
- TR: Sık sorulan sorular
- ZH: 常见问题
- UZ: Savol-javoblar

**`faq.title`**

- RU: Что важно знать [до старта]
- EN: What to know [before you start]
- TR: Başlamadan önce [bilmeniz gerekenler]
- ZH: 启动前[您需要了解]
- UZ: Boshlashdan oldin [bilish muhim]

**`faq.items.0.q`**

- RU: Чем ExpoContact помогает зарубежному организатору выставки?
- EN: How does ExpoContact help a foreign trade-show organiser?
- TR: ExpoContact yabancı bir fuar organizatörüne nasıl yardımcı olur?
- ZH: ExpoContact 如何帮助外国展会主办方？
- UZ: ExpoContact xorijiy koʻrgazma tashkilotchisiga qanday yordam beradi?

**`faq.items.0.a`**

- RU: Мы — местный партнёр-организатор в Ташкенте. Берём на себя разрешения и переговоры с госорганами, подбор и бронирование площадки, таможню и логистику экспонатов, проект и застройку павильона, стенды участников, рекламу и поток посетителей. Всё — по одному договору, с одним менеджером проекта.
- EN: We are your local organising partner in Tashkent. We handle permits and negotiations with the authorities, venue selection and booking, customs and exhibit logistics, pavilion design and build, exhibitor stands, promotion and the visitor flow — all under one contract, with one project manager.
- TR: Taşkent'teki yerel organizasyon ortağınızız. İzinleri ve devlet kurumlarıyla görüşmeleri, mekân seçimi ve rezervasyonunu, gümrük ve sergi ürünlerinin lojistiğini, pavyon tasarımı ve kurulumunu, katılımcı stantlarını, tanıtımı ve ziyaretçi akışını üstleniyoruz — hepsi tek sözleşmeyle ve tek proje yöneticisiyle.
- ZH: 我们是您在塔什干的本地主办合作伙伴，负责许可审批及与政府部门的沟通、场馆选址与预订、展品清关与物流、展馆设计与搭建、参展商展位、宣传推广和观众引流——全部通过一份合同、由一位项目经理负责。
- UZ: Biz Toshkentdagi mahalliy hamkoringizmiz. Ruxsatnomalar va davlat idoralari bilan muzokaralar, maydonchani tanlash va band qilish, bojxona va eksponatlar logistikasi, pavilyonni loyihalash va qurish, ishtirokchilar stendlari, reklama va tashrif buyuruvchilar oqimini oʻz zimmamizga olamiz — barchasi bitta shartnoma va bitta loyiha menejeri bilan.

**`faq.items.1.q`**

- RU: За сколько начинать подготовку выставки в Узбекистане?
- EN: How far ahead should we start preparing a show in Uzbekistan?
- TR: Özbekistan'da bir fuara hazırlığa ne zaman başlamalı?
- ZH: 在乌兹别克斯坦办展需要提前多久准备？
- UZ: Oʻzbekistonda koʻrgazmaga tayyorgarlikni qachondan boshlash kerak?

**`faq.items.1.a`**

- RU: Обычно за 9 месяцев до открытия. Стратегия, площадка и даты — за 9–7 месяцев, разрешения и согласования — за 8–4, проект павильона и стендов — за 6–3, реклама и предрегистрация — в последние 3 месяца, застройка и монтаж — в последние недели. При сжатых сроках запускаем выставку в ускоренном режиме.
- EN: Usually nine months before opening. Strategy, venue and dates 9–7 months ahead, permits and approvals 8–4, pavilion and stand design 6–3, promotion and pre-registration in the last 3 months, build and set-up in the final weeks. On a tight timeline we run a fast-track launch.
- TR: Genellikle açılıştan dokuz ay önce. Strateji, mekân ve tarihler 9–7 ay önce; izinler ve onaylar 8–4 ay önce; pavyon ve stant tasarımı 6–3 ay önce; tanıtım ve ön kayıt son 3 ayda; kurulum ve montaj son haftalarda. Zaman darsa hızlandırılmış lansman yapıyoruz.
- ZH: 通常在开幕前九个月启动：开幕前 9–7 个月确定策略、场馆和日期，8–4 个月办理许可与审批，6–3 个月完成展馆与展位设计，最后 3 个月开展宣传与预登记，最后几周完成搭建与安装。时间紧张时，我们也可加急启动。
- UZ: Odatda ochilishdan toʻqqiz oy oldin. Strategiya, maydoncha va sanalar — 9–7 oy oldin, ruxsatnomalar va kelishuvlar — 8–4 oy oldin, pavilyon va stendlar loyihasi — 6–3 oy oldin, reklama va oldindan roʻyxatga olish — soʻnggi 3 oyda, qurilish va montaj — soʻnggi haftalarda. Muddatlar qisqa boʻlsa, tezlashtirilgan tartibda ishga tushiramiz.

**`faq.items.2.q`**

- RU: На каких площадках Ташкента можно провести выставку?
- EN: Which venues in Tashkent can host a trade show?
- TR: Taşkent'te hangi mekânlarda fuar düzenlenebilir?
- ZH: 塔什干有哪些场馆可以举办展会？
- UZ: Toshkentda qaysi maydonchalarda koʻrgazma oʻtkazish mumkin?

**`faq.items.2.a`**

- RU: Мы работаем на семи ключевых площадках Ташкента: UzExpoCentre, CAEx Uzbekistan, Anhor Lokomotiv, Yoshlar Ijod Saroyi, Humo Arena, Alpomish Arena и Zakovat Arena. Подбираем площадку под вашу выставку, ведём переговоры и бронируем её.
- EN: We work at the seven key venues in Tashkent: UzExpoCentre, CAEx Uzbekistan, Anhor Lokomotiv, Yoshlar Ijod Saroyi, Humo Arena, Alpomish Arena and Zakovat Arena. We choose the venue that fits your show, negotiate and book it.
- TR: Taşkent'in yedi kilit etkinlik mekânında çalışıyoruz: UzExpoCentre, CAEx Uzbekistan, Anhor Lokomotiv, Yoshlar Ijod Saroyi, Humo Arena, Alpomish Arena ve Zakovat Arena. Fuarınıza uygun mekânı seçiyor, görüşmeleri yürütüyor ve rezervasyonu yapıyoruz.
- ZH: 我们在塔什干七个核心场馆开展工作：UzExpoCentre、CAEx Uzbekistan、Anhor Lokomotiv、Yoshlar Ijod Saroyi、Humo Arena、Alpomish Arena 和 Zakovat Arena。我们根据展会需求选择场馆，负责谈判和预订。
- UZ: Toshkentdagi yettita asosiy maydonchada ishlaymiz: UzExpoCentre, CAEx Uzbekistan, Anhor Lokomotiv, Yoshlar Ijod Saroyi, Humo Arena, Alpomish Arena va Zakovat Arena. Koʻrgazmangizga mos maydonchani tanlaymiz, muzokaralar olib boramiz va band qilamiz.

**`faq.items.3.q`**

- RU: Как вы приводите посетителей на выставку?
- EN: How do you bring visitors to the show?
- TR: Fuara ziyaretçileri nasıl getiriyorsunuz?
- ZH: 你们如何为展会吸引观众？
- UZ: Koʻrgazmaga tashrif buyuruvchilarni qanday jalb qilasiz?

**`faq.items.3.a`**

- RU: Реклама в Meta, Telegram, Google и отраслевых СМИ; предрегистрация через лендинг выставки и Telegram-бот; персональные приглашения целевым компаниям и делегации из регионов; QR-учёт на входе. Целевое число посетителей фиксируем в договоре.
- EN: Promotion on Meta, Telegram, Google and in trade media; pre-registration through the show's landing page and a Telegram bot; personal invitations to target companies and regional delegations; QR check-in at the entrance. The target visitor count is fixed in the contract.
- TR: Meta, Telegram, Google ve sektör medyasında tanıtım; fuarın açılış sayfası ve Telegram botu üzerinden ön kayıt; hedef şirketlere doğrudan davet ve bölgelerden heyetler; girişte QR ile kayıt. Hedef ziyaretçi sayısı sözleşmede belirlenir.
- ZH: 在 Meta、Telegram、Google 和行业媒体上宣传推广；通过展会落地页和 Telegram 机器人进行预登记；直接邀请目标企业，组织各地区代表团；入口二维码签到。目标观众人数写入合同。
- UZ: Meta, Telegram, Google va soha nashrlarida reklama; koʻrgazma sahifasi va Telegram-bot orqali oldindan roʻyxatga olish; maqsadli kompaniyalarga shaxsiy taklif va viloyatlardan delegatsiyalar; kirishda QR orqali roʻyxatga olish. Tashrif buyuruvchilarning maqsadli soni shartnomada qayd etiladi.

**`faq.items.4.q`**

- RU: Что организатор получает после выставки?
- EN: What does the organiser receive after the show?
- TR: Organizatör fuardan sonra ne alır?
- ZH: 展会结束后主办方能获得什么？
- UZ: Koʻrgazmadan soʻng tashkilotchi nimalarga ega boʻladi?

**`faq.items.4.a`**

- RU: Базу контактов посетителей — с их согласия; аналитику по дням, отраслям, должностям и регионам; онлайн-дашборд во время выставки и цифры, с которыми проще продавать площадь участникам на следующий год.
- EN: A contact database of visitors, collected with their consent; analytics by day, industry, job title and region; a live dashboard during the show; and the numbers that make it easier to sell next year's floor space to exhibitors.
- TR: Ziyaretçilerin onayıyla toplanan iletişim veri tabanı; güne, sektöre, unvana ve bölgeye göre analitik; fuar süresince canlı panel ve gelecek yılın stant alanlarını katılımcılara satmayı kolaylaştıran rakamlar.
- ZH: 经观众同意收集的联系人数据库；按日期、行业、职位和地区的数据分析；展会期间的在线看板；以及帮助您向参展商销售明年展位面积的数据。
- UZ: Tashrif buyuruvchilar roziligi bilan toʻplangan kontaktlar bazasi; kunlar, sohalar, lavozimlar va hududlar kesimidagi tahlil; koʻrgazma davomida onlayn-dashbord va keyingi yilgi maydonlarni ishtirokchilarga sotishni osonlashtiradigan raqamlar.

**`faq.items.5.q`**

- RU: Какие есть форматы работы?
- EN: Which formats do you offer?
- TR: Hangi çalışma formatları var?
- ZH: 有哪些合作模式？
- UZ: Qanday ishlash formatlari bor?

**`faq.items.5.a`**

- RU: Три. Local Partner: вы строите сами, мы решаем всё на месте — разрешения, площадка, таможня и логистика. Turnkey Build: выставка под ключ — плюс проект и застройка павильона, стенды участников и техподдержка 24/7. Full House: под ключ и с полными залами — плюс реклама, регистрация и QR-учёт, приглашения и делегации, отчёт и база посетителей.
- EN: Three. Local Partner: you build, we handle everything on the ground — permits, venue, customs and logistics. Turnkey Build: a turnkey show — plus pavilion design and build, exhibitor stands and 24/7 technical support. Full House: turnkey with full halls — plus promotion, registration and QR check-in, invitations and delegations, the report and the visitor database.
- TR: Üç format var. Local Partner: kurulumu siz yaparsınız, sahadaki her şeyi biz hallederiz — izinler, mekân, gümrük ve lojistik. Turnkey Build: anahtar teslim fuar — ek olarak pavyon tasarımı ve kurulumu, katılımcı stantları ve 7/24 teknik destek. Full House: anahtar teslim ve dolu salonlar — ek olarak tanıtım, kayıt ve QR giriş, davetler ve heyetler, rapor ve ziyaretçi veri tabanı.
- ZH: 共三种。Local Partner：您自行搭建，现场事务由我们全部解决——许可、场馆、清关与物流。Turnkey Build：交钥匙展会——另含展馆设计与搭建、参展商展位和 7×24 小时技术支持。Full House：交钥匙 + 观众满馆——另含宣传推广、观众登记与二维码签到、邀请与代表团、报告与观众数据库。
- UZ: Uchta. Local Partner: stendni oʻzingiz qurasiz, joyidagi barcha masalalarni biz hal qilamiz — ruxsatnomalar, maydoncha, bojxona va logistika. Turnkey Build: koʻrgazmani toʻliq tashkil etamiz — qoʻshimcha ravishda pavilyonni loyihalash va qurish, ishtirokchilar stendlari va 24/7 texnik yordam. Full House: toʻliq tashkil etish va toʻla zallar — qoʻshimcha ravishda reklama, roʻyxatga olish va QR orqali kirish, taklifnomalar va delegatsiyalar, hisobot va tashrif buyuruvchilar bazasi.

**`faq.items.6.q`**

- RU: С чего начать?
- EN: How do we start?
- TR: Nasıl başlarız?
- ZH: 如何开始合作？
- UZ: Nimadan boshlaymiz?

**`faq.items.6.a`**

- RU: Пришлите тему и даты выставки через форму на этой странице, в WhatsApp или Telegram. По вашему ТЗ до старта подготовим концепцию и план запуска выставки, 3D-концепцию павильона и план привлечения посетителей.
- EN: Send us your show's theme and dates through the form on this page, on WhatsApp or Telegram. Based on your brief, before launch we prepare the show concept and launch plan, a 3D pavilion concept and a visitor acquisition plan.
- TR: Fuarınızın konusunu ve tarihlerini bu sayfadaki form, WhatsApp veya Telegram üzerinden gönderin. Brifinize göre lansmandan önce fuar konseptini ve lansman planını, pavyonun 3D konseptini ve ziyaretçi kazanım planını hazırlıyoruz.
- ZH: 请通过本页表单、WhatsApp 或 Telegram 发送展会的主题和日期。根据您的需求，启动前我们将准备展会概念与启动计划、展馆 3D 概念设计和观众招募计划。
- UZ: Koʻrgazmangiz mavzusi va sanalarini ushbu sahifadagi forma, WhatsApp yoki Telegram orqali yuboring. Texnik topshirigʻingiz asosida ishga tushirishdan oldin koʻrgazma konsepsiyasi va ishga tushirish rejasini, pavilyonning 3D-konsepsiyasini va tashrif buyuruvchilarni jalb qilish rejasini tayyorlaymiz.

## 10. Контакт

**`contact.kicker`**

- RU: До старта подготовим по вашему ТЗ
- EN: Based on your brief, we'll prepare before launch
- TR: Brifinize göre lansmandan önce hazırlıyoruz
- ZH: 根据您的需求，启动前我们将准备
- UZ: Texnik topshirigʻingiz asosida ishga tushirishdan oldin tayyorlaymiz

**`contact.title`**

- RU: Пришлите тему и даты [вашей выставки.]
- EN: Send us your show's [theme and dates.]
- TR: Fuarınızın konusunu ve tarihlerini [bize gönderin.]
- ZH: 请发送[您展会的主题和日期。]
- UZ: Koʻrgazmangiz mavzusi va sanalarini [bizga yuboring.]

**`contact.prepare.0`**

- RU: Концепцию и план запуска выставки
- EN: Show concept and launch plan
- TR: Fuar konsepti ve lansman planı
- ZH: 展会概念与启动计划
- UZ: Koʻrgazma konsepsiyasi va ishga tushirish rejasi

**`contact.prepare.1`**

- RU: 3D-концепцию павильона
- EN: 3D pavilion concept
- TR: Pavyonun 3D konsepti
- ZH: 展馆 3D 概念设计
- UZ: Pavilyonning 3D-konsepsiyasi

**`contact.prepare.2`**

- RU: План привлечения посетителей
- EN: Visitor acquisition plan
- TR: Ziyaretçi kazanım planı
- ZH: 观众招募计划
- UZ: Tashrif buyuruvchilarni jalb qilish rejasi

**`contact.phones`**

- RU: Телефоны
- EN: Phone
- TR: Telefon
- ZH: 电话
- UZ: Telefonlar

**`contact.whatsapp`**

- RU: WhatsApp
- EN: WhatsApp
- TR: WhatsApp
- ZH: WhatsApp
- UZ: WhatsApp

**`contact.telegram`**

- RU: Telegram
- EN: Telegram
- TR: Telegram
- ZH: Telegram
- UZ: Telegram

**`contact.email`**

- RU: E-mail
- EN: E-mail
- TR: E-posta
- ZH: 电子邮箱
- UZ: E-mail

**`contact.site`**

- RU: Сайт
- EN: Website
- TR: Web sitesi
- ZH: 网站
- UZ: Sayt

## 10. Форма заявки

**`form.title`**

- RU: Заявка организатора
- EN: Organiser enquiry
- TR: Organizatör talebi
- ZH: 主办方咨询
- UZ: Tashkilotchi arizasi

**`form.name`**

- RU: Имя
- EN: Name
- TR: Ad Soyad
- ZH: 姓名
- UZ: Ismingiz

**`form.company`**

- RU: Компания
- EN: Company
- TR: Şirket
- ZH: 公司
- UZ: Kompaniya

**`form.country`**

- RU: Страна
- EN: Country
- TR: Ülke
- ZH: 国家
- UZ: Mamlakat

**`form.countryPlaceholder`**

- RU: Начните вводить страну
- EN: Start typing a country
- TR: Ülke adını yazmaya başlayın
- ZH: 输入国家名称
- UZ: Mamlakat nomini kiriting

**`form.countryEmpty`**

- RU: Ничего не найдено
- EN: No matches
- TR: Sonuç bulunamadı
- ZH: 未找到
- UZ: Hech narsa topilmadi

**`form.email`**

- RU: E-mail
- EN: E-mail
- TR: E-posta
- ZH: 电子邮箱
- UZ: E-mail

**`form.phone`**

- RU: Телефон / WhatsApp
- EN: Phone / WhatsApp
- TR: Telefon / WhatsApp
- ZH: 电话 / WhatsApp
- UZ: Telefon / WhatsApp

**`form.showName`**

- RU: Название / тема выставки
- EN: Show name / theme
- TR: Fuarın adı / konusu
- ZH: 展会名称 / 主题
- UZ: Koʻrgazma nomi yoki mavzusi

**`form.dates`**

- RU: Планируемые даты
- EN: Planned dates
- TR: Planlanan tarihler
- ZH: 计划日期
- UZ: Rejalashtirilgan sanalar

**`form.month`**

- RU: Месяц
- EN: Month
- TR: Ay
- ZH: 月份
- UZ: Oy

**`form.year`**

- RU: Год
- EN: Year
- TR: Yıl
- ZH: 年份
- UZ: Yil

**`form.area`**

- RU: Площадь
- EN: Floor area
- TR: Alan
- ZH: 面积
- UZ: Maydon

**`form.areas.0`**

- RU: до 1 000 м²
- EN: up to 1,000 m²
- TR: 1.000 m²'ye kadar
- ZH: 1,000 m² 以下
- UZ: 1 000 m² gacha

**`form.areas.1`**

- RU: 1 000–5 000 м²
- EN: 1,000–5,000 m²
- TR: 1.000–5.000 m²
- ZH: 1,000–5,000 m²
- UZ: 1 000–5 000 m²

**`form.areas.2`**

- RU: 5 000–10 000 м²
- EN: 5,000–10,000 m²
- TR: 5.000–10.000 m²
- ZH: 5,000–10,000 m²
- UZ: 5 000–10 000 m²

**`form.areas.3`**

- RU: 10 000+ м²
- EN: 10,000+ m²
- TR: 10.000+ m²
- ZH: 10,000 m² 以上
- UZ: 10 000+ m²

**`form.areas.4`**

- RU: пока не знаю
- EN: not sure yet
- TR: henüz bilmiyorum
- ZH: 尚未确定
- UZ: hozircha nomaʼlum

**`form.format`**

- RU: Формат
- EN: Format
- TR: Format
- ZH: 合作模式
- UZ: Format

**`form.formatConsult`**

- RU: нужна консультация
- EN: I need advice
- TR: danışmanlık istiyorum
- ZH: 需要咨询
- UZ: maslahat kerak

**`form.choose`**

- RU: Выберите…
- EN: Select…
- TR: Seçin…
- ZH: 请选择…
- UZ: Tanlang…

**`form.message`**

- RU: Сообщение
- EN: Message
- TR: Mesaj
- ZH: 留言
- UZ: Xabar

**`form.messagePlaceholder`**

- RU: Отрасль, ожидаемое число экспонентов — всё, что важно
- EN: Industry, expected number of exhibitors — anything that matters
- TR: Sektör, beklenen katılımcı sayısı — önemli olan her şey
- ZH: 行业、预计参展商数量——任何重要信息
- UZ: Soha, ishtirokchilarning taxminiy soni va boshqa muhim maʼlumotlar

**`form.notice`**

- RU: Отправляя заявку, вы соглашаетесь с {link}
- EN: By sending the enquiry you agree to the {link}
- TR: Talebi göndererek kişisel verilerinizin {link} uyarınca işlenmesini kabul etmiş olursunuz
- ZH: 提交即表示您同意根据{link}处理您的个人数据
- UZ: Arizani yuborish orqali shaxsiy maʼlumotlaringizni {link} muvofiq qayta ishlashga rozilik bildirasiz

**`form.consentLink`**

- RU: политикой конфиденциальности
- EN: privacy policy
- TR: gizlilik politikası
- ZH: 隐私政策
- UZ: maxfiylik siyosatiga

**`form.required`**

- RU: * — обязательные поля
- EN: * required fields
- TR: * zorunlu alanlar
- ZH: * 为必填项
- UZ: * — majburiy maydonlar

**`form.optional`**

- RU: необязательно
- EN: optional
- TR: isteğe bağlı
- ZH: 选填
- UZ: ixtiyoriy

**`form.more`**

- RU: Добавить детали — компания, страна, e-mail, даты, площадь
- EN: Add details — company, country, e-mail, dates, floor area
- TR: Ayrıntı ekleyin — şirket, ülke, e-posta, tarihler, alan
- ZH: 补充详情——公司、国家、电子邮箱、日期、面积
- UZ: Tafsilot qoʻshing — kompaniya, mamlakat, e-mail, sanalar, maydon

**`form.less`**

- RU: Скрыть детали
- EN: Hide details
- TR: Ayrıntıları gizle
- ZH: 收起详情
- UZ: Tafsilotlarni yashirish

**`form.submit`**

- RU: Отправить заявку
- EN: Send enquiry
- TR: Talebi gönder
- ZH: 提交咨询
- UZ: Arizani yuborish

**`form.sending`**

- RU: Отправляем…
- EN: Sending…
- TR: Gönderiliyor…
- ZH: 正在发送…
- UZ: Yuborilmoqda…

**`form.errors.required`**

- RU: Заполните поле
- EN: Please fill in this field
- TR: Bu alanı doldurun
- ZH: 请填写此项
- UZ: Ushbu maydonni toʻldiring

**`form.errors.email`**

- RU: Проверьте e-mail
- EN: Please check the e-mail address
- TR: E-posta adresini kontrol edin
- ZH: 请检查邮箱地址
- UZ: E-mail manzilini tekshiring

**`form.errors.phone`**

- RU: Укажите номер полностью, с кодом страны
- EN: Enter the full number with the country code
- TR: Numarayı ülke koduyla birlikte eksiksiz yazın
- ZH: 请填写含国家代码的完整号码
- UZ: Raqamni mamlakat kodi bilan toʻliq kiriting

**`form.errors.country`**

- RU: Выберите страну из списка
- EN: Choose a country from the list
- TR: Listeden bir ülke seçin
- ZH: 请从列表中选择国家
- UZ: Mamlakatni roʻyxatdan tanlang

**`form.errors.consent`**

- RU: Нужно согласие на обработку данных
- EN: We need your consent to process your data
- TR: Veri işleme onayı gerekli
- ZH: 需要您同意数据处理
- UZ: Maʼlumotlarni qayta ishlashga rozilik bildiring

**`form.errors.summary`**

- RU: Проверьте отмеченные поля
- EN: Please check the highlighted fields
- TR: İşaretli alanları kontrol edin
- ZH: 请检查标记的字段
- UZ: Belgilangan maydonlarni tekshiring

**`form.errors.network`**

- RU: Не удалось отправить. Проверьте соединение и попробуйте ещё раз — или напишите нам в WhatsApp.
- EN: Could not send. Check your connection and try again — or message us on WhatsApp.
- TR: Gönderilemedi. Bağlantınızı kontrol edip tekrar deneyin — ya da bize WhatsApp'tan yazın.
- ZH: 发送失败。请检查网络后重试，或通过 WhatsApp 联系我们。
- UZ: Yuborib boʻlmadi. Internet aloqasini tekshirib, qayta urinib koʻring yoki bizga WhatsApp orqali yozing.

**`form.successTitle`**

- RU: Спасибо!
- EN: Thank you!
- TR: Teşekkürler!
- ZH: 谢谢！
- UZ: Rahmat!

**`form.successText`**

- RU: Свяжемся с вами в ближайшее время.
- EN: We'll be in touch shortly.
- TR: En kısa sürede sizinle iletişime geçeceğiz.
- ZH: 我们会尽快与您联系。
- UZ: Tez orada siz bilan bogʻlanamiz.

**`form.successAlt`**

- RU: Если удобнее — напишите нам прямо сейчас:
- EN: Prefer to talk now? Message us:
- TR: Hemen konuşmak isterseniz bize yazın:
- ZH: 如需立即沟通，请联系我们：
- UZ: Hoziroq gaplashmoqchi boʻlsangiz, bizga yozing:

## 11. Футер

**`footer.rights`**

- RU: Все права защищены.
- EN: All rights reserved.
- TR: Tüm hakları saklıdır.
- ZH: 版权所有。
- UZ: Barcha huquqlar himoyalangan.

**`footer.privacy`**

- RU: Политика конфиденциальности
- EN: Privacy policy
- TR: Gizlilik politikası
- ZH: 隐私政策
- UZ: Maxfiylik siyosati

## Политика конфиденциальности

**`privacy.title`**

- RU: Политика конфиденциальности
- EN: Privacy policy
- TR: Gizlilik politikası
- ZH: 隐私政策
- UZ: Maxfiylik siyosati

**`privacy.sections.0.title`**

- RU: Какие данные мы получаем
- EN: What we collect
- TR: Hangi verileri alıyoruz
- ZH: 我们收集哪些数据
- UZ: Qanday maʼlumotlarni olamiz

**`privacy.sections.0.text`**

- RU: Имя, компанию, страну, e-mail, телефон и то, что вы напишете в форме. А также сведения о визите: страницу, источник перехода и рекламные метки.
- EN: Your name, company, country, e-mail, phone and whatever you write in the form, plus details of the visit: the page, where you came from and campaign tags.
- TR: Adınız, şirketiniz, ülkeniz, e-posta adresiniz, telefonunuz ve formda yazdıklarınız; ayrıca ziyaretle ilgili bilgiler: sayfa, geldiğiniz kaynak ve kampanya etiketleri.
- ZH: 您的姓名、公司、国家、电子邮箱、电话以及您在表单中填写的内容，另外还有访问信息：页面、来源和广告标签。
- UZ: Ismingiz, kompaniyangiz, mamlakatingiz, e-mail, telefon raqamingiz va formada yozgan maʼlumotlaringiz. Shuningdek, tashrif haqidagi maʼlumotlar: sahifa, qayerdan kelganingiz va reklama belgilari.

**`privacy.sections.1.title`**

- RU: Зачем
- EN: Why
- TR: Neden
- ZH: 用途
- UZ: Nima uchun

**`privacy.sections.1.text`**

- RU: Чтобы ответить на заявку, подготовить предложение и обсудить вашу выставку. Мы не продаём ваши данные и не передаём их третьим лицам для их собственных целей.
- EN: To reply to your enquiry, prepare a proposal and discuss your show. We do not sell your data or pass it to third parties for their own purposes.
- TR: Talebinize yanıt vermek, teklif hazırlamak ve fuarınızı görüşmek için. Verilerinizi satmıyor, üçüncü kişilere kendi amaçları için aktarmıyoruz.
- ZH: 用于回复您的咨询、准备方案并与您沟通展会事宜。我们不会出售您的数据，也不会将其提供给第三方用于其自身目的。
- UZ: Arizangizga javob berish, taklif tayyorlash va koʻrgazmangizni muhokama qilish uchun. Maʼlumotlaringizni sotmaymiz va uchinchi shaxslarga ularning oʻz maqsadlari uchun bermaymiz.

**`privacy.sections.2.title`**

- RU: Где они хранятся
- EN: Where it is kept
- TR: Nerede saklanıyor
- ZH: 存储位置
- UZ: Qayerda saqlanadi

**`privacy.sections.2.text`**

- RU: Заявка сохраняется в защищённой базе ExpoContact и приходит в рабочий чат нашей команды в Telegram.
- EN: The enquiry is stored in ExpoContact's secured database and delivered to our team's work chat in Telegram.
- TR: Talep, ExpoContact'ın güvenli veri tabanında saklanır ve ekibimizin Telegram'daki çalışma sohbetine iletilir.
- ZH: 咨询信息保存在 ExpoContact 的安全数据库中，并发送到我们团队在 Telegram 的工作群。
- UZ: Ariza ExpoContactning himoyalangan bazasida saqlanadi va jamoamizning Telegramdagi ishchi chatiga yuboriladi.

**`privacy.sections.3.title`**

- RU: Аналитика
- EN: Analytics
- TR: Analitik
- ZH: 数据分析
- UZ: Tahlil

**`privacy.sections.3.text`**

- RU: Сайт использует Meta Pixel и собственную обезличенную статистику посещений, а при подключении — Google Analytics и LinkedIn Insight Tag. Они показывают, какая реклама работает.
- EN: The site uses the Meta Pixel and its own anonymised visit statistics and, when enabled, Google Analytics and the LinkedIn Insight Tag. They show which advertising works.
- TR: Site, Meta Pixel'i ve kendi anonim ziyaret istatistiklerini, etkinleştirildiğinde ise Google Analytics ve LinkedIn Insight Tag'i kullanır. Bunlar hangi reklamın işe yaradığını gösterir.
- ZH: 本网站使用 Meta Pixel 和自有的匿名访问统计，启用后还会使用 Google Analytics 和 LinkedIn Insight Tag，用于了解哪些广告有效。
- UZ: Sayt Meta Pixel va oʻzining anonim tashriflar statistikasidan, ulanganida esa Google Analytics va LinkedIn Insight Tag xizmatlaridan foydalanadi. Ular qaysi reklama samarali ishlayotganini koʻrsatadi.

**`privacy.sections.4.title`**

- RU: Ваши права
- EN: Your rights
- TR: Haklarınız
- ZH: 您的权利
- UZ: Huquqlaringiz

**`privacy.sections.4.text`**

- RU: Чтобы узнать, какие данные о вас хранятся, исправить или удалить их, напишите на info@expocontact.uz.
- EN: To find out what data we hold about you, correct it or have it deleted, write to info@expocontact.uz.
- TR: Hakkınızda hangi verileri tuttuğumuzu öğrenmek, düzeltmek veya sildirmek için info@expocontact.uz adresine yazın.
- ZH: 如需了解、更正或删除我们保存的您的数据，请发送邮件至 info@expocontact.uz。
- UZ: Siz haqingizda qanday maʼlumotlar saqlanayotganini bilish, ularni tuzatish yoki oʻchirish uchun info@expocontact.uz manziliga yozing.
