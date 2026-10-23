import { createFileRoute } from "@tanstack/react-router";
import { money, summarizeServices } from "../../site/serviceCatalog";

type ContactPayload = { name?: unknown; email?: unknown; brief?: unknown; services?: unknown; total?: unknown };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export const Route = createFileRoute("/api/contact")({
  server: { handlers: { POST: async ({ request }) => {
    if (Number(request.headers.get("content-length") || 0) > 12000) return Response.json({ ok: false, error: "too_large" }, { status: 413 });
    let payload: ContactPayload;
    try { payload = (await request.json()) as ContactPayload; }
    catch { return Response.json({ ok: false, error: "invalid_json" }, { status: 400 }); }
    const name = clean(payload.name, 120);
    const email = clean(payload.email, 254).toLowerCase();
    const brief = clean(payload.brief, 4000);
    const services = Array.isArray(payload.services) ? payload.services.filter((x): x is string => typeof x === "string").slice(0, 50).map(x => clean(x, 80)) : [];
    const { fixed, development, total } = summarizeServices(services);
    if (!name || !emailPattern.test(email) || !brief) return Response.json({ ok: false, error: "invalid_fields" }, { status: 400 });
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    const to = process.env.NOTIFY_TO_EMAIL;
    if (!apiKey || !from || !to) {
      console.error("Contact notification environment is incomplete");
      return Response.json({ ok: false, error: "notification_unavailable" }, { status: 503 });
    }
    const lines = [
      "Новая заявка — Лаборатория брендов", `Имя: ${name}`, `Email: ${email}`,
      "Услуги по фиксированной цене:",
      ...fixed.map(item => `№ ${item.n} — ${item.name}: ${money(item.amount)}`),
      fixed.length ? `Сумма фиксированных услуг: ${money(total)}` : "Не выбраны",
      "Разработка — требуется расчёт:",
      ...development.map(item => `№ ${item.n} — ${item.name} (${item.pricing === "quote" ? "по расчёту" : "стартовая цена от " + money(item.amount)})`),
      ...(development.length ? ["Окончательные стоимость, сроки и этапы разработки согласуем отдельно. Стартовые цены не включены в фиксированную сумму."] : ["Не выбрана"]),
      "Задача:", brief,
    ];
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [to], reply_to: email, subject: `Новая заявка от ${name}`, text: lines.join("\n") }),
      });
      if (!response.ok) {
        console.error("Notification provider returned", response.status);
        return Response.json({ ok: false, error: "notification_failed" }, { status: 502 });
      }
      // Клиенту отвечает умный автоответчик через Gmail: без повторяющегося шаблона.
      return Response.json({ ok: true });
    } catch (error) {
      console.error("Notification request failed", error);
      return Response.json({ ok: false, error: "notification_failed" }, { status: 502 });
    }
  } } },
});
