import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageIntro, PhoneIcon, SiteShell } from "./SiteShell";

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
  const [n,name,category,copy]=work;
  const src='/assets/portfolio/work-'+n+'.webp';
  const alt=name+' — '+category;
  return <article>
    <button className="work-image-button" type="button" onClick={()=>onOpen(src,alt)} aria-label={'Открыть работу '+name+' полностью'}>
      <img src={src} alt={alt} loading="lazy" />
      <span className="image-open-hint"><b>↗</b> Открыть полностью</span>
    </button>
    <div><span>№{n} / {category}</span><small className="work-status">Защищённая версия · показ до передачи оригинала</small><h3>{name}</h3><p>{copy}</p><div className="work-links"><Link to={'/pricing#price-'+(Number(n) <= 10 ? '12' : '08')}>Узнать стоимость →</Link><Link to={'/contacts?packages='+(Number(n) <= 10 ? '12' : '08')}>Обсудить задачу <PhoneIcon className="is-pulsing"/></Link></div></div>
  </article>;
}

export function PortfolioPage(){const[viewer,setViewer]=useState<{src:string;alt:string}|null>(null);const[tab,setTab]=useState<"creative"|"logo">("creative");const[expanded,setExpanded]=useState(false);const visible=tab==="creative"?works.slice(0,10):works.slice(10);const shown=expanded?visible:visible.slice(0,6);const open=(src:string,alt:string)=>setViewer({src,alt});return <SiteShell><main><PageIntro number="03" title="Работы" lead="Защищённые версии работ, показанные клиентам до передачи чистых оригиналов."/><nav className="portfolio-tabs" aria-label="Категории работ"><button className={tab==="creative"?"is-active":""} onClick={()=>{setTab("creative");setExpanded(false)}}>Рекламные креативы</button><button className={tab==="logo"?"is-active":""} onClick={()=>{setTab("logo");setExpanded(false)}}>Логотипы и айдентика</button></nav><section className="portfolio-group"><header><span>{tab==="creative"?"01":"02"}</span><div><h2>{tab==="creative"?"Рекламные креативы":"Логотипы и айдентика"}</h2><p>{tab==="creative"?"Идеи для наружной рекламы, социальных сетей и запуска продукта.":"Знаки и визуальные системы в защищённой демонстрационной подаче."}</p></div></header><div className="premium-works">{shown.map(w=><WorkCard key={w[0]} work={w} onOpen={open}/>)}</div>{!expanded?<button className="portfolio-more" onClick={()=>setExpanded(true)}>Показать ещё 4 работы ↓</button>:null}</section>{viewer?<div className="image-viewer" role="dialog" aria-modal="true" aria-label={viewer.alt} onClick={()=>setViewer(null)}><button type="button" onClick={()=>setViewer(null)} aria-label="Закрыть">×</button><img src={viewer.src} alt={viewer.alt} onClick={e=>e.stopPropagation()}/><p>{viewer.alt}</p></div>:null}</main></SiteShell>}
