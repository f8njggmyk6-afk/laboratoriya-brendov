import { createFileRoute } from "@tanstack/react-router";
import { PortfolioPage } from "@/site/PortfolioPage";
import { pageHead } from "@/site/meta";

export const Route = createFileRoute("/portfolio")({
  head: () => pageHead("/portfolio", "Примеры брендинга | Лаборатория брендов", "50 пронумерованных концептуальных работ: логотипы, рекламные креативы, упаковка и визуальные системы Лаборатории брендов."),
  component: PortfolioPage,
});
