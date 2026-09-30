import { serviceGroups } from "./serviceCatalog";
import { PageIntro, SiteShell } from "./SiteShell";
import { useLanguage } from "./i18n";

export function ServicesPage(){
  const { lang, t } = useLanguage();
  return <SiteShell><main>
    <PageIntro number="01" title="Услуги" titleEn="Services" lead="Выберите направление, изучите состав работы и перейдите к соответствующей позиции в прайсе." leadEn="Choose a direction, review what is included and move to the matching package in the pricing section."/>
    <nav className="service-category-nav" aria-label={t("Категории услуг","Service categories")}>
      {serviceGroups.map((g,i)=><a key={g.title} href={`#service-group-${i+1}`}>{lang==="en"?(g.titleEn??g.title):g.title}</a>)}
    </nav>
    {serviceGroups.map((g,i)=><section className="service-group" id={`service-group-${i+1}`} key={g.title}>
      <header><span>0{i+1}</span><h2>{lang==="en"?(g.titleEn??g.title):g.title}</h2></header>
      <div className="editorial-list service-catalog-list">{g.packages.map(s=><article id={"service-"+s.n} key={s.n}>
        <span>№ {s.n}</span><h3>{lang==="en"?(s.nameEn??s.name):s.name}</h3>
        <div><p>{lang==="en"?(s.descriptionEn??s.description):s.description}</p><a href={"/pricing#price-"+s.n}>{t("Узнать стоимость →","See pricing →")}</a></div>
      </article>)}</div>
    </section>)}
  </main></SiteShell>
}
