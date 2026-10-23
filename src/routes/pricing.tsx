import { createFileRoute } from "@tanstack/react-router";
import { PricingPage } from "@/site/PricingPage";
import { pageHead } from "@/site/meta";

export const Route = createFileRoute("/pricing")({
  head: () => pageHead("/pricing", "Цены на дизайн и разработку | Лаборатория брендов", "Цены на нейминг, логотипы, рекламу, сайты, ботов и автоматизацию. Пакеты разработки с фиксированной ценой и понятным составом работ."),
  component: PricingPage,
});
