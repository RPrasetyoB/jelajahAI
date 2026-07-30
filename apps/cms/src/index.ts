import type { Core } from "@strapi/strapi";
import { sampleContent } from "@jelajahai/utils";

type SeedDocument = {
  documentId: string;
  slug?: string;
  name?: string;
  title?: string;
};

type DocumentApi = {
  findMany: (params?: { status?: "draft" | "published" }) => Promise<SeedDocument[]>;
  create: (params: { data: Record<string, unknown>; status?: "draft" | "published" }) => Promise<SeedDocument>;
};

type Sluggable = {
  slug: string;
};

const bySlug = (documents: SeedDocument[], slug: string) =>
  documents.find((document) => document.slug === slug);

const loadExistingDocuments = async (documentsApi: DocumentApi) => {
  const [published, draft] = await Promise.all([
    documentsApi.findMany({ status: "published" }),
    documentsApi.findMany({ status: "draft" })
  ]);

  const merged = new Map<string, SeedDocument>();

  for (const document of [...published, ...draft]) {
    const key = document.slug ?? document.name ?? document.title ?? document.documentId;
    merged.set(key, document);
  }

  return Array.from(merged.values());
};

const withoutId = (item: Record<string, unknown>) => {
  const { id: _id, ...rest } = item;
  return rest;
};

const syncCollection = async <T extends Sluggable>(documentsApi: DocumentApi, items: T[]) => {
  const existing = await loadExistingDocuments(documentsApi);

  const synced = await Promise.all(
    items.map(async (item) => {
      const current = bySlug(existing, item.slug);

      if (current) {
        return current;
      }

      return documentsApi.create({
        data: withoutId(item as Record<string, unknown>) as never,
        status: "published"
      });
    })
  );

  return synced;
};

const connectDocuments = (documents: SeedDocument[]) => ({
  connect: documents.map((document) => ({ documentId: document.documentId }))
});

const publishEntry = async <T extends Sluggable>(strapi: Core.Strapi, uid: string, data: T) => {
  const documentsApi = strapi.documents(uid as never) as unknown as DocumentApi;
  const existing = await loadExistingDocuments(documentsApi);
  const slug = String(data.slug ?? "");
  const found = bySlug(existing, slug);

  if (found) {
    return found;
  }

  return documentsApi.create({
    data: withoutId(data as Record<string, unknown>) as never,
    status: "published"
  });
};

const publishSingleton = async <T extends object>(strapi: Core.Strapi, uid: string, data: T) => {
  const documentsApi = strapi.documents(uid as never) as unknown as DocumentApi;
  const existing = await loadExistingDocuments(documentsApi);

  if (existing.length > 0) {
    return existing[0];
  }

  return documentsApi.create({
    data: withoutId(data as Record<string, unknown>) as never,
    status: "published"
  });
};

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const categoryApi = strapi.documents("api::category.category") as unknown as DocumentApi;
    const tagApi = strapi.documents("api::tag.tag") as unknown as DocumentApi;
    const authorApi = strapi.documents("api::author.author") as unknown as DocumentApi;
    const modelApi = strapi.documents("api::ai-model.ai-model") as unknown as DocumentApi;

    const categories = await syncCollection(categoryApi, sampleContent.categories);
    const tags = await syncCollection(tagApi, sampleContent.tags);
    const authors = await syncCollection(authorApi, sampleContent.authors);
    const models = await syncCollection(modelApi, sampleContent.models);

    const categoryBySlug = new Map(categories.map((entry) => [entry.slug ?? "", entry]));
    const tagBySlug = new Map(tags.map((entry) => [entry.slug ?? "", entry]));
    const authorBySlug = new Map(authors.map((entry) => [entry.slug ?? "", entry]));
    const modelBySlug = new Map(models.map((entry) => [entry.slug ?? "", entry]));

    for (const article of sampleContent.articles) {
      await publishEntry(strapi, "api::article.article", {
        ...article,
        category: article.category ? categoryBySlug.get(article.category.slug)?.documentId : null,
        author: article.author ? authorBySlug.get(article.author.slug)?.documentId : null,
        tags: {
          connect: article.tags
            .map((tag) => tagBySlug.get(tag.slug)?.documentId)
            .filter((documentId): documentId is string => Boolean(documentId))
            .map((documentId) => ({ documentId }))
        }
      });
    }

    for (const tool of sampleContent.tools) {
      await publishEntry(strapi, "api::ai-tool.ai-tool", {
        ...tool,
        category: tool.category ? categoryBySlug.get(tool.category.slug)?.documentId : null,
        tags: {
          connect: tool.tags
            .map((tag) => tagBySlug.get(tag.slug)?.documentId)
            .filter((documentId): documentId is string => Boolean(documentId))
            .map((documentId) => ({ documentId }))
        }
      });
    }

    for (const prompt of sampleContent.prompts) {
      await publishEntry(strapi, "api::prompt.prompt", {
        ...prompt,
        category: prompt.category ? categoryBySlug.get(prompt.category.slug)?.documentId : null,
        tags: {
          connect: prompt.tags
            .map((tag) => tagBySlug.get(tag.slug)?.documentId)
            .filter((documentId): documentId is string => Boolean(documentId))
            .map((documentId) => ({ documentId }))
        },
        recommendedModels: {
          connect: prompt.recommendedModels
            .map((model) => modelBySlug.get(model.slug)?.documentId)
            .filter((documentId): documentId is string => Boolean(documentId))
            .map((documentId) => ({ documentId }))
        }
      });
    }

    for (const tutorial of sampleContent.tutorials) {
      await publishEntry(strapi, "api::tutorial.tutorial", {
        ...tutorial,
        category: tutorial.category ? categoryBySlug.get(tutorial.category.slug)?.documentId : null,
        author: tutorial.author ? authorBySlug.get(tutorial.author.slug)?.documentId : null,
        tags: {
          connect: tutorial.tags
            .map((tag) => tagBySlug.get(tag.slug)?.documentId)
            .filter((documentId): documentId is string => Boolean(documentId))
            .map((documentId) => ({ documentId }))
        }
      });
    }

    await publishSingleton(strapi, "api::site-setting.site-setting", sampleContent.siteSettings);
  }
};
