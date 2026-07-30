import type { Core } from "@strapi/strapi";

type MediaAsset = {
  id?: number;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

type ContentReference = {
  id: number;
  name: string;
  slug: string;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
};

type Tag = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
};

type Author = {
  id: number;
  name: string;
  slug: string;
  avatar?: MediaAsset | null;
  bio?: string | null;
  websiteUrl?: string | null;
  xUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
};

type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: MediaAsset | null;
  body: string;
  category?: ContentReference | null;
  tags: ContentReference[];
  author?: ContentReference | null;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogImage?: MediaAsset | null;
  } | null;
};

type AiTool = {
  id: number;
  name: string;
  slug: string;
  logo?: MediaAsset | null;
  shortDescription: string;
  longDescription?: string | null;
  websiteUrl: string;
  pricingModel: "free" | "freemium" | "paid" | "enterprise";
  pricingSummary?: string | null;
  startingPrice?: string | null;
  billingPeriod?: string | null;
  freeTierAvailable?: boolean;
  pricingNotes?: string | null;
  pricingDefaultTab?: string | null;
  pricingTabs: Array<{
    id: string;
    label: string;
    description?: string | null;
    plans: Array<{
      name: string;
      description?: string | null;
      priceLabel: string;
      billingLabel?: string | null;
      badge?: string | null;
      ctaLabel?: string | null;
      ctaUrl?: string | null;
      highlights: string[];
      featured?: boolean;
    }>;
  }>;
  category?: ContentReference | null;
  tags: ContentReference[];
  pros: string[];
  cons: string[];
  featured: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogImage?: MediaAsset | null;
  } | null;
};

type AiModel = {
  id: number;
  name: string;
  slug: string;
  vendor: string;
  description?: string | null;
  contextWindow?: string | null;
  modalities: Array<"text" | "image" | "audio" | "video">;
  pricingSummary?: string | null;
  releaseDate?: string | null;
  docsUrl: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogImage?: MediaAsset | null;
  } | null;
};

type Prompt = {
  id: number;
  title: string;
  slug: string;
  promptText: string;
  useCaseDescription: string;
  category?: ContentReference | null;
  tags: ContentReference[];
  recommendedModels: ContentReference[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogImage?: MediaAsset | null;
  } | null;
};

type TutorialStep = {
  title: string;
  body: string;
  codeBlock?: string | null;
  image?: MediaAsset | null;
};

type Tutorial = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: MediaAsset | null;
  steps: TutorialStep[];
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  category?: ContentReference | null;
  tags: ContentReference[];
  author?: ContentReference | null;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogImage?: MediaAsset | null;
  } | null;
};

type SiteSettings = {
  siteTitle: string;
  tagline?: string | null;
  defaultSeoImage?: MediaAsset | null;
  socialLinks: Array<{ label: string; url: string }>;
  footerContent?: string | null;
};

type NewsletterEntry = {
  id: number;
  email: string;
  subscribedAt?: string | null;
  status: "pending" | "confirmed";
};

type SiteContent = {
  siteSettings: SiteSettings;
  categories: Category[];
  tags: Tag[];
  authors: Author[];
  articles: Article[];
  tools: AiTool[];
  prompts: Prompt[];
  tutorials: Tutorial[];
  models: AiModel[];
  newsletter: NewsletterEntry[];
};

type DocumentApi = {
  findMany: (params?: { status?: "draft" | "published"; populate?: Record<string, unknown> | string[]; sort?: string[]; fields?: string[]; locale?: string }) => Promise<any[]>;
};

const getStrapi = () => (globalThis as unknown as { strapi?: Core.Strapi }).strapi;

const asString = (value: unknown) => (typeof value === "string" ? value : "");

const asNullableString = (value: unknown) => (typeof value === "string" && value.trim().length > 0 ? value : null);

const asNumber = (value: unknown) => (typeof value === "number" ? value : undefined);

const asStringArray = (value: unknown) =>
  Array.isArray(value) ? value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean) : [];

const normalizeToolPricingTabs = (value: unknown): AiTool["pricingTabs"] =>
  Array.isArray(value)
    ? value
        .map((tab) => {
          if (!tab || typeof tab !== "object") {
            return null;
          }

          const item = tab as Record<string, unknown>;
          const id = asString(item.id).trim();
          const label = asString(item.label).trim();
          const plans = Array.isArray(item.plans)
            ? item.plans
                .map((plan) => {
                  if (!plan || typeof plan !== "object") {
                    return null;
                  }

                  const planItem = plan as Record<string, unknown>;
                  const name = asString(planItem.name).trim();
                  const priceLabel = asString(planItem.priceLabel).trim();

                  if (!name || !priceLabel) {
                    return null;
                  }

                  return {
                    name,
                    description: asNullableString(planItem.description),
                    priceLabel,
                    billingLabel: asNullableString(planItem.billingLabel),
                    badge: asNullableString(planItem.badge),
                    ctaLabel: asNullableString(planItem.ctaLabel),
                    ctaUrl: asNullableString(planItem.ctaUrl),
                    highlights: asStringArray(planItem.highlights),
                    featured: typeof planItem.featured === "boolean" ? planItem.featured : false
                  };
                })
                .filter((plan): plan is NonNullable<typeof plan> => plan !== null)
            : [];

          if (!id || !label || !plans.length) {
            return null;
          }

          return {
            id,
            label,
            description: asNullableString(item.description),
            plans
          };
        })
        .filter((tab): tab is NonNullable<typeof tab> => tab !== null)
    : [];

const mediaAsset = (value: any): MediaAsset | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  return {
    id: asNumber(value.id),
    url: asString(value.url),
    alt: asNullableString(value.alternativeText) ?? asNullableString(value.alt) ?? undefined,
    width: asNumber(value.width),
    height: asNumber(value.height)
  };
};

const reference = (value: any): ContentReference | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const name = asString(value.name) || asString(value.title);
  const slug = asString(value.slug);

  if (!name || !slug) {
    return null;
  }

  return {
    id: asNumber(value.id) ?? 0,
    name,
    slug
  };
};

const references = (items: any[] | null | undefined): ContentReference[] =>
  Array.isArray(items) ? items.map((item: any) => reference(item)).filter((item: ContentReference | null): item is ContentReference => Boolean(item)) : [];

const normalizeCategory = (entry: any): Category => ({
  id: asNumber(entry.id) ?? 0,
  name: asString(entry.name),
  slug: asString(entry.slug),
  description: asNullableString(entry.description)
});

const normalizeTag = (entry: any): Tag => ({
  id: asNumber(entry.id) ?? 0,
  name: asString(entry.name),
  slug: asString(entry.slug),
  description: asNullableString(entry.description)
});

const normalizeAuthor = (entry: any): Author => ({
  id: asNumber(entry.id) ?? 0,
  name: asString(entry.name),
  slug: asString(entry.slug),
  avatar: mediaAsset(entry.avatar),
  bio: asNullableString(entry.bio),
  websiteUrl: asNullableString(entry.websiteUrl),
  xUrl: asNullableString(entry.xUrl),
  githubUrl: asNullableString(entry.githubUrl),
  linkedinUrl: asNullableString(entry.linkedinUrl)
});

const normalizeArticle = (entry: any): Article => ({
  id: asNumber(entry.id) ?? 0,
  title: asString(entry.title),
  slug: asString(entry.slug),
  excerpt: asNullableString(entry.excerpt),
  coverImage: mediaAsset(entry.coverImage),
  body: asString(entry.body),
  category: reference(entry.category) ?? undefined,
  tags: references(entry.tags),
  author: reference(entry.author) ?? undefined,
  seo: entry.seo
    ? {
        metaTitle: asNullableString(entry.seo.metaTitle) ?? undefined,
        metaDescription: asNullableString(entry.seo.metaDescription) ?? undefined,
        canonicalUrl: asNullableString(entry.seo.canonicalUrl) ?? undefined,
        ogImage: mediaAsset(entry.seo.ogImage)
      }
    : null
});

const normalizeTool = (entry: any): AiTool => ({
  id: asNumber(entry.id) ?? 0,
  name: asString(entry.name),
  slug: asString(entry.slug),
  logo: mediaAsset(entry.logo),
  shortDescription: asString(entry.shortDescription),
  longDescription: asNullableString(entry.longDescription),
  websiteUrl: asString(entry.websiteUrl),
  pricingModel: asString(entry.pricingModel) as AiTool["pricingModel"],
  pricingSummary: asNullableString(entry.pricingSummary),
  startingPrice: asNullableString(entry.startingPrice),
  billingPeriod: asNullableString(entry.billingPeriod),
  freeTierAvailable: typeof entry.freeTierAvailable === "boolean" ? entry.freeTierAvailable : false,
  pricingNotes: asNullableString(entry.pricingNotes),
  pricingDefaultTab: asNullableString(entry.pricingDefaultTab),
  pricingTabs: normalizeToolPricingTabs(entry.pricingTabs),
  category: reference(entry.category) ?? undefined,
  tags: references(entry.tags),
  pros: Array.isArray(entry.pros) ? entry.pros.filter((item: unknown) => typeof item === "string") : [],
  cons: Array.isArray(entry.cons) ? entry.cons.filter((item: unknown) => typeof item === "string") : [],
  featured: Boolean(entry.featured),
  seo: entry.seo
    ? {
        metaTitle: asNullableString(entry.seo.metaTitle) ?? undefined,
        metaDescription: asNullableString(entry.seo.metaDescription) ?? undefined,
        canonicalUrl: asNullableString(entry.seo.canonicalUrl) ?? undefined,
        ogImage: mediaAsset(entry.seo.ogImage)
      }
    : null
});

const normalizeModel = (entry: any): AiModel => ({
  id: asNumber(entry.id) ?? 0,
  name: asString(entry.name),
  slug: asString(entry.slug),
  vendor: asString(entry.vendor),
  description: asNullableString(entry.description),
  contextWindow: asNullableString(entry.contextWindow),
  modalities: Array.isArray(entry.modalities) ? entry.modalities.filter((item: unknown) => typeof item === "string") : [],
  pricingSummary: asNullableString(entry.pricingSummary),
  releaseDate: asNullableString(entry.releaseDate),
  docsUrl: asString(entry.docsUrl),
  seo: entry.seo
    ? {
        metaTitle: asNullableString(entry.seo.metaTitle) ?? undefined,
        metaDescription: asNullableString(entry.seo.metaDescription) ?? undefined,
        canonicalUrl: asNullableString(entry.seo.canonicalUrl) ?? undefined,
        ogImage: mediaAsset(entry.seo.ogImage)
      }
    : null
});

const normalizePrompt = (entry: any): Prompt => ({
  id: asNumber(entry.id) ?? 0,
  title: asString(entry.title),
  slug: asString(entry.slug),
  promptText: asString(entry.promptText),
  useCaseDescription: asString(entry.useCaseDescription),
  category: reference(entry.category) ?? undefined,
  tags: references(entry.tags),
  recommendedModels: references(entry.recommendedModels),
  seo: entry.seo
    ? {
        metaTitle: asNullableString(entry.seo.metaTitle) ?? undefined,
        metaDescription: asNullableString(entry.seo.metaDescription) ?? undefined,
        canonicalUrl: asNullableString(entry.seo.canonicalUrl) ?? undefined,
        ogImage: mediaAsset(entry.seo.ogImage)
      }
    : null
});

const normalizeTutorial = (entry: any): Tutorial => ({
  id: asNumber(entry.id) ?? 0,
  title: asString(entry.title),
  slug: asString(entry.slug),
  excerpt: asNullableString(entry.excerpt),
  coverImage: mediaAsset(entry.coverImage),
  steps: Array.isArray(entry.steps)
    ? entry.steps.map((step: any) => ({
        title: asString(step.title),
        body: asString(step.body),
        codeBlock: asNullableString(step.codeBlock) ?? undefined,
        image: mediaAsset(step.image)
      })) as TutorialStep[]
    : [],
  difficulty: asString(entry.difficulty) as Tutorial["difficulty"],
  estimatedTime: asString(entry.estimatedTime),
  category: reference(entry.category) ?? undefined,
  tags: references(entry.tags),
  author: reference(entry.author) ?? undefined,
  seo: entry.seo
    ? {
        metaTitle: asNullableString(entry.seo.metaTitle) ?? undefined,
        metaDescription: asNullableString(entry.seo.metaDescription) ?? undefined,
        canonicalUrl: asNullableString(entry.seo.canonicalUrl) ?? undefined,
        ogImage: mediaAsset(entry.seo.ogImage)
      }
    : null
});

const normalizeSiteSettings = (entry: any): SiteSettings => ({
  siteTitle: asString(entry.siteTitle),
  tagline: asNullableString(entry.tagline),
  defaultSeoImage: mediaAsset(entry.defaultSeoImage),
  socialLinks: Array.isArray(entry.socialLinks)
    ? entry.socialLinks
        .map((link: any) => ({
          label: asString(link.label),
          url: asString(link.url)
        }))
        .filter((link: { label: string; url: string }) => Boolean(link.label) && Boolean(link.url))
    : [],
  footerContent: asNullableString(entry.footerContent)
});

const queryDocuments = async (strapi: Core.Strapi, uid: string, options: { status?: "draft" | "published"; populate?: Record<string, unknown> | string[]; sort?: string[]; fields?: string[] } = {}) => {
  const documentsApi = strapi.documents(uid as never) as unknown as DocumentApi;
  return documentsApi.findMany({
    status: options.status ?? "published",
    populate: options.populate,
    sort: options.sort,
    fields: options.fields
  });
};

const firstDocument = async (strapi: Core.Strapi, uid: string, options: { populate?: Record<string, unknown> | string[]; fields?: string[] } = {}) => {
  const documents = await queryDocuments(strapi, uid, options);
  return documents[0] ?? null;
};

export default {
  async index(ctx: any) {
    try {
      const strapi = getStrapi();

      if (!strapi) {
        throw new Error("Strapi runtime is not available");
      }

      const [siteSetting, categories, tags, authors, articles, tools, prompts, tutorials, models, newsletter] = await Promise.all([
        firstDocument(strapi, "api::site-setting.site-setting", {
          fields: ["siteTitle", "tagline", "socialLinks", "footerContent"],
          populate: { defaultSeoImage: true }
        }),
        queryDocuments(strapi, "api::category.category", { fields: ["name", "slug", "description"] }),
        queryDocuments(strapi, "api::tag.tag", { fields: ["name", "slug", "description"] }),
        queryDocuments(strapi, "api::author.author", { populate: { avatar: true }, sort: ["name:asc"] }),
        queryDocuments(strapi, "api::article.article", {
          populate: { coverImage: true, category: { fields: ["name", "slug"] }, tags: { fields: ["name", "slug"] }, author: { fields: ["name", "slug"] }, seo: { populate: "*" } },
          sort: ["publishedAt:desc", "title:asc"]
        }),
        queryDocuments(strapi, "api::ai-tool.ai-tool", {
          populate: { logo: true, category: { fields: ["name", "slug"] }, tags: { fields: ["name", "slug"] }, seo: { populate: "*" } },
          sort: ["featured:desc", "name:asc"]
        }),
        queryDocuments(strapi, "api::prompt.prompt", {
          populate: { category: { fields: ["name", "slug"] }, tags: { fields: ["name", "slug"] }, recommendedModels: { fields: ["name", "slug"] }, seo: { populate: "*" } },
          sort: ["title:asc"]
        }),
        queryDocuments(strapi, "api::tutorial.tutorial", {
          populate: { coverImage: true, category: { fields: ["name", "slug"] }, tags: { fields: ["name", "slug"] }, author: { fields: ["name", "slug"] }, seo: { populate: "*" } },
          sort: ["title:asc"]
        }),
        queryDocuments(strapi, "api::ai-model.ai-model", { populate: { seo: { populate: "*" } }, sort: ["name:asc"] }),
        queryDocuments(strapi, "api::newsletter.newsletter", { fields: ["email", "subscribedAt", "status"], sort: ["subscribedAt:desc"] })
      ]);

      const payload: SiteContent = {
        siteSettings: siteSetting ? normalizeSiteSettings(siteSetting) : {
          siteTitle: "JelajahAI",
          tagline: null,
          defaultSeoImage: null,
          socialLinks: [],
          footerContent: null
        },
        categories: categories.map(normalizeCategory),
        tags: tags.map(normalizeTag),
        authors: authors.map(normalizeAuthor),
        articles: articles.map(normalizeArticle),
        tools: tools.map(normalizeTool),
        prompts: prompts.map(normalizePrompt),
        tutorials: tutorials.map(normalizeTutorial),
        models: models.map(normalizeModel),
        newsletter: newsletter.map((entry) => ({
          id: asNumber(entry.id) ?? 0,
          email: asString(entry.email),
          subscribedAt: asNullableString(entry.subscribedAt),
          status: asString(entry.status) === "confirmed" ? "confirmed" : "pending"
        }))
      };

      ctx.body = {
        ok: true,
        ...payload
      };
    } catch (error) {
      console.error("[site-content]", error);
      ctx.status = 500;
      ctx.body = {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to load site content"
      };
    }
  }
};
