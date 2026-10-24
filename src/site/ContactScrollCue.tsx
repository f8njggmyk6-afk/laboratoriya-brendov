import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./i18n";

export function ContactScrollCue() {
  const { t } = useLanguage();
  const slot = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [state, setState] = useState({ floating: false, visible: true, top: 0, height: 0 });
  useEffect(() => {
    const header = document.querySelector(".site-header");
    const target = document.getElementById("order-contact-options");
    const update = () => {
      if (!slot.current || !button.current || !target) return;
      const top = Math.max(0, header?.getBoundingClientRect().bottom ?? 0) + 10;
      target.style.scrollMarginTop = `${top + 14}px`;
      const height = button.current.getBoundingClientRect().height;
      const visible = target.getBoundingClientRect().top > Math.max(top + height + 24, window.innerHeight * .65);
      const floating = slot.current.getBoundingClientRect().top <= top;
      setState(previous => previous.top === top && previous.height === height && previous.visible === visible && previous.floating === floating ? previous : { top, height, visible, floating });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(document.body);
    if (header) observer.observe(header);
    if (button.current) observer.observe(button.current);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { observer.disconnect(); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return <div ref={slot} className="application-cue-slot" style={state.height ? { height: state.height } : undefined}>
    <button ref={button} type="button" className={`application-scroll-cue contact-follow-cue${state.floating ? " is-floating" : ""}${state.visible ? "" : " is-hidden"}`} style={state.floating ? { top: state.top } : undefined} tabIndex={state.visible ? 0 : -1} aria-hidden={!state.visible} onClick={() => {
      const target = document.getElementById("order-contact-options");
      if (!target) return;
      const headerBottom = Math.max(0, document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0);
      target.focus({preventScroll:true});
      const align = () => window.scrollTo({top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - headerBottom - 24), behavior:"instant"});
      align();
      requestAnimationFrame(align);
    }}>
      <span>{t("Способы связи для оформления заказа — ниже", "Contact options for placing your order are below")}</span><b aria-hidden="true">↓</b>
    </button>
  </div>;
}
