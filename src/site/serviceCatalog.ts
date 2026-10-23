export type ServiceItem = {
  n: string;
  name: string;
  nameEn?: string;
  subtitle: string;
  subtitleEn?: string;
  description: string;
  descriptionEn?: string;
  price: string;
  amount: number;
  pricing?: "from" | "quote";
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
  return { ...item, amount, price: "от " + amount.toLocaleString("ru-RU") + " ₽", pricing: "from", discountPercent: COMPLEX_PROJECT_DISCOUNT };
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
  ]},
  { title: "Разработка и автоматизация", titleEn: "Development & automation", packages: [
    { n: "15", name: "Исправление ошибок", nameEn: "Bug fixes", subtitle: "Одна локальная ошибка после диагностики", subtitleEn: "One localized issue after diagnosis", description: "Находим причину одной локальной ошибки на существующем сайте или в скрипте и согласуем исправление.", descriptionEn: "We diagnose one localized issue on an existing website or in a script and agree on the fix.", price: "от 3 000 ₽", amount: 3000, pricing: "from", items: ["Диагностика и согласование объёма", "Исправление одной локальной ошибки", "Проверка исправленного сценария"], itemsEn: ["Diagnosis and agreed scope", "One localized bug fix", "Verification of the corrected flow"], searchTerms: ["ошибка", "исправить", "не работает", "баг", "скрипт", "bug fix", "repair"] },
    { n: "16", name: "Доработка сайта", nameEn: "Website improvements", subtitle: "Одна небольшая функция на существующем сайте", subtitleEn: "One small feature on an existing website", description: "Добавляем форму, фильтр, калькулятор или другую небольшую функцию. Перед работой проверяем существующий код и фиксируем объём.", descriptionEn: "We add a form, filter, calculator or another small feature after reviewing the existing code and confirming the scope.", price: "от 5 000 ₽", amount: 5000, pricing: "from", items: ["Одна согласованная функция", "Адаптация под мобильные устройства", "Проверка работы функции"], itemsEn: ["One agreed feature", "Mobile adaptation", "Feature verification"], searchTerms: ["доработка сайта", "форма", "калькулятор", "фильтр", "функция", "website improvement", "form", "calculator"] },
    { n: "17", name: "Скрипты и автоматизация", nameEn: "Scripts & automation", subtitle: "Один сценарий для повторяющихся действий", subtitleEn: "One workflow for repetitive tasks", description: "Автоматизируем согласованный сценарий обработки файлов, таблиц или повторяющихся действий и объясняем, как им пользоваться.", descriptionEn: "We automate one agreed workflow involving files, spreadsheets or repetitive tasks and explain how to use it.", price: "от 7 000 ₽", amount: 7000, pricing: "from", items: ["Один согласованный сценарий", "Проверка на предоставленных примерах", "Краткая инструкция по запуску"], itemsEn: ["One agreed workflow", "Checks using supplied examples", "Short setup and usage guide"], searchTerms: ["автоматизация", "скрипт", "таблицы", "файлы", "программирование", "automation", "script", "programming"] },
    { n: "18", name: "Telegram-бот для бизнеса", nameEn: "Telegram bot for business", subtitle: "Меню, сбор заявок и уведомления владельцу", subtitleEn: "Menu, lead collection and owner notifications", description: "Разрабатываем базового бота с меню, сбором заявок и уведомлениями. Сценарий, размещение и стоимость согласуем до начала.", descriptionEn: "A basic bot with a menu, lead collection and notifications. We agree on its workflow, hosting and price before starting.", price: "от 12 000 ₽", amount: 12000, pricing: "from", items: ["Меню и один сценарий сбора заявки", "Уведомления владельцу", "Проверка и инструкция"], itemsEn: ["Menu and one lead collection flow", "Owner notifications", "Verification and instructions"], searchTerms: ["телеграм бот", "telegram bot", "бот", "заявки", "чат бот"] },
    { n: "19", name: "Подключение сервисов", nameEn: "Service integrations", subtitle: "Одна интеграция через доступный API", subtitleEn: "One integration through an available API", description: "Связываем два сервиса по одному сценарию, например передаём заявку с сайта в CRM. Сначала проверяем документацию и доступы.", descriptionEn: "We connect two services for one workflow, such as sending a website lead to a CRM, after checking API documentation and access.", price: "от 8 000 ₽", amount: 8000, pricing: "from", items: ["Одна интеграция и один сценарий", "Настройка обмена данными", "Проверка передачи данных"], itemsEn: ["One integration and one workflow", "Data exchange setup", "Data transfer verification"], searchTerms: ["интеграция", "api", "crm", "подключение", "сервисы", "integration"] },
    { n: "20", name: "Одностраничный сайт", nameEn: "Landing page", subtitle: "До пяти блоков и форма по готовым материалам", subtitleEn: "Up to five sections and a form using supplied content", description: "Создаём адаптивную одностраничную страницу с формой. Тексты, изображения и материалы предоставляет заказчик; отдельный дизайн и контент оцениваем дополнительно.", descriptionEn: "A responsive landing page with a form using client-supplied text, images and materials. Custom design and content are quoted separately.", price: "от 15 000 ₽", amount: 15000, pricing: "from", items: ["До пяти блоков", "Адаптация для телефона и компьютера", "Форма и проверка отправки заявки"], itemsEn: ["Up to five sections", "Mobile and desktop layouts", "Form and submission verification"], searchTerms: ["сайт", "лендинг", "одностраничный сайт", "разработка сайта", "landing page", "website"] },
    { n: "21", name: "Веб-приложение или личный кабинет", nameEn: "Web app or customer portal", subtitle: "Индивидуальная разработка по согласованному заданию", subtitleEn: "Custom development based on an agreed specification", description: "Обсуждаем функции, роли пользователей и интеграции. После оценки фиксируем состав, сроки, стоимость и этапы работы.", descriptionEn: "We review features, user roles and integrations, then confirm scope, deadlines, price and milestones.", price: "По расчёту", amount: 0, pricing: "quote", items: ["Оценка задачи и состава функций", "Согласование этапов и стоимости", "Разработка и проверка по заданию"], itemsEn: ["Feature and scope assessment", "Agreed milestones and price", "Development and verification against the specification"], searchTerms: ["веб приложение", "личный кабинет", "портал", "приложение", "разработка", "web app", "portal", "development"] },
  ]},
  { title: "Комплексная разработка для бизнеса", titleEn: "Business software & digital products",
    note: "На новые комплексные проекты — скидка 5% от нашей базовой оценки работ. Цены в прайсе уже со скидкой. В предложении покажем базовую смету, скидку и итог. Это стартовая оценка за описанный объём; окончательные состав, цена и сроки — после обсуждения. Хостинг, лицензии, платные API, эквайринг и сопровождение оплачиваются отдельно; скидка на них не распространяется.",
    noteEn: "New complex projects receive 5% off our base development estimate. Starting prices in the price list already include the discount. Your proposal shows the base estimate, discount and final price. Final scope, price and timeline are confirmed after discussion. Hosting, licenses, paid APIs, payment fees and ongoing support are separate and excluded from the discount.",
    packages: [
    {
        "n": "22",
        "name": "Корпоративный сайт",
        "nameEn": "Corporate website",
        "subtitle": "Сайт компании с услугами, кейсами и заявками",
        "subtitleEn": "A company website with services, case studies and inquiries",
        "description": "Для компаний, которым нужна полноценная презентация бизнеса. Проектируем структуру, создаём адаптивный дизайн и страницы услуг, подключаем формы и управление контентом. Начальный объём — до восьми типов страниц на одном языке. Тексты и фотографии предоставляет заказчик; сложные кабинеты и интеграции оцениваем отдельно.",
        "descriptionEn": "For companies that need a complete business website. Includes structure, responsive design, service pages, forms and content management. Starting scope: up to eight page templates in one language using client-supplied text and images. Complex portals and integrations are quoted separately.",
        "baseAmount": 200000,
        "timeline": "Ориентир: 4–6 недель",
        "timelineEn": "Estimate: 4–6 weeks",
        "items": [
            "Структура и адаптивный дизайн",
            "До восьми типов страниц и управление контентом",
            "Формы заявок, базовая аналитика и проверка",
            "Запуск, исходный код и инструкция"
        ],
        "itemsEn": [
            "Structure and responsive design",
            "Up to eight page templates and content management",
            "Inquiry forms, basic analytics and verification",
            "Launch, source code and instructions"
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
        "description": "Для брендов и магазинов, которые хотят принимать заказы на собственном сайте. Первый релиз: каталог до 100 товаров из готовой таблицы, карточки, корзина, оформление заказа и панель управления. Одна платёжная интеграция после проверки возможностей провайдера. Обмен с 1С, маркетплейсы, нестандартная доставка и массовый перенос данных — отдельно.",
        "descriptionEn": "For brands and retailers taking orders on their own website. First release: up to 100 products imported from a prepared spreadsheet, product pages, cart, checkout and an admin panel. One payment integration subject to provider availability. ERP sync, marketplace integrations, custom delivery and large data migrations are separate.",
        "baseAmount": 250000,
        "timeline": "Ориентир: 5–8 недель",
        "timelineEn": "Estimate: 5–8 weeks",
        "items": [
            "Каталог до 100 товаров и карточки",
            "Корзина, оформление и статусы заказов",
            "Панель управления и одна платёжная интеграция",
            "Проверка сценариев, запуск и исходный код"
        ],
        "itemsEn": [
            "Catalog of up to 100 products and product pages",
            "Cart, checkout and order statuses",
            "Admin panel and one payment integration",
            "Workflow verification, launch and source code"
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
        "description": "Для бизнеса с аудиторией в Telegram. Создаём один согласованный сценарий — каталог с заявкой, запись или кабинет — до пяти основных экранов, с проверкой авторизации Telegram на сервере, базой данных и небольшой панелью управления. Платежи, дополнительные интеграции и сложные программы лояльности рассчитываем отдельно.",
        "descriptionEn": "For businesses with an audience in Telegram. One agreed flow—a catalog with inquiries, booking or a portal—with up to five main screens, server-validated Telegram authentication, a database and a small admin panel. Payments, extra integrations and complex loyalty programs are quoted separately.",
        "baseAmount": 150000,
        "timeline": "Ориентир: 3–5 недель",
        "timelineEn": "Estimate: 3–5 weeks",
        "items": [
            "Один сценарий, до пяти основных экранов",
            "Авторизация Telegram и база данных",
            "Запуск из бота и базовая панель управления",
            "Проверка в согласованных клиентах Telegram"
        ],
        "itemsEn": [
            "One flow and up to five main screens",
            "Telegram authentication and database",
            "Bot launch entry and basic admin panel",
            "Testing in agreed Telegram clients"
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
        "description": "Для команды, которой уже не хватает таблиц. Начальная CRM: одна воронка, карточки клиентов и сделок, задачи, два уровня доступа и базовый отчёт по статусам. Сначала проверяем, нужна ли разработка с нуля или достаточно готовой CRM. Телефония, 1С, миграция данных и дополнительные процессы оцениваются отдельно.",
        "descriptionEn": "For teams that have outgrown spreadsheets. Starting CRM: one pipeline, customer and deal records, tasks, two access roles and a basic status report. We first assess whether custom development or an existing CRM fits best. Telephony, ERP, data migration and additional workflows are separate.",
        "baseAmount": 300000,
        "timeline": "Ориентир: 6–10 недель",
        "timelineEn": "Estimate: 6–10 weeks",
        "items": [
            "Описание процесса и одна воронка",
            "Карточки клиентов, сделок и задачи",
            "Два уровня доступа и базовые отчёты",
            "Проверка, запуск, код и обучение работе"
        ],
        "itemsEn": [
            "Workflow definition and one pipeline",
            "Customer records, deals and tasks",
            "Two access roles and basic reports",
            "Testing, launch, source code and usage training"
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
        "description": "Для сотрудников, которые регулярно ищут ответы в инструкциях и документах. Пилот на одной подготовленной базе: до 100 текстовых документов или 500 страниц, один интерфейс, ссылки на источники и проверка на 50 согласованных вопросах. Сканирование, распознавание, локальное размещение моделей и сложные права доступа — отдельные задачи. Провайдера модели и порядок обработки данных согласуем до загрузки.",
        "descriptionEn": "For staff who regularly search instructions and documents. A pilot on one prepared knowledge base: up to 100 text documents or 500 pages, one interface, source references and evaluation against 50 agreed questions. Scanning, OCR, local model hosting and complex permissions are separate. Model provider and data handling are agreed before upload.",
        "baseAmount": 150000,
        "timeline": "Ориентир: 3–5 недель",
        "timelineEn": "Estimate: 3–5 weeks",
        "items": [
            "Одна подготовленная база знаний",
            "Чат с ответами и ссылками на документы",
            "Отказ от ответа при отсутствии источника",
            "Проверка на 50 вопросах и инструкция"
        ],
        "itemsEn": [
            "One prepared knowledge base",
            "Chat with answers and document references",
            "Abstention when no supporting source is found",
            "Evaluation on 50 questions and instructions"
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
        "description": "Для нового сервиса, которому нужен первый рабочий релиз. В начальный объём входят один основной пользовательский сценарий, до восьми экранов, регистрация, два уровня доступа, серверная часть, база данных и панель управления. Функции и критерии приёмки фиксируем до начала; платежи, сложные интеграции, приложения для магазинов и высокая нагрузка — отдельный расчёт.",
        "descriptionEn": "For a new service that needs its first working release. Starting scope: one core user journey, up to eight screens, registration, two access roles, backend, database and admin panel. Features and acceptance criteria are fixed before work starts. Payments, complex integrations, app-store apps and high-load requirements are quoted separately.",
        "baseAmount": 500000,
        "timeline": "Ориентир: 8–12 недель",
        "timelineEn": "Estimate: 8–12 weeks",
        "items": [
            "Задание, прототип и один основной сценарий",
            "До восьми экранов, регистрация и два уровня доступа",
            "Серверная часть, база данных и админ-панель",
            "Тестирование, запуск, исходный код и документация"
        ],
        "itemsEn": [
            "Specification, prototype and one core journey",
            "Up to eight screens, registration and two access roles",
            "Backend, database and admin panel",
            "Testing, launch, source code and documentation"
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
].map(discountedProject)
  },
];

export const serviceCatalog = serviceGroups.flatMap((group) => group.packages);
// Storage IDs remain stable so existing carts and links keep their meaning.
export function serviceIdentity(item: ServiceItem, lang: "ru" | "en" = "ru") {
  const development = Number(item.n) > 14;
  const number = String(Number(item.n) - (development ? 14 : 0)).padStart(2, "0");
  const direction = development ? (lang === "en" ? "Development" : "Разработка") : (lang === "en" ? "Advertising" : "Реклама");
  const symbol = development ? "</>" : "📣";
  return { development, number, direction, symbol, code: `${development ? "DEV" : "AD"}-${number}`, label: `${symbol} ${direction} · № ${number}` };
}

export const money = (value: number) => value.toLocaleString("ru-RU") + " ₽";

export function servicePrice(item: ServiceItem, format: (value: number) => string, lang: "ru" | "en") {
  if (item.pricing === "quote") return lang === "en" ? "Custom quote" : "По расчёту";
  return (item.pricing === "from" ? (lang === "en" ? "from " : "от ") : "") + format(item.amount);
}

export function summarizeServices(ids: readonly string[]) {
  const chosen = serviceCatalog.filter(item => ids.includes(item.n));
  const fixed = chosen.filter(item => !item.pricing);
  const development = chosen.filter(item => item.pricing);
  return { chosen, fixed, development, total: fixed.reduce((sum, item) => sum + item.amount, 0) };
}
