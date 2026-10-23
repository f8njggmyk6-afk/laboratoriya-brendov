import { ContactBand, PageIntro, SiteShell } from "./SiteShell";
import { useLanguage } from "./i18n";

export function ProcessPage() {
  const { lang, t } = useLanguage();
  const steps = lang==="en" ? [
    ["01","Discovery","We clarify the product, audience and task, then capture the essentials."],
    ["02","Directions","We propose several strategic and visual directions with concise rationale."],
    ["03","Presentation","We show protected previews so you can compare the options comfortably."],
    ["04","Selection","You choose a direction. We make the refinements included in the selected package."],
    ["05","Delivery","After approval and payment, we deliver the clean files in the agreed formats."],
  ] : [
    ["01","Диагностика","Уточняем продукт, аудиторию и задачу. Фиксируем главное."],
    ["02","Направления","Предлагаем разные смысловые и визуальные направления с кратким объяснением."],
    ["03","Показ","Показываем решения с защитной отметкой, чтобы вы спокойно сравнили варианты."],
    ["04","Выбор","Вы выбираете направление. Мы вносим предусмотренные пакетом доработки."],
    ["05","Передача","После утверждения и оплаты передаём чистые файлы в согласованных форматах."],
  ];
  return (
    <SiteShell>
      <main className="process-page">
        <PageIntro number="04" title="Процесс" titleEn="Process" lead="Пять понятных этапов — от первой беседы до передачи готовых материалов." leadEn="Five clear stages — from the first conversation to final file delivery." />
        <section className="process-line">
          {steps.map(([n,title,copy])=><article key={n}><span>{n}</span><h2>{title}</h2><p>{copy}</p></article>)}
        </section>
        <section className="watermark-proof"><div className="watermark-sample"><b>ЛБ</b><span>{t("Лаборатория брендов","Brand Laboratory")}</span></div><div><h2>{t("Показ до оплаты","Preview before payment")}</h2><p>{t("Сначала вы видите готовое направление с аккуратной защитной отметкой и спокойно оцениваете результат.","First you see the prepared direction with a discreet protection mark so you can evaluate the result safely.")}</p><p>{t("После утверждения и оплаты передаём чистые файлы без водяных знаков — в согласованных форматах.","After approval and payment, we deliver clean files without watermarks in the agreed formats.")}</p></div></section>
        <section className="pricing-note"><h2>{t("Как работаем с разработкой", "How development works")}</h2><p>{t("Сначала уточняем функции, материалы и доступы, согласуем задание, сроки и фиксированную стоимость. При необходимости показываем небольшой демонстрационный фрагмент. Крупные проекты делим на оплачиваемые этапы с проверкой результата каждого. Дополнительные пожелания, хостинг, домен, платные сервисы и сопровождение оцениваем отдельно до начала соответствующей работы.", "First we review features, materials and access, then agree on scope, timeline and a fixed price. A small demo can be arranged. Larger projects use paid milestones with verification at each stage. Additional requests, hosting, domains, paid services and ongoing support are quoted separately before the relevant work starts.")}</p></section>
        <ContactBand />
      </main>
    </SiteShell>
  );
}
