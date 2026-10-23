import { useLanguage } from "./i18n";
import { summarizeServices } from "./serviceCatalog";

export function SelectionSummary({ selected }: { selected: readonly string[] }) {
  const { t, money } = useLanguage();
  const { fixed, development, total } = summarizeServices(selected);
  return <div className="order-summary">
    {fixed.length > 0 ? <div><span>{t("Услуги по фиксированной цене", "Fixed-price services")}: {fixed.length}</span><strong>{money(total)}</strong></div> : null}
    {development.length > 0 ? <div><span>{t("Разработка", "Development")}: {development.length}</span><strong>{t("Требуется расчёт", "Quote required")}</strong></div> : null}
    {!fixed.length && !development.length ? <span>{t("Услуги пока не выбраны", "No services selected yet")}</span> : null}
  </div>;
}
