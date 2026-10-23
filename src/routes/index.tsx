import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/site/HomePage";
import { pageHead } from "@/site/meta";

export const Route = createFileRoute("/")({
  head: () => pageHead("", "Лаборатория брендов | Нейминг, дизайн и разработка", "Названия, логотипы, дизайн, реклама, сайты, Telegram-боты и автоматизация для бизнеса. Стоимость и сроки разработки согласуем до начала работы."),
  component: HomePage,
});
