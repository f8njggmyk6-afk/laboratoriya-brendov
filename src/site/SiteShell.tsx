import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLanguage } from "./i18n";

const nav = [
  ["/services", "Услуги", "01"],
  ["/pricing", "Цены", "02"],
  ["/portfolio", "Работы", "03"],
  ["/process", "Процесс", "04"],
  ["/contacts", "Заявка", "05"],
] as const;

export function SiteHeader() {
  const { lang, setLang } = useLanguage();
  return (
    <header className="site-header">
      <Link className="brand-lockup" to="/" aria-label="Лаборатория брендов, главная">
        <span className="brand-monogram">ЛБ</span>
        <span className="brand-name">Лаборатория<br />брендов</span>
      </Link>
      <nav className="main-nav" aria-label="Основная навигация">
        {nav.map(([to, label, index]) => (
          <Link key={to} to={to} activeProps={{ className: "is-active" }}>
            <span>{index}</span>{lang === "en" ? ({ "Услуги":"Services","Цены":"Pricing","Работы":"Work","Процесс":"Process","Заявка":"Contact" } as Record<string,string>)[label] : label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-mark">ЛБ</div>
      <div><p className="footer-title">Лаборатория брендов</p><p>Нейминг, слоганы, логотипы, рекламные концепции и креативы.</p></div>
      <div><p className="footer-label">География</p><p>Россия и онлайн</p></div>
      <div><p className="footer-label">Связаться</p><p><a href="mailto:laboratoriabrendov@gmail.com">laboratoriabrendov@gmail.com</a></p></div>
      <p className="footer-note">Телефон и мессенджеры временно скрыты. Основной канал связи — email.</p>
    </footer>
  );
}

export function PhoneIcon({ className = "" }: { className?: string }) {
  return <span className={`phone-icon ${className}`} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7.1 3.7 9.4 7a1.8 1.8 0 0 1-.2 2.3l-1.4 1.3a14.5 14.5 0 0 0 5.6 5.6l1.3-1.4a1.8 1.8 0 0 1 2.3-.2l3.3 2.3a1.8 1.8 0 0 1 .7 2.1l-.5 1.6a2 2 0 0 1-1.9 1.4C9.4 22 2 14.6 2 5.4a2 2 0 0 1 1.4-1.9L5 3a1.8 1.8 0 0 1 2.1.7Z"/></svg></span>;
}

function BackButton() {
  const [scrollState, setScrollState] = useState({ away: false, scrolling: false, nearBottom: false });
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const update = (scrolling: boolean) => {
      const root = document.documentElement;
      const nearBottom = window.scrollY + window.innerHeight >= root.scrollHeight - 180;
      setScrollState({ away: window.scrollY > 180, scrolling, nearBottom });
    };
    const onScroll = () => {
      update(true);
      if (stopTimer.current) clearTimeout(stopTimer.current);
      stopTimer.current = setTimeout(() => update(false), 180);
    };
    update(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (stopTimer.current) clearTimeout(stopTimer.current);
    };
  }, []);

  const goBack = () => {
    if (typeof window === "undefined") return;
    const cameFromThisSite = document.referrer ? new URL(document.referrer).host === window.location.host : window.history.length > 1;
    if (cameFromThisSite && window.history.length > 1) window.history.back();
    else window.location.assign("/");
  };
  const floating = scrollState.away && !scrollState.nearBottom;
  const hidden = (scrollState.scrolling && scrollState.away) || scrollState.nearBottom;
  return <button type="button" className={`page-back-control${floating ? " is-floating" : ""}${hidden ? " is-hidden" : ""}`} onClick={goBack} aria-label="Вернуться на предыдущую страницу" aria-hidden={hidden}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7"/></svg><span>Назад</span></button>;
}

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => {
      const root = document.documentElement;
      setVisible(root.scrollHeight > window.innerHeight && window.scrollY + window.innerHeight >= root.scrollHeight - 180);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return <button type="button" className={`back-to-top${visible ? " is-visible" : ""}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Вернуться наверх" aria-hidden={!visible}><span>Наверх</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 14 7-7 7 7"/></svg></button>;
}

export function SiteShell({ children }: { children: ReactNode }) {
  return <div className="site-frame"><SiteHeader />{children}<BackToTop/><SiteFooter /></div>;
}

function JourneyTrail({ current }: { current: string }) {
  const currentIndex = nav.findIndex((item) => item[2] === current);
  return (
    <nav className="journey-trail" aria-label="Этапы знакомства с сайтом">
      <div className="journey-line" aria-hidden="true" />
      {nav.map(([to, label, number], index) => {
        const state = index < currentIndex ? "is-done" : index === currentIndex ? "is-current" : index === currentIndex + 1 ? "is-next" : "";
        return <Link key={number} to={to} className={state} aria-current={index === currentIndex ? "step" : undefined}>
          <span>{index < currentIndex ? "✓" : number}</span><b>{label}</b>{index === currentIndex + 1 ? <small>Далее</small> : null}
        </Link>;
      })}
    </nav>
  );
}

export function PageIntro({ number, title, lead }: { number: string; title: string; lead: string }) {
  return <section className="page-intro"><BackButton/><JourneyTrail current={number} /><h1>{title}</h1><p className="page-lead">{lead}</p></section>;
}

export function ContactBand() {
  return (
    <section className="contact-band">
      <div className="contact-band-copy">
        <p>Есть задача для бренда?</p>
        <h2>Разберём задачу и предложим решение.</h2>
      </div>
      <Link to="/contacts" className="contact-seal" aria-label="Обсудить задачу">
        <span>Обсудить задачу</span>
        <PhoneIcon className="is-pulsing"/>
      </Link>
    </section>
  );
}

export function SectionCue({ label }: { label: string }) {
  return <div className="section-cue" aria-hidden="true"><span>{label}</span><b>↓</b></div>;
}
