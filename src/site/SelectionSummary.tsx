import { useLanguage } from "./i18n";
import { summarizeServices } from "./serviceCatalog";

export function SelectionSummary({ selected }: { selected: readonly string[] }) {
  const { t, money } = useLanguage();
  const { chosen, fixed, custom, total } = summarizeServices(selected);
  return <div className="order-summary">
    {fixed.length > 0 ? <div><span>{t("Итого за выбранные пакеты", "Selected packages total")}</span><strong>{money(total)}</strong></div> : null}
    {custom.length > 0 ? <div className="custom-project-summary"><span>{t("Индивидуальный проект", "Custom project")}: {custom.length}</span><small>{t("Стоимость согласуем отдельно", "Priced separately")}</small></div> : null}
    {!chosen.length ? <span>{t("Услуги пока не выбраны", "No services selected yet")}</span> : null}
  </div>;
}
