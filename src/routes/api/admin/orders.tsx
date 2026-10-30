import { createFileRoute } from "@tanstack/react-router";
import { handleOrders } from "../../../server/local-admin.server";
export const Route = createFileRoute("/api/admin/orders")({
  server: {
    handlers: {
      GET: ({ request }) => handleOrders(request),
      DELETE: ({ request }) => handleOrders(request),
      PATCH: ({ request }) => handleOrders(request),
    },
  },
});
