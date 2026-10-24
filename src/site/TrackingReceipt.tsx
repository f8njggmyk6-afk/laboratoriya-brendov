import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { orderNumber } from "../admin/model";
import { useLanguage } from "./i18n";
import "./tracking.css";

export function TrackingReceipt({
  code,
  number,
  owner = false,
}: {
  code: string;
  number: number;
  owner?: boolean;
}) {
  const { t } = useLanguage();
  const [feedback, setFeedback] = useState("");
  const numberLabel = orderNumber({ order_number: number });
  const text = `${t("Заказ", "Order")} ${numberLabel}\n${t("Код отслеживания", "Tracking code")}: ${code}\n${t("Откройте «Статус заказа» и вставьте код. Регистрация не нужна.", "Open Order status and enter the code. No registration needed.")}`;
  async function copy() {
    try {
      await navigator.clipboard.writeText(owner ? text : code);
      setFeedback(t("Скопировано", "Copied"));
    } catch {
      setFeedback(
        t(
          "Выделите и скопируйте код вручную.",
          "Select and copy the code manually.",
        ),
      );
    }
  }
  function remember() {
    try {
      sessionStorage.setItem("lb-tracking-code", code);
    } catch {}
  }
  return (
    <section
      className="tracking-receipt"
      aria-label={t("Доступ к статусу заказа", "Order tracking access")}
    >
      <b>
        {t("Заказ", "Order")} {numberLabel}
      </b>
      <span>{t("Код отслеживания", "Tracking code")}</span>
      <code>{code}</code>
      <p>
        {owner
          ? "Этот код открывает клиентскую карточку. Отправьте его клиенту в вашей переписке. Внутренние заметки в карточку не попадают."
          : t(
              "Следите за этапами работы без регистрации. Скопируйте код или откройте статус заказа.",
              "Follow your order without registering. Copy the code or open your order status.",
            )}
      </p>
      <div className="tracking-receipt-actions">
        <button type="button" onClick={copy}>
          {owner
            ? "Скопировать для клиента"
            : t("Скопировать код", "Copy code")}
        </button>
        <Link to="/order" onClick={remember}>
          {owner ? "Клиентский вид ↗" : t("Открыть статус →", "View status →")}
        </Link>
      </div>
      {feedback ? <small role="status">{feedback}</small> : null}
    </section>
  );
}
