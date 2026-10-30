import { createFileRoute } from "@tanstack/react-router";
import { privateJson, handleTracking } from "../../server/local-admin.server";
export const Route = createFileRoute("/api/tracking")({
  server: {
    handlers: {
      GET: () =>
        privateJson(
          { error: "Используйте форму отслеживания заказа" },
          405,
          new Headers({ Allow: "POST" }),
        ),
      POST: ({ request }) => handleTracking(request),
    },
  },
});
