import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { type ReactNode } from "react";
import appCss from "../styles.css?url";
import appMetaJson from "../app-meta.json";
import { themeColor } from "@/site/meta";


type AppMeta = {
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  favicon_url?: string | null;
  og_video_url?: string | null;
  marketplace_cover_url?: string | null;
};

const appMeta = appMetaJson as AppMeta;
const title = appMeta.og_title ?? "Лаборатория брендов";
const description = appMeta.og_description ?? "Нейминг, слоганы, логотипы, рекламные концепции и креативы.";

function NotFoundComponent() {
  return <main className="error-page"><p>404</p><h1>Такой страницы нет</h1><Link to="/">Вернуться в Лабораторию брендов</Link></main>;
}

function ErrorComponent({ reset }: { error: unknown; reset: () => void }) {
  const router = useRouter();
  return <main className="error-page"><p>Ошибка</p><h1>Страница не загрузилась</h1><button onClick={() => { router.invalidate(); reset(); }}>Попробовать снова</button><a href="/">Перейти на главную</a></main>;
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title },
      { name: "description", content: description },
      { name: "author", content: "Лаборатория брендов" },
      { name: "theme-color", content: themeColor },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Лаборатория брендов" },
      { property: "og:locale", content: "ru_RU" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: appMeta.og_image_url ?? "" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: appMeta.og_image_url ?? "" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: appMeta.favicon_url ?? "/assets/head/favicon.svg" },
      { rel: "apple-touch-icon", href: "/assets/head/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return <html lang="ru" style={{ colorScheme: "dark" }}><head><HeadContent /></head><body>{children}<Scripts /></body></html>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return <QueryClientProvider client={queryClient}><Outlet /></QueryClientProvider>;
}
