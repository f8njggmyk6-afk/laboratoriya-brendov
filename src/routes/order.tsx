import { createFileRoute } from "@tanstack/react-router";
import { TrackingPage } from "../site/TrackingPage";
export const Route = createFileRoute("/order")({
  head: () => ({
    meta: [
      { title: "Статус заказа | Лаборатория брендов" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: TrackingPage,
});
