import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/site/PrivacyPage";
import { pageHead } from "@/site/meta";

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageHead(
      "/privacy",
      "Обработка персональных данных | Лаборатория брендов",
      "Какие данные используются при оформлении заявки, для чего они нужны и как запросить их исправление или удаление.",
    ),
  component: PrivacyPage,
});
