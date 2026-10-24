export const orderStatuses = [
  "new",
  "discussion",
  "in_progress",
  "approval",
  "payment",
  "handover",
  "completed",
] as const;
export type OrderStatus = (typeof orderStatuses)[number];
export const statusLabels: Record<OrderStatus, string> = {
  new: "Новая",
  discussion: "Обсуждение",
  in_progress: "В работе",
  approval: "Предпоказ и согласование",
  payment: "Оплата",
  handover: "Передача файлов",
  completed: "Завершена",
};
export type OrderService = {
  id: string;
  code: string;
  direction: string;
  name: string;
  amount: number | null;
  items: readonly string[];
};
export type Order = {
  id: string;
  order_number: number;
  request_id: string;
  created_at: string;
  updated_at: string;
  version: number;
  customer_name: string;
  customer_email: string;
  brief: string;
  services: OrderService[];
  advertising_total: number;
  development_total: number;
  catalog_total: number;
  has_custom: boolean;
  agreed_amount: number | null;
  due_date: string | null;
  agreed_scope: string;
  status: OrderStatus;
  notes: string;
  terms_confirmed: boolean;
  paid: boolean;
  delivered: boolean;
  notification_status: string;
  tracking_code: string;
  public_notice: string;
  public_notice_until: string | null;
  public_updated_at: string;
};
export type OrderHistory = {
  id: string;
  created_at: string;
  actor_email: string;
  changes: Record<string, { before: unknown; after: unknown }>;
};
export type OrderPatch = Pick<
  Order,
  | "customer_name"
  | "customer_email"
  | "agreed_amount"
  | "due_date"
  | "agreed_scope"
  | "status"
  | "notes"
  | "terms_confirmed"
  | "paid"
  | "delivered"
  | "public_notice"
  | "public_notice_until"
>;
export const orderNumber = (order: Pick<Order, "order_number">) =>
  "ЛБ-" + String(order.order_number).padStart(5, "0");
export const formatMoney = (n: number) =>
  n.toLocaleString("ru-RU", { maximumFractionDigits: 2 }) + " ₽";
export const fieldLabels: Record<string, string> = {
  customer_name: "Имя",
  customer_email: "Email",
  agreed_amount: "Согласованная сумма",
  due_date: "Дата сдачи",
  agreed_scope: "Состав работ",
  status: "Статус",
  notes: "Внутренние заметки",
  public_notice: "Сообщение клиенту",
  public_notice_until: "Сообщение активно до",
  terms_confirmed: "Условия согласованы",
  paid: "Оплачено",
  delivered: "Файлы переданы",
};
export function validateOrderPatch(value: unknown): {
  patch?: OrderPatch;
  error?: string;
} {
  if (!value || typeof value !== "object")
    return { error: "Некорректные данные заказа" };
  const v = value as Record<string, unknown>;
  const text = (key: string, max: number) =>
    typeof v[key] === "string" ? (v[key] as string).trim().slice(0, max) : "";
  const name = text("customer_name", 120),
    email = text("customer_email", 254).toLowerCase();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: "Укажите имя и корректный email" };
  if (!orderStatuses.includes(v.status as OrderStatus))
    return { error: "Неизвестный статус" };
  const amount = v.agreed_amount === null ? null : v.agreed_amount;
  if (
    amount !== null &&
    (typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount < 0 ||
      amount > 100000000 ||
      Math.abs(Math.round(amount * 100) - amount * 100) > 0.000001)
  )
    return { error: "Укажите корректную сумму в рублях" };
  const date =
    v.due_date === null || v.due_date === "" ? null : text("due_date", 10);
  if (
    date &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(Date.parse(date + "T00:00:00Z")) ||
      new Date(date + "T00:00:00Z").toISOString().slice(0, 10) !== date)
  )
    return { error: "Укажите корректную дату сдачи" };
  for (const key of ["terms_confirmed", "paid", "delivered"])
    if (typeof v[key] !== "boolean")
      return { error: "Некорректное подтверждение условий" };
  const noticeUntil =
    v.public_notice_until == null || v.public_notice_until === ""
      ? null
      : v.public_notice_until;
  if (
    noticeUntil !== null &&
    (typeof noticeUntil !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T/.test(noticeUntil) ||
      !Number.isFinite(Date.parse(noticeUntil)))
  )
    return { error: "Укажите корректное время окончания сообщения" };
  if (typeof v.public_notice === "string" && v.public_notice.length > 600)
    return { error: "Сообщение клиенту — до 600 символов" };
  const patch: OrderPatch = {
    customer_name: name,
    customer_email: email,
    agreed_amount: amount as number | null,
    due_date: date,
    agreed_scope: text("agreed_scope", 10000),
    status: v.status as OrderStatus,
    notes: text("notes", 10000),
    public_notice: text("public_notice", 600),
    public_notice_until:
      noticeUntil === null
        ? null
        : new Date(noticeUntil as string).toISOString(),
    terms_confirmed: v.terms_confirmed as boolean,
    paid: v.paid as boolean,
    delivered: v.delivered as boolean,
  };
  if (
    ["in_progress", "approval", "payment", "handover", "completed"].includes(
      patch.status,
    ) &&
    (patch.agreed_amount === null ||
      !patch.due_date ||
      !patch.agreed_scope ||
      !patch.terms_confirmed)
  )
    return {
      error:
        "Сначала заполните сумму, дату сдачи, состав работ и подтвердите согласование с клиентом",
    };
  if (patch.status === "handover" && !patch.paid)
    return { error: "Перед передачей файлов подтвердите получение оплаты" };
  if (patch.delivered && !patch.paid)
    return { error: "Перед отметкой о передаче файлов подтвердите оплату" };
  if (patch.status === "completed" && (!patch.paid || !patch.delivered))
    return { error: "Для завершения подтвердите оплату и передачу файлов" };
  return { patch };
}
