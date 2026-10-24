import { createFileRoute } from "@tanstack/react-router";
import { handleTracking } from "../../server/admin.server";
export const Route = createFileRoute("/api/tracking")({
  server: { handlers: { POST: ({ request }) => handleTracking(request) } },
});
