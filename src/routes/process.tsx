import { createFileRoute } from "@tanstack/react-router";
import { ProcessPage } from "@/site/ProcessPage";
import { pageHead } from "@/site/meta";

export const Route = createFileRoute("/process")({
  head: () => pageHead("/process", "Процесс работы | Лаборатория брендов", "Как создаётся бренд без предоплаты: диагностика, варианты, показ с водяными знаками, подтверждение, оплата и передача чистых исходников."),
  component: ProcessPage,
});
