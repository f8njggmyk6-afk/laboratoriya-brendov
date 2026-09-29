import { createFileRoute } from "@tanstack/react-router";
import { ServicesPage } from "@/site/ServicesPage";
import { pageHead } from "@/site/meta";

export const Route = createFileRoute("/services")({
  head: () => pageHead("/services", "Услуги брендинга | Лаборатория брендов", "Нейминг, слоганы, логотипы, рекламные креативы и фирменные системы. Каждая услуга подробно описана в отдельном разделе."),
  component: ServicesPage,
});
