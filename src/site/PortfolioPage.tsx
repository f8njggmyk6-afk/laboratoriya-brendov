import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageIntro, PhoneIcon, SiteShell } from "./SiteShell";
import { useLanguage } from "./i18n";

const works = [
  ["01","SFERA","Недвижимость","Архитектурная кампания жилого проекта с ощущением пространства и статуса."],
  ["02","MINT","Стоматология","Чистая медицинская коммуникация без холодной больничной эстетики."],
  ["03","MIRA","Одежда","Редакционная fashion-подача для запуска локальной марки."],
  ["04","GRAIN","Пекарня","Тактильный продуктовый кадр, усиливающий свежесть и ремесленный характер."],
  ["05","FINO","Финтех","Современная 3D-композиция для цифрового финансового сервиса."],
  ["06","MESTO","Кафе","Тёплая рекламная подача городского кафе с акцентом на атмосферу и продукт."],
  ["07","SHAURMA №1","Шаурма","Контрастная street-food концепция, где продукт сразу становится главным героем."],
  ["08","UGOL","Шашлык","Премиальная подача огня, мяса и гостеприимства для шашлычного ресторана."],
  ["09","MOTOR","Автосервис","Технологичный визуал, передающий точность, скорость и доверие к сервису."],
  ["10","AURA","Косметика","Мягкий премиальный кадр для косметического продукта и digital-рекламы."],
  ["11","MESTO","Кафе","Минималистичный знак, вывеска, упаковка и фирменная чашка."],
  ["12","VERTEL","Шаурма","Узнаваемый продуктовый символ и яркая система для точки продаж."],
  ["13","UGOL","Шашлык","Знак на основе огня и угля с премиальным применением на носителях."],
  ["14","MOTOR","Автосервис","Динамичный знак, фасадная вывеска и форма сотрудников."],
  ["15","VITA","Клиника","Спокойная природная айдентика для частной медицинской практики."],
  ["16","AURA","Косметика","Тонкая типографика, упаковка и премиальная золотая отделка."],
  ["17","SFERA","Недвижимость","Геометрический знак и архитектурное применение в городской среде."],
  ["18","GRAIN","Пекарня","Ремесленный символ зерна и натуральная упаковочная система."],
  ["19","VECTOR","IT-сервис","Технологичный знак с современной цифровой палитрой и 3D-подачей."],
  ["20","CARE","Семейный сервис","Человечный знак заботы и мягкая визуальная система."],
] as const;

function WorkCard({work,onOpen}:{work:typeof works[number];onOpen:(src:string,alt:string)=>void}) {
  const { lang, t } = useLanguage();
  const [n,name,category,copy]=work;
  const categoryEn: Record<string,string> = {"Недвижимость":"Real estate","Стоматология":"Dentistry","Одежда":"Fashion","Пекарня":"Bakery","Финтех":"Fintech","Кафе":"Cafe","Шаурма":"Street food","Шашлык":"Restaurant","Автосервис":"Auto service","Косметика":"Cosmetics","Клиника":"Clinic","IT-сервис":"IT service","Семейный сервис":"Family service"};
  const copyEn: Record<string,string> = {
    "01":"Architectural campaign for a residential project with a sense of space and status.",
    "02":"Clean medical communication without a cold hospital aesthetic.",
    "03":"Editorial fashion direction for the launch of a local brand.",
    "04":"Tactile product visual emphasizing freshness and craft.",
    "05":"Contemporary 3D composition for a digital financial service.",
    "06":"Warm advertising direction for an urban cafe focused on atmosphere and product.",
    "07":"High-contrast street-food concept with the product as the main hero.",
    "08":"Premium presentation of fire, meat and hospitality for a grill restaurant.",
    "09":"Technology-led visual communicating precision, speed and trust.",
    "10":"Soft premium visual for a cosmetics product and digital advertising.",
    "11":"Minimalist mark, signage, packaging and branded cup.",
    "12":"Recognizable product symbol and bold visual system for a point of sale.",
    "13":"Mark based on fire and charcoal with premium brand applications.",
    "14":"Dynamic mark, facade signage and staff uniform application.",
    "15":"Calm nature-inspired identity for a private medical practice.",
    "16":"Refined typography, packaging and premium gold finishing.",
    "17":"Geometric mark and architectural application in an urban environment.",
    "18":"Craft-inspired grain symbol and natural packaging system.",
    "19":"Technology-led mark with a modern digital palette and 3D presentation.",
    "20":"Human-centered care symbol and a soft visual system."
  };
  const shownCategory = lang==="en" ? (categoryEn[category] ?? category) : category;
  const shownCopy = lang==="en" ? (copyEn[n] ?? copy) : copy;
  const src='/assets/portfolio/work-'+n+'.webp';
  const alt=name+' — '+shownCategory;
  return <article>
    <button className="work-image-button" type="button" onClick={()=>onOpen(src,alt)} aria-label={t('Открыть работу полностью','Open work in full')}>
      <img src={src} alt={alt} loading="lazy" />
      <span className="image-open-hint"><b>↗</b> {t("Открыть полностью","Open in full")}</span>
    </button>
    <div><span>№{n} / {shownCategory}</span><small className="work-status">{t("Защищённая версия · показ до передачи оригинала","Protected preview · shown before original delivery")}</small><h3>{name}</h3><p>{shownCopy}</p><div className="work-links"><Link to={'/pricing#price-'+(Number(n) <= 10 ? '12' : '08')}>{t("Узнать стоимость →","See pricing →")}</Link><Link to={'/contacts?packages='+(Number(n) <= 10 ? '12' : '08')}>{t("Обсудить задачу","Discuss project")} <PhoneIcon className="is-pulsing"/></Link></div></div>
  </article>;
}

export function PortfolioPage(){const{t}=useLanguage();const[viewer,setViewer]=useState<{src:string;alt:string}|null>(null);const[tab,setTab]=useState<"creative"|"logo">("creative");const[expanded,setExpanded]=useState(false);const visible=tab==="creative"?works.slice(0,10):works.slice(10);const shown=expanded?visible:visible.slice(0,6);const open=(src:string,alt:string)=>setViewer({src,alt});return <SiteShell><main><PageIntro number="03" title="Работы" titleEn="Work" lead="Защищённые версии работ, показанные клиентам до передачи чистых оригиналов." leadEn="Protected previews shown to clients before clean originals are delivered."/><nav className="portfolio-tabs" aria-label={t("Категории работ","Work categories")}><button className={tab==="creative"?"is-active":""} onClick={()=>{setTab("creative");setExpanded(false)}}>{t("Рекламные креативы","Advertising creatives")}</button><button className={tab==="logo"?"is-active":""} onClick={()=>{setTab("logo");setExpanded(false)}}>{t("Логотипы и айдентика","Logos & identity")}</button></nav><section className="portfolio-group"><header><span>{tab==="creative"?"01":"02"}</span><div><h2>{tab==="creative"?t("Рекламные креативы","Advertising creatives"):t("Логотипы и айдентика","Logos & identity")}</h2><p>{tab==="creative"?t("Идеи для наружной рекламы, социальных сетей и запуска продукта.","Ideas for outdoor ads, social media and product launches."):t("Знаки и визуальные системы в защищённой демонстрационной подаче.","Marks and visual systems in a protected presentation format.")}</p></div></header><div className="premium-works">{shown.map(w=><WorkCard key={w[0]} work={w} onOpen={open}/>)}</div>{!expanded?<button className="portfolio-more" onClick={()=>setExpanded(true)}>{t("Показать ещё 4 работы ↓","Show 4 more ↓")}</button>:null}</section>{viewer?<div className="image-viewer" role="dialog" aria-modal="true" aria-label={viewer.alt} onClick={()=>setViewer(null)}><button type="button" onClick={()=>setViewer(null)} aria-label={t("Закрыть","Close")}>×</button><img src={viewer.src} alt={viewer.alt} onClick={e=>e.stopPropagation()}/><p>{viewer.alt}</p></div>:null}</main></SiteShell>}
