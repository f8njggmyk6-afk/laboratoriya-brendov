import { businessPhone, businessMax } from "./contactDetails";
import { TrackingReceipt } from "./TrackingReceipt";
import { ContactScrollCue } from "./ContactScrollCue";
import { ServiceBadge } from "./ServiceBadge";
import { Link, useLocation } from "@tanstack/react-router";
import "./phoneContact.css";
import "./maxContact.css";
import { useEffect, useState, useRef, type FormEvent } from "react";
import { PageIntro, SiteShell } from "./SiteShell";
import { serviceGroups, servicePrice, summarizeServices } from "./serviceCatalog";
import { SelectionSummary } from "./SelectionSummary";
import { useLanguage } from "./i18n";


export function ContactsPage() {
  const { lang, t, money } = useLanguage();
  const location = useLocation();
  const [highlightPhone, setHighlightPhone] = useState(false);
  const submission = useRef<{body:string;id:string}|null>(null);
  const [sent, setSent] = useState(false);
  const [channel, setChannel] = useState<"max"|"email">("max");
  const [preparedMessage, setPreparedMessage] = useState("");
  const [copyState, setCopyState] = useState(false);
  const [draft, setDraft] = useState({name:"",email:"",brief:""});
  const [receipt, setReceipt] = useState<{number:number;code:string}|null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("packages");
    let saved: string[] = [];
    try { const value = JSON.parse(window.sessionStorage.getItem("lb-selected-services") ?? "[]"); if (Array.isArray(value)) saved = value.filter((item): item is string => typeof item === "string"); } catch {}
    const requested = raw?.split(",").filter(Boolean);
    const customRequest = params.get("request") === "custom";
    setSelected(customRequest ? [...new Set([...saved,...(requested ?? [])])] : requested ?? saved);
    try {
      const stored = JSON.parse(sessionStorage.getItem("lb-order-draft") ?? "null");
      if (stored && typeof stored.name === "string" && typeof stored.email === "string" && typeof stored.brief === "string") setDraft(stored);
      const ready = JSON.parse(sessionStorage.getItem("lb-max-order-ready") ?? "null");
      if (!requested && !customRequest && ready && typeof ready.message === "string" && typeof ready.number === "number" && typeof ready.code === "string") {
        setPreparedMessage(ready.message);setReceipt({number:ready.number,code:ready.code});setChannel("max");setSent(true);
      }
    } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) window.sessionStorage.setItem("lb-selected-services", JSON.stringify(selected)); }, [selected, hydrated]);

  useEffect(() => {
    if (!hydrated || location.hash !== "contact-phone") return;
    const frame = requestAnimationFrame(() => {
      const phone = document.getElementById("contact-phone");
      if (!phone) return;
      const headerBottom = document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;
      phone.style.scrollMarginTop = `${Math.max(0, headerBottom) + 20}px`;
      phone.scrollIntoView({ behavior: "instant", block: "start" });
      phone.focus({ preventScroll: true });
      setHighlightPhone(true);
    });
    const timer = window.setTimeout(() => setHighlightPhone(false), 4000);
    return () => { cancelAnimationFrame(frame); clearTimeout(timer); };
  }, [hydrated, location.hash, location.state]);

  useEffect(() => { if (hydrated) { try { sessionStorage.setItem("lb-order-draft",JSON.stringify(draft)); } catch {} } }, [draft,hydrated]);

  const { chosen, total } = summarizeServices(selected);

  const toggle = (number: string) => setSelected((current) => current.includes(number) ? current.filter((item) => item !== number) : [...current, number]);

  function chooseChannel(next: "max" | "email") {
    setChannel(next);
    requestAnimationFrame(() => {
      const target = document.getElementById("order-send-actions");
      if (!target) return;
      const header = document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;
      target.style.scrollMarginTop = `${Math.max(0, header) + 20}px`;
      target.scrollIntoView({behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start"});
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
    const body=JSON.stringify({channel,name:draft.name,email:channel==="email"?draft.email:"",brief:draft.brief,services:chosen.map(item=>item.n),total});
    if(!submission.current || submission.current.body!==body) submission.current={body,id:window.crypto.randomUUID()};
    const response = await fetch("/api/contact", {
      method:"POST",headers:{"Content-Type":"application/json","Idempotency-Key":submission.current.id},body,
    });
    if (!response.ok) {
      alert(t("Не получилось отправить заявку. Напишите нам на laboratoriabrendov@gmail.com","We couldn't send the request. Please email us at laboratoriabrendov@gmail.com"));
      return;
    }
    const accepted = await response.json();
    if (accepted.trackingCode) {
      setReceipt({number:accepted.orderNumber,code:accepted.trackingCode});
      try { sessionStorage.setItem("lb-tracking-code",accepted.trackingCode); } catch {}
    }
    if (channel === "max") {
      if (!accepted.message || !accepted.trackingCode) throw new Error("Missing saved order");
      setPreparedMessage(accepted.message);
      try { sessionStorage.setItem("lb-max-order-ready",JSON.stringify({number:accepted.orderNumber,code:accepted.trackingCode,message:accepted.message})); } catch {}
    }
    if (channel === "email") { try { sessionStorage.removeItem("lb-max-order-ready"); } catch {} }
    setSent(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      alert(t("Не получилось отправить заявку. Напишите нам на laboratoriabrendov@gmail.com", "We couldn’t send your request. Please email laboratoriabrendov@gmail.com"));
    } finally { setSubmitting(false); }
  }

  if (sent) {
    if (channel === "max") return <SiteShell><main className="thanks-page"><section className="thanks-card max-order-ready">
      <span>{t("Заказ сохранён", "Order saved")}</span><h1>{t("Передайте заказ в MAX", "Send your order on MAX")}</h1>
      <p>{t("Текст заказа уже готов. В MAX выберите чат «Лаборатория Брендов» и нажмите «Отправить».", "Your order text is ready. In MAX, choose the Brand Laboratory chat and press Send.")}</p>
      <a className="max-send-order" href={"https://max.ru/:share?text="+encodeURIComponent(preparedMessage)}>{t("Открыть MAX с заказом", "Open MAX with order")} →</a>
      <p className="handoff-note">{t("Не находите наш чат? Сначала откройте профиль, затем вернитесь и отправьте заказ.", "Can’t find our chat? Open our profile first, then return to send your order.")} <a href={businessMax.href} target="_blank" rel="noopener noreferrer">{t("Открыть профиль MAX", "Open MAX profile")} ↗</a></p>
      <details><summary>{t("Текст заказа и резервное копирование", "Order text and copy option")}</summary><textarea readOnly rows={8} aria-label={t("Готовый текст заказа", "Prepared order text")} value={preparedMessage}/><button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(preparedMessage);setCopyState(true);}catch{setCopyState(false);}}}>{copyState?t("Скопировано", "Copied"):t("Скопировать заказ", "Copy order")}</button></details>
      {receipt?<TrackingReceipt code={receipt.code} number={receipt.number}/>:null}
      <p className="handoff-note">{t("Заказ сохранён на сайте. Переход в MAX ещё не означает отправку сообщения.", "Your order is saved on the website. Opening MAX does not send the message.")}</p>
      <button type="button" onClick={()=>{setSent(false);setPreparedMessage("");submission.current=null;sessionStorage.removeItem("lb-max-order-ready");}}>{t("Вернуться к заказу", "Back to order")}</button>
    </section></main></SiteShell>;
    return (
      <SiteShell>
        <main className="thanks-page">
          <section className="thanks-card">
            <span>{t("Заявка принята","Request received")}</span>
            <h1>{t("Спасибо!","Thank you!")}</h1>
            <p>{t("Мы получили вашу заявку и ответим на указанный email в течение рабочего дня.","We received your request and will reply to the email you provided within one business day.")}</p>
            {receipt ? <TrackingReceipt code={receipt.code} number={receipt.number}/> : null}
            <div className="thanks-summary">
              <b>{t("Выбрано","Selected")}: {chosen.length}</b><SelectionSummary selected={selected}/>
              <small>{t("Заявка сохранена. Мы ответим на указанный email.","Your request has been saved. We’ll reply by email.")}</small>
            </div>
            <Link to="/">{t("Вернуться на главную →","Back to home →")}</Link>
          </section>
        </main>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <main className="contacts-page application-flow">
        <PageIntro number="05" title="Оформить заявку" titleEn="Contact" lead="Выберите услуги и удобный способ связи — обсудим задачу и подготовим предложение." leadEn="Choose your services and a contact method to discuss your project and receive a proposal." />
        <ContactScrollCue/>

        <section className="selected-services-first">
          <div className="application-section-head"><div><h2>{t("Выбранные услуги","Selected services")}</h2></div></div>
          <p>{t("Можно добавить или убрать пакеты. В итог включён весь указанный состав работ; дополнительные функции — по согласованию за отдельную плату.","Add or remove packages. The total covers all listed work; additional features are agreed and priced separately.")}</p>
          <div className="application-total application-total-overview"><span>{hydrated ? <>{t("Выбрано","Selected")}: <b>{chosen.length}</b></> : t("Восстанавливаем выбор…","Restoring selection…")}</span>{hydrated ? <SelectionSummary selected={selected}/> : null}</div>
          <fieldset className="multi-service">
            <legend className="sr-only">{t("Услуги","Services")}</legend>
            {serviceGroups.map((group,index) => <section className="contact-service-group" key={group.id}>
              {index === 0 || group.direction !== serviceGroups[index-1].direction ? <h3 className="contact-service-direction">{group.direction === "development" ? t("Разработка и программирование", "Development & programming") : t("Реклама и дизайн", "Advertising & design")}</h3> : null}
              <h4>{lang === "en" ? group.titleEn : group.title}</h4>
              <div className="contact-service-options">{group.packages.map((item) => (
              <label key={item.n} className={selected.includes(item.n) ? "is-selected" : ""}>
                <input type="checkbox" name="packages" value={item.n} checked={selected.includes(item.n)} onChange={() => toggle(item.n)} />
                <span><b><ServiceBadge item={item}/></b>{lang==="en"?(item.nameEn??item.name):item.name}<small>{servicePrice(item,money,lang)}{item.discountPercent ? t(" · скидка "," · ")+item.discountPercent+t("% уже учтена","% discount included") : ""}{item.pricing === "quote" ? t(" · стоимость отдельно", " · priced separately") : ""}</small></span>
                <em>{selected.includes(item.n) ? t("Убрать","Remove") : t("Добавить","Add")}</em>
              </label>
            ))}</div></section>)}
          </fieldset>
          <div className="application-total application-total-bottom"><span>{t("Выбрано","Selected")}: <b>{chosen.length}</b></span><SelectionSummary selected={selected}/></div>
          {!selected.length && hydrated ? <p className="form-note">{t("Не определились с услугой? Всё равно напишите — поможем выбрать подходящий вариант.","Not sure which service you need? Send us a message anyway — we’ll help you choose.")}</p> : null}
        </section>

        <form id="order-contact-options" onSubmit={submit} className="contact-form application-form unified-order-form">
          <div className="application-section-head"><div><span>{t("Отправка заказа", "Send your order")}</span><h2>{t("Куда отправить заказ?", "Where shall we continue?")}</h2></div></div>
          <p className="choice-prompt">{t("Выберите, куда отправить собранный заказ. Имя и пожелания можно добавить по желанию — обсуждение продолжим в выбранном канале.", "Choose where to send your selected services. Your name and notes are optional; we’ll continue in your chosen channel.")}</p>
          <fieldset className="order-channel-choice"><legend>{t("Способ отправки", "Send via")}</legend>
            <label onClick={()=>chooseChannel("max")} className={channel==="max"?"is-selected":""}><input type="radio" name="channel" value="max" checked={channel==="max"} onChange={()=>setChannel("max")}/><b>MAX</b><span>{t("Заказ и обсуждение в чате", "Order and discussion in chat")}</span></label>
            <label onClick={()=>chooseChannel("email")} className={channel==="email"?"is-selected":""}><input type="radio" name="channel" value="email" checked={channel==="email"} onChange={()=>setChannel("email")}/><b>Email</b><span>{t("Заказ и ответ по почте", "Order and reply by email")}</span></label>
          </fieldset>
          <section className="application-final-selection"><div className="application-final-heading"><h3>{t("Ваш заказ", "Your order")}</h3><span>{chosen.length}</span></div>
            {chosen.length?<ul className="application-final-items">{chosen.map(item=><li key={item.n}><ServiceBadge item={item}/><span>{lang==="en"?item.nameEn??item.name:item.name}</span><strong>{servicePrice(item,money,lang)}</strong></li>)}</ul>:<p>{t("Подготовим предложение по вашему описанию.", "We’ll prepare a proposal based on your brief.")}</p>}
            <SelectionSummary selected={selected}/>
          </section>
          <div id="order-send-actions" className="order-send-actions">
          {channel==="email"?<div className="unified-email"><label htmlFor="contact">{t("Email для ответа", "Reply email")}</label><input id="contact" name="contact" type="email" required maxLength={254} autoComplete="email" value={draft.email} onChange={e=>setDraft(d=>({...d,email:e.target.value}))}/></div>:null}
          <details className="order-optional-details" open={!chosen.length || undefined}>
            <summary>{chosen.length ? t("Добавить пожелания — необязательно", "Add notes — optional") : t("Опишите задачу, если услуги ещё не выбраны", "Describe your task if no services are selected")}</summary>
          <div><label htmlFor="name">{t("Как к вам обращаться — необязательно", "Your name — optional")}</label><input id="name" name="name" maxLength={120} value={draft.name} onChange={e=>setDraft(d=>({...d,name:e.target.value}))} autoComplete="name" /></div>
          <div className="unified-brief"><label htmlFor="brief">{chosen.length ? t("Пожелания к заказу — необязательно", "Order notes — optional") : t("Коротко о задаче", "Your brief")}</label><textarea id="brief" name="brief" required={!chosen.length} maxLength={3900} rows={4} value={draft.brief} onChange={e=>setDraft(d=>({...d,brief:e.target.value}))} placeholder={t("Что нужно сделать и какие детали важно учесть", "What do you need and what should we consider?")}/></div>
          </details>
          <p className="order-send-explanation">{channel==="max"?t("Сначала сохраним заказ и подготовим сообщение. В MAX выберите «Лаборатория Брендов» и нажмите «Отправить».", "We’ll save your order and prepare the message. In MAX, choose Brand Laboratory and press Send."):t("Отправим весь заказ на нашу почту. Ответим на указанный вами email.", "We’ll send the complete order to our inbox and reply at your email.")}</p>
          <button type="submit" disabled={submitting}>{submitting?t("Сохраняем…", "Saving…"):channel==="max"?t("Отправить заказ в MAX", "Send order via MAX"):t("Отправить заказ по email", "Send order by email")} →</button>
          </div>
          <div className="contact-direct-call"><span>{t("Или позвоните нам", "Or call us")}</span><a id="contact-phone" className={highlightPhone?"phone-arrival-highlight":""} href={businessPhone.href}>{businessPhone.display}</a></div>
        </form>
      </main>
    </SiteShell>
  );
}
