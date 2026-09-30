import { useEffect,useState } from "react";
import { PageIntro,SiteShell } from "./SiteShell";
import { serviceCatalog,serviceGroups } from "./serviceCatalog";
import { useLanguage } from "./i18n";

export function PricingPage(){
  const { lang, t, money } = useLanguage();
  const[selected,setSelected]=useState<string[]>([]);
  const[hydrated,setHydrated]=useState(false);
  useEffect(()=>{try{const v=JSON.parse(window.sessionStorage.getItem("lb-selected-services")??"[]");if(Array.isArray(v))setSelected(v)}catch{}setHydrated(true)},[]);
  useEffect(()=>{if(hydrated)window.sessionStorage.setItem("lb-selected-services",JSON.stringify(selected))},[selected,hydrated]);
  const toggle=(n:string)=>setSelected(v=>v.includes(n)?v.filter(x=>x!==n):[...v,n]);
  const href="/contacts?packages="+encodeURIComponent(selected.join(","));
  const total=selected.reduce((a,n)=>a+(serviceCatalog.find(x=>x.n===n)?.amount??0),0);

  return <SiteShell><main className="pricing-page">
    <PageIntro number="02" title="Цены" titleEn="Pricing" lead="Выберите одну или несколько услуг. Состав и стоимость каждого пакета указаны заранее." leadEn="Choose one or more services. Each package clearly lists what is included and its price."/>
    <div className="selection-guide"><strong>{t("Выберите услуги","Choose services")}</strong><span>{hydrated ? t("Выбрано","Selected")+": "+selected.length+(selected.length?" · "+money(total):"") : t("Восстанавливаем выбор…","Restoring selection…")}</span></div>
    {serviceGroups.map(g=><section className="pricing-category" key={g.title}>
      <h2>{lang==="en"?(g.titleEn??g.title):g.title}</h2>
      <div className="pricing-dossier">{g.packages.map(p=>{const active=selected.includes(p.n);return <article id={"price-"+p.n} key={p.n} className={active?"is-selected":""}>
        <div className="package-head"><span className="package-number-badge">№ {p.n}</span><button type="button" className="package-check" onClick={()=>toggle(p.n)} aria-pressed={active}><b>{active?t("✓ Добавлено","✓ Added"):t("+ Добавить","+ Add")}</b></button></div>
        <div className="package-copy"><h3>{lang==="en"?(p.nameEn??p.name):p.name}</h3><p>{lang==="en"?(p.subtitleEn??p.subtitle):p.subtitle}</p>{p.items.length?<ul>{(lang==="en"?(p.itemsEn??p.items):p.items).map(x=><li key={x}>{x}</li>)}</ul>:null}</div>
        <strong className="package-price">{money(p.amount)}</strong>
      </article>})}</div>
    </section>)}
    {hydrated&&selected.length?<aside className="selection-dock" role="status" aria-live="polite"><div className="selection-dock-count"><b>{selected.length}</b><span>{t("услуг выбрано","services selected")}</span></div><div className="selection-dock-total"><small>{t("Итого","Total")}</small><strong>{money(total)}</strong></div><div className="selection-dock-actions"><a href={href}>{t("Перейти к заявке →","Continue to contact →")}</a></div></aside>:null}
    <section className="pricing-note"><h2>{t("Оплата после согласования","Payment after approval")}</h2><p>{t("Сначала обсуждаем задачу и фиксируем стоимость. Затем предлагаем варианты, вместе доводим выбранное решение и только после утверждения принимаем оплату.","First we discuss the task and confirm the price. Then we present options, refine the selected direction together, and accept payment only after approval.")}</p></section>
  </main></SiteShell>
}
