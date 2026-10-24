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

type ContactMode = "write" | null;

export function ContactsPage() {
  const { lang, t, money } = useLanguage();
  const location = useLocation();
  const [highlightPhone, setHighlightPhone] = useState(false);
  const submission = useRef<{body:string;id:string}|null>(null);
  const [sent, setSent] = useState(false);
  const [receipt, setReceipt] = useState<{number:number;code:string}|null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<ContactMode>(null);
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
    if (customRequest) setMode("write");
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) window.sessionStorage.setItem("lb-selected-services", JSON.stringify(selected)); }, [selected, hydrated]);

  useEffect(() => {
    if (mode === "write" && new URLSearchParams(window.location.search).get("request") === "custom") {
      document.getElementById("application-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [mode]);

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

  const { chosen, total } = summarizeServices(selected);

  const toggle = (number: string) => setSelected((current) => current.includes(number) ? current.filter((item) => item !== number) : [...current, number]);

  const chooseMode = (next: ContactMode) => {
    setMode(next);
    window.setTimeout(() => document.getElementById("application-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mode || submitting) return;
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    try {
    const body=JSON.stringify({name:String(form.get("name")??""),email:String(form.get("contact")??""),brief:String(form.get("brief")??""),services:chosen.map(item=>item.n),total});
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
    setSent(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      alert(t("Не получилось отправить заявку. Напишите нам на laboratoriabrendov@gmail.com", "We couldn’t send your request. Please email laboratoriabrendov@gmail.com"));
    } finally { setSubmitting(false); }
  }

  if (sent) {
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

        <section id="order-contact-options" className="application-choice-intro">
          <span>{t("Следующий шаг","Next step")}</span>
          <h2>{t("Оставьте заявку", "Get in touch")}</h2>
          <p>{t("Выберите удобный способ связи.", "Choose how you’d like to contact us.")}</p>
          <div className="contact-mode contact-mode-three contact-options-ranked" role="group" aria-label={t("Способ связи","Contact method")}>
            <a className="contact-mode-link contact-max-link" href={businessMax.href} target="_blank" rel="noopener noreferrer"><i aria-hidden="true">MAX</i><b>{t("Написать в MAX","Message on MAX")} <em aria-hidden="true">↗</em></b><span>{t("Обсудим задачу и подготовим предложение","Let’s discuss your task and prepare a proposal")}</span></a>
            <button type="button" onClick={() => chooseMode("write")}><i aria-hidden="true">02</i><b>{t("Заявка на сайте", "Website enquiry")}</b><span>{t("Заполните форму — ответим на email", "Complete the form for an email response")}</span></button>
            <a className="contact-mode-link" href="mailto:laboratoriabrendov@gmail.com"><i aria-hidden="true">03</i><b>{t("Написать на почту", "Email us")}</b><span>laboratoriabrendov@gmail.com</span></a>
          </div>
          <div className="contact-direct-call"><span>{t("Или позвоните нам", "Or call us")}</span><a id="contact-phone" className={highlightPhone ? "phone-arrival-highlight" : ""} href={businessPhone.href}>{businessPhone.display} <span aria-hidden="true">↗</span></a></div>
        </section>

        {mode === "write" ? (
          <form id="application-form" onSubmit={submit} className="contact-form application-form">
            <div className="application-section-head"><div><span>{t("Заявка по email","Email enquiry")}</span><h2>{t("Расскажите о задаче","Tell us about your task")}</h2></div></div>
            <p className="choice-prompt">{t("Укажите имя, email и коротко опишите задачу. Если удобнее обсудить детали по телефону, в Telegram или MAX, можете оставить контакт прямо в описании. Мы изучим запрос и ответим с предложением.","Tell us your name, email and a short description of the task. If you prefer to discuss details by phone, Telegram or MAX, you can leave that contact in the description. We’ll review your request and reply with a proposal.")}</p>
            <div><label htmlFor="name">{t("Как к вам обращаться","Your name")}</label><input id="name" name="name" required placeholder={t("Ваше имя","Your name")} /></div>
            <div><label htmlFor="contact">{t("Email для ответа","Email for reply")}</label><input id="contact" name="contact" type="email" required placeholder="name@company.com" /></div>
            <div><label htmlFor="brief">{t("Коротко о задаче","Briefly about the task")}</label><textarea id="brief" name="brief" required rows={4} placeholder={t("Что нужно создать, для какого проекта и любые важные детали. При желании укажите номер телефона, Telegram или MAX для связи.","What needs to be created, for which project, and any important details. You can also include your phone, Telegram or MAX contact if you wish.")} /></div>
            <button type="submit" disabled={submitting}>{submitting ? t("Отправляем…", "Sending…") : t("Получить предложение","Get a proposal")} <span>→</span></button>
            <section className="application-final-selection" aria-label={t("Ваш выбор перед отправкой", "Your selection before sending")}>
              <div className="application-final-heading"><h3>{t("Ваш выбор", "Your selection")}</h3><span>{t("Услуг", "Services")}: {chosen.length}</span></div>
              {chosen.length ? <ul className="application-final-items">{chosen.map(item=><li key={item.n}><ServiceBadge item={item}/><span>{lang === "en" ? item.nameEn ?? item.name : item.name}</span><strong>{servicePrice(item,money,lang)}</strong></li>)}</ul> : <p>{t("Опишите задачу — поможем подобрать услуги.","Describe your task and we’ll help choose the services.")}</p>}
              {chosen.length ? <SelectionSummary selected={selected}/> : null}
            </section>
            <p className="test-note">{t("Ответ на эту заявку придёт на указанный вами email. Наша почта","We’ll reply to this enquiry at the email you provided. Our email")}: laboratoriabrendov@gmail.com</p>
          </form>
        ) : null}
      </main>
    </SiteShell>
  );
}
