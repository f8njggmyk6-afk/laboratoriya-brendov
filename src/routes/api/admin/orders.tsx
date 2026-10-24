import { createFileRoute } from "@tanstack/react-router";
import { handleOrders } from "../../../server/admin.server";
export const Route = createFileRoute("/api/admin/orders")({
  server: {
    handlers: {
      GET: ({ request }) => handleOrders(request),
      PATCH: ({ request }) => handleOrders(request),
    },
  },
});
