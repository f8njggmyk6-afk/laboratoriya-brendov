export type ServiceItem = {
  n: string;
  direction?: "advertising" | "development";
  displayNumber?: string;
  customRequest?: boolean;
  name: string;
  nameEn?: string;
  subtitle: string;
  subtitleEn?: string;
  description: string;
  descriptionEn?: string;
  price: string;
  amount: number;
  pricing?: "fixed" | "quote";
  baseAmount?: number;
  discountPercent?: number;
  timeline?: string;
  timelineEn?: string;
  items: readonly string[];
  itemsEn?: readonly string[];
  searchTerms: readonly string[];
};

export const COMPLEX_PROJECT_DISCOUNT = 5;

function discountedProject(item: Omit<ServiceItem, "amount" | "price" | "pricing" | "discountPercent"> & { baseAmount: number }): ServiceItem {
  const amount = Math.round(item.baseAmount * (100 - COMPLEX_PROJECT_DISCOUNT) / 100);
  return { ...item, amount, price: amount.toLocaleString("ru-RU") + " ₽", pricing: "fixed", discountPercent: COMPLEX_PROJECT_DISCOUNT };
}

function customPackage(direction: "advertising" | "development"): ServiceItem {
  const development = direction === "development";
  return {
    n: development ? "dev-custom" : "ad-custom", direction, displayNumber: development ? "14" : "15", customRequest: true,
    name: development ? "Индивидуальный пакет разработки" : "Индивидуальный пакет рекламы и дизайна",
    nameEn: development ? "Custom development package" : "Custom advertising & design package",
    subtitle: "Не нашли нужную услугу? Подберём решение вместе.", subtitleEn: "Can't find the service you need? Let's find the right solution together.",
    description: "Расскажите о задаче — предложим состав работ, согласуем стоимость и сроки до начала.",
    descriptionEn: "Tell us what you need. We'll propose the scope and agree on price and timing before starting.",
    price: "По индивидуальному заданию", amount: 0, pricing: "quote", items: [], itemsEn: [], searchTerms: ["индивидуальный пакет", "другая услуга", "custom package"]
  };
}

export const serviceGroups: readonly { title: string; titleEn?: string; note?: string; noteEn?: string; packages: readonly ServiceItem[] }[] = [
  { title: "Названия", titleEn: "Naming", packages: [
    { n: "01", name: "Название, 2 варианта", nameEn: "Name — 2 options", subtitle: "Для компании, услуги, продукта или проекта", subtitleEn: "For a company, service, product or project", description: "Создаём два продуманных названия, объясняем логику каждого и предварительно проверяем совпадения.", descriptionEn: "Two considered naming options with rationale and a preliminary online similarity check.", price: "2 000 ₽", amount: 2000, items: ["2 продуманных варианта", "Краткое объяснение каждого", "Предварительный поиск совпадений в интернете"], itemsEn: ["2 considered options", "Short rationale for each", "Preliminary online similarity check"], searchTerms: ["название", "назвать", "имя", "нейминг", "компания", "продукт", "проект", "кафе", "магазин", "бренд"] },
    { n: "02", name: "Название, 5 вариантов", nameEn: "Name — 5 options", subtitle: "Для глубокого поиска и сравнения направлений", subtitleEn: "For deeper exploration and comparison", description: "Разрабатываем пять разных вариантов названия с обоснованием идей и предварительной проверкой совпадений.", descriptionEn: "Five distinct naming directions with rationale and a preliminary similarity check.", price: "5 000 ₽", amount: 5000, items: ["5 разных вариантов", "Обоснование идей", "Предварительный поиск совпадений"], itemsEn: ["5 distinct options", "Rationale for each direction", "Preliminary similarity check"], searchTerms: ["много названий", "варианты названия", "пять названий", "выбрать имя", "нейминг"] },
    { n: "03", name: "Название + слоган + логотип", nameEn: "Name + slogan + logo", subtitle: "Готовая основа бренда в единой концепции", subtitleEn: "A coherent foundation for a new brand", description: "Объединяем название, слоган и три варианта простого логотипа в одну согласованную основу бренда.", descriptionEn: "Naming, slogan development and three simple logo directions combined into one brand foundation.", price: "10 000 ₽", amount: 10000, items: ["Название и слоган", "3 варианта простого логотипа", "Доработка выбранного варианта"], itemsEn: ["Name and slogan", "3 simple logo options", "Refinement of the selected option"], searchTerms: ["бренд под ключ", "название слоган логотип", "основа бренда", "все сразу", "комплекс"] },
  ]},
  { title: "Названия и слоганы", titleEn: "Naming & slogans", packages: [
    { n: "04", name: "5 вариантов слогана", nameEn: "5 slogan options", subtitle: "Короткие фразы для бренда, рекламы или продукта", subtitleEn: "Short lines for a brand, ad or product", description: "Формулируем пять коротких слоганов, которые передают смысл и обещание бренда.", descriptionEn: "Five concise slogans that communicate the brand’s meaning and promise.", price: "2 000 ₽", amount: 2000, items: [], searchTerms: ["слоган", "девиз", "фраза", "лозунг", "подпись", "обещание"] },
    { n: "05", name: "Название позиции меню (минимум 2)", nameEn: "Menu item naming — minimum 2", subtitle: "Стоимость указана за одну позицию", subtitleEn: "Price shown per item", description: "Придумываем названия для отдельных блюд или напитков с учётом концепции заведения.", descriptionEn: "Names for individual dishes or drinks based on the venue concept.", price: "1 000 ₽ / позиция", amount: 2000, items: [], searchTerms: ["название блюда", "название напитка", "позиция меню", "меню", "еда"] },
    { n: "06", name: "10 названий для меню", nameEn: "10 names for a menu", subtitle: "Единая стилистика для напитков или блюд", subtitleEn: "One consistent style for dishes or drinks", description: "Создаём десять связанных названий для цельного и запоминающегося раздела меню.", descriptionEn: "Ten connected names for a cohesive and memorable menu section.", price: "7 000 ₽", amount: 7000, items: [], searchTerms: ["10 названий меню", "десять блюд", "названия напитков", "меню"] },
    { n: "07", name: "20 названий для меню", nameEn: "20 names for a menu", subtitle: "Расширенная проработка раздела меню", subtitleEn: "Extended naming for a larger menu", description: "Создаём двадцать названий в единой стилистике для большого меню или отдельной линейки.", descriptionEn: "Twenty names in one style for a large menu or product line.", price: "12 000 ₽", amount: 12000, items: [], searchTerms: ["20 названий меню", "двадцать блюд", "большое меню", "меню"] },
  ]},
  { title: "Логотипы", titleEn: "Logos", packages: [
    { n: "08", name: "Простой логотип", nameEn: "Simple logo", subtitle: "3 варианта и доработка выбранного", subtitleEn: "3 options + refinement", description: "Разрабатываем три варианта логотипа и передаём выбранный в JPG, PNG и на прозрачном фоне.", descriptionEn: "Three logo options with the selected version delivered in JPG, PNG and transparent formats.", price: "4 000 ₽", amount: 4000, items: [], searchTerms: ["логотип", "лого", "знак", "эмблема", "символ", "иконка"] },
    { n: "09", name: "Расширенный логотип", nameEn: "Extended logo package", subtitle: "5 вариантов и полный набор версий", subtitleEn: "5 options and a complete version set", description: "Создаём пять вариантов, цветную и чёрно-белую версии, аватар и файлы для разных носителей.", descriptionEn: "Five directions, color and monochrome versions, an avatar and files for different use cases.", price: "7 500 ₽", amount: 7500, items: [], searchTerms: ["расширенный логотип", "много логотипов", "аватар", "фирменный знак", "логотип"] },
  ]},
  { title: "Реклама и креативы", titleEn: "Advertising & creatives", packages: [
    { n: "10", name: "Рекламный текст", nameEn: "Advertising copy", subtitle: "Заголовок, основной текст и призыв к действию", subtitleEn: "Headline, body copy and call to action", description: "Пишем готовый рекламный текст с понятной структурой и сильным призывом к действию.", descriptionEn: "Ready-to-use advertising copy with a clear structure and strong call to action.", price: "2 500 ₽", amount: 2500, items: [], searchTerms: ["рекламный текст", "текст объявления", "копирайтинг", "заголовок", "призыв"] },
    { n: "11", name: "Полное оформление объявления", nameEn: "Complete ad copy package", subtitle: "Структура, описание, преимущества и призыв", subtitleEn: "Structure, description, benefits and CTA", description: "Собираем все текстовые элементы объявления в единую продающую подачу.", descriptionEn: "All text elements assembled into one clear, conversion-focused advertising message.", price: "5 000 ₽", amount: 5000, items: [], searchTerms: ["объявление", "оформить рекламу", "текст рекламы", "описание", "продвижение"] },
    { n: "12", name: "1 статичный рекламный креатив", nameEn: "1 static advertising creative", subtitle: "Готовое изображение с текстом под выбранную площадку", subtitleEn: "Ready-to-use visual for the selected platform", description: "Создаём один готовый рекламный макет для социальной сети, сайта, баннера или другой площадки.", descriptionEn: "One finished advertising visual for social media, a website banner or another digital placement.", price: "1 500 ₽", amount: 1500, items: [], searchTerms: ["фото для рекламы", "фотография для рекламы", "картинка", "креатив", "баннер", "пост", "сторис", "макет", "соцсеть", "telegram", "телеграм", "meta"] },
    { n: "13", name: "5 статичных креативов", nameEn: "5 static creatives", subtitle: "Разные визуальные подачи для тестирования", subtitleEn: "Different visual directions for testing", description: "Готовим пять рекламных креативов, чтобы сравнить разные идеи и визуальные направления.", descriptionEn: "Five advertising creatives for comparing several ideas and visual approaches.", price: "6 000 ₽", amount: 6000, items: [], searchTerms: ["5 креативов", "пять картинок", "несколько баннеров", "тест рекламы", "креативы"] },
    { n: "14", name: "10 статичных креативов", nameEn: "10 static creatives", subtitle: "Полный набор вариантов для рекламной кампании", subtitleEn: "A complete set for an advertising campaign", description: "Создаём десять согласованных рекламных креативов для полноценного запуска кампании.", descriptionEn: "Ten coordinated advertising creatives for a full campaign launch.", price: "10 000 ₽", amount: 10000, items: [], searchTerms: ["10 креативов", "десять картинок", "рекламная кампания", "набор баннеров", "много креативов"] },
    customPackage("advertising"),
  ]},
  { title: "Разработка и автоматизация", titleEn: "Development & automation", packages: [
    {"n": "15", "name": "Исправление ошибки на сайте", "nameEn": "Website bug fix", "subtitle": "Одна ошибка в интерфейсе существующего сайта", "subtitleEn": "One interface issue on an existing website", "description": "Одна ошибка в интерфейсе существующего сайта. В стоимость входит: Диагностика одной ошибки формы или отображения; Исправление в существующем коде без смены платформы; Проверка на телефоне и компьютере.", "descriptionEn": "One interface issue on an existing website. Includes: Diagnosis of one form or display issue; Fix in the existing code without platform migration; Mobile and desktop verification.", "price": "3 000 ₽", "amount": 3000, "pricing": "fixed", "items": ["Диагностика одной ошибки формы или отображения", "Исправление в существующем коде без смены платформы", "Проверка на телефоне и компьютере"], "itemsEn": ["Diagnosis of one form or display issue", "Fix in the existing code without platform migration", "Mobile and desktop verification"], "searchTerms": ["Исправление ошибки на сайте", "Website bug fix", "разработка", "исправление"]},
    {"n": "16", "name": "Форма заявки на сайте", "nameEn": "Website inquiry form", "subtitle": "Одна форма с отправкой заявки на email", "subtitleEn": "One form with email delivery", "description": "Одна форма с отправкой заявки на email. В стоимость входит: Одна форма до пяти полей на готовом сайте; Проверка полей и отправка на один email; Адаптация под телефон и проверка отправки.", "descriptionEn": "One form with email delivery. Includes: One form with up to five fields on an existing website; Field validation and delivery to one email address; Mobile layout and submission verification.", "price": "5 000 ₽", "amount": 5000, "pricing": "fixed", "items": ["Одна форма до пяти полей на готовом сайте", "Проверка полей и отправка на один email", "Адаптация под телефон и проверка отправки"], "itemsEn": ["One form with up to five fields on an existing website", "Field validation and delivery to one email address", "Mobile layout and submission verification"], "searchTerms": ["Форма заявки на сайте", "Website inquiry form", "разработка", "форма"]},
    {"n": "17", "name": "Автоматизация обработки таблиц", "nameEn": "Spreadsheet automation", "subtitle": "Объединение или очистка данных по одному правилу", "subtitleEn": "Merge or clean data using one agreed rule", "description": "Объединение или очистка данных по одному правилу. В стоимость входит: Один скрипт для CSV или XLSX: до двух входных файлов; Объединение таблиц или удаление дублей по одному правилу; Один итоговый файл, проверка и инструкция.", "descriptionEn": "Merge or clean data using one agreed rule. Includes: One CSV or XLSX script with up to two input files; Merge tables or remove duplicates using one rule; One output file, verification and instructions.", "price": "7 000 ₽", "amount": 7000, "pricing": "fixed", "items": ["Один скрипт для CSV или XLSX: до двух входных файлов", "Объединение таблиц или удаление дублей по одному правилу", "Один итоговый файл, проверка и инструкция"], "itemsEn": ["One CSV or XLSX script with up to two input files", "Merge tables or remove duplicates using one rule", "One output file, verification and instructions"], "searchTerms": ["Автоматизация обработки таблиц", "Spreadsheet automation", "разработка", "автоматизация"]},
    {"n": "18", "name": "Telegram-бот для бизнеса", "nameEn": "Telegram bot for business", "subtitle": "Меню, сбор заявок и уведомления владельцу", "subtitleEn": "Menu, lead collection and owner notifications", "description": "Меню, сбор заявок и уведомления владельцу. В стоимость входит: Меню до пяти кнопок и один сценарий заявки до пяти полей; Уведомления в один Telegram-чат владельца; Размещение на вашем хостинге, проверка и инструкция.", "descriptionEn": "Menu, lead collection and owner notifications. Includes: Menu with up to five buttons and one inquiry flow of up to five fields; Notifications to one owner Telegram chat; Deployment to your hosting, verification and instructions.", "price": "12 000 ₽", "amount": 12000, "pricing": "fixed", "items": ["Меню до пяти кнопок и один сценарий заявки до пяти полей", "Уведомления в один Telegram-чат владельца", "Размещение на вашем хостинге, проверка и инструкция"], "itemsEn": ["Menu with up to five buttons and one inquiry flow of up to five fields", "Notifications to one owner Telegram chat", "Deployment to your hosting, verification and instructions"], "searchTerms": ["Telegram-бот для бизнеса", "Telegram bot for business", "разработка", "telegram-бот"]},
    {"n": "19", "name": "Передача заявок в CRM через API", "nameEn": "CRM lead integration", "subtitle": "Одна форма → один сервис → одна заявка", "subtitleEn": "One form → one service → one lead", "description": "Одна форма → один сервис → одна заявка. В стоимость входит: Подключение одной формы к одному документированному REST API; Передача до десяти полей заявки с готовым API-ключом; Обработка ошибок отправки и проверка передачи.", "descriptionEn": "One form → one service → one lead. Includes: One form connected to one documented REST API; Transfer of up to ten lead fields using an available API key; Delivery error handling and transfer verification.", "price": "8 000 ₽", "amount": 8000, "pricing": "fixed", "items": ["Подключение одной формы к одному документированному REST API", "Передача до десяти полей заявки с готовым API-ключом", "Обработка ошибок отправки и проверка передачи"], "itemsEn": ["One form connected to one documented REST API", "Transfer of up to ten lead fields using an available API key", "Delivery error handling and transfer verification"], "searchTerms": ["Передача заявок в CRM через API", "CRM lead integration", "разработка", "передача"]},
    {"n": "20", "name": "Одностраничный сайт", "nameEn": "Landing page", "subtitle": "До пяти блоков и форма по готовым материалам", "subtitleEn": "Up to five sections and a form using supplied content", "description": "До пяти блоков и форма по готовым материалам. В стоимость входит: Одна страница до пяти блоков на одном языке; Адаптивная вёрстка по готовому макету, текстам и изображениям; Форма до пяти полей с отправкой на один email; Публикация на вашем хостинге и проверка.", "descriptionEn": "Up to five sections and a form using supplied content. Includes: One page of up to five sections in one language; Responsive implementation using supplied design, text and images; Form with up to five fields delivered to one email address; Deployment to your hosting and verification.", "price": "15 000 ₽", "amount": 15000, "pricing": "fixed", "items": ["Одна страница до пяти блоков на одном языке", "Адаптивная вёрстка по готовому макету, текстам и изображениям", "Форма до пяти полей с отправкой на один email", "Публикация на вашем хостинге и проверка"], "itemsEn": ["One page of up to five sections in one language", "Responsive implementation using supplied design, text and images", "Form with up to five fields delivered to one email address", "Deployment to your hosting and verification"], "searchTerms": ["Одностраничный сайт", "Landing page", "разработка", "одностраничный"]},
    { n: "21", name: "Веб-приложение или личный кабинет", nameEn: "Web app or customer portal", subtitle: "Индивидуальная разработка по согласованному заданию", subtitleEn: "Custom development based on an agreed specification", description: "Обсуждаем функции, роли пользователей и интеграции. После оценки фиксируем состав, сроки, стоимость и этапы работы.", descriptionEn: "We review features, user roles and integrations, then confirm scope, deadlines, price and milestones.", price: "По индивидуальному заданию", amount: 0, pricing: "quote", items: ["Оценка задачи и состава функций", "Согласование этапов и стоимости", "Разработка и проверка по заданию"], itemsEn: ["Feature and scope assessment", "Agreed milestones and price", "Development and verification against the specification"], searchTerms: ["веб приложение", "личный кабинет", "портал", "приложение", "разработка", "web app", "portal", "development"] },
  ]},
  { title: "Комплексная разработка для бизнеса", titleEn: "Business software & digital products",
    note: "Скидка 5% уже включена в цены комплексных пакетов. Стоимость фиксирована за указанный состав работ. Дополнительные функции согласуем и оцениваем отдельно до выполнения. Хостинг, домен, лицензии, платные API, эквайринг и сопровождение оплачиваются отдельно; скидка на них не распространяется.",
    noteEn: "Complex package prices already include a 5% discount. Prices are fixed for the listed scope. Additional features are agreed and quoted separately before work starts. Hosting, domains, licenses, paid APIs, payment fees and ongoing support are separate and excluded from the discount.",
    packages: [...[
    {
        "n": "22",
        "name": "Корпоративный сайт",
        "nameEn": "Corporate website",
        "subtitle": "Сайт компании с услугами, кейсами и заявками",
        "subtitleEn": "A company website with services, case studies and inquiries",
        "description": "В пакет входит: До восьми типов страниц на одном языке; Адаптивный дизайн и управление контентом; До двух форм заявок и подключение одного счётчика аналитики; Публикация, исходный код и инструкция; тексты и фото — от клиента. Дополнительные функции — по согласованию за отдельную плату.",
        "descriptionEn": "Package includes: Up to eight page templates in one language; Responsive design and content management; Up to two inquiry forms and one analytics counter; Deployment, source code and instructions; client-supplied text and photos. Additional features are agreed and priced separately.",
        "baseAmount": 200000,
        "timeline": "Ориентир: 4–6 недель",
        "timelineEn": "Estimate: 4–6 weeks",
        "items": [
            "До восьми типов страниц на одном языке",
            "Адаптивный дизайн и управление контентом",
            "До двух форм заявок и подключение одного счётчика аналитики",
            "Публикация, исходный код и инструкция; тексты и фото — от клиента"
        ],
        "itemsEn": [
            "Up to eight page templates in one language",
            "Responsive design and content management",
            "Up to two inquiry forms and one analytics counter",
            "Deployment, source code and instructions; client-supplied text and photos"
        ],
        "searchTerms": [
            "корпоративный сайт",
            "многостраничный сайт",
            "сайт компании",
            "corporate website",
            "business website"
        ]
    },
    {
        "n": "23",
        "name": "Интернет-магазин",
        "nameEn": "Online store",
        "subtitle": "Каталог, корзина, оформление и управление заказами",
        "subtitleEn": "Catalog, cart, checkout and order management",
        "description": "В пакет входит: Каталог до 100 товаров из готовой таблицы и карточки товаров; Корзина, оформление заказа и статусы заказов; Панель управления и один платёжный провайдер по готовому API; Один язык, адаптивный дизайн, тестирование, запуск и исходный код. Дополнительные функции — по согласованию за отдельную плату.",
        "descriptionEn": "Package includes: Catalog of up to 100 products from a prepared spreadsheet and product pages; Cart, checkout and order statuses; Admin panel and one payment provider through an available API; One language, responsive design, testing, launch and source code. Additional features are agreed and priced separately.",
        "baseAmount": 250000,
        "timeline": "Ориентир: 5–8 недель",
        "timelineEn": "Estimate: 5–8 weeks",
        "items": [
            "Каталог до 100 товаров из готовой таблицы и карточки товаров",
            "Корзина, оформление заказа и статусы заказов",
            "Панель управления и один платёжный провайдер по готовому API",
            "Один язык, адаптивный дизайн, тестирование, запуск и исходный код"
        ],
        "itemsEn": [
            "Catalog of up to 100 products from a prepared spreadsheet and product pages",
            "Cart, checkout and order statuses",
            "Admin panel and one payment provider through an available API",
            "One language, responsive design, testing, launch and source code"
        ],
        "searchTerms": [
            "интернет магазин",
            "магазин",
            "каталог",
            "корзина",
            "онлайн оплата",
            "ecommerce",
            "online store",
            "shop"
        ]
    },
    {
        "n": "24",
        "name": "Telegram Mini App",
        "nameEn": "Telegram Mini App",
        "subtitle": "Каталог, запись или кабинет внутри Telegram",
        "subtitleEn": "A catalog, booking flow or portal inside Telegram",
        "description": "В пакет входит: Один сценарий: каталог с заявкой, запись или кабинет; До пяти экранов на одном языке; Авторизация Telegram, база данных и базовая админ-панель; Запуск из бота, тестирование и исходный код. Дополнительные функции — по согласованию за отдельную плату.",
        "descriptionEn": "Package includes: One flow: catalog with inquiries, booking or a portal; Up to five screens in one language; Telegram authentication, database and basic admin panel; Bot launch entry, testing and source code. Additional features are agreed and priced separately.",
        "baseAmount": 150000,
        "timeline": "Ориентир: 3–5 недель",
        "timelineEn": "Estimate: 3–5 weeks",
        "items": [
            "Один сценарий: каталог с заявкой, запись или кабинет",
            "До пяти экранов на одном языке",
            "Авторизация Telegram, база данных и базовая админ-панель",
            "Запуск из бота, тестирование и исходный код"
        ],
        "itemsEn": [
            "One flow: catalog with inquiries, booking or a portal",
            "Up to five screens in one language",
            "Telegram authentication, database and basic admin panel",
            "Bot launch entry, testing and source code"
        ],
        "searchTerms": [
            "mini app",
            "мини приложение",
            "телеграм приложение",
            "telegram mini app",
            "запись",
            "бронирование"
        ]
    },
    {
        "n": "25",
        "name": "CRM и внутренняя система",
        "nameEn": "CRM & internal business system",
        "subtitle": "Клиенты, заявки, задачи и отчёты в одном месте",
        "subtitleEn": "Customers, inquiries, tasks and reports in one place",
        "description": "В пакет входит: Одна воронка продаж и два уровня доступа; Карточки клиентов, сделки и задачи; Один отчёт по статусам, без переноса старой базы; Тестирование, запуск, исходный код и инструкция. Дополнительные функции — по согласованию за отдельную плату.",
        "descriptionEn": "Package includes: One sales pipeline and two access roles; Customer records, deals and tasks; One status report, excluding legacy data migration; Testing, launch, source code and instructions. Additional features are agreed and priced separately.",
        "baseAmount": 300000,
        "timeline": "Ориентир: 6–10 недель",
        "timelineEn": "Estimate: 6–10 weeks",
        "items": [
            "Одна воронка продаж и два уровня доступа",
            "Карточки клиентов, сделки и задачи",
            "Один отчёт по статусам, без переноса старой базы",
            "Тестирование, запуск, исходный код и инструкция"
        ],
        "itemsEn": [
            "One sales pipeline and two access roles",
            "Customer records, deals and tasks",
            "One status report, excluding legacy data migration",
            "Testing, launch, source code and instructions"
        ],
        "searchTerms": [
            "crm",
            "црм",
            "срм",
            "система учёта",
            "управление клиентами",
            "воронка продаж",
            "internal system",
            "customer management"
        ]
    },
    {
        "n": "26",
        "name": "ИИ-помощник по документам",
        "nameEn": "AI assistant for company documents",
        "subtitle": "Поиск ответов в базе знаний со ссылками на источники",
        "subtitleEn": "Answers from your knowledge base with source references",
        "description": "В пакет входит: Одна база: до 100 текстовых документов и до 500 страниц суммарно; Один чат с ответами и ссылками на источники; Подключение одной облачной модели; без OCR и локального развёртывания; Проверка на 50 вопросах, запуск и инструкция. Дополнительные функции — по согласованию за отдельную плату.",
        "descriptionEn": "Package includes: One knowledge base: up to 100 text documents and 500 pages total; One chat with answers and source references; One cloud model integration; no OCR or local model deployment; Evaluation on 50 questions, launch and instructions. Additional features are agreed and priced separately.",
        "baseAmount": 150000,
        "timeline": "Ориентир: 3–5 недель",
        "timelineEn": "Estimate: 3–5 weeks",
        "items": [
            "Одна база: до 100 текстовых документов и до 500 страниц суммарно",
            "Один чат с ответами и ссылками на источники",
            "Подключение одной облачной модели; без OCR и локального развёртывания",
            "Проверка на 50 вопросах, запуск и инструкция"
        ],
        "itemsEn": [
            "One knowledge base: up to 100 text documents and 500 pages total",
            "One chat with answers and source references",
            "One cloud model integration; no OCR or local model deployment",
            "Evaluation on 50 questions, launch and instructions"
        ],
        "searchTerms": [
            "ии",
            "ai",
            "rag",
            "ассистент",
            "помощник",
            "документы",
            "база знаний",
            "чат по документам",
            "knowledge base",
            "ai assistant"
        ]
    },
    {
        "n": "27",
        "name": "Веб-сервис — первая версия",
        "nameEn": "Web service — first release",
        "subtitle": "Рабочая версия продукта для первых пользователей",
        "subtitleEn": "A working product for your first users",
        "description": "В пакет входит: Один основной сценарий, до восьми экранов на одном языке; Регистрация и два уровня доступа; Серверная часть, база данных и базовая админ-панель; Тестирование, публикация, исходный код и документация. Дополнительные функции — по согласованию за отдельную плату.",
        "descriptionEn": "Package includes: One core flow, up to eight screens in one language; Registration and two access roles; Backend, database and basic admin panel; Testing, deployment, source code and documentation. Additional features are agreed and priced separately.",
        "baseAmount": 500000,
        "timeline": "Ориентир: 8–12 недель",
        "timelineEn": "Estimate: 8–12 weeks",
        "items": [
            "Один основной сценарий, до восьми экранов на одном языке",
            "Регистрация и два уровня доступа",
            "Серверная часть, база данных и базовая админ-панель",
            "Тестирование, публикация, исходный код и документация"
        ],
        "itemsEn": [
            "One core flow, up to eight screens in one language",
            "Registration and two access roles",
            "Backend, database and basic admin panel",
            "Testing, deployment, source code and documentation"
        ],
        "searchTerms": [
            "mvp",
            "saas",
            "веб сервис",
            "стартап",
            "онлайн сервис",
            "сервис подписки",
            "web service",
            "startup",
            "продукт"
        ]
    }
].map(discountedProject), customPackage("development")]
  },
];

export const serviceCatalog = serviceGroups.flatMap((group) => group.packages);
// Storage IDs remain stable so existing carts and links keep their meaning.
export function serviceIdentity(item: ServiceItem, lang: "ru" | "en" = "ru") {
  const development = item.direction ? item.direction === "development" : Number(item.n) > 14;
  const number = item.displayNumber ?? String(Number(item.n) - (development ? 14 : 0)).padStart(2, "0");
  const direction = development ? (lang === "en" ? "Development" : "Разработка") : (lang === "en" ? "Advertising" : "Реклама");
  const symbol = development ? "</>" : "📣";
  return { development, number, direction, symbol, code: `${development ? "DEV" : "AD"}-${number}`, label: `${symbol} ${direction} · № ${number}` };
}

export const money = (value: number) => value.toLocaleString("ru-RU") + " ₽";

export function servicePrice(item: ServiceItem, format: (value: number) => string, lang: "ru" | "en") {
  if (item.pricing === "quote") return lang === "en" ? "Custom specification" : "По индивидуальному заданию";
  return format(item.amount);
}

export function summarizeServices(ids: readonly string[]) {
  const chosen = serviceCatalog.filter(item => ids.includes(item.n));
  const fixed = chosen.filter(item => item.pricing !== "quote");
  const development = chosen.filter(item => serviceIdentity(item).development);
  const custom = chosen.filter(item => item.pricing === "quote");
  const advertisingTotal = fixed.filter(item => !serviceIdentity(item).development).reduce((sum,item)=>sum+item.amount,0);
  const developmentTotal = fixed.filter(item => serviceIdentity(item).development).reduce((sum,item)=>sum+item.amount,0);
  return { chosen, fixed, development, custom, advertisingTotal, developmentTotal, total: fixed.reduce((sum, item) => sum + item.amount, 0) };
}
