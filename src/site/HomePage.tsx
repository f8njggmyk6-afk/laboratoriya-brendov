import { Link } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { BackToTop, ContactBand, PhoneIcon, SectionCue, SiteHeader } from "./SiteShell";
import { StructuredData } from "./StructuredData";
import { serviceCatalog } from "./serviceCatalog";

const faq = [
  ["С чего начинается работа?", "С короткого разговора о задаче, продукте и клиенте. Затем мы предлагаем профессиональные направления и объясняем логику каждого."],
  ["Когда нужна оплата?", "Оплата стоит в конце процесса. Сначала вы видите подготовленный результат с защитными отметками, выбираете направление и только потом оплачиваете."],
  ["Вы делаете рекламные креативы?", "Да. Создаём идеи и макеты для социальных сетей, рекламных кабинетов, баннеров и других цифровых форматов."],
  ["Можно заказать одну услугу?", "Да. Можно начать с одного названия, слогана, логотипа или креатива, а затем расширить работу до целой системы."],
];

const schema = JSON.stringify({"@context":"https://schema.org","@type":"ProfessionalService","name":"Лаборатория брендов","serviceType":"Нейминг, логотипы и рекламные креативы","url":"https://laboratoriya-brendov-concept.higgsfield.app"});


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
    const terms = service.searchTerms.flatMap((term) => clean(term).split(" ")).filter((term) => term.length > 2).map(stem);
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
  const [query, setQuery] = useState("");
  const match = useMemo(() => findService(query), [query]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.location.assign(match ? `/pricing#price-${match.n}` : "/pricing");
  };
  return <form className="service-finder" onSubmit={submit}>
    <div className="service-finder-copy"><b>Опишите задачу своими словами</b><span>Можно написать одно слово или несколько — так, как вам удобно.</span></div>
    <div className="service-finder-control">
      <span className="finder-icon" aria-hidden="true" />
      <label className="sr-only" htmlFor="service-search">Поиск услуги</label>
      <input id="service-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Например: придумать имя компании" />
      <button type="submit">Найти <span>→</span></button>
    </div>
    {query ? <p className="service-finder-result">{match ? <>Подходит: <b>{match.name}</b></> : "Покажем все подходящие услуги"}</p> : null}
  </form>;
}

export function HomePage() {
  return <><StructuredData json={schema}/><SiteHeader/><main>
    <section className="new-hero">
      <video autoPlay muted loop playsInline poster="/assets/world/scene-01-poster.jpg"><source src="/assets/world/scene-01.mp4" type="video/mp4"/></video>
      <div className="new-hero-shade"/>
      <div className="new-hero-content">
        <p className="eyebrow">Нейминг · Дизайн · Реклама · Креатив</p>
        <h1>Бренды, которые<br/>выбирают.</h1>
        <p className="hero-lead">Названия, слоганы, логотипы, рекламные концепции и креативы для бизнеса по всей России.</p><p className="hero-method">Слушаем задачу, предлагаем сильные варианты и вместе доводим решение до результата.</p>
        <ServiceFinder />
        <div className="hero-actions hero-actions-single"><Link to="/contacts">Обсудить задачу <PhoneIcon className="is-pulsing"/></Link></div>
        <p className="payment-last">Оплата — после согласования выбранного решения.</p>
      </div>
      <SectionCue label="Листайте дальше"/>
    </section>

    <section className="clear-section approach-section">
      <header><p className="section-index">01 / Наш подход</p><h2>Сначала понимаем. Потом создаём.</h2></header>
      <div className="step-grid">
        {[["01","Слушаем","Погружаемся в вашу задачу, продукт и ожидания."],["02","Обсуждаем","Уточняем аудиторию, характер и практические ограничения."],["03","Предлагаем","Разрабатываем профессиональные варианты с понятной логикой."],["04","Доводим","Вместе совершенствуем выбранное направление до результата."],["05","Оплата","После утверждения передаём чистые готовые материалы."]].map(([n,t,p])=><article key={n}><span>{n}</span><h3>{t}</h3><p>{p}</p></article>)}
      </div><SectionCue label="Листайте дальше"/>
    </section>

    <section className="clear-section services-home">
      <header><p className="section-index">02 / Услуги</p><h2>Каждая задача в своём разделе.</h2></header>
      <div className="service-grid">
        {[["01","Название","Нейминг для компании, продукта или сервиса."],["02","Слоган","Короткая формула смысла и обещания бренда."],["03","Логотип","Знак, типографика и визуальный характер."],["04","Рекламные креативы","Идеи и макеты для Meta, Telegram, сайтов и баннеров."],["05","Фирменная система","Связанный набор решений для полноценного запуска."]].map(([n,t,p])=><Link to="/services" className="service-tile" key={n}><span>{n}</span><h3>{t}</h3><p>{p}</p><b>↗</b></Link>)}
      </div><SectionCue label="Листайте дальше"/>
    </section>

    <section className="clear-section works-home">
      <header><p className="section-index">03 / Наши работы</p><h2>Рекламные креативы и логотипы.</h2><p>Каждая работа показывает отдельную отрасль, задачу и визуальное направление.</p></header>
      <div className="work-strip">{["01","04","07","11","14","19"].map(n=><Link to="/portfolio" key={n}><img src={"/assets/portfolio/work-"+n+".webp"} alt={"Защищённая демонстрационная версия работы "+n}/><span>Работа №{n}</span></Link>)}</div>
      <Link className="big-section-link" to="/portfolio">Открыть все работы <b>→</b></Link><SectionCue label="Листайте дальше"/>
    </section>

    <section className="clear-section price-home">
      <header><p className="section-index">04 / Прайс</p><h2>Понятная стоимость.</h2></header>
      {[["01","Название, 2 варианта","2 000 ₽"],["02","Название, 5 вариантов","5 000 ₽"],["03","Название + слоган + логотип","10 000 ₽"],["04","5 вариантов слогана","2 000 ₽"],["12","1 статичный рекламный креатив","1 500 ₽"]].map(([n,t,p])=><Link to="/pricing" className="price-row" key={n}><b>{n}</b><span>{t}</span><strong>{p}</strong><i>→</i></Link>)}
      <SectionCue label="Листайте дальше"/>
    </section>

    <section className="clear-section faq-section"><header><p className="section-index">05 / Вопросы</p><h2>Коротко о главном.</h2></header><div className="faq-list">{faq.map(([q,a],i)=><details key={q}><summary><span>0{i+1}</span>{q}</summary><p>{a}</p></details>)}</div></section>
    <ContactBand/>
  </main><BackToTop/><footer className="home-footer"><p>Лаборатория брендов</p></footer></>;
}
