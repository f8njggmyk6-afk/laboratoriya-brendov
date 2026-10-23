import { ServiceBadge } from "./ServiceBadge";
import { Link } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { BackToTop, ScrollReminder, ContactBand, PhoneIcon, SectionCue, SiteHeader } from "./SiteShell";
import { StructuredData } from "./StructuredData";
import { serviceCatalog, servicePrice } from "./serviceCatalog";
import { useLanguage } from "./i18n";

const schema = JSON.stringify({"@context":"https://schema.org","@type":"ProfessionalService","name":"Brand Laboratory","serviceType":"Naming, design, websites, bots and automation","url":"https://laboratoriyabrendov.com"});

const clean = (value: string) => value.toLowerCase().replace(/ё/g, "е").replace(/[^a-zа-я0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const distance = (a: string, b: string) => {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0]; row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const saved = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = saved;
    }
  }
  return row[b.length];
};
const stem = (word: string) => clean(word).replace(/(иями|ями|ами|ого|ему|ыми|ими|иях|ах|ях|ой|ый|ий|ая|яя|ое|ее|ов|ев|ам|ям|ом|ем|ы|и|а|я|у|ю|е|о)$/u, "");
const findService = (value: string) => {
  const query = clean(value);
  if (!query) return null;
  const tokens = query.split(" ").filter((token) => token.length > 2).map(stem);
  const ranked = serviceCatalog.map((service) => {
    const source = [...service.searchTerms, service.name, service.nameEn ?? "", service.subtitle, service.subtitleEn ?? ""];
    const terms = source.flatMap((term) => clean(term).split(" ")).filter((term) => term.length > 2).map(stem);
    const score = tokens.reduce((sum, token) => sum + Math.max(0, ...terms.map((term) => {
      if (token === term) return 8;
      if (token.length > 3 && term.length > 3 && (token.startsWith(term) || term.startsWith(token))) return 6;
      if (token.length > 4 && distance(token, term) <= 2) return 3;
      return 0;
    })), 0);
    return { service, score };
  }).sort((a, b) => b.score - a.score);
  return ranked[0]?.score >= 3 ? ranked[0].service : null;
};

function ServiceFinder() {
  const { lang, t } = useLanguage();
  const [query, setQuery] = useState("");
  const match = useMemo(() => findService(query), [query]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.location.assign(match ? `/pricing#price-${match.n}` : "/pricing");
  };
  return <form className="service-finder" onSubmit={submit}>
    <div className="service-finder-copy"><b>{t("Опишите задачу своими словами","Describe your task in your own words")}</b><span>{t("Можно написать одно слово или несколько — так, как вам удобно.","One word or a short phrase is enough.")}</span></div>
    <div className="service-finder-control">
      <span className="finder-icon" aria-hidden="true" />
      <label className="sr-only" htmlFor="service-search">{t("Поиск услуги","Service search")}</label>
      <input id="service-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Например: создать Telegram-бота","For example: a Telegram bot")} />
      <button type="submit">{t("Найти","Find")} <span>→</span></button>
    </div>
    {query ? <p className="service-finder-result">{match ? <>{t("Подходит:","Best match:")} <b>{lang==="en"?(match.nameEn??match.name):match.name}</b></> : t("Покажем все подходящие услуги","We’ll show all relevant services")}</p> : null}
  </form>;
}

export function HomePage() {
  const { lang, t, money } = useLanguage();
  const approach = lang==="en"
    ? [["01","Listen","We understand your task, product and expectations."],["02","Discuss","We clarify the audience, character and practical constraints."],["03","Propose","We develop professional directions with clear reasoning."],["04","Refine","We improve the selected direction together until it is ready."],["05","Payment","Design is paid after approval. Development follows agreed milestones."]]
    : [["01","Слушаем","Погружаемся в вашу задачу, продукт и ожидания."],["02","Обсуждаем","Уточняем аудиторию, характер и практические ограничения."],["03","Предлагаем","Разрабатываем профессиональные варианты с понятной логикой."],["04","Доводим","Вместе совершенствуем выбранное направление до результата."],["05","Оплата","Дизайн — после утверждения. Разработка — по согласованным этапам."]];
  const services = lang==="en"
    ? [["01","Naming","Naming for a company, product or service."],["02","Slogan","A concise expression of the brand’s meaning and promise."],["03","Logo","A mark, typography and visual character."],["04","Advertising creatives","Ideas and layouts for Meta, Telegram, websites and banners."],["05","Brand system","A connected set of solutions for a complete launch."],["06","Development & automation","Websites, Telegram bots, integrations, scripts and bug fixes."],["07","Business software","Online stores, CRM, Mini Apps, AI assistants and first product releases."]]
    : [["01","Название","Нейминг для компании, продукта или сервиса."],["02","Слоган","Короткая формула смысла и обещания бренда."],["03","Логотип","Знак, типографика и визуальный характер."],["04","Рекламные креативы","Идеи и макеты для Meta, Telegram, сайтов и баннеров."],["05","Фирменная система","Связанный набор решений для полноценного запуска."],["06","Разработка и автоматизация","Сайты, Telegram-боты, интеграции, скрипты и исправление ошибок."],["07","Цифровые продукты для бизнеса","Интернет-магазины, CRM, Mini Apps, ИИ-помощники и первые версии сервисов."]];
  const faq = lang==="en"
    ? [["How does the work start?","With a short discussion of the task, product and customer. Then we propose professional directions and explain the logic behind each."],["When is payment due?","Design is paid after approval of protected previews. For development, we agree on scope and price first; larger projects use paid milestones. Hosting and paid services are separate."],["Do you create advertising creatives?","Yes. We create ideas and layouts for social media, advertising platforms, banners and other digital formats."],["Do you develop websites and bots?","Yes. We create landing pages, Telegram bots, integrations and automation, and improve existing websites. Scope, timeline and price are agreed before work starts."],["Can I order just one service?","Yes. You can start with a single name, slogan, logo or creative and expand later if needed."]]
    : [["С чего начинается работа?","С короткого разговора о задаче, продукте и клиенте. Затем мы предлагаем профессиональные направления и объясняем логику каждого."],["Когда нужна оплата?","Дизайн оплачивается после утверждения защищённых вариантов. Для разработки заранее фиксируем объём и стоимость, крупные проекты делим на оплачиваемые этапы. Хостинг и платные сервисы — отдельно."],["Вы делаете рекламные креативы?","Да. Создаём идеи и макеты для социальных сетей, рекламных кабинетов, баннеров и других цифровых форматов."],["Вы разрабатываете сайты и ботов?","Да. Создаём одностраничные сайты, Telegram-ботов, интеграции и автоматизацию, дорабатываем существующие сайты. Состав, сроки и стоимость согласуем до начала работы."],["Можно заказать одну услугу?","Да. Можно начать с одного названия, слогана, логотипа или креатива, а затем расширить работу до целой системы."]];
  const featured = ["01","03","12","18","20","23","26"].map(n=>serviceCatalog.find(s=>s.n===n)!);

  return <><StructuredData json={schema}/><SiteHeader/><main>
    <section className="new-hero">
      <video autoPlay muted loop playsInline poster="/assets/world/scene-01-poster.png"><source src="/assets/world/scene-01.mp4" type="video/mp4"/></video>
      <div className="new-hero-shade"/>
      <div className="new-hero-content">
        <p className="eyebrow">{t("Нейминг · Дизайн · Разработка · Реклама","Naming · Design · Development · Advertising")}</p>
        <h1>{t("Бренды, которые","Brands people")}<br/>{t("выбирают.","choose.")}</h1>
        <p className="hero-lead">{t("Названия, логотипы, дизайн, сайты, боты и автоматизация для бизнеса по всей России.","Naming, logos, design, websites, bots and automation for businesses worldwide.")}</p>
        <p className="hero-method">{t("Слушаем задачу, предлагаем сильные варианты и вместе доводим решение до результата.","We listen, propose strong directions and refine the selected solution together.")}</p>
        <ServiceFinder />
        <div className="hero-actions hero-actions-single"><Link to="/contacts">{t("Обсудить задачу","Discuss project")} <PhoneIcon className="is-pulsing"/></Link></div>
        <p className="payment-last">{t("Дизайн — без предоплаты. Разработка — по согласованному объёму и этапам.","Design — no advance payment. Development — agreed scope and milestones.")}</p>
      </div>
      <SectionCue label="Листайте дальше" labelEn="Keep scrolling"/>
    </section>

    <section className="clear-section approach-section">
      <header><p className="section-index">{t("01 / Наш подход","01 / Our approach")}</p><h2>{t("Сначала понимаем. Потом создаём.","Understand first. Create second.")}</h2></header>
      <div className="step-grid">{approach.map(([n,title,copy])=><article key={n}><span>{n}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      <SectionCue label="Листайте дальше" labelEn="Keep scrolling"/>
    </section>

    <section className="clear-section services-home">
      <header><p className="section-index">{t("02 / Услуги","02 / Services")}</p><h2>{t("Каждая задача в своём разделе.","A clear service for every task.")}</h2></header>
      <div className="service-grid">{services.map(([n,title,copy])=><Link to="/services" hash={n==="07"?"service-group-6":n==="06"?"service-group-5":undefined} className="service-tile" key={n}><span>{n}</span><h3>{title}</h3><p>{copy}</p><b>↗</b></Link>)}</div>
      <p className="complex-project-offer">{t("Комплексная разработка для бизнеса — скидка 5% от базовой оценки работ. Стартовые цены в прайсе уже со скидкой.", "Complex business projects — 5% off our base development estimate. Starting prices already include the discount.")} <a href="/pricing#pricing-group-6">{t("Посмотреть проекты и цены →", "View projects and pricing →")}</a></p>
      <SectionCue label="Листайте дальше" labelEn="Keep scrolling"/>
    </section>

    <section className="clear-section works-home">
      <header><p className="section-index">{t("03 / Наши работы","03 / Our work")}</p><h2>{t("Рекламные креативы и логотипы.","Advertising creatives and logos.")}</h2><p>{t("Каждая работа показывает отдельную отрасль, задачу и визуальное направление.","Each project represents a different industry, task and visual direction.")}</p></header>
      <div className="work-strip">{["01","04","07","11","14","19"].map(n=><Link to="/portfolio" key={n}><img src={"/assets/portfolio/work-"+n+".webp"} alt={t("Защищённая демонстрационная версия работы ","Protected preview of work ")+n}/><span>{t("Работа №","Work №")}{n}</span></Link>)}</div>
      <Link className="big-section-link" to="/portfolio">{t("Открыть все работы","View all work")} <b>→</b></Link><SectionCue label="Листайте дальше" labelEn="Keep scrolling"/>
    </section>

    <section className="clear-section price-home">
      <header><p className="section-index">{t("04 / Прайс","04 / Pricing")}</p><h2>{t("Понятная стоимость.","Clear pricing.")}</h2></header>
      {featured.map((p)=><Link to="/pricing" className="price-row" key={p.n}><b><ServiceBadge item={p}/></b><span>{lang==="en"?(p.nameEn??p.name):p.name}</span><strong>{servicePrice(p,money,lang)}</strong><i>→</i></Link>)}
      <SectionCue label="Листайте дальше" labelEn="Keep scrolling"/>
    </section>

    <section className="clear-section faq-section"><header><p className="section-index">{t("05 / Вопросы","05 / Questions")}</p><h2>{t("Коротко о главном.","The essentials, briefly.")}</h2></header><div className="faq-list">{faq.map(([q,a],i)=><details key={q}><summary><span>0{i+1}</span>{q}</summary><p>{a}</p></details>)}</div></section>
    <ContactBand/>
  </main><BackToTop/><ScrollReminder/><footer className="home-footer"><p>{t("Лаборатория брендов","Brand Laboratory")}</p></footer></>;
}
