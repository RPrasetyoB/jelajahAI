import {
  generateArticleDraft,
  publishGeneratedDraft,
  type GenerateArticleInput,
  type GeneratedArticle,
  type StudioContentType
} from "../services/ai-content";

type AiContentRequest = {
  contentType?: unknown;
  mode?: unknown;
  useLatestWebUpdates?: unknown;
  brief?: unknown;
  topic?: unknown;
  audience?: unknown;
  style?: unknown;
  length?: unknown;
  tone?: unknown;
  sourceSlug?: unknown;
  sourceTitle?: unknown;
  sourceExcerpt?: unknown;
  sourceContent?: unknown;
  sourceDocumentId?: unknown;
  categorySlug?: unknown;
  tagSlugs?: unknown;
  authorSlug?: unknown;
  recommendedModelSlugs?: unknown;
  saveDraft?: unknown;
};

type AiContentPublishRequest = {
  draft?: unknown;
  sourceDocumentId?: unknown;
  sourceSlug?: unknown;
  sourceTitle?: unknown;
};

type StudioOption = {
  slug: string;
  name: string;
};

type StudioEntryOption = {
  contentType: StudioContentType;
  documentId: string;
  slug: string;
  title: string;
  excerpt: string;
  sourceContent: string;
  categorySlug?: string;
  tagSlugs: string[];
  authorSlug?: string;
  recommendedModelSlugs: string[];
};

type DocumentApi = {
  findMany: (params?: {
    status?: "draft" | "published";
    populate?: Record<string, unknown> | string[];
    fields?: string[];
  }) => Promise<Array<Record<string, unknown>>>;
};

const getStrapi = () => (globalThis as unknown as { strapi?: any }).strapi;

const asString = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const asBoolean = (value: unknown) => value === true || value === "true" || value === 1 || value === "1";

const asStringArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((entry) => asString(entry)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
};

const allowedAudience = new Set<GenerateArticleInput["audience"]>(["beginner", "intermediate", "advanced"]);
const allowedStyle = new Set<GenerateArticleInput["style"]>(["guide", "tutorial", "comparison", "news", "case-study"]);
const allowedLength = new Set<GenerateArticleInput["length"]>(["short", "medium", "long"]);
const allowedMode = new Set<NonNullable<GenerateArticleInput["mode"]>>(["create", "seo", "improve"]);
const allowedContentTypes = new Set<StudioContentType>(["article", "tutorial", "prompt", "aiTool", "aiModel"]);

const getErrorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

const getErrorStatus = (error: unknown) => {
  const statusCode = typeof error === "object" && error && "statusCode" in error ? Number((error as { statusCode?: unknown }).statusCode) : NaN;

  if (Number.isFinite(statusCode) && statusCode >= 400) {
    return statusCode;
  }

  const message = getErrorMessage(error, "");

  if (/could not be resolved/i.test(message)) {
    return 400;
  }

  if (/quota|resource_exhausted|rate limit|too many requests/i.test(message)) {
    return 429;
  }

  if (/high demand|try again later|temporar|unavailable|overloaded/i.test(message)) {
    return 503;
  }

  return 500;
};

const ensureStudioAccess = (ctx: any) => {
  const requiredKey = process.env.AI_STUDIO_KEY?.trim();

  if (!requiredKey) {
    return;
  }

  const providedKey = asString(ctx.get("x-ai-studio-key"));

  if (!providedKey || providedKey !== requiredKey) {
    throw new Error("Invalid AI studio key");
  }
};

const getPublishedOptions = async (strapi: any, uid: string) => {
  const documentsApi = strapi.documents(uid) as unknown as DocumentApi;
  const entries = await documentsApi.findMany({ status: "published" });

  return entries
    .map((entry) => ({
      slug: asString(entry.slug),
      name: asString(entry.name) || asString(entry.title)
    }))
    .filter((entry: StudioOption) => Boolean(entry.slug) && Boolean(entry.name))
    .sort((left: StudioOption, right: StudioOption) => left.name.localeCompare(right.name));
};

const toTagSlugs = (value: unknown) =>
  Array.isArray(value)
    ? value.map((item) => (typeof item === "object" && item ? asString((item as { slug?: unknown }).slug) : "")).filter(Boolean)
    : [];

const toStepText = (value: unknown) =>
  Array.isArray(value)
    ? value
        .map((step, index) => {
          const title = typeof step === "object" && step ? asString((step as { title?: unknown }).title) : "";
          const body = typeof step === "object" && step ? asString((step as { body?: unknown }).body) : "";
          const codeBlock = typeof step === "object" && step ? asString((step as { codeBlock?: unknown }).codeBlock) : "";
          return [title ? `Step ${index + 1}: ${title}` : "", body, codeBlock ? `Code:\n${codeBlock}` : ""].filter(Boolean).join("\n\n");
        })
        .filter(Boolean)
        .join("\n\n")
    : "";

const toPricingTabsText = (value: unknown) =>
  Array.isArray(value)
    ? value
        .map((tab) => {
          if (!tab || typeof tab !== "object") {
            return "";
          }

          const item = tab as Record<string, unknown>;
          const label = asString(item.label);
          const description = asString(item.description);
          const plans = Array.isArray(item.plans)
            ? item.plans
                .map((plan) => {
                  if (!plan || typeof plan !== "object") {
                    return "";
                  }

                  const planItem = plan as Record<string, unknown>;
                  const highlights = Array.isArray(planItem.highlights)
                    ? planItem.highlights.map((highlight) => asString(highlight)).filter(Boolean).join(", ")
                    : "";

                  return [
                    `Plan: ${asString(planItem.name)}`,
                    asString(planItem.description) ? `Description: ${asString(planItem.description)}` : "",
                    asString(planItem.priceLabel) ? `Price: ${asString(planItem.priceLabel)}` : "",
                    asString(planItem.billingLabel) ? `Billing: ${asString(planItem.billingLabel)}` : "",
                    asString(planItem.badge) ? `Badge: ${asString(planItem.badge)}` : "",
                    asString(planItem.ctaLabel) ? `CTA: ${asString(planItem.ctaLabel)}` : "",
                    highlights ? `Highlights: ${highlights}` : "",
                    typeof planItem.featured === "boolean" ? `Featured: ${planItem.featured ? "yes" : "no"}` : ""
                  ]
                    .filter(Boolean)
                    .join("\n");
                })
                .filter(Boolean)
                .join("\n\n")
            : "";

          return [
            label ? `Pricing tab: ${label}` : "",
            description ? `Tab description: ${description}` : "",
            plans
          ]
            .filter(Boolean)
            .join("\n");
        })
        .filter(Boolean)
        .join("\n\n")
    : "";

const getPublishedEntries = async (strapi: any) => {
  const [articles, tutorials, prompts, tools, models] = await Promise.all([
    (strapi.documents("api::article.article") as unknown as DocumentApi).findMany({
      status: "published",
      populate: { category: { fields: ["slug"] }, tags: { fields: ["slug"] }, author: { fields: ["slug"] } }
    }),
    (strapi.documents("api::tutorial.tutorial") as unknown as DocumentApi).findMany({
      status: "published",
      populate: { category: { fields: ["slug"] }, tags: { fields: ["slug"] }, author: { fields: ["slug"] }, steps: true }
    }),
    (strapi.documents("api::prompt.prompt") as unknown as DocumentApi).findMany({
      status: "published",
      populate: { category: { fields: ["slug"] }, tags: { fields: ["slug"] }, recommendedModels: { fields: ["slug"] } }
    }),
    (strapi.documents("api::ai-tool.ai-tool") as unknown as DocumentApi).findMany({
      status: "published",
      populate: { category: { fields: ["slug"] }, tags: { fields: ["slug"] } }
    }),
    (strapi.documents("api::ai-model.ai-model") as unknown as DocumentApi).findMany({ status: "published" })
  ]);

  const articleEntries: StudioEntryOption[] = articles
    .map((entry) => ({
      contentType: "article" as const,
      documentId: asString(entry.documentId),
      slug: asString(entry.slug),
      title: asString(entry.title),
      excerpt: asString(entry.excerpt),
      sourceContent: asString(entry.body),
      categorySlug: entry.category && typeof entry.category === "object" ? asString((entry.category as { slug?: unknown }).slug) : undefined,
      tagSlugs: toTagSlugs(entry.tags),
      authorSlug: entry.author && typeof entry.author === "object" ? asString((entry.author as { slug?: unknown }).slug) : undefined,
      recommendedModelSlugs: []
    }))
    .filter((entry) => entry.documentId && entry.slug && entry.title);

  const tutorialEntries: StudioEntryOption[] = tutorials
    .map((entry) => ({
      contentType: "tutorial" as const,
      documentId: asString(entry.documentId),
      slug: asString(entry.slug),
      title: asString(entry.title),
      excerpt: asString(entry.excerpt),
      sourceContent: toStepText(entry.steps),
      categorySlug: entry.category && typeof entry.category === "object" ? asString((entry.category as { slug?: unknown }).slug) : undefined,
      tagSlugs: toTagSlugs(entry.tags),
      authorSlug: entry.author && typeof entry.author === "object" ? asString((entry.author as { slug?: unknown }).slug) : undefined,
      recommendedModelSlugs: []
    }))
    .filter((entry) => entry.documentId && entry.slug && entry.title);

  const promptEntries: StudioEntryOption[] = prompts
    .map((entry) => ({
      contentType: "prompt" as const,
      documentId: asString(entry.documentId),
      slug: asString(entry.slug),
      title: asString(entry.title),
      excerpt: asString(entry.useCaseDescription),
      sourceContent: `Prompt:\n${asString(entry.promptText)}\n\nUse case:\n${asString(entry.useCaseDescription)}`,
      categorySlug: entry.category && typeof entry.category === "object" ? asString((entry.category as { slug?: unknown }).slug) : undefined,
      tagSlugs: toTagSlugs(entry.tags),
      recommendedModelSlugs:
        Array.isArray(entry.recommendedModels)
          ? entry.recommendedModels
              .map((item) => (typeof item === "object" && item ? asString((item as { slug?: unknown }).slug) : ""))
              .filter(Boolean)
          : []
    }))
    .filter((entry) => entry.documentId && entry.slug && entry.title);

  const toolEntries: StudioEntryOption[] = tools
    .map((entry) => ({
      contentType: "aiTool" as const,
      documentId: asString(entry.documentId),
      slug: asString(entry.slug),
      title: asString(entry.name),
      excerpt: asString(entry.shortDescription),
      sourceContent: [
        `Short description: ${asString(entry.shortDescription)}`,
        asString(entry.longDescription) ? `Long description:\n${asString(entry.longDescription)}` : "",
        asString(entry.websiteUrl) ? `Website: ${asString(entry.websiteUrl)}` : "",
        asString(entry.pricingModel) ? `Pricing: ${asString(entry.pricingModel)}` : "",
        asString(entry.pricingSummary) ? `Pricing summary:\n${asString(entry.pricingSummary)}` : "",
        asString(entry.startingPrice) ? `Starting price: ${asString(entry.startingPrice)}` : "",
        asString(entry.billingPeriod) ? `Billing period: ${asString(entry.billingPeriod)}` : "",
        typeof entry.freeTierAvailable === "boolean" ? `Free tier available: ${entry.freeTierAvailable ? "yes" : "no"}` : "",
        asString(entry.pricingNotes) ? `Pricing notes:\n${asString(entry.pricingNotes)}` : "",
        asString(entry.pricingDefaultTab) ? `Default pricing tab: ${asString(entry.pricingDefaultTab)}` : "",
        toPricingTabsText(entry.pricingTabs),
        Array.isArray(entry.pros) && entry.pros.length ? `Pros: ${entry.pros.join(", ")}` : "",
        Array.isArray(entry.cons) && entry.cons.length ? `Cons: ${entry.cons.join(", ")}` : ""
      ]
        .filter(Boolean)
        .join("\n\n"),
      categorySlug: entry.category && typeof entry.category === "object" ? asString((entry.category as { slug?: unknown }).slug) : undefined,
      tagSlugs: toTagSlugs(entry.tags),
      recommendedModelSlugs: []
    }))
    .filter((entry) => entry.documentId && entry.slug && entry.title);

  const modelEntries: StudioEntryOption[] = models
    .map((entry) => ({
      contentType: "aiModel" as const,
      documentId: asString(entry.documentId),
      slug: asString(entry.slug),
      title: asString(entry.name),
      excerpt: asString(entry.description) || asString(entry.vendor),
      sourceContent: [
        asString(entry.vendor) ? `Vendor: ${asString(entry.vendor)}` : "",
        asString(entry.description) ? `Description:\n${asString(entry.description)}` : "",
        asString(entry.contextWindow) ? `Context window: ${asString(entry.contextWindow)}` : "",
        Array.isArray(entry.modalities) && entry.modalities.length ? `Modalities: ${entry.modalities.join(", ")}` : "",
        asString(entry.pricingSummary) ? `Pricing: ${asString(entry.pricingSummary)}` : "",
        asString(entry.releaseDate) ? `Release date: ${asString(entry.releaseDate)}` : "",
        asString(entry.docsUrl) ? `Docs: ${asString(entry.docsUrl)}` : ""
      ]
        .filter(Boolean)
        .join("\n\n"),
      tagSlugs: [],
      recommendedModelSlugs: []
    }))
    .filter((entry) => entry.documentId && entry.slug && entry.title);

  return [...articleEntries, ...tutorialEntries, ...promptEntries, ...toolEntries, ...modelEntries].sort((left, right) =>
    left.title.localeCompare(right.title)
  );
};

const isGeneratedDraft = (value: unknown): value is GeneratedArticle => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as Record<string, unknown>;
  const contentType = asString(draft.contentType) as StudioContentType;

  if (!allowedContentTypes.has(contentType)) {
    return false;
  }

  if (typeof draft.slug !== "string" || typeof draft.seoTitle !== "string" || typeof draft.seoDescription !== "string") {
    return false;
  }

  if (contentType === "article") {
    return typeof draft.title === "string" && typeof draft.excerpt === "string" && typeof draft.bodyMarkdown === "string";
  }

  if (contentType === "tutorial") {
    return typeof draft.title === "string" && Array.isArray(draft.steps) && typeof draft.estimatedTime === "string";
  }

  if (contentType === "prompt") {
    return typeof draft.title === "string" && typeof draft.promptText === "string" && typeof draft.useCaseDescription === "string";
  }

  if (contentType === "aiTool") {
    return typeof draft.name === "string" && typeof draft.shortDescription === "string" && typeof draft.websiteUrl === "string";
  }

  return typeof draft.name === "string" && typeof draft.vendor === "string" && typeof draft.docsUrl === "string";
};

export default {
  async options(ctx: any) {
    try {
      const strapi = getStrapi();

      if (!strapi) {
        throw new Error("Strapi runtime is not available");
      }

      const [categories, tags, authors, models, entries] = await Promise.all([
        getPublishedOptions(strapi, "api::category.category"),
        getPublishedOptions(strapi, "api::tag.tag"),
        getPublishedOptions(strapi, "api::author.author"),
        getPublishedOptions(strapi, "api::ai-model.ai-model"),
        getPublishedEntries(strapi)
      ]);

      ctx.body = {
        ok: true,
        categories,
        tags,
        authors,
        models,
        entries
      };
    } catch (error) {
      const message = getErrorMessage(error, "Unable to load options");
      console.error("[ai-content/options]", error);
      ctx.status = 500;
      ctx.body = {
        ok: false,
        message
      };
    }
  },

  async generate(ctx: any) {
    const body = (ctx.request.body ?? {}) as AiContentRequest;
    const contentType = asString(body.contentType) as StudioContentType;
    const mode = asString(body.mode) as GenerateArticleInput["mode"];
    const useLatestWebUpdates = body.useLatestWebUpdates === undefined ? undefined : asBoolean(body.useLatestWebUpdates);
    const brief = asString(body.brief);
    const topic = asString(body.topic);
    const audience = asString(body.audience) as GenerateArticleInput["audience"];
    const style = asString(body.style) as GenerateArticleInput["style"];
    const length = asString(body.length) as GenerateArticleInput["length"];
    const tone = asString(body.tone);
    const sourceSlug = asString(body.sourceSlug);
    const sourceTitle = asString(body.sourceTitle);
    const sourceExcerpt = asString(body.sourceExcerpt);
    const sourceContent = asString(body.sourceContent);
    const sourceDocumentId = asString(body.sourceDocumentId);
    const categorySlug = asString(body.categorySlug) || null;
    const tagSlugs = asStringArray(body.tagSlugs);
    const authorSlug = asString(body.authorSlug) || null;
    const recommendedModelSlugs = asStringArray(body.recommendedModelSlugs);
    const saveDraft = asBoolean(body.saveDraft);

    if (!allowedContentTypes.has(contentType)) {
      return ctx.badRequest("Content type must be article, tutorial, prompt, aiTool, or aiModel");
    }

    if (mode && !allowedMode.has(mode)) {
      return ctx.badRequest("Mode must be create, seo, or improve");
    }

    if (!brief && !topic && !sourceContent) {
      return ctx.badRequest("Topic is required");
    }

    if (!brief && mode !== "improve") {
      if (!allowedAudience.has(audience)) {
        return ctx.badRequest("Audience must be beginner, intermediate, or advanced");
      }

      if (!allowedStyle.has(style)) {
        return ctx.badRequest("Style must be guide, tutorial, comparison, news, or case-study");
      }

      if (!allowedLength.has(length)) {
        return ctx.badRequest("Length must be short, medium, or long");
      }

      if (!tone) {
        return ctx.badRequest("Tone is required");
      }
    }

    try {
      ensureStudioAccess(ctx);
    } catch (error) {
      return ctx.unauthorized(getErrorMessage(error, "Invalid AI studio key"));
    }

    const strapi = getStrapi();

    if (!strapi) {
      return ctx.internalServerError("Strapi runtime is not available");
    }

    try {
      const result = await generateArticleDraft(strapi, {
        contentType,
        mode: mode || "create",
        useLatestWebUpdates,
        brief: brief || undefined,
        topic,
        audience,
        style,
        length,
        tone,
        sourceSlug: sourceSlug || undefined,
        sourceTitle: sourceTitle || undefined,
        sourceExcerpt: sourceExcerpt || undefined,
        sourceContent: sourceContent || undefined,
        sourceDocumentId: sourceDocumentId || undefined,
        categorySlug,
        tagSlugs,
        authorSlug,
        recommendedModelSlugs,
        saveDraft
      });

      ctx.body = {
        ok: true,
        ...result
      };
    } catch (error) {
      const message = getErrorMessage(error, "AI generation failed");
      const status = getErrorStatus(error);
      console.error("[ai-content/generate]", error);
      ctx.status = status;
      ctx.body = {
        ok: false,
        message
      };
    }
  },

  async publish(ctx: any) {
    const body = (ctx.request.body ?? {}) as AiContentPublishRequest;
    const draft = body.draft;
    const sourceDocumentId = asString(body.sourceDocumentId) || undefined;
    const sourceSlug = asString(body.sourceSlug) || undefined;
    const sourceTitle = asString(body.sourceTitle) || undefined;

    if (!isGeneratedDraft(draft)) {
      return ctx.badRequest("Draft is required");
    }

    try {
      ensureStudioAccess(ctx);
    } catch (error) {
      return ctx.unauthorized(getErrorMessage(error, "Invalid AI studio key"));
    }

    const strapi = getStrapi();

    if (!strapi) {
      return ctx.internalServerError("Strapi runtime is not available");
    }

    try {
      const result = await publishGeneratedDraft(strapi, {
        draft,
        sourceDocumentId,
        sourceSlug,
        sourceTitle
      });

      ctx.body = {
        ok: true,
        ...result
      };
    } catch (error) {
      const message = getErrorMessage(error, "Publish failed");
      const status = getErrorStatus(error);
      console.error("[ai-content/publish]", error);
      ctx.status = status;
      ctx.body = {
        ok: false,
        message
      };
    }
  }
};
