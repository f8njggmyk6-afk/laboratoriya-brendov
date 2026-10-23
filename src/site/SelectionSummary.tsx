import { useLanguage } from "./i18n";
import { serviceIdentity, summarizeServices } from "./serviceCatalog";

export function SelectionSummary({ selected }: { selected: readonly string[] }) {
  const { lang, t, money } = useLanguage();
  const { chosen, fixed, custom, advertisingTotal, developmentTotal, total } = summarizeServices(selected);
  return <div className="order-summary">
    {fixed.length > 0 ? <>
      <div className="order-subtotal"><span>{t("Реклама и дизайн", "Advertising & design")}</span><strong>{money(advertisingTotal)}</strong></div>
      <div className="order-subtotal"><span>{t("Разработка", "Development")}</span><strong>{money(developmentTotal)}</strong></div>
      <div className="order-grand-total"><span>{t("Общая сумма", "Total")}</span><strong>{money(total)}</strong></div>
    </> : null}
    {custom.map(item=><div className="custom-project-summary" key={item.n}><span>{serviceIdentity(item,lang).label}</span><small>{t("Стоимость согласуем отдельно", "Priced separately")}</small></div>)}
    {!chosen.length ? <span>{t("Услуги пока не выбраны", "No services selected yet")}</span> : null}
  </div>;
}
