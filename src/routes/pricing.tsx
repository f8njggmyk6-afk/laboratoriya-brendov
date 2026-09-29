import { createFileRoute } from "@tanstack/react-router";
import { PricingPage } from "@/site/PricingPage";
import { pageHead } from "@/site/meta";

export const Route = createFileRoute("/pricing")({
  head: () => pageHead("/pricing", "Цены на брендинг | Лаборатория брендов", "Пронумерованный прайс на рекламные креативы, слоганы, нейминг, логотипы и фирменные системы. Первый пакет от 2 000 рублей."),
  component: PricingPage,
});
