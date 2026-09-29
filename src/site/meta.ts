export const themeColor = "#090A0D";
const base = "https://laboratoriya-brendov-concept.higgsfield.app";
const image = `${base}/assets/head/og-wide.png`;

export function pageHead(path: string, title: string, description: string) {
  const url = `${base}${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
