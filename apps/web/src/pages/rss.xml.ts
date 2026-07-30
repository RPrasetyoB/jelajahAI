import { contentService } from "../lib/services/content-service";

const siteUrl = "https://jelajahai.dev";

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export async function GET() {
  const content = await contentService.getHomeContent();
  const articles = content.articles.slice(0, 20);
  const updated = new Date().toUTCString();

  const items = articles
    .map((article) => {
      const link = `${siteUrl}/articles/${article.slug}/`;
      return `
        <item>
          <title>${escapeXml(article.title)}</title>
          <link>${escapeXml(link)}</link>
          <guid isPermaLink="true">${escapeXml(link)}</guid>
          <description>${escapeXml(article.excerpt ?? article.body.slice(0, 200))}</description>
        </item>
      `.trim();
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(content.siteSettings.siteTitle)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(content.siteSettings.tagline ?? "AI knowledge hub")}</description>
    <language>en</language>
    <lastBuildDate>${updated}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}
