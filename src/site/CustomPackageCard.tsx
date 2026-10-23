import { ServiceBadge } from "./ServiceBadge";
import { serviceIdentity, type ServiceItem } from "./serviceCatalog";
import { useLanguage } from "./i18n";

export function CustomPackageCard({ item, selected = [] }: { item: ServiceItem; selected?: readonly string[] }) {
  const { lang, t } = useLanguage();
  const development = serviceIdentity(item).development;
  const ids = [...new Set([...selected,item.n])];
  return <article id={"price-"+item.n} className={`custom-package-card${development ? " is-development" : ""}`}>
    <div className="custom-package-heading"><span className="package-number-badge"><ServiceBadge item={item}/></span><span className="custom-package-eyebrow">{t("Решение под вашу задачу", "Built around your needs")}</span></div>
    <div className="custom-package-copy"><h3>{lang === "en" ? item.nameEn : item.name}</h3><p className="custom-package-question">{lang === "en" ? item.subtitleEn : item.subtitle}</p><p>{lang === "en" ? item.descriptionEn : item.description}</p></div>
    <a className="custom-package-cta" href={"/contacts?packages="+encodeURIComponent(ids.join(","))+"&request=custom#application-form"}>{t("Подобрать пакет", "Build my package")}<span aria-hidden="true">↗</span></a>
  </article>;
}
