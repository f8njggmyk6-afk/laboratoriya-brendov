import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/site/HomePage";
import { pageHead } from "@/site/meta";

export const Route = createFileRoute("/")({
  head: () => pageHead("", "Лаборатория брендов | Нейминг, логотипы и реклама", "Создаём названия, слоганы, логотипы и рекламные креативы. Слушаем задачу, предлагаем варианты, вместе доводим до результата. Оплата в конце."),
  component: HomePage,
});
