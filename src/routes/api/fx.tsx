import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/fx")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const response = await fetch("https://open.er-api.com/v6/latest/RUB", {
            headers: { accept: "application/json" },
          });
          if (!response.ok) throw new Error("fx_failed");
          const data = await response.json() as { rates?: { USD?: number } };
          const usdPerRub = data?.rates?.USD;
          if (typeof usdPerRub !== "number" || usdPerRub <= 0) throw new Error("fx_invalid");
          return Response.json(
            { usdPerRub },
            { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
          );
        } catch {
          return Response.json({ usdPerRub: 0.0122 }, { headers: { "Cache-Control": "public, s-maxage=600" } });
        }
      },
    },
  },
});
