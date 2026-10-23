import { createFileRoute } from "@tanstack/react-router";
import { ServicesPage } from "@/site/ServicesPage";
import { pageHead } from "@/site/meta";

export const Route = createFileRoute("/services")({
  head: () => pageHead("/services", "Услуги дизайна и разработки | Лаборатория брендов", "Нейминг, логотипы, реклама, сайты, Telegram-боты, исправление ошибок и автоматизация. Состав услуг и условия работы."),
  component: ServicesPage,
});
