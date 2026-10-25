import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Link } from "@tanstack/react-router";
import { SiteShell } from "./SiteShell";
import { useLanguage } from "./i18n";
import { orderStatuses, type OrderStatus, orderNumber } from "../admin/model";
import "./tracking.css";

export type PublicOrder = {
  number: number;
  status: OrderStatus;
  progress: number;
  services: {
    code: string;
    name: string;
    status: "pending" | "in_progress" | "completed";
  }[];
  amount: number | null;
  dueDate: string | null;
  paid: boolean;
  delivered: boolean;
  notice: string;
  updatedAt: string;
};
const stages: Record<OrderStatus, [string, string, string, string]> = {
  new: [
    "Заявка принята",
    "Request received",
    "Ваш запрос сохранён. Скоро обсудим детали.",
    "Your request is saved. We will discuss the details next.",
  ],
  discussion: [
    "Обсуждение",
    "Discussion",
    "Уточняем задачу, согласуем состав, стоимость и срок.",
    "We agree the scope, price and delivery date.",
  ],
  in_progress: [
    "В работе",
    "In progress",
    "Создаём решение по согласованному заданию.",
    "We are working on the agreed brief.",
  ],
  approval: [
    "Предпоказ и согласование",
    "Preview and approval",
    "Показываем результат, собираем обратную связь и вносим согласованные правки.",
    "We present the result, collect feedback and make agreed revisions.",
  ],
  payment: [
    "Оплата",
    "Payment",
    "Подтверждаем оплату перед передачей итоговых материалов.",
    "We confirm payment before delivering the final materials.",
  ],
  handover: [
    "Передача файлов",
    "Delivery",
    "Передаём согласованный результат, исходники или доступы по составу заказа.",
    "We deliver the agreed result, source files or access credentials.",
  ],
  completed: [
    "Завершено",
    "Completed",
    "Работа завершена, оплата получена, итоговые материалы переданы.",
    "Work is complete, payment received and final materials delivered.",
  ],
};
const stamp = (value: string, lang: string, withTime = false) =>
  new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Moscow",
    ...(withTime ? ({ hour: "2-digit", minute: "2-digit" } as const) : {}),
  }).format(new Date(value.length === 10 ? value + "T12:00:00Z" : value));

export function TrackingPage() {
  const { t, lang, money } = useLanguage();
  const [code, setCode] = useState("");
  const [activeCode, setActiveCode] = useState("");
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const sequence = useRef(0);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    try {
      setCode(sessionStorage.getItem("lb-tracking-code") ?? "");
    } catch {}
    return () => {
      sequence.current++;
      controller.current?.abort();
    };
  }, []);
  const load = useCallback(async (value: string, refresh = false) => {
    const attempt = ++sequence.current;
    controller.current?.abort();
    controller.current = new AbortController();
    setBusy(true);
    setError("");
    if (!refresh) setOrder(null);
    try {
      const response = await fetch("/api/tracking", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: value }),
        signal: controller.current.signal,
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Не удалось получить статус заказа.");
      if (attempt !== sequence.current) return;
      setOrder(data.order);
      setActiveCode(value);
      setCheckedAt(new Date());
      try {
        sessionStorage.setItem("lb-tracking-code", value);
      } catch {}
    } catch (reason) {
      if (
        attempt !== sequence.current ||
        (reason as Error).name === "AbortError"
      )
        return;
      setError(
        (reason as Error).message ??
          "Не удалось получить статус. Попробуйте ещё раз.",
      );
    } finally {
      if (attempt === sequence.current) setBusy(false);
    }
  }, []);
  useEffect(() => {
    if (!activeCode) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void load(activeCode, true);
    }, 60000);
    return () => clearInterval(timer);
  }, [activeCode, load]);
  function submit(event: FormEvent) {
    event.preventDefault();
    setActiveCode("");
    void load(code.trim().toUpperCase());
  }
  function resetOrder() {
    sequence.current++;
    controller.current?.abort();
    setOrder(null);
    setActiveCode("");
    setCode("");
    setError("");
    setBusy(false);
    setCheckedAt(null);
    try {
      sessionStorage.removeItem("lb-tracking-code");
    } catch {}
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const current = order ? orderStatuses.indexOf(order.status) : -1;
  return (
    <SiteShell>
      <main className="tracking-page">
        <header className="tracking-intro">
          <span className="tracking-eyebrow">
            {t(
              "Лаборатория брендов · Для клиентов",
              "Brand Laboratory · For clients",
            )}
          </span>
          <h1>
            {t("Ваш заказ.\nВсё по этапам.", "Your order.\nStep by step.")}
          </h1>
          <p>
            {t(
              "Введите код отслеживания из подтверждения заявки или нашего сообщения. Регистрация не нужна.",
              "Enter the tracking code from your request confirmation or our message. No registration needed.",
            )}
          </p>
        </header>
        <form className="tracking-search" onSubmit={submit}>
          <label htmlFor="tracking-code">
            {t("Код отслеживания", "Tracking code")}
          </label>
          <div>
            <input
              id="tracking-code"
              name="tracking-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="LB-…"
              required
              maxLength={80}
              autoComplete="off"
              spellCheck={false}
              autoCapitalize="characters"
              aria-describedby="tracking-help"
            />
            <button disabled={busy}>
              {busy
                ? t("Проверяем…", "Checking…")
                : t("Показать статус", "View status")}{" "}
              <span aria-hidden="true">↗</span>
            </button>
          </div>
          <small id="tracking-help">
            {t(
              "Код открывает только ваш заказ. Сохраните его и не публикуйте в открытом доступе.",
              "The code opens only your order. Keep it safe and do not publish it.",
            )}
          </small>
        </form>
        {error ? (
          <p className="tracking-error" role="alert">
            {error}
            {order
              ? t(
                  " Ниже показан последний полученный статус.",
                  " The last received status is shown below.",
                )
              : ""}
          </p>
        ) : null}
        {order ? (
          <section
            className="tracking-result"
            aria-label={t("Статус заказа", "Order status")}
            aria-live="polite"
            aria-busy={busy}
          >
            <div className="tracking-result-head">
              <div>
                <span className="tracking-eyebrow">
                  {orderNumber({ order_number: order.number })}
                </span>
                <h2>{stages[order.status]?.[lang === "en" ? 1 : 0]}</h2>
              </div>
              <span
                className={
                  "tracking-state " +
                  (order.status === "completed" ? "is-complete" : "")
                }
              >
                <i />
                {order.status === "completed"
                  ? t("Готово", "Complete")
                  : t("Текущий этап", "Current stage")}
              </span>
            </div>
            <p className="tracking-current-description">
              {stages[order.status]?.[lang === "en" ? 3 : 2]}
            </p>
            <div className="tracking-work-progress">
              <div>
                <b>{t("Готовность заказа", "Order readiness")}</b>
                <strong>{order.progress ?? 0}%</strong>
              </div>
              <progress
                max="100"
                value={order.progress ?? 0}
                aria-label={t("Готовность заказа", "Order readiness")}
              />
              {order.services.length ? (
                <small>
                  {t("Готово", "Completed")}{" "}
                  {
                    order.services.filter(
                      (service) => service.status === "completed",
                    ).length
                  }{" "}
                  {t("из", "of")} {order.services.length}{" "}
                  {t("услуг", "services")}
                </small>
              ) : null}
            </div>
            {order.notice ? (
              <aside className="tracking-notice">
                <span aria-hidden="true">◷</span>
                <div>
                  <b>{t("Сообщение по заказу", "Order update")}</b>
                  <p>{order.notice}</p>
                </div>
              </aside>
            ) : null}
            <dl className="tracking-facts">
              <div>
                <dt>{t("Согласованная стоимость", "Agreed price")}</dt>
                <dd>
                  {order.amount === null
                    ? t("Согласуем при обсуждении", "To be agreed")
                    : money(order.amount)}
                </dd>
              </div>
              <div>
                <dt>{t("Дата сдачи", "Delivery date")}</dt>
                <dd>
                  {order.dueDate
                    ? stamp(order.dueDate, lang)
                    : t("Согласуем при обсуждении", "To be agreed")}
                </dd>
              </div>
            </dl>
            <div className="tracking-body">
              <div>
                <h3>{t("Путь заказа", "Order progress")}</h3>
                <ol className="tracking-timeline">
                  {orderStatuses.map((status, index) => {
                    const done =
                      order.status === "completed" ||
                      index < current ||
                      (index === current &&
                        ((status === "payment" && order.paid) ||
                          (status === "handover" && order.delivered)));
                    const active = index === current && !done;
                    return (
                      <li
                        key={status}
                        className={
                          done ? "is-done" : active ? "is-current" : ""
                        }
                        aria-current={active ? "step" : undefined}
                      >
                        <span className="tracking-step-icon" aria-hidden="true">
                          {done ? "✓" : String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <h4>
                            {stages[status][lang === "en" ? 1 : 0]}
                            {active ? <em>{t("Сейчас", "Now")}</em> : null}
                          </h4>
                          <p>{stages[status][lang === "en" ? 3 : 2]}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
              <aside className="tracking-package">
                <span className="tracking-eyebrow">
                  {t("Состав заявки", "Requested services")}
                </span>
                <h3>{t("Услуги по заказу", "Order services")}</h3>
                {order.services.length ? (
                  <ul>
                    {order.services.map((service, index) => (
                      <li key={index}>
                        <small>{service.code}</small>
                        <b>{service.name}</b>
                        <span
                          className={
                            "tracking-service-state service-" +
                            (service.status ?? "pending")
                          }
                        >
                          {service.status === "completed"
                            ? t("✓ Готово", "✓ Complete")
                            : service.status === "in_progress"
                              ? t("◉ В работе", "◉ In progress")
                              : t("○ Ожидает начала", "○ Not started")}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    {t(
                      "Индивидуальная задача — состав согласуем в переписке.",
                      "Custom project — scope will be agreed in our conversation.",
                    )}
                  </p>
                )}
                <p className="tracking-private-note">
                  {t(
                    "Изменения публикует команда проекта. Переписка, личные контакты и внутренние заметки здесь не отображаются.",
                    "Updates are published by the project team. Conversations, personal contacts and internal notes are not displayed here.",
                  )}
                </p>
              </aside>
            </div>
            <footer className="tracking-result-footer">
              <div>
                <p>
                  {t("Обновлено командой", "Updated by the team")}:{" "}
                  {stamp(order.updatedAt, lang, true)} {t("МСК", "MSK")}
                </p>
                <small>
                  {t(
                    "Автообновление — раз в минуту",
                    "Auto-refresh every minute",
                  )}
                  {checkedAt
                    ? " · " +
                      t("Проверено", "Checked") +
                      " " +
                      checkedAt.toLocaleTimeString(
                        lang === "en" ? "en-GB" : "ru-RU",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Europe/Moscow",
                        },
                      ) +
                      " " +
                      t("МСК", "MSK")
                    : ""}
                </small>
              </div>
              <div className="tracking-footer-actions">
                <button type="button" onClick={resetOrder}>
                  {t("Другой заказ", "Another order")}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void load(activeCode, true)}
                >
                  {t("Обновить статус", "Refresh status")} ↻
                </button>
              </div>
            </footer>
          </section>
        ) : (
          <aside className="tracking-no-code">
            <span aria-hidden="true">↗</span>
            <div>
              <h2>{t("Не нашли код?", "Cannot find your code?")}</h2>
              <p>
                {t(
                  "Напишите нам в той же переписке, где обсуждали проект. Поможем восстановить доступ к статусу заказа.",
                  "Message us in the conversation where we discussed your project. We will help restore access to your order status.",
                )}
              </p>
              <Link to="/contacts">
                {t("Связаться с нами", "Contact us")} →
              </Link>
            </div>
          </aside>
        )}
      </main>
    </SiteShell>
  );
}
