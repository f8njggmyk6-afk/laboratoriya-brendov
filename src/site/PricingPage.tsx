import { CustomPackageCard } from "./CustomPackageCard";
import { useEffect,useState } from "react";
import { PageIntro,SiteShell } from "./SiteShell";
import { serviceGroups,servicePrice,summarizeServices } from "./serviceCatalog";
import { useLanguage } from "./i18n";
import { ServiceBadge } from "./ServiceBadge";
import { SelectionSummary } from "./SelectionSummary";

function PricingDirections() {
  const { t } = useLanguage();
  return <nav className="pricing-directions" aria-label={t("Выберите направление прайса", "Choose a pricing direction")}>
    <a className="pricing-direction-card pricing-direction-card--creative" href="#pricing-group-1">
      <div className="pricing-direction-top"><span className="pricing-direction-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="m5 13 17-7v20L5 19v-6Zm17-1 5 2v4l-5 2M9 21l2 7h5l-2-5"/></svg></span><span>{t("01 / Бренд и продвижение", "01 / Brand & promotion")}</span><span className="pricing-direction-arrow" aria-hidden="true">↗</span></div>
      <h2>{t("Реклама и дизайн", "Advertising & design")}</h2>
      <p className="pricing-direction-services">{t("Названия, слоганы, логотипы, тексты и рекламные креативы.", "Names, slogans, logos, copy and advertising creatives.")}</p>
      <p className="pricing-direction-process">{t("Слушаем задачу, обсуждаем идею, показываем варианты и доводим выбранное решение до готового результата.", "We listen, discuss the idea, present options and refine your chosen direction into a finished result.")}</p>
      <span className="pricing-direction-cta">{t("К ценам на рекламу и дизайн", "See advertising & design pricing")}<span aria-hidden="true">↓</span></span>
    </a>
    <a className="pricing-direction-card pricing-direction-card--development" href="#pricing-group-5">
      <div className="pricing-direction-top"><span className="pricing-direction-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="m10 9-7 7 7 7m12-14 7 7-7 7M19 5l-6 22"/></svg></span><span>{t("02 / Цифровые продукты", "02 / Digital products")}</span><span className="pricing-direction-arrow" aria-hidden="true">↗</span></div>
      <h2>{t("Разработка и программирование", "Development & programming")}</h2>
      <p className="pricing-direction-services">{t("Сайты, боты, приложения, CRM, ИИ и автоматизация бизнеса.", "Websites, bots, apps, CRM, AI and business automation.")}</p>
      <p className="pricing-direction-process">{t("Разбираем задачу, согласуем функции, показываем рабочую версию, проверяем и доводим до запуска.", "We explore the task, agree on features, demonstrate a working version, test and refine it for launch.")}</p>
      <span className="pricing-direction-cta">{t("К ценам на разработку", "See development pricing")}<span aria-hidden="true">↓</span></span>
    </a>
  </nav>;
}

export function PricingPage(){
  const { lang, t, money } = useLanguage();
  const[selected,setSelected]=useState<string[]>([]);
  const[hydrated,setHydrated]=useState(false);
  useEffect(()=>{try{const v=JSON.parse(window.sessionStorage.getItem("lb-selected-services")??"[]");if(Array.isArray(v))setSelected(v)}catch{}setHydrated(true)},[]);
  useEffect(()=>{if(hydrated)window.sessionStorage.setItem("lb-selected-services",JSON.stringify(selected))},[selected,hydrated]);
  const toggle=(n:string)=>setSelected(v=>v.includes(n)?v.filter(x=>x!==n):[...v,n]);
  const href="/contacts?packages="+encodeURIComponent(selected.join(","));
  const { chosen } = summarizeServices(selected);

  return <SiteShell><main className="pricing-page">
    <PageIntro number="02" title="Цены" titleEn="Pricing" lead="От первой идеи до готового результата. Выберите направление — перейдём к нужным услугам в общем прайсе." leadEn="From your first idea to a finished result. Choose a direction to jump to its services in the full price list."/>
    <PricingDirections/>
    <div className="selection-guide"><strong>{t("Выберите услуги","Choose services")}</strong><span>{hydrated ? t("Выбрано","Selected")+": "+chosen.length : t("Восстанавливаем выбор…","Restoring selection…")}</span></div>
    {serviceGroups.map((g,index)=><section className="pricing-category" id={"pricing-group-"+(index+1)} key={g.title}>
      <h2>{lang==="en"?(g.titleEn??g.title):g.title}</h2>
      <div className="pricing-dossier">{g.packages.map(p=>{if(p.customRequest)return <CustomPackageCard key={p.n} item={p} selected={chosen.map(item=>item.n)}/>;const active=selected.includes(p.n);return <article id={"price-"+p.n} key={p.n} className={active?"is-selected":""}>
        <div className="package-head"><span className="package-number-badge"><ServiceBadge item={p}/></span><button type="button" className="package-check" onClick={()=>toggle(p.n)} aria-pressed={active}><b>{active?t("✓ Добавлено","✓ Added"):t("+ Добавить","+ Add")}</b></button></div>
        <div className="package-copy"><h3>{lang==="en"?(p.nameEn??p.name):p.name}</h3><p>{lang==="en"?(p.subtitleEn??p.subtitle):p.subtitle}</p>{p.pricing === "fixed" ? <p className="package-scope-label">{t("В стоимость входит", "Included in the price")}</p> : null}{p.items.length?<ul>{(lang==="en"?(p.itemsEn??p.items):p.items).map(x=><li key={x}>{x}</li>)}</ul>:null}</div>
        <div className="package-price-block">{p.discountPercent ? <span className="project-discount-badge">−{p.discountPercent}% {t("уже в цене","included")}</span> : null}<strong className="package-price">{servicePrice(p,money,lang)}</strong>{p.baseAmount ? <small className="project-base-price">{t("Цена без скидки: ","Before discount: ")}{money(p.baseAmount)}</small> : null}{p.timeline ? <small>{lang==="en"?(p.timelineEn??p.timeline):p.timeline}</small> : null}{p.pricing ? <><small>{p.pricing === "quote" ? t("Состав и стоимость — по индивидуальному заданию.","Scope and price follow your custom specification.") : t("Цена за указанный состав. Дополнительные функции — по согласованию за отдельную плату.","Fixed price for the listed scope. Additional features are agreed and priced separately.")}</small><a className="development-discuss" href={"/contacts?packages="+encodeURIComponent([...new Set([...chosen.map(item=>item.n),p.n])].join(","))}>{t("Обсудить задачу →","Discuss your task →")}</a></> : null}</div>
      </article>})}</div>
    </section>)}
    {hydrated&&chosen.length?<aside className="selection-dock" role="status" aria-live="polite"><div className="selection-dock-count"><b>{chosen.length}</b><span>{t("услуг выбрано","services selected")}</span></div><SelectionSummary selected={selected}/><div className="selection-dock-actions"><a href={href}>{t("Перейти к заявке →","Continue to contact →")}</a></div></aside>:null}
    <section className="pricing-note"><h2>{t("Оплата после согласования","Payment after approval")}</h2><p>{t("Для дизайна сначала обсуждаем задачу и фиксируем стоимость, показываем защищённые варианты, дорабатываем и принимаем оплату после утверждения.","For design, we confirm the scope and price, show protected previews, refine the result and accept payment after approval.")}</p><p>{t("Стоимость пакетов разработки фиксирована за указанный состав. Перед началом подтверждаем задание и сроки. При необходимости покажем небольшой демонстрационный фрагмент. Крупные проекты делим на оплачиваемые этапы; новые пожелания оцениваем до выполнения. Хостинг, домен, платные сервисы и сопровождение рассчитываются отдельно.","Development package prices are fixed for the listed scope. We confirm the specification and timeline before starting. A small demo can be arranged. Larger projects use paid milestones; additional requests are quoted before implementation. Hosting, domains, paid services and ongoing support are priced separately.")}</p></section>
    <section className="pricing-discount-terms" aria-label={t("Условия скидки на разработку", "Development discount terms")}>{serviceGroups.filter(g=>g.note).map(g=><p key={g.title}>{lang==="en"?(g.noteEn??g.note):g.note}</p>)}</section>
  </main></SiteShell>
}
