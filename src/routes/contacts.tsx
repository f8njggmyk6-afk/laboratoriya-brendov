import { createFileRoute } from "@tanstack/react-router";
import { ContactsPage } from "@/site/ContactsPage";
import { pageHead } from "@/site/meta";

export const Route = createFileRoute("/contacts")({
  head: () => pageHead("/contacts", "Контакты | Лаборатория брендов", "Обсудите название, слоган, логотип, рекламную концепцию или креатив с Лабораторией брендов. Сейчас доступен тестовый сценарий обращения."),
  component: ContactsPage,
});
