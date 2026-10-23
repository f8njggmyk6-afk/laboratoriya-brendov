import { useEffect,useState } from "react";
import { PageIntro,SiteShell } from "./SiteShell";
import { serviceGroups,servicePrice,summarizeServices } from "./serviceCatalog";
import { useLanguage } from "./i18n";
import { SelectionSummary } from "./SelectionSummary";

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
    <PageIntro number="02" title="Цены" titleEn="Pricing" lead="Выберите одну или несколько услуг. Для разработки указаны стартовые цены; окончательные стоимость и сроки согласуем после уточнения задачи." leadEn="Choose one or more services. Development prices are starting estimates; we confirm the final price and timeline after reviewing the task."/>
    <div className="selection-guide"><strong>{t("Выберите услуги","Choose services")}</strong><span>{hydrated ? t("Выбрано","Selected")+": "+chosen.length : t("Восстанавливаем выбор…","Restoring selection…")}</span></div>
    {serviceGroups.map(g=><section className="pricing-category" key={g.title}>
      <h2>{lang==="en"?(g.titleEn??g.title):g.title}</h2>
      <div className="pricing-dossier">{g.packages.map(p=>{const active=selected.includes(p.n);return <article id={"price-"+p.n} key={p.n} className={active?"is-selected":""}>
        <div className="package-head"><span className="package-number-badge">№ {p.n}</span><button type="button" className="package-check" onClick={()=>toggle(p.n)} aria-pressed={active}><b>{active?t("✓ Добавлено","✓ Added"):t("+ Добавить","+ Add")}</b></button></div>
        <div className="package-copy"><h3>{lang==="en"?(p.nameEn??p.name):p.name}</h3><p>{lang==="en"?(p.subtitleEn??p.subtitle):p.subtitle}</p>{p.items.length?<ul>{(lang==="en"?(p.itemsEn??p.items):p.items).map(x=><li key={x}>{x}</li>)}</ul>:null}</div>
        <div className="package-price-block"><strong className="package-price">{servicePrice(p,money,lang)}</strong>{p.pricing ? <><small>{t("Срок и окончательная стоимость — после уточнения задачи.","Timeline and final price confirmed after reviewing the task.")}</small><a className="development-discuss" href={"/contacts?packages="+encodeURIComponent([...new Set([...chosen.map(item=>item.n),p.n])].join(","))}>{t("Обсудить задачу →","Discuss your task →")}</a></> : null}</div>
      </article>})}</div>
    </section>)}
    {hydrated&&chosen.length?<aside className="selection-dock" role="status" aria-live="polite"><div className="selection-dock-count"><b>{chosen.length}</b><span>{t("услуг выбрано","services selected")}</span></div><SelectionSummary selected={selected}/><div className="selection-dock-actions"><a href={href}>{t("Перейти к заявке →","Continue to contact →")}</a></div></aside>:null}
    <section className="pricing-note"><h2>{t("Оплата после согласования","Payment after approval")}</h2><p>{t("Для дизайна сначала обсуждаем задачу и фиксируем стоимость, показываем защищённые варианты, дорабатываем и принимаем оплату после утверждения.","For design, we confirm the scope and price, show protected previews, refine the result and accept payment after approval.")}</p><p>{t("Для разработки сначала согласуем задание, сроки и фиксированную стоимость. При необходимости покажем небольшой демонстрационный фрагмент. Крупные проекты делим на оплачиваемые этапы; новые пожелания оцениваем до выполнения. Хостинг, домен, платные сервисы и сопровождение рассчитываются отдельно.","For development, we agree on the specification, timeline and fixed price first. A small demo can be arranged. Larger projects use paid milestones; additional requests are quoted before implementation. Hosting, domains, paid services and ongoing support are priced separately.")}</p></section>
  </main></SiteShell>
}
