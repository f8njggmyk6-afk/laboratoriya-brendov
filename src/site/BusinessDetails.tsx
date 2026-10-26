import { businessProvider } from "./contactDetails";
import { useLanguage } from "./i18n";
import "./businessDetails.css";

export function BusinessDetails({ footer = false }: { footer?: boolean }) {
  const { t } = useLanguage();
  return (
    <aside
      className={
        "business-details" +
        (footer ? " business-details-footer" : " business-details-contact")
      }
      aria-label={t("Реквизиты исполнителя", "Service provider details")}
    >
      <span className="business-details-label">
        {t("Исполнитель", "Service provider")}
      </span>
      <p className="business-details-name">{businessProvider.fullName}</p>
      <p className="business-details-meta">
        {t("Самозанятый", "Self-employed")}
        <span aria-hidden="true"> · </span>
        {t("ИНН", "Tax ID")} {businessProvider.taxId}
      </p>
    </aside>
  );
}
