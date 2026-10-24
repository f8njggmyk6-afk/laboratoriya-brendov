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
  const text = `${t("Заказ", "Order")} ${numberLabel}\n${t("Код отслеживания", "Tracking code")}: ${code}\nhttps://laboratoriyabrendov.com/order\n${t("Откройте «Статус заказа» и вставьте код. Регистрация не нужна.", "Open Order status and enter the code. No registration needed.")}`;
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
  function download() {
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `LB-order-${number}.txt`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
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
              "Сохраните код или скачайте подтверждение. По коду вы сможете смотреть этапы работы без регистрации.",
              "Save the code or download the confirmation. Use it to track progress without registering.",
            )}
      </p>
      <div className="tracking-receipt-actions">
        <button type="button" onClick={copy}>
          {owner
            ? "Скопировать для клиента"
            : t("Скопировать код", "Copy code")}
        </button>
        <button type="button" onClick={download}>
          {t("Скачать подтверждение", "Download confirmation")}
        </button>
        <Link to="/order" onClick={remember}>
          {owner ? "Клиентский вид ↗" : t("Открыть статус →", "View status →")}
        </Link>
      </div>
      {feedback ? <small role="status">{feedback}</small> : null}
    </section>
  );
}
