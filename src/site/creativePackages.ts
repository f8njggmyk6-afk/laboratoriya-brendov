import type { ServiceGroup, ServiceItem } from "./serviceCatalog";

function creative(
  item: Omit<
    ServiceItem,
    "price" | "pricing" | "direction" | "description" | "descriptionEn"
  >,
): ServiceItem {
  return {
    ...item,
    direction: "advertising",
    pricing: "fixed",
    price: item.amount.toLocaleString("ru-RU") + " ₽",
    description: `${item.subtitle}. В стоимость входит: ${item.items.join("; ")}. ${item.requirements}`,
    descriptionEn: `${item.subtitleEn}. Includes: ${item.itemsEn?.join("; ")}. ${item.requirementsEn}`,
  };
}

export const creativeServiceGroups: readonly ServiceGroup[] = [
  {
    id: "presentations",
    direction: "advertising",
    title: "Презентации и коммерческие предложения",
    titleEn: "Presentations & proposals",
    packages: [
      creative({
        n: "ad-presentation",
        displayNumber: "15",
        name: "Бизнес-презентация под ключ",
        nameEn: "Business presentation",
        subtitle: "До 10 слайдов: структура, тексты и дизайн",
        subtitleEn: "Up to 10 slides: structure, copy and design",
        amount: 15000,
        timeline: "5 рабочих дней после получения материалов",
        timelineEn: "5 business days after receiving the materials",
        items: [
          "Одна презентация до 10 слайдов на одном языке",
          "Структура и тексты на основе материалов клиента",
          "Единый дизайн, до трёх простых схем или диаграмм",
          "Два раунда правок в рамках задания; PDF и редактируемый PPTX",
        ],
        itemsEn: [
          "One presentation of up to 10 slides in one language",
          "Structure and copy based on client materials",
          "Consistent design and up to three simple diagrams or charts",
          "Two revision rounds within the brief; PDF and editable PPTX",
        ],
        requirements:
          "Факты, цифры, логотип и материалы — от клиента. Исследования, финансовая модель, анимация и дополнительные слайды — отдельно.",
        requirementsEn:
          "Client supplies facts, figures, logo and materials. Research, financial modelling, animation and extra slides are separate.",
        searchTerms: [
          "презентация",
          "слайды",
          "презентация компании",
          "презентация продукта",
          "pitch deck",
          "powerpoint",
          "sales deck",
        ],
      }),
      creative({
        n: "ad-proposal",
        displayNumber: "16",
        name: "Коммерческое предложение",
        nameEn: "Commercial proposal",
        subtitle: "До 4 страниц с понятным предложением и условиями",
        subtitleEn: "Up to 4 pages presenting your offer and terms",
        amount: 8000,
        timeline: "4 рабочих дня после получения материалов",
        timelineEn: "4 business days after receiving the materials",
        items: [
          "Одно предложение до 4 страниц на одном языке",
          "Структура, текст, преимущества и призыв к действию",
          "Оформление в стиле компании и один блок с ценами",
          "Два раунда правок; PDF и редактируемый файл в согласованном формате",
        ],
        itemsEn: [
          "One proposal of up to 4 pages in one language",
          "Structure, copy, benefits and a call to action",
          "Company styling and one pricing section",
          "Two revision rounds; PDF and an editable file in the agreed format",
        ],
        requirements:
          "Продукт, цены, факты и условия предоставляет клиент. Другие версии, переводы и дополнительные страницы — отдельно.",
        requirementsEn:
          "Client supplies product information, prices, facts and terms. Additional versions, translations and pages are separate.",
        searchTerms: [
          "коммерческое предложение",
          "кп",
          "предложение клиенту",
          "sales proposal",
          "one pager",
          "презентор",
        ],
      }),
    ],
  },
  {
    id: "identity",
    direction: "advertising",
    title: "Брендбук и упаковка",
    titleEn: "Brand guidelines & packaging",
    packages: [
      creative({
        n: "ad-brandbook",
        displayNumber: "17",
        name: "Базовый брендбук",
        nameEn: "Essential brand guidelines",
        subtitle: "До 20 страниц правил по готовому логотипу",
        subtitleEn: "Up to 20 pages of guidelines for an existing logo",
        amount: 25000,
        timeline: "7 рабочих дней после получения материалов",
        timelineEn: "7 business days after receiving the materials",
        items: [
          "Руководство до 20 страниц для одного бренда",
          "Правила логотипа: версии, охранное поле и недопустимое использование",
          "Палитра, шрифтовые сочетания и принципы оформления",
          "Два примера носителей: визитка и пост для соцсети",
          "Два раунда правок; PDF и редактируемый макет",
        ],
        itemsEn: [
          "A guideline document of up to 20 pages for one brand",
          "Logo variants, clear space and incorrect usage",
          "Colour palette, font pairings and layout principles",
          "Two applications: a business card and a social post",
          "Two revision rounds; PDF and an editable layout",
        ],
        requirements:
          "Нужны готовый логотип и вводные о бренде. Новый логотип, бренд-стратегия и дополнительные носители в пакет не входят. Подбираем шрифты с бесплатным коммерческим использованием. Платные шрифты — только по вашему желанию и после согласования стоимости.",
        requirementsEn:
          "Requires an existing logo and brand brief. A new logo, brand strategy and additional applications are excluded. We select fonts that are free for commercial use. Paid fonts are used only at your request, with the cost agreed in advance.",
        searchTerms: [
          "брендбук",
          "гайдлайн",
          "фирменный стиль",
          "айдентика",
          "brandbook",
          "brand guidelines",
          "палитра",
          "шрифты",
        ],
      }),
      creative({
        n: "ad-packaging",
        displayNumber: "18",
        name: "Дизайн упаковки или этикетки",
        nameEn: "Packaging or label design",
        subtitle: "Один товар на готовой развёртке типографии",
        subtitleEn: "One product using a printer-supplied dieline",
        amount: 20000,
        timeline: "7 рабочих дней после получения материалов",
        timelineEn: "7 business days after receiving the materials",
        items: [
          "Один товар: одна коробка до 6 сторон или одна этикетка",
          "Два направления лицевой стороны; доработка одного выбранного",
          "Размещение текстов, состава и маркировки на готовой развёртке",
          "Два раунда правок; PDF по требованиям типографии и редактируемый макет",
        ],
        itemsEn: [
          "One product: one box with up to 6 sides or one label",
          "Two front-panel directions; refinement of the selected one",
          "Text, ingredients and supplied marks on an existing dieline",
          "Two revision rounds; printer-ready PDF and an editable layout",
        ],
        requirements:
          "В стоимость входят дизайн и подготовка макета к печати. Логотип, развёртку и требования типографии, утверждённые тексты и маркировку предоставляет клиент. Разработка конструкции, дополнительные товары и изготовление упаковки в стоимость не входят.",
        requirementsEn:
          "The price includes design and preparation of print-ready artwork. The client supplies the logo, printer’s dieline and specifications, approved text and product marks. Structural design, additional products and manufacturing are not included.",
        searchTerms: [
          "упаковка",
          "этикетка",
          "коробка",
          "дизайн упаковки",
          "дизайн этикетки",
          "packaging",
          "label",
          "sku",
        ],
      }),
    ],
  },
  {
    id: "content",
    direction: "advertising",
    title: "Тексты, фото и маркетплейсы",
    titleEn: "Copy, photography & marketplaces",
    packages: [
      creative({
        n: "ad-copywriting",
        displayNumber: "19",
        name: "Копирайтинг для бизнеса",
        nameEn: "Business copywriting",
        subtitle: "Одна статья или текст страницы до 5 000 знаков",
        subtitleEn: "One article or page of up to 5,000 characters",
        amount: 5000,
        timeline: "3 рабочих дня после получения материалов",
        timelineEn: "3 business days after receiving the materials",
        items: [
          "Один текст до 5 000 знаков с пробелами на одном языке",
          "Структура, заголовки и текст на основе брифа клиента",
          "Редактура, проверка логики и единый тон общения",
          "Два раунда правок; редактируемый DOCX",
        ],
        itemsEn: [
          "One text of up to 5,000 characters including spaces in one language",
          "Structure, headings and copy based on the client brief",
          "Editing, logic checks and a consistent tone of voice",
          "Two revision rounds; editable DOCX",
        ],
        requirements:
          "Нужны факты о продукте, аудитория и цель текста. Исследования, экспертная проверка и SEO-продвижение в пакет не входят. Для короткого объявления есть отдельная услуга «Рекламный текст».",
        requirementsEn:
          "Requires product facts, audience and purpose. Research, expert review and SEO promotion are excluded. Short ads have a separate Advertising copy package.",
        searchTerms: [
          "копирайтинг",
          "статья",
          "текст для сайта",
          "описание компании",
          "редактура",
          "copywriting",
          "article",
          "website copy",
        ],
      }),
      creative({
        n: "ad-photo",
        displayNumber: "20",
        name: "Обработка фотографий",
        nameEn: "Photo editing",
        subtitle: "10 фотографий для каталога, сайта или рекламы",
        subtitleEn: "10 photographs for a catalog, website or advertising",
        amount: 5000,
        timeline: "3 рабочих дня после получения материалов",
        timelineEn: "3 business days after receiving the materials",
        items: [
          "Пакет из 10 предоставленных фотографий",
          "Свет, цвет, кадрирование и единая визуальная подача",
          "Удаление простого фона и небольших дефектов без изменения товара",
          "Два раунда правок; JPG или PNG в одном согласованном размере",
        ],
        itemsEn: [
          "A set of 10 client-supplied photographs",
          "Light, colour, cropping and consistent visual treatment",
          "Simple background removal and minor cleanup without altering the product",
          "Two revision rounds; JPG or PNG in one agreed size",
        ],
        requirements:
          "Работаем с качественными исходниками. Съёмка, сложная портретная ретушь, реставрация и фотомонтаж оцениваются отдельно.",
        requirementsEn:
          "Requires suitable original files. Photography, complex portrait retouching, restoration and compositing are quoted separately.",
        searchTerms: [
          "обработка фото",
          "ретушь",
          "убрать фон",
          "фото товара",
          "цветокоррекция",
          "photo editing",
          "background removal",
          "product photo",
        ],
      }),
      creative({
        n: "ad-product-cards",
        displayNumber: "21",
        name: "Карточка товара для маркетплейса",
        nameEn: "Marketplace product visuals",
        subtitle: "Главное изображение и 5 слайдов для одного товара",
        subtitleEn: "One main image and 5 slides for one product",
        amount: 9000,
        timeline: "4 рабочих дня после получения материалов",
        timelineEn: "4 business days after receiving the materials",
        items: [
          "6 изображений для одного товара и одной площадки: Wildberries или Ozon",
          "Главное изображение и 5 слайдов с преимуществами и характеристиками",
          "Единый стиль, короткие подписи и простая инфографика",
          "Два раунда правок; JPG или PNG и редактируемый макет",
        ],
        itemsEn: [
          "6 images for one product and one marketplace: Wildberries or Ozon",
          "One main image and 5 benefit and specification slides",
          "Consistent styling, concise captions and simple infographics",
          "Two revision rounds; JPG or PNG and an editable layout",
        ],
        requirements:
          "Нужны фото, точные характеристики и преимущества товара. Съёмка, загрузка в кабинет, ведение магазина, видео и rich-контент в пакет не входят.",
        requirementsEn:
          "Requires photos, accurate specifications and product benefits. Photography, uploading, store management, video and rich content are excluded.",
        searchTerms: [
          "карточка товара",
          "карточки товаров",
          "инфографика",
          "маркетплейс",
          "wildberries",
          "ozon",
          "вайлдберриз",
          "озон",
          "product card",
          "marketplace",
        ],
      }),
    ],
  },
];
