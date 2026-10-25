export const noticePresets = [
  ["start", "Приступили к работе"],
  ["preview", "Готовим предпоказ"],
  ["revisions", "Вносим правки"],
  ["resume", "Работа продолжается"],
  ["break", "Перерыв на 2 часа"],
  ["next", "Следующий рабочий день"],
  ["materials", "Ждём материалы"],
  ["approval", "Ждём комментарии"],
  ["payment", "Ждём оплату"],
  ["clear", "Убрать сообщение"],
] as const;
export function noticePreset(key: string, now = new Date()) {
  const until = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const time = new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  }).format(until);
  const texts: Record<string, string> = {
    start: "Приступили к работе по согласованному заданию.",
    preview:
      "Готовим результат к предпоказу. Сообщим, когда можно будет ознакомиться.",
    revisions: "Вносим согласованные правки по вашему заказу.",
    resume: "Работа по вашему заказу продолжается.",
    break: `Технический перерыв. Планируем продолжить работу в ${time} МСК.`,
    next: "Продолжим работу по вашему заказу в следующий рабочий день.",
    materials:
      "Ожидаем от вас материалы или уточнения, чтобы продолжить работу. Напишите нам в переписке по заказу.",
    approval:
      "Предпоказ готов. Ожидаем ваши комментарии или подтверждение в переписке по заказу.",
    payment:
      "Ожидаем оплату по согласованным условиям. Реквизиты — в нашей переписке по заказу.",
    clear: "",
  };
  return {
    public_notice: texts[key] ?? "",
    public_notice_until: key === "break" ? until.toISOString() : null,
  };
}
