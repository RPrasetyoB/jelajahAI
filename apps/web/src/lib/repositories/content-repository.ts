import type { HomeContent, ContentKind } from "../content-types";
import { sampleContent } from "@jelajahai/utils";
import { strapiClient } from "../api/strapi-client";

const getLocalContent = (): HomeContent => sampleContent;

export const contentRepository = {
  async getHomeContent() {
    if (!strapiClient.isConfigured()) {
      return getLocalContent();
    }

    try {
      const payload = await strapiClient.fetchSiteContent();

      if (!payload || !payload.ok) {
        return getLocalContent();
      }

      return {
        siteSettings: (payload.siteSettings as HomeContent["siteSettings"]) ?? sampleContent.siteSettings,
        categories: (payload.categories as HomeContent["categories"]) ?? sampleContent.categories,
        tags: (payload.tags as HomeContent["tags"]) ?? sampleContent.tags,
        authors: (payload.authors as HomeContent["authors"]) ?? sampleContent.authors,
        articles: (payload.articles as HomeContent["articles"]) ?? sampleContent.articles,
        tools: (payload.tools as HomeContent["tools"]) ?? sampleContent.tools,
        prompts: (payload.prompts as HomeContent["prompts"]) ?? sampleContent.prompts,
        tutorials: (payload.tutorials as HomeContent["tutorials"]) ?? sampleContent.tutorials,
        models: (payload.models as HomeContent["models"]) ?? sampleContent.models,
        newsletter: (payload.newsletter as HomeContent["newsletter"]) ?? sampleContent.newsletter
      };
    } catch {
      return getLocalContent();
    }
  },

  async getCollection(kind: ContentKind) {
    const content = await contentRepository.getHomeContent();
    return content[kind];
  }
};
