import { TrackingReceipt } from "../site/TrackingReceipt";
import { noticePresets, noticePreset } from "./notices";
import { useEffect, useState, type FormEvent } from "react";
import {
  serviceStatuses,
  serviceStatusLabels,
  type ServiceStatus,
  fieldLabels,
  formatMoney,
  orderNumber,
  orderStatuses,
  statusLabels,
  type Order,
  type OrderHistory,
  type OrderPatch,
  type OrderStatus,
} from "./model";
import "./admin.css";

type OrderRow = Pick<
  Order,
  | "id"
  | "order_number"
  | "customer_name"
  | "customer_email"
  | "status"
  | "agreed_amount"
  | "due_date"
  | "created_at"
  | "updated_at"
  | "version"
  | "catalog_total"
  | "has_custom"
  | "terms_confirmed"
  | "notification_status"
>;
class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
async function api(path: string, method = "GET", body?: unknown) {
  const response = await fetch("/api/admin/" + path, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok)
    throw new ApiError(
      response.status,
      data.error ?? "Не удалось выполнить действие",
    );
  return data;
}
const dateLabel = (date: string | null) =>
  date
    ? new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Europe/Moscow",
      }).format(new Date(date.length === 10 ? date + "T12:00:00Z" : date))
    : "Не назначен";
const historyValue = (key: string, value: unknown) =>
  key === "service_progress" && value && typeof value === "object"
    ? Object.entries(value)
        .map(
          ([code, state]) =>
            `${code}: ${serviceStatusLabels[state as ServiceStatus] ?? state}`,
        )
        .join("; ") || "Ожидает начала"
    : value === null || value === ""
      ? "Не указано"
      : typeof value === "boolean"
        ? value
          ? "Да"
          : "Нет"
        : key === "status"
          ? (statusLabels[value as OrderStatus] ?? String(value))
          : key === "agreed_amount"
            ? formatMoney(Number(value))
            : String(value);

export function AdminPage() {
  const [session, setSession] = useState<"loading" | "anonymous" | "owner">(
    "loading",
  );
  const [configured, setConfigured] = useState(true);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [current, setCurrent] = useState<Order | null>(null);
  const [history, setHistory] = useState<OrderHistory[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  async function loadOrders() {
    setLoadingOrders(true);
    try {
      const data = await api("orders");
      setOrders(data.orders);
    } finally {
      setLoadingOrders(false);
    }
  }
  function showError(reason: unknown) {
    const err = reason as ApiError;
    if (err.status === 401) {
      setSession("anonymous");
      setOrders([]);
      setCurrent(null);
      setHistory([]);
    }
    setError(err.message ?? "Не удалось выполнить действие");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  useEffect(() => {
    let active = true;
    api("auth")
      .then((data) => {
        if (!active) return;
        setConfigured(data.configured !== false);
        setEmail(data.email ?? "");
        setSession(data.authenticated ? "owner" : "anonymous");
      })
      .catch((reason) => {
        if (active) {
          setSession("anonymous");
          if (reason.status !== 401) setError(reason.message);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (session === "owner") loadOrders().catch(showError);
  }, [session]);
  async function login(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const data = await api("auth", "POST", {
        action: codeSent ? "verify" : "request",
        email,
        ...(codeSent ? { code } : {}),
      });
      if (data.authenticated) {
        setSession("owner");
        setCode("");
        setCodeSent(false);
      } else {
        setCodeSent(true);
        setMessage("Код отправлен на почту владельца. Введите его ниже.");
      }
    } catch (reason) {
      showError(reason);
    } finally {
      setBusy(false);
    }
  }
  async function openOrder(id: string) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const data = await api("orders?id=" + encodeURIComponent(id));
      setCurrent(data.order);
      setHistory(data.history);
    } catch (reason) {
      showError(reason);
    } finally {
      setBusy(false);
    }
  }
  async function saveOrder(patch: OrderPatch) {
    if (!current || busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api("orders", "PATCH", {
        id: current.id,
        version: current.version,
        patch,
      });
      const data = await api("orders?id=" + current.id);
      setCurrent(data.order);
      setHistory(data.history);
      await loadOrders();
      setMessage("Изменения сохранены. Общий прайс сайта не изменился.");
    } catch (reason) {
      showError(reason);
    } finally {
      setBusy(false);
    }
  }
  async function deleteOrder(order: OrderRow) {
    if (
      busy ||
      !window.confirm(
        `Удалить заказ ${orderNumber(order)}? Он исчезнет из списка и отслеживания клиента.`,
      )
    )
      return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api("orders", "DELETE", {
        id: order.id,
        version: order.version,
        confirm: "delete",
      });
      if (current?.id === order.id) {
        setCurrent(null);
        setHistory([]);
      }
      setOrders((previous) => previous.filter((item) => item.id !== order.id));
      await loadOrders();
      setMessage("Заказ удалён.");
    } catch (reason) {
      showError(reason);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    try {
      await api("auth", "POST", { action: "logout" });
      setSession("anonymous");
      setOrders([]);
      setCurrent(null);
      setHistory([]);
      setMessage("");
    } catch (reason) {
      showError(reason);
    } finally {
      setBusy(false);
    }
  }
  const filtered = orders.filter(
    (order) =>
      (filter === "all" || order.status === filter) &&
      [order.customer_name, order.customer_email, orderNumber(order)]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div className="lb-admin">
      <header className="admin-header">
        <a href="/" className="admin-brand">
          <span>ЛБ</span>
          <b>
            Лаборатория брендов<small>Управление заказами</small>
          </b>
        </a>
        <div>
          <span className="admin-private-mark">Закрытый раздел</span>
          {session === "owner" ? (
            <button onClick={logout} disabled={busy}>
              Выйти
            </button>
          ) : (
            <a href="/">На сайт ↗</a>
          )}
        </div>
      </header>
      <main className="admin-main">
        {session === "loading" ? (
          <p role="status" className="admin-loading">
            Проверяем доступ…
          </p>
        ) : null}
        {error ? (
          <div role="alert" className="admin-alert is-error">
            {error}
          </div>
        ) : null}
        {message ? (
          <div role="status" className="admin-alert">
            {message}
          </div>
        ) : null}
        {session === "anonymous" ? (
          <section className="admin-login">
            <span className="admin-kicker">Только для владельца</span>
            <h1>Панель заказов</h1>
            <p>
              Заявки, согласованные условия и сроки — в одном месте. Вход по
              одноразовому коду на почту.
            </p>
            {!configured ? (
              <div className="admin-setup-note">
                <b>Подключение ещё не завершено</b>
                <p>
                  Раздел закрыт. Для начала работы нужно подключить отдельную
                  базу заказов и аккаунт владельца.
                </p>
              </div>
            ) : null}
            <form onSubmit={login}>
              <label htmlFor="admin-email">Почта владельца</label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={codeSent}
                placeholder="Ваш email"
                disabled={!configured}
              />
              {codeSent ? (
                <>
                  <label htmlFor="admin-code">Код из письма</label>
                  <input
                    id="admin-code"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    pattern="[0-9]{6,10}"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="Введите код"
                  />
                </>
              ) : null}
              <button className="admin-primary" disabled={busy || !configured}>
                {busy
                  ? "Подождите…"
                  : codeSent
                    ? "Войти в панель →"
                    : "Получить код входа →"}
              </button>
              {codeSent ? (
                <button
                  type="button"
                  className="admin-link-button"
                  onClick={() => {
                    setCodeSent(false);
                    setCode("");
                    setMessage("");
                  }}
                >
                  Изменить email / запросить код повторно
                </button>
              ) : null}
            </form>
          </section>
        ) : null}
        {session === "owner" && !current ? (
          <>
            <div className="admin-page-heading">
              <div>
                <span className="admin-kicker">Рабочее пространство</span>
                <h1>Заказы</h1>
                <p>От первого обращения до передачи результата.</p>
              </div>
              <button
                onClick={() => {
                  setError("");
                  loadOrders().catch(showError);
                }}
                disabled={busy || loadingOrders}
              >
                ↻ Обновить
              </button>
            </div>
            <div className="admin-metrics">
              <div>
                <span>Всего заявок</span>
                <b>{orders.length}</b>
              </div>
              <div>
                <span>Новые</span>
                <b>{orders.filter((o) => o.status === "new").length}</b>
              </div>
              <div>
                <span>В работе</span>
                <b>
                  {
                    orders.filter((o) =>
                      [
                        "in_progress",
                        "approval",
                        "payment",
                        "handover",
                      ].includes(o.status),
                    ).length
                  }
                </b>
              </div>
              <div>
                <span>Срок сегодня / просрочен</span>
                <b>
                  {
                    orders.filter(
                      (o) =>
                        o.due_date &&
                        o.status !== "completed" &&
                        o.due_date <=
                          new Intl.DateTimeFormat("en-CA", {
                            timeZone: "Europe/Moscow",
                          }).format(new Date()),
                    ).length
                  }
                </b>
              </div>
            </div>
            <div className="admin-toolbar">
              <label>
                <span>Поиск</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Имя, email или номер заказа"
                />
              </label>
              <label>
                <span>Статус</span>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as typeof filter)}
                >
                  <option value="all">Все статусы</option>
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {loadingOrders ? (
              <p role="status">Загружаем заказы…</p>
            ) : !orders.length ? (
              <section className="admin-empty">
                <span>↙</span>
                <h2>Здесь появятся новые заявки</h2>
                <p>
                  После подключения базы заявки с сайта будут сохраняться
                  автоматически. Старые письма сами сюда не переносятся.
                </p>
              </section>
            ) : !filtered.length ? (
              <p>По вашему запросу заказов нет.</p>
            ) : (
              <div className="admin-order-list">
                {filtered.map((order) => (
                  <article key={order.id} className="admin-order-card">
                    <button
                      className="admin-order-row"
                      onClick={() => openOrder(order.id)}
                      disabled={busy}
                    >
                      <div>
                        <small>
                          {orderNumber(order)} · {dateLabel(order.created_at)}
                        </small>
                        <strong>{order.customer_name}</strong>
                        <span>{order.customer_email}</span>
                      </div>
                      <span className={"admin-status status-" + order.status}>
                        {statusLabels[order.status]}
                      </span>
                      <div className="admin-order-money">
                        <b>
                          {order.agreed_amount === null
                            ? "Сумма не согласована"
                            : formatMoney(order.agreed_amount)}
                        </b>
                        <small>Срок: {dateLabel(order.due_date)}</small>
                        {order.has_custom ? (
                          <small>Есть индивидуальная задача</small>
                        ) : null}
                      </div>
                      <span aria-hidden="true">↗</span>
                    </button>
                    <div className="admin-order-card-actions">
                      <button
                        type="button"
                        className="admin-danger"
                        aria-label={`Удалить заказ ${orderNumber(order)}`}
                        disabled={busy}
                        onClick={() => deleteOrder(order)}
                      >
                        Удалить
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <p className="admin-footnote">
              Показаны последние 300 заявок. Суммы и сроки меняются только в
              карточке конкретного заказа.
            </p>
          </>
        ) : null}
        {session === "owner" && current ? (
          <>
            <div className="admin-page-heading">
              <div>
                <button
                  className="admin-link-button"
                  onClick={() => {
                    setCurrent(null);
                    setHistory([]);
                    setError("");
                    setMessage("");
                  }}
                >
                  ← Все заказы
                </button>
                <h1>{orderNumber(current)}</h1>
                <p>Получена {dateLabel(current.created_at)}</p>
              </div>
              <button onClick={() => openOrder(current.id)} disabled={busy}>
                ↻ Обновить карточку
              </button>
            </div>
            <OrderEditor order={current} busy={busy} save={saveOrder} />
            <section className="admin-panel admin-delete-panel">
              <button
                type="button"
                className="admin-danger"
                onClick={() => deleteOrder(current)}
                disabled={busy}
              >
                Удалить заказ
              </button>
            </section>
            <section className="admin-panel admin-history">
              <h2>История изменений</h2>
              {history.length ? (
                history.map((event) => (
                  <article key={event.id}>
                    <small>
                      {dateLabel(event.created_at)} ·{" "}
                      {new Date(event.created_at).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Europe/Moscow",
                      })}{" "}
                      · {event.actor_email}
                    </small>
                    {Object.entries(event.changes).map(([key, change]) => (
                      <p key={key}>
                        <b>{fieldLabels[key] ?? key}:</b>{" "}
                        {historyValue(key, change.before)} →{" "}
                        {historyValue(key, change.after)}
                      </p>
                    ))}
                  </article>
                ))
              ) : (
                <p>
                  Изменений пока нет. Исходная заявка сохранена отдельно от
                  редактируемых условий.
                </p>
              )}
            </section>
          </>
        ) : null}
      </main>
      <footer className="admin-footer">
        Лаборатория брендов · Доступ по подтверждённому аккаунту владельца
      </footer>
    </div>
  );
}

function OrderEditor({
  order,
  busy,
  save,
}: {
  order: Order;
  busy: boolean;
  save: (patch: OrderPatch) => Promise<void>;
}) {
  const [draft, setDraft] = useState<OrderPatch>(() => editable(order));
  const [amount, setAmount] = useState(
    order.agreed_amount === null ? "" : String(order.agreed_amount),
  );
  useEffect(() => {
    setDraft(editable(order));
    setAmount(order.agreed_amount === null ? "" : String(order.agreed_amount));
  }, [order.id, order.version]);
  function editable(o: Order): OrderPatch {
    return {
      customer_name: o.customer_name,
      customer_email: o.customer_email,
      agreed_amount: o.agreed_amount,
      due_date: o.due_date,
      agreed_scope: o.agreed_scope,
      status: o.status,
      notes: o.notes,
      terms_confirmed: o.terms_confirmed,
      paid: o.paid,
      delivered: o.delivered,
      progress_percent: o.progress_percent ?? 0,
      service_progress: o.service_progress ?? {},
      public_notice: o.public_notice ?? "",
      public_notice_until: o.public_notice_until ?? null,
    };
  }
  const change = <K extends keyof OrderPatch>(key: K, value: OrderPatch[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));
  return (
    <div className="admin-detail-grid">
      <section className="admin-panel admin-source">
        <span className="admin-kicker">Исходная заявка</span>
        <h2>Что запросил клиент</h2>
        {order.tracking_code ? (
          <TrackingReceipt
            code={order.tracking_code}
            number={order.order_number}
            owner
          />
        ) : null}
        <p className="admin-preserve-lines">{order.brief}</p>
        <ul>
          {order.services.map((service) => (
            <li key={service.id}>
              <span>{service.code}</span>
              <strong>{service.name}</strong>
              <b>
                {service.amount === null
                  ? "Индивидуально"
                  : formatMoney(service.amount)}
              </b>
              {service.items.length ? (
                <small>{service.items.join(" · ")}</small>
              ) : null}
            </li>
          ))}
        </ul>
        <dl>
          <div>
            <dt>Реклама и дизайн</dt>
            <dd>{formatMoney(order.advertising_total)}</dd>
          </div>
          <div>
            <dt>Разработка</dt>
            <dd>{formatMoney(order.development_total)}</dd>
          </div>
          <div>
            <dt>По прайсу</dt>
            <dd>{formatMoney(order.catalog_total)}</dd>
          </div>
        </dl>
        {order.has_custom ? (
          <p className="admin-info-note">
            Есть индивидуальная задача. Её стоимость нужно включить в
            согласованную сумму вручную.
          </p>
        ) : null}
        {order.notification_status === "failed" ? (
          <p className="admin-info-note">
            Заявка сохранена, но почтовое уведомление не отправлено.
          </p>
        ) : null}
      </section>
      <section className="admin-panel">
        <span className="admin-kicker">Условия заказа</span>
        <h2>Редактирование</h2>
        <p className="admin-help">
          Изменения относятся к этому заказу. Прайс сайта остаётся прежним.
        </p>
        <form
          className="admin-edit-form"
          onSubmit={(event) => {
            event.preventDefault();
            save({
              ...draft,
              agreed_amount: amount === "" ? null : Number(amount),
            });
          }}
        >
          <label>
            Имя клиента
            <input
              required
              maxLength={120}
              value={draft.customer_name}
              onChange={(e) => change("customer_name", e.target.value)}
            />
          </label>
          <label>
            Email клиента (если есть)
            <input
              type="email"
              value={draft.customer_email}
              onChange={(e) => change("customer_email", e.target.value)}
            />
          </label>
          <div className="admin-field-pair">
            <label>
              Согласованная сумма, ₽
              <input
                type="number"
                min="0"
                max="100000000"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Укажите сумму"
              />
            </label>
            <label>
              Дата сдачи
              <input
                type="date"
                value={draft.due_date ?? ""}
                onChange={(e) => change("due_date", e.target.value || null)}
              />
            </label>
          </div>
          <label>
            Состав согласованных работ
            <textarea
              rows={7}
              value={draft.agreed_scope}
              maxLength={10000}
              onChange={(e) => change("agreed_scope", e.target.value)}
            />
          </label>
          <label>
            Статус
            <select
              value={draft.status}
              onChange={(e) => change("status", e.target.value as OrderStatus)}
            >
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={draft.terms_confirmed}
              onChange={(e) => change("terms_confirmed", e.target.checked)}
            />
            Состав, сумма и срок согласованы с клиентом
          </label>
          <div className="admin-field-pair">
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={draft.paid}
                onChange={(e) => change("paid", e.target.checked)}
              />
              Оплата получена
            </label>
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={draft.delivered}
                onChange={(e) => change("delivered", e.target.checked)}
              />
              Файлы переданы
            </label>
          </div>
          <fieldset className="admin-client-update">
            <legend>Что увидит клиент</legend>
            <p className="admin-help">
              Этап, готовность услуг и сообщение появятся в клиентской карточке
              после сохранения. Внутренние заметки остаются только здесь.
            </p>
            <label>
              Общая готовность, %
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                required
                value={
                  Number.isFinite(draft.progress_percent)
                    ? draft.progress_percent
                    : ""
                }
                onChange={(e) =>
                  change(
                    "progress_percent",
                    e.target.value === "" ? NaN : Number(e.target.value),
                  )
                }
              />
            </label>
            <p className="admin-help">
              Процент задаётся вручную с учётом объёма работ. Количество готовых
              услуг считается отдельно.
            </p>
            <div className="admin-service-progress">
              {order.services.map((service) => (
                <label key={service.code}>
                  <span>
                    {service.code} · {service.name}
                  </span>
                  <select
                    value={draft.service_progress[service.code] ?? "pending"}
                    onChange={(e) =>
                      change("service_progress", {
                        ...draft.service_progress,
                        [service.code]: e.target.value as ServiceStatus,
                      })
                    }
                  >
                    {serviceStatuses.map((state) => (
                      <option key={state} value={state}>
                        {serviceStatusLabels[state]}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <div className="admin-notice-presets">
              {noticePresets.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({ ...prev, ...noticePreset(key) }))
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            <label>
              Сообщение клиенту
              <textarea
                rows={4}
                maxLength={600}
                value={draft.public_notice}
                onChange={(e) => change("public_notice", e.target.value)}
                placeholder="Короткое обновление по заказу…"
              />
            </label>
            <label>
              Показывать до (время вашего устройства)
              <input
                type="datetime-local"
                value={
                  draft.public_notice_until
                    ? new Date(
                        Date.parse(draft.public_notice_until) -
                          new Date(
                            draft.public_notice_until,
                          ).getTimezoneOffset() *
                            60000,
                      )
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  change(
                    "public_notice_until",
                    e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  )
                }
              />
            </label>
            <p className="admin-help">
              Без даты сообщение действует до следующего изменения. Пресет
              перерыва скрывается через 2 часа; этап заказа при этом не
              меняется.
            </p>
            <div className="admin-client-preview">
              <span>Предпросмотр для клиента</span>
              <strong>
                {statusLabels[draft.status]} ·{" "}
                {Number.isFinite(draft.progress_percent)
                  ? draft.progress_percent
                  : 0}
                %
              </strong>
              <p>{draft.public_notice || "Дополнительного сообщения нет."}</p>
            </div>
          </fieldset>
          <label>
            Внутренние заметки
            <textarea
              rows={4}
              maxLength={10000}
              value={draft.notes}
              onChange={(e) => change("notes", e.target.value)}
              placeholder="О чём договорились, следующий шаг…"
            />
          </label>
          <p className="admin-help">
            Для статуса «В работе» нужны сумма, дата сдачи, состав и
            подтверждение условий. Для завершения — отметки об оплате и передаче
            файлов.
          </p>
          <button className="admin-primary" disabled={busy}>
            {busy ? "Сохраняем…" : "Сохранить изменения"}
          </button>
        </form>
      </section>
    </div>
  );
}
