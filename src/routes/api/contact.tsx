import { saveIncomingOrder, markNotification } from "../../server/local-admin.server";
import { createFileRoute } from "@tanstack/react-router";
import { money, serviceIdentity, summarizeServices } from "../../site/serviceCatalog";

type ContactPayload = { name?: unknown; email?: unknown; brief?: unknown; services?: unknown; total?: unknown; channel?: unknown };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export const Route = createFileRoute("/api/contact")({
  server: { handlers: { POST: async ({ request }) => {
    if (Number(request.headers.get("content-length") || 0) > 12000) return Response.json({ ok: false, error: "too_large" }, { status: 413 });
    let payload: ContactPayload;
    try { payload = (await request.json()) as ContactPayload; }
    catch { return Response.json({ ok: false, error: "invalid_json" }, { status: 400 }); }
    const channel = payload.channel === "max" ? "max" : "email";
    const suppliedName = clean(payload.name, 120);
    const name = suppliedName || "Клиент";
    const email = clean(payload.email, 254).toLowerCase();
    const brief = clean(payload.brief, 4000);
    const services = Array.isArray(payload.services) ? payload.services.filter((x): x is string => typeof x === "string").slice(0, 50).map(x => clean(x, 80)) : [];
    const { chosen, fixed, custom, advertisingTotal, developmentTotal, total } = summarizeServices(services);
    if (((channel === "email" || email !== "") && !emailPattern.test(email)) || (!brief && !chosen.length)) return Response.json({ ok: false, error: "invalid_fields" }, { status: 400 });
    let saved: {id:string;order_number:number;tracking_code:string}|null = null;
    try { saved=await saveIncomingOrder({requestId:request.headers.get("idempotency-key")??undefined,name,email,brief:channel === "max" ? "Канал связи: MAX\n" + (brief || "Заказ по выбранным услугам.").slice(0,3980) : brief || "Заказ по выбранным услугам.",services,rateKey:request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()??"unknown"}); }
    catch { return Response.json({ok:false,error:"storage_unavailable"},{status:503}); }
    if (!saved) return Response.json({ ok: false, error: "storage_unavailable" }, { status: 503 });
    const accepted = () => Response.json({ok:true,orderNumber:saved.order_number,trackingCode:saved.tracking_code}, { headers: { "Cache-Control": "private, no-store" } });
    if (channel === "max") {
      if (!saved) return Response.json({ok:false,error:"storage_unavailable"},{status:503});
      const message = [
        "Заказ — Лаборатория брендов",
        "Номер заказа: ЛБ-" + String(saved.order_number).padStart(5,"0"),
        "Код отслеживания: " + saved.tracking_code,
        ...(suppliedName ? ["Имя: " + suppliedName] : []),
        ...fixed.map(item => serviceIdentity(item).label + " — " + item.name + ": " + money(item.amount)),
        ...custom.map(item => serviceIdentity(item).label + " — " + item.name + ": стоимость отдельно"),
        "Реклама и дизайн: " + money(advertisingTotal),
        "Разработка: " + money(developmentTotal),
        "Итого за выбранные пакеты: " + money(total),
        ...(custom.length ? ["Индивидуальные услуги в итог не включены."] : []),
        ...(brief ? ["Пожелания:", brief] : []),
        "Для отслеживания введите код в разделе «Статус заказа» на нашем сайте.",
      ].join("\n");
      return Response.json({ok:true,orderNumber:saved.order_number,trackingCode:saved.tracking_code,message},{headers:{"Cache-Control":"private, no-store"}});
    }
    // The Russian VPS build does not forward customer data to a foreign mail API.
    await markNotification(saved.id, "failed");
    return accepted();
  } } },
});
