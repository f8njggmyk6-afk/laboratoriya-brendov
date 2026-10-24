import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "../admin/AdminPage";
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Панель заказов | Лаборатория брендов" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: AdminPage,
});
