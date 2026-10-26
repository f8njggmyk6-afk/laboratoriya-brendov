import { useLanguage } from "./i18n";

export function PrivacyNotice() {
  const { t } = useLanguage();
  return (
    <div className="privacy-notice">
      <p>
        {t(
          "При подготовке заказа выбранные услуги, имя и пожелания сохраняются для обработки заявки. Имя необязательно; пожелания — тоже, если услуги уже выбраны.",
          "Preparing an order saves your selected services, name and notes to handle your request. Your name is optional; notes are optional when services are selected.",
        )}
      </p>
      <a href="/privacy" target="_blank" rel="noopener noreferrer">
        {t("Как обрабатываются данные", "How we process your data")}{" "}
        <span aria-hidden="true">↗</span>
        <span className="sr-only">
          {t(" — откроется в новой вкладке", " — opens in a new tab")}
        </span>
      </a>
    </div>
  );
}
