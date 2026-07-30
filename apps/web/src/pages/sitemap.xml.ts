import type { APIRoute } from "astro";
import { createAbsoluteUrl } from "@jelajahai/config";
import { contentService } from "../lib/services/content-service";
import {
  getAuthors,
  getCategories,
  getTags,
  getCollectionEntries
} from "../lib/route-data";
import type { ContentKind } from "../lib/content-types";

export const GET: APIRoute = async () => {
  const content = await contentService.getHomeContent();
  const collections: ContentKind[] = ["articles", "tools", "prompts", "tutorials", "models"];

  const urls = new Set<string>([
    createAbsoluteUrl("/"),
    createAbsoluteUrl("/articles/"),
    createAbsoluteUrl("/tools/"),
    createAbsoluteUrl("/prompts/"),
    createAbsoluteUrl("/tutorials/"),
    createAbsoluteUrl("/models/compare/"),
    createAbsoluteUrl("/models/"),
    createAbsoluteUrl("/categories/"),
    createAbsoluteUrl("/tags/"),
    createAbsoluteUrl("/authors/")
  ]);

  for (const category of getCategories(content)) {
    urls.add(createAbsoluteUrl(`/categories/${category.slug}/`));
  }

  for (const tag of getTags(content)) {
    urls.add(createAbsoluteUrl(`/tags/${tag.slug}/`));
  }

  for (const author of getAuthors(content)) {
    urls.add(createAbsoluteUrl(`/authors/${author.slug}/`));
  }

  for (const collection of collections) {
    for (const entry of getCollectionEntries(content, collection)) {
      urls.add(createAbsoluteUrl(`/${collection}/${entry.slug}/`));
    }
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from(urls)
  .sort()
  .map((url) => `  <url>\n    <loc>${url}</loc>\n  </url>`)
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
};
