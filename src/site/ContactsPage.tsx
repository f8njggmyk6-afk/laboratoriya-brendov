import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { PageIntro, SiteShell } from "./SiteShell";
import { money, serviceCatalog } from "./serviceCatalog";

const options = serviceCatalog.map(({ n, name: label, amount }) => ({ n, label, amount }));

type ContactMode = "write" | null;

export function ContactsPage() {
  const [sent, setSent] = useState(false);
  const [mode, setMode] = useState<ContactMode>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("packages");
    if (raw) setSelected(raw.split(",").filter(Boolean));
    else try { const saved = JSON.parse(window.sessionStorage.getItem("lb-selected-services") ?? "[]"); if (Array.isArray(saved)) setSelected(saved); } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) window.sessionStorage.setItem("lb-selected-services", JSON.stringify(selected)); }, [selected, hydrated]);

  const chosen = useMemo(() => options.filter((item) => selected.includes(item.n)), [selected]);
  const total = chosen.reduce((sum, item) => sum + item.amount, 0);

  const toggle = (number: string) => {
    setSelected((current) =>
      current.includes(number) ? current.filter((item) => item !== number) : [...current, number],
    );
  };

  const chooseMode = (next: ContactMode) => {
    setMode(next);
    window.setTimeout(() => document.getElementById("application-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mode) return;
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") ?? ""),
        email: String(form.get("contact") ?? ""),
        brief: String(form.get("brief") ?? ""),
        services: selected,
        total,
      }),
    });
    if (!response.ok) {
      alert("Не получилось отправить заявку. Напишите нам на laboratoriabrendov@gmail.com");
      return;
    }
    setSent(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (sent) {
    return (
      <SiteShell>
        <main className="thanks-page">
          <section className="thanks-card">
            <span>Заявка принята</span>
            <h1>Спасибо!</h1>
            <p>Мы получили вашу заявку и ответим на указанный email в течение рабочего дня.</p>
            <div className="thanks-summary">
              <b>Выбрано: {selected.length} · {money(total)}</b>
              <small>Заявка сохранена. Мы ответим на указанный email.</small>
            </div>
            <Link to="/">Вернуться на главную →</Link>
          </section>
        </main>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <main className="contacts-page application-flow">
        <PageIntro number="05" title="Оформить заявку" lead="Проверьте состав заказа и итоговую стоимость." />
        <div className="application-scroll-cue" aria-hidden="true"><span>Способы связи — ниже</span><b>↓</b></div>

        <section className="selected-services-first">
          <div className="application-section-head">
            <div><h2>Выбранные услуги</h2></div>
          </div>
          <p>Можно добавить или убрать позиции. Выбор и сумма сохраняются.</p>
          <div className="application-total application-total-overview"><span>{hydrated ? <>Выбрано: <b>{selected.length}</b></> : "Восстанавливаем выбор…"}</span><strong>{hydrated ? money(total) : ""}</strong></div>
          <fieldset className="multi-service">
            <legend className="sr-only">Услуги</legend>
            {options.map((item) => (
              <label key={item.n} className={selected.includes(item.n) ? "is-selected" : ""}>
                <input type="checkbox" name="packages" value={item.n} checked={selected.includes(item.n)} onChange={() => toggle(item.n)} />
                <span><b>№ {item.n}</b>{item.label}<small>{money(item.amount)}</small></span>
                <em>{selected.includes(item.n) ? "Убрать" : "Добавить"}</em>
              </label>
            ))}
          </fieldset>
          <div className="application-total application-total-bottom"><span>Выбрано: <b>{selected.length}</b></span><strong>{money(total)}</strong></div>
          {!selected.length && hydrated ? <p className="form-note">Не определились с услугой? Можно сразу написать или заказать звонок — поможем выбрать.</p> : null}
        </section>

        <section className="application-choice-intro">
          <span>Следующий шаг</span>
          <h2>Как вам удобнее?</h2>
          <p>Напишите нам напрямую или оставьте заявку на предложение.</p>
          <div className="contact-mode contact-mode-three contact-mode-two" role="group" aria-label="Способ связи">
            <a className="contact-mode-link" href="mailto:laboratoriabrendov@gmail.com?subject=%D0%97%D0%B0%D0%BF%D1%80%D0%BE%D1%81%20%D0%B2%20%D0%9B%D0%B0%D0%B1%D0%BE%D1%80%D0%B0%D1%82%D0%BE%D1%80%D0%B8%D1%8E%20%D0%B1%D1%80%D0%B5%D0%BD%D0%B4%D0%BE%D0%B2"><i>01</i><b>Написать нам</b><span>laboratoriabrendov@gmail.com</span></a>
            <button type="button" className={mode === "write" ? "is-active" : ""} onClick={() => chooseMode("write")}><i>02</i><b>Получить предложение</b><span>Оставьте email и коротко опишите задачу</span></button>
          </div>
          <p className="contact-email-line">Почта ЛБ: <a href="mailto:laboratoriabrendov@gmail.com">laboratoriabrendov@gmail.com</a></p>
        </section>

        {mode === "write" ? (
          <form id="application-form" onSubmit={submit} className="contact-form application-form">
            <div className="application-section-head"><div><span>Получить предложение</span><h2>Расскажите о задаче</h2></div></div>
            <p className="choice-prompt">Укажите имя, email и коротко опишите задачу. Мы изучим запрос и ответим с предложением.</p>
            <div><label htmlFor="name">Как к вам обращаться</label><input id="name" name="name" required placeholder="Ваше имя" /></div>
            <div><label htmlFor="contact">Email для ответа</label><input id="contact" name="contact" type="email" required placeholder="name@company.com" /></div>
            <div><label htmlFor="brief">Коротко о задаче</label><textarea id="brief" name="brief" required rows={4} placeholder="Что нужно создать и для какого проекта" /></div>
            <button type="submit">Получить предложение <span>→</span></button>
            <p className="test-note">Основной канал связи: laboratoriabrendov@gmail.com</p>
          </form>
        ) : null}
      </main>
    </SiteShell>
  );
}
