import type { Core } from "@strapi/strapi";

type StudioContentType = "article" | "tutorial" | "prompt" | "aiTool" | "aiModel";
type GenerationMode = "create" | "seo" | "improve";
type Audience = "beginner" | "intermediate" | "advanced";
type ContentStyle = "guide" | "tutorial" | "comparison" | "news" | "case-study";
type ContentLength = "short" | "medium" | "long";
type PricingModel = "free" | "freemium" | "paid" | "enterprise";
type TutorialDifficulty = "beginner" | "intermediate" | "advanced";

type GenerateArticleInput = {
  contentType: StudioContentType;
  mode?: GenerationMode;
  useLatestWebUpdates?: boolean;
  brief?: string;
  topic: string;
  audience: Audience;
  style: ContentStyle;
  length: ContentLength;
  tone: string;
  sourceSlug?: string;
  sourceTitle?: string;
  sourceExcerpt?: string;
  sourceContent?: string;
  sourceDocumentId?: string;
  categorySlug?: string | null;
  tagSlugs?: string[];
  authorSlug?: string | null;
  recommendedModelSlugs?: string[];
  saveDraft?: boolean;
};

type ArticlePlan = {
  topic: string;
  audience: Audience;
  style: ContentStyle;
  length: ContentLength;
  tone: string;
  categorySlug?: string | null;
  tagSlugs: string[];
};

type GeminiTextPart = {
  text?: string;
};

type GeminiCandidate = {
  content?: {
    parts?: GeminiTextPart[];
  };
};

type GeminiResponse = {
  candidates?: GeminiCandidate[];
  error?: {
    message?: string;
  };
};

type GeminiRequestError = Error & {
  statusCode?: number;
  retryable?: boolean;
};

type GeminiModelExecution = {
  requestedModel: string;
  usedModel: string;
  fallbackUsed: boolean;
  attemptedModels: string[];
};

type WebUpdateExecution = {
  requested: boolean;
  used: boolean;
  fallbackReason?: string;
};

type BaseDraft = {
  contentType: StudioContentType;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  categorySlug?: string | null;
  tagSlugs: string[];
  sourceDocumentId?: string;
  sourceSlug?: string;
};

type ArticleDraft = BaseDraft & {
  contentType: "article";
  title: string;
  excerpt: string;
  bodyMarkdown: string;
  authorSlug?: string | null;
  outline: string[];
  faqs: Array<{
    question: string;
    answer: string;
  }>;
};

type TutorialDraft = BaseDraft & {
  contentType: "tutorial";
  title: string;
  excerpt: string;
  difficulty: TutorialDifficulty;
  estimatedTime: string;
  authorSlug?: string | null;
  steps: Array<{
    title: string;
    body: string;
    codeBlock?: string;
  }>;
  outline: string[];
};

type PromptDraft = BaseDraft & {
  contentType: "prompt";
  title: string;
  promptText: string;
  useCaseDescription: string;
  recommendedModelSlugs: string[];
};

type ToolPricingPlan = {
  name: string;
  description: string;
  priceLabel: string;
  billingLabel: string;
  badge: string;
  ctaLabel: string;
  ctaUrl: string;
  highlights: string[];
  featured: boolean;
};

type ToolPricingTab = {
  id: string;
  label: string;
  description: string;
  plans: ToolPricingPlan[];
};

type AiToolDraft = BaseDraft & {
  contentType: "aiTool";
  name: string;
  shortDescription: string;
  longDescription: string;
  websiteUrl: string;
  pricingModel: PricingModel;
  pricingSummary: string;
  startingPrice: string;
  billingPeriod: string;
  freeTierAvailable: boolean;
  pricingNotes: string;
  pricingDefaultTab: string;
  pricingTabs: ToolPricingTab[];
  pros: string[];
  cons: string[];
  featured: boolean;
};

type AiModelDraft = BaseDraft & {
  contentType: "aiModel";
  name: string;
  vendor: string;
  description: string;
  contextWindow: string;
  modalities: string[];
  pricingSummary: string;
  releaseDate: string;
  docsUrl: string;
};

type GeneratedArticle = ArticleDraft | TutorialDraft | PromptDraft | AiToolDraft | AiModelDraft;

type SeedDocument = {
  documentId: string;
  slug?: string;
  name?: string;
  title?: string;
};

type DocumentApi = {
  findMany: (params?: { status?: "draft" | "published"; populate?: Record<string, unknown> | string[]; fields?: string[] }) => Promise<any[]>;
  create: (params: { data: Record<string, unknown>; status?: "draft" | "published" }) => Promise<SeedDocument>;
  update: (params: { documentId: string; data: Record<string, unknown>; status?: "draft" | "published" }) => Promise<SeedDocument>;
};

type SaveGeneratedArticleInput = {
  draft: GeneratedArticle;
  status?: "draft" | "published";
  sourceDocumentId?: string;
  sourceSlug?: string;
  sourceTitle?: string;
};

type LookupEntry = {
  documentId: string;
  slug?: string;
};

const GEMINI_STANDARD_PRIMARY_MODEL = "gemini-3.5-flash-lite";
const GEMINI_TOOL_JSON_PRIMARY_MODEL = "gemini-3.5-flash-lite";
const GEMINI_STANDARD_FALLBACK_MODELS = ["gemini-3.6-flash", "gemini-3.5-flash"] as const;
const GEMINI_TOOL_JSON_FALLBACK_MODELS = ["gemini-3.6-flash", "gemini-3.5-flash"] as const;
const GEMINI_MAX_RETRIES = 3;
const CURRENT_DATE = "2026-07-29";

const contentTypeConfig: Record<
  StudioContentType,
  {
    uid: string;
    label: string;
    titleField: "title" | "name";
    supportsCategory: boolean;
    supportsTags: boolean;
    supportsAuthor: boolean;
    supportsRecommendedModels: boolean;
  }
> = {
  article: {
    uid: "api::article.article",
    label: "article",
    titleField: "title",
    supportsCategory: true,
    supportsTags: true,
    supportsAuthor: true,
    supportsRecommendedModels: false
  },
  tutorial: {
    uid: "api::tutorial.tutorial",
    label: "tutorial",
    titleField: "title",
    supportsCategory: true,
    supportsTags: true,
    supportsAuthor: true,
    supportsRecommendedModels: false
  },
  prompt: {
    uid: "api::prompt.prompt",
    label: "prompt",
    titleField: "title",
    supportsCategory: true,
    supportsTags: true,
    supportsAuthor: false,
    supportsRecommendedModels: true
  },
  aiTool: {
    uid: "api::ai-tool.ai-tool",
    label: "AI tool",
    titleField: "name",
    supportsCategory: true,
    supportsTags: true,
    supportsAuthor: false,
    supportsRecommendedModels: false
  },
  aiModel: {
    uid: "api::ai-model.ai-model",
    label: "AI model",
    titleField: "name",
    supportsCategory: false,
    supportsTags: false,
    supportsAuthor: false,
    supportsRecommendedModels: false
  }
};

const getRequiredEnv = (key: "LLM_API_KEY" | "AI_STUDIO_KEY") => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing ${key} environment variable`);
  }

  return value;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const clampText = (value: string, maxLength: number) => {
  const trimmed = value.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return trimmed.slice(0, maxLength).trimEnd();
};

const normalizeTextKey = (value?: string) => value?.trim().toLowerCase() ?? "";
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const createGeminiError = (message: string, statusCode?: number, retryable?: boolean) => {
  const error = new Error(message) as GeminiRequestError;
  error.statusCode = statusCode;
  error.retryable = retryable;
  return error;
};

const isRetryableGeminiFailure = (statusCode: number, message: string) =>
  statusCode === 429 ||
  statusCode === 500 ||
  statusCode === 502 ||
  statusCode === 503 ||
  statusCode === 504 ||
  /high demand|try again later|temporar|unavailable|overloaded/i.test(message);

const shouldTryFallbackModel = (error: GeminiRequestError) => {
  const message = error.message ?? "";
  const statusCode = error.statusCode;

  return (
    statusCode === 429 ||
    statusCode === 503 ||
    /quota|resource_exhausted|rate limit|too many requests|high demand|try again later|temporar|unavailable|overloaded/i.test(message)
  );
};

const shouldFallbackWithoutGrounding = (error: GeminiRequestError) => {
  const message = error.message ?? "";
  const statusCode = error.statusCode;

  return (
    statusCode === 429 ||
    /quota|resource_exhausted|rate limit|too many requests|grounding with google search.*not available|tool use with a response mime type/i.test(message)
  );
};

const getGeminiCandidateModels = (options?: { requireToolJsonCompatibility?: boolean }) =>
  options?.requireToolJsonCompatibility
    ? [GEMINI_TOOL_JSON_PRIMARY_MODEL, ...GEMINI_TOOL_JSON_FALLBACK_MODELS]
    : [GEMINI_STANDARD_PRIMARY_MODEL, ...GEMINI_STANDARD_FALLBACK_MODELS];

const uniqueBySlug = (documents: SeedDocument[]) => {
  const map = new Map<string, SeedDocument>();

  for (const document of documents) {
    const key = document.slug ?? document.name ?? document.title ?? document.documentId;
    map.set(key, document);
  }

  return Array.from(map.values());
};

const loadExistingDocuments = async (documentsApi: DocumentApi) => {
  const [published, draft] = await Promise.all([
    documentsApi.findMany({ status: "published" }),
    documentsApi.findMany({ status: "draft" })
  ]);

  return uniqueBySlug([...published, ...draft]);
};

const createUniqueSlug = async (documentsApi: DocumentApi, baseSlug: string) => {
  const existing = await loadExistingDocuments(documentsApi);
  const used = new Set(existing.map((document) => document.slug).filter((slug): slug is string => Boolean(slug)));

  let candidate = baseSlug;
  let index = 2;

  while (used.has(candidate)) {
    candidate = `${baseSlug}-${index}`;
    index += 1;
  }

  return candidate;
};

const loadNamedDocuments = async (documentsApi: DocumentApi) => {
  const existing = await loadExistingDocuments(documentsApi);
  return new Map(existing.map((entry) => [entry.slug ?? "", { documentId: entry.documentId, slug: entry.slug }]));
};

const normalizeStringArray = (value: unknown) =>
  Array.isArray(value) ? value.map((entry) => String(entry ?? "").trim()).filter(Boolean) : [];

const normalizeToolPricingTabs = (value: unknown): ToolPricingTab[] =>
  Array.isArray(value)
    ? value
        .map((tab) => {
          if (!tab || typeof tab !== "object") {
            return null;
          }

          const item = tab as Record<string, unknown>;
          const id = slugify(String(item.id ?? item.label ?? "").trim());
          const label = String(item.label ?? "").trim();
          const plans = Array.isArray(item.plans)
            ? item.plans
                .map((plan) => {
                  if (!plan || typeof plan !== "object") {
                    return null;
                  }

                  const planItem = plan as Record<string, unknown>;
                  const name = String(planItem.name ?? "").trim();
                  const priceLabel = String(planItem.priceLabel ?? "").trim();

                  if (!name || !priceLabel) {
                    return null;
                  }

                  return {
                    name,
                    description: String(planItem.description ?? "").trim(),
                    priceLabel,
                    billingLabel: String(planItem.billingLabel ?? "").trim(),
                    badge: String(planItem.badge ?? "").trim(),
                    ctaLabel: String(planItem.ctaLabel ?? "").trim(),
                    ctaUrl: String(planItem.ctaUrl ?? "").trim(),
                    highlights: normalizeStringArray(planItem.highlights),
                    featured: Boolean(planItem.featured)
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
            description: String(item.description ?? "").trim(),
            plans
          };
        })
        .filter((tab): tab is NonNullable<typeof tab> => tab !== null)
    : [];

const normalizeFaqs = (value: unknown): ArticleDraft["faqs"] =>
  Array.isArray(value)
    ? value
        .map((faq) => ({
          question: typeof faq === "object" && faq && "question" in faq ? String((faq as { question?: unknown }).question ?? "").trim() : "",
          answer: typeof faq === "object" && faq && "answer" in faq ? String((faq as { answer?: unknown }).answer ?? "").trim() : ""
        }))
        .filter((faq) => faq.question && faq.answer)
    : [];

const normalizeTutorialSteps = (value: unknown): TutorialDraft["steps"] =>
  Array.isArray(value)
    ? value
        .map((step) => ({
          title: typeof step === "object" && step && "title" in step ? String((step as { title?: unknown }).title ?? "").trim() : "",
          body: typeof step === "object" && step && "body" in step ? String((step as { body?: unknown }).body ?? "").trim() : "",
          codeBlock:
            typeof step === "object" && step && "codeBlock" in step ? String((step as { codeBlock?: unknown }).codeBlock ?? "").trim() : ""
        }))
        .filter((step) => step.title && step.body)
    : [];

const normalizeGeneratedDraft = (draft: GeneratedArticle): GeneratedArticle => {
  const base = {
    ...draft,
    slug: slugify(draft.slug),
    seoTitle: clampText(draft.seoTitle, 60),
    seoDescription: clampText(draft.seoDescription, 160),
    categorySlug: draft.categorySlug?.trim() ? draft.categorySlug.trim() : null,
    tagSlugs: normalizeStringArray(draft.tagSlugs).map((tag) => slugify(tag))
  };

  if (draft.contentType === "article") {
    return {
      ...base,
      contentType: "article",
      title: draft.title.trim(),
      excerpt: draft.excerpt.trim(),
      bodyMarkdown: draft.bodyMarkdown.trim(),
      authorSlug: draft.authorSlug?.trim() ? slugify(draft.authorSlug) : null,
      outline: normalizeStringArray(draft.outline),
      faqs: normalizeFaqs(draft.faqs)
    };
  }

  if (draft.contentType === "tutorial") {
    return {
      ...base,
      contentType: "tutorial",
      title: draft.title.trim(),
      excerpt: draft.excerpt.trim(),
      difficulty:
        draft.difficulty === "intermediate" || draft.difficulty === "advanced" ? draft.difficulty : "beginner",
      estimatedTime: draft.estimatedTime.trim(),
      authorSlug: draft.authorSlug?.trim() ? slugify(draft.authorSlug) : null,
      steps: normalizeTutorialSteps(draft.steps),
      outline: normalizeStringArray(draft.outline)
    };
  }

  if (draft.contentType === "prompt") {
    return {
      ...base,
      contentType: "prompt",
      title: draft.title.trim(),
      promptText: draft.promptText.trim(),
      useCaseDescription: draft.useCaseDescription.trim(),
      recommendedModelSlugs: normalizeStringArray(draft.recommendedModelSlugs).map((slug) => slugify(slug))
    };
  }

  if (draft.contentType === "aiTool") {
    return {
      ...base,
      contentType: "aiTool",
      name: draft.name.trim(),
      shortDescription: draft.shortDescription.trim(),
      longDescription: draft.longDescription.trim(),
      websiteUrl: draft.websiteUrl.trim(),
      pricingModel:
        draft.pricingModel === "freemium" || draft.pricingModel === "paid" || draft.pricingModel === "enterprise"
          ? draft.pricingModel
          : "free",
      pricingSummary: draft.pricingSummary.trim(),
      startingPrice: draft.startingPrice.trim(),
      billingPeriod: draft.billingPeriod.trim(),
      freeTierAvailable: Boolean(draft.freeTierAvailable),
      pricingNotes: draft.pricingNotes.trim(),
      pricingDefaultTab: slugify(draft.pricingDefaultTab || ""),
      pricingTabs: normalizeToolPricingTabs(draft.pricingTabs),
      pros: normalizeStringArray(draft.pros),
      cons: normalizeStringArray(draft.cons),
      featured: Boolean(draft.featured)
    };
  }

  return {
    ...base,
    contentType: "aiModel",
    name: draft.name.trim(),
    vendor: draft.vendor.trim(),
    description: draft.description.trim(),
    contextWindow: draft.contextWindow.trim(),
    modalities: normalizeStringArray(draft.modalities),
    pricingSummary: draft.pricingSummary.trim(),
    releaseDate: draft.releaseDate.trim(),
    docsUrl: draft.docsUrl.trim()
  };
};

const resolveExistingEntry = (
  existingEntries: SeedDocument[],
  input: Pick<SaveGeneratedArticleInput, "sourceDocumentId" | "sourceSlug" | "sourceTitle">
) => {
  if (input.sourceDocumentId) {
    const byDocumentId = existingEntries.find((entry) => entry.documentId === input.sourceDocumentId) ?? null;

    if (byDocumentId) {
      return byDocumentId;
    }
  }

  const sourceSlug = slugify(input.sourceSlug ?? "");

  if (sourceSlug) {
    const bySlug = existingEntries.find((entry) => entry.slug === sourceSlug) ?? null;

    if (bySlug) {
      return bySlug;
    }
  }

  const sourceTitle = normalizeTextKey(input.sourceTitle);

  if (!sourceTitle) {
    return null;
  }

  const titleMatches = existingEntries.filter(
    (entry) => normalizeTextKey(entry.title ?? entry.name ?? "") === sourceTitle
  );

  return titleMatches.length === 1 ? titleMatches[0] : null;
};

const postToGemini = async <T>(
  apiKey: string,
  model: string,
  body: Record<string, unknown>,
  fallbackMessage: string
): Promise<T> => {
  let lastError: GeminiRequestError | null = null;

  for (let attempt = 1; attempt <= GEMINI_MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify(body)
      });

      const payload = (await response.json()) as GeminiResponse & T;

      if (response.ok) {
        return payload as T;
      }

      const message = payload.error?.message ?? fallbackMessage;
      const retryable = isRetryableGeminiFailure(response.status, message);
      lastError = createGeminiError(message, response.status, retryable);

      if (!retryable || attempt === GEMINI_MAX_RETRIES) {
        throw lastError;
      }
    } catch (error) {
      const normalized =
        error instanceof Error
          ? ((error as GeminiRequestError).statusCode || (error as GeminiRequestError).retryable !== undefined
              ? (error as GeminiRequestError)
              : createGeminiError(error.message || fallbackMessage, undefined, /fetch failed|timeout|network/i.test(error.message)))
          : createGeminiError(fallbackMessage);

      lastError = normalized;

      if (!normalized.retryable || attempt === GEMINI_MAX_RETRIES) {
        throw normalized;
      }
    }

    await wait(800 * attempt);
  }

  throw lastError ?? createGeminiError(fallbackMessage);
};

const requestGeminiWithFallback = async <T>(
  apiKey: string,
  body: Record<string, unknown>,
  fallbackMessage: string,
  options?: { requireToolJsonCompatibility?: boolean }
): Promise<{ payload: T; execution: GeminiModelExecution }> => {
  const attemptedModels: string[] = [];
  const modelsToTry = getGeminiCandidateModels(options);
  const requestedModel = modelsToTry[0] ?? GEMINI_STANDARD_PRIMARY_MODEL;
  let lastError: GeminiRequestError | null = null;

  for (const model of modelsToTry) {
    attemptedModels.push(model);

    try {
      const payload = await postToGemini<T>(apiKey, model, body, fallbackMessage);
      return {
        payload,
        execution: {
          requestedModel,
          usedModel: model,
          fallbackUsed: model !== requestedModel,
          attemptedModels
        }
      };
    } catch (error) {
      const normalized =
        error instanceof Error
          ? ((error as GeminiRequestError).statusCode || (error as GeminiRequestError).retryable !== undefined
              ? (error as GeminiRequestError)
              : createGeminiError(error.message || fallbackMessage))
          : createGeminiError(fallbackMessage);

      lastError = normalized;

      if (!shouldTryFallbackModel(normalized) || model === modelsToTry[modelsToTry.length - 1]) {
        break;
      }
    }
  }

  if (lastError) {
    lastError.message = `${lastError.message} Tried models: ${attemptedModels.join(", ")}.`;
    throw lastError;
  }

  throw createGeminiError(`${fallbackMessage}. Tried models: ${attemptedModels.join(", ")}.`);
};

const requestPlan = async (apiKey: string, brief: string, contentType: StudioContentType, categories: string[], tags: string[]): Promise<ArticlePlan> => {
  const { payload } = await requestGeminiWithFallback<GeminiResponse>(
    apiKey,
    {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
Turn this request into a structured plan for a ${contentTypeConfig[contentType].label} on JelajahAI.
Return JSON only.

Request: ${brief}

Available categories: ${categories.join(", ") || "none"}
Available tags: ${tags.join(", ") || "none"}

Rules:
- Infer the topic, audience, style, length, tone, categorySlug, and tagSlugs.
- Use audience "beginner" unless a more advanced audience is clear.
- Use length "medium" unless short or long is strongly implied.
- Keep the tone natural and useful.
`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            topic: { type: "STRING" },
            audience: { type: "STRING" },
            style: { type: "STRING" },
            length: { type: "STRING" },
            tone: { type: "STRING" },
            categorySlug: { type: "STRING" },
            tagSlugs: { type: "ARRAY", items: { type: "STRING" } }
          },
          required: ["topic", "audience", "style", "length", "tone", "tagSlugs"]
        }
      }
    },
    "Gemini brief planning failed"
  );

  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();

  if (!text) {
    throw new Error("Gemini returned an empty plan");
  }

  const parsed = JSON.parse(text) as ArticlePlan;

  return {
    topic: (typeof parsed.topic === "string" && parsed.topic.trim()) || brief,
    audience: parsed.audience === "intermediate" || parsed.audience === "advanced" ? parsed.audience : "beginner",
    style:
      parsed.style === "tutorial" || parsed.style === "comparison" || parsed.style === "news" || parsed.style === "case-study"
        ? parsed.style
        : "guide",
    length: parsed.length === "short" || parsed.length === "long" ? parsed.length : "medium",
    tone: typeof parsed.tone === "string" && parsed.tone.trim() ? parsed.tone.trim() : "clear, helpful, and practical",
    categorySlug: typeof parsed.categorySlug === "string" && parsed.categorySlug.trim() ? parsed.categorySlug.trim() : null,
    tagSlugs: Array.isArray(parsed.tagSlugs) ? parsed.tagSlugs.map((tag) => slugify(tag)).filter(Boolean) : []
  };
};

const buildPrompt = (
  input: GenerateArticleInput,
  categories: string[],
  tags: string[],
  authors: string[],
  models: string[],
  options?: {
    extraRequirements?: string[];
  }
) => {
  const config = contentTypeConfig[input.contentType];
  const modeInstructions =
    input.mode === "seo"
      ? ["Focus on stronger search packaging, sharper positioning, and clearer metadata."]
      : input.mode === "improve"
        ? input.useLatestWebUpdates === false
          ? [
              `Rewrite and update the existing ${config.label} in place instead of inventing a completely new angle.`,
              "Do not use live web lookups for this run.",
              "Improve the content using only the provided source content and the structured context already included in this request."
            ]
          : [
              `Rewrite and update the existing ${config.label} in place instead of inventing a completely new angle.`,
              `Before you rewrite, use grounded web search to verify whether any facts, features, pricing, release details, or recent updates are outdated as of ${CURRENT_DATE}.`,
              "Refresh outdated statements when reliable public updates are available. If no reliable update is found, preserve the original claim."
            ]
        : [`Create a polished ${config.label} suitable for publication after human review.`];

  const typeInstructions: Record<StudioContentType, string[]> = {
    article: [
      "Use markdown in bodyMarkdown with headings and short paragraphs.",
      "Provide a concise excerpt.",
      "Return outline and faq items."
    ],
    tutorial: [
      "Return a practical sequence of steps.",
      "Each step must have a title and body. codeBlock is optional.",
      "Keep the excerpt concise."
    ],
    prompt: [
      "Return a reusable promptText and a clear useCaseDescription.",
      "Recommend up to 4 model slugs when appropriate."
    ],
    aiTool: [
      "Return a balanced tool profile with short and long descriptions.",
      "Write a real pricingSummary that explains how the tool is priced, not just a link prompt.",
      "Fill structured pricing fields when they are known: startingPrice, billingPeriod, freeTierAvailable, pricingNotes.",
      "When pricing has multiple plans or segments, return pricingDefaultTab and pricingTabs with grouped plan cards.",
      "Use pricingTabs for real pricing layouts like monthly versus yearly or individual versus business.",
      "Prefer pricingTabs whenever the source shows a pricing table, segmented plans, or multiple tiers.",
      "When possible, structure pricing tabs with labels like Monthly, Yearly, Individuals, or Businesses instead of generic labels.",
      "Inside each pricing tab, prefer 3 to 5 plans such as Free, Pro, Team, Business, Enterprise, Hobby, Individual, or Max when those are supported by the source.",
      "Each plan should include a meaningful priceLabel, a billingLabel when shown publicly, a short description, and 3 or more specific highlights when available.",
      "Use badge only when the source clearly indicates emphasis like Best value, Most popular, or Recommended.",
      "Set pricingDefaultTab to the most likely landing state from the source. If unclear, prefer monthly for consumer tools and individuals for split audience pricing.",
      "Do not collapse a multi-plan pricing page into one flat summary if the source provides enough detail for pricingTabs.",
      "Include concise pros and cons lists.",
      "Use a valid pricingModel: free, freemium, paid, or enterprise."
    ],
    aiModel: [
      "Return a clear model reference entry.",
      "Use modalities as an array of strings.",
      "Use releaseDate in YYYY-MM-DD format when known, otherwise leave it empty."
    ]
  };

  return `
You are writing structured CMS content for JelajahAI.
Return JSON only for contentType "${input.contentType}".

Content type: ${input.contentType}
Mode: ${input.mode ?? "create"}
Topic: ${input.topic}
Audience: ${input.audience}
Style: ${input.style}
Length: ${input.length}
Tone: ${input.tone}
Current date: ${CURRENT_DATE}
${input.brief ? `Quick brief: ${input.brief}\n` : ""}
${input.sourceTitle ? `Source title: ${input.sourceTitle}\n` : ""}
${input.sourceExcerpt ? `Source excerpt: ${input.sourceExcerpt}\n` : ""}
${input.sourceContent ? `Source content:\n${input.sourceContent}\n` : ""}
${input.sourceDocumentId ? `Source document ID: ${input.sourceDocumentId}\n` : ""}

Available category slugs: ${categories.join(", ") || "none"}
Available tag slugs: ${tags.join(", ") || "none"}
Available author slugs: ${authors.join(", ") || "none"}
Available model slugs: ${models.join(", ") || "none"}
Preferred category slug: ${input.categorySlug ?? "auto"}
Preferred tag slugs: ${(input.tagSlugs ?? []).join(", ") || "auto"}
Preferred author slug: ${input.authorSlug ?? "auto"}
Preferred recommended model slugs: ${(input.recommendedModelSlugs ?? []).join(", ") || "auto"}

Requirements:
- ${modeInstructions.join(" ")}
- ${typeInstructions[input.contentType].join(" ")}
${(options?.extraRequirements ?? []).length ? `- ${(options?.extraRequirements ?? []).join(" ")}\n` : ""}
- Keep SEO title under 60 characters and SEO description under 160 characters.
- Return slugs as lowercase strings.
`;
};

const sourceSuggestsStructuredPricing = (input: GenerateArticleInput) => {
  if (input.contentType !== "aiTool") {
    return false;
  }

  const text = `${input.sourceTitle ?? ""}\n${input.sourceExcerpt ?? ""}\n${input.sourceContent ?? ""}`.toLowerCase();

  if (!text.trim()) {
    return false;
  }

  const planSignals = [
    /\bfree\b/,
    /\bpro\b/,
    /\bpro\+\b/,
    /\bmax\b/,
    /\bteam(s)?\b/,
    /\benterprise\b/,
    /\bhobby\b/,
    /\bindividual(s)?\b/,
    /\bbusiness(es)?\b/
  ];

  const structureSignals = [
    /\bmonthly\b/,
    /\byearly\b/,
    /\bper user\b/,
    /\bbilled yearly\b/,
    /\bwhat'?s included\b/,
    /\bbest value\b/,
    /\bmost popular\b/,
    /\brecommended\b/,
    /\bpricing\b/
  ];

  const planMatches = planSignals.filter((pattern) => pattern.test(text)).length;
  const structureMatches = structureSignals.filter((pattern) => pattern.test(text)).length;

  return planMatches >= 2 && structureMatches >= 2;
};

const hasMeaningfulPricingTabs = (draft: AiToolDraft) => {
  const totalPlans = draft.pricingTabs.reduce((count, tab) => count + tab.plans.length, 0);
  return draft.pricingTabs.length > 0 && totalPlans >= 2 && draft.pricingTabs.some((tab) => tab.plans.length >= 2);
};

const buildResponseSchema = (contentType: StudioContentType): Record<string, unknown> => {
  const common = {
    slug: { type: "STRING" },
    seoTitle: { type: "STRING" },
    seoDescription: { type: "STRING" }
  };

  if (contentType === "article") {
    return {
      type: "OBJECT",
      properties: {
        ...common,
        title: { type: "STRING" },
        excerpt: { type: "STRING" },
        bodyMarkdown: { type: "STRING" },
        categorySlug: { type: "STRING" },
        tagSlugs: { type: "ARRAY", items: { type: "STRING" } },
        authorSlug: { type: "STRING" },
        outline: { type: "ARRAY", items: { type: "STRING" } },
        faqs: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              question: { type: "STRING" },
              answer: { type: "STRING" }
            },
            required: ["question", "answer"]
          }
        }
      },
      required: ["title", "slug", "excerpt", "bodyMarkdown", "seoTitle", "seoDescription", "tagSlugs", "outline", "faqs"]
    };
  }

  if (contentType === "tutorial") {
    return {
      type: "OBJECT",
      properties: {
        ...common,
        title: { type: "STRING" },
        excerpt: { type: "STRING" },
        difficulty: { type: "STRING" },
        estimatedTime: { type: "STRING" },
        categorySlug: { type: "STRING" },
        tagSlugs: { type: "ARRAY", items: { type: "STRING" } },
        authorSlug: { type: "STRING" },
        outline: { type: "ARRAY", items: { type: "STRING" } },
        steps: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              body: { type: "STRING" },
              codeBlock: { type: "STRING" }
            },
            required: ["title", "body"]
          }
        }
      },
      required: ["title", "slug", "difficulty", "estimatedTime", "steps", "seoTitle", "seoDescription", "tagSlugs", "outline"]
    };
  }

  if (contentType === "prompt") {
    return {
      type: "OBJECT",
      properties: {
        ...common,
        title: { type: "STRING" },
        promptText: { type: "STRING" },
        useCaseDescription: { type: "STRING" },
        categorySlug: { type: "STRING" },
        tagSlugs: { type: "ARRAY", items: { type: "STRING" } },
        recommendedModelSlugs: { type: "ARRAY", items: { type: "STRING" } }
      },
      required: ["title", "slug", "promptText", "useCaseDescription", "seoTitle", "seoDescription", "tagSlugs", "recommendedModelSlugs"]
    };
  }

  if (contentType === "aiTool") {
    return {
      type: "OBJECT",
      properties: {
        ...common,
        name: { type: "STRING" },
        shortDescription: { type: "STRING" },
        longDescription: { type: "STRING" },
        websiteUrl: { type: "STRING" },
        pricingModel: { type: "STRING" },
        pricingSummary: { type: "STRING" },
        startingPrice: { type: "STRING" },
        billingPeriod: { type: "STRING" },
        freeTierAvailable: { type: "BOOLEAN" },
        pricingNotes: { type: "STRING" },
        pricingDefaultTab: { type: "STRING" },
        pricingTabs: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              label: { type: "STRING" },
              description: { type: "STRING" },
              plans: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    name: { type: "STRING" },
                    description: { type: "STRING" },
                    priceLabel: { type: "STRING" },
                    billingLabel: { type: "STRING" },
                    badge: { type: "STRING" },
                    ctaLabel: { type: "STRING" },
                    ctaUrl: { type: "STRING" },
                    highlights: { type: "ARRAY", items: { type: "STRING" } },
                    featured: { type: "BOOLEAN" }
                  },
                  required: ["name", "priceLabel", "highlights", "featured"]
                }
              }
            },
            required: ["id", "label", "plans"]
          }
        },
        categorySlug: { type: "STRING" },
        tagSlugs: { type: "ARRAY", items: { type: "STRING" } },
        pros: { type: "ARRAY", items: { type: "STRING" } },
        cons: { type: "ARRAY", items: { type: "STRING" } },
        featured: { type: "BOOLEAN" }
      },
      required: ["name", "slug", "shortDescription", "websiteUrl", "pricingModel", "pricingSummary", "startingPrice", "billingPeriod", "freeTierAvailable", "pricingNotes", "pricingDefaultTab", "pricingTabs", "seoTitle", "seoDescription", "tagSlugs", "pros", "cons", "featured"]
    };
  }

  return {
    type: "OBJECT",
    properties: {
      ...common,
      name: { type: "STRING" },
      vendor: { type: "STRING" },
      description: { type: "STRING" },
      contextWindow: { type: "STRING" },
      modalities: { type: "ARRAY", items: { type: "STRING" } },
      pricingSummary: { type: "STRING" },
      releaseDate: { type: "STRING" },
      docsUrl: { type: "STRING" }
    },
    required: ["name", "slug", "vendor", "description", "contextWindow", "modalities", "pricingSummary", "releaseDate", "docsUrl", "seoTitle", "seoDescription"]
  };
};

const parseAiToolDraft = (parsed: Record<string, unknown>) =>
  normalizeGeneratedDraft({
    contentType: "aiTool",
    name: String(parsed.name ?? "").trim(),
    slug: String(parsed.slug ?? parsed.name ?? "").trim(),
    shortDescription: String(parsed.shortDescription ?? "").trim(),
    longDescription: String(parsed.longDescription ?? "").trim(),
    websiteUrl: String(parsed.websiteUrl ?? "").trim(),
    pricingModel:
      parsed.pricingModel === "freemium" || parsed.pricingModel === "paid" || parsed.pricingModel === "enterprise"
        ? parsed.pricingModel
        : "free",
    pricingSummary: String(parsed.pricingSummary ?? "").trim(),
    startingPrice: String(parsed.startingPrice ?? "").trim(),
    billingPeriod: String(parsed.billingPeriod ?? "").trim(),
    freeTierAvailable: Boolean(parsed.freeTierAvailable),
    pricingNotes: String(parsed.pricingNotes ?? "").trim(),
    pricingDefaultTab: String(parsed.pricingDefaultTab ?? "").trim(),
    pricingTabs: normalizeToolPricingTabs(parsed.pricingTabs),
    categorySlug: typeof parsed.categorySlug === "string" ? parsed.categorySlug : null,
    tagSlugs: normalizeStringArray(parsed.tagSlugs),
    pros: normalizeStringArray(parsed.pros),
    cons: normalizeStringArray(parsed.cons),
    featured: Boolean(parsed.featured),
    seoTitle: String(parsed.seoTitle ?? parsed.name ?? "").trim(),
    seoDescription: String(parsed.seoDescription ?? parsed.shortDescription ?? "").trim()
  }) as AiToolDraft;

const requestGemini = async (apiKey: string, input: GenerateArticleInput, categories: string[], tags: string[], authors: string[], models: string[]) => {
  const requestStructuredDraft = async (extraRequirements: string[] = [], useGrounding = input.mode === "improve" && input.useLatestWebUpdates !== false) => {
    const { payload, execution } = await requestGeminiWithFallback<GeminiResponse>(
      apiKey,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: buildPrompt(input, categories, tags, authors, models, {
                  extraRequirements
                })
              }
            ]
          }
        ],
        ...(useGrounding
          ? {
              tools: [
                {
                  googleSearch: {}
                }
              ]
            }
          : {}),
        generationConfig: {
          temperature: 0.35,
          responseMimeType: "application/json",
          responseSchema: buildResponseSchema(input.contentType)
        }
      },
      "Gemini generation failed",
      {
        requireToolJsonCompatibility: input.mode === "improve"
      }
    );

    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();

    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    return {
      parsed: JSON.parse(text) as Record<string, unknown>,
      execution
    };
  };

  const wantsLatestWebUpdates = input.mode === "improve" && input.useLatestWebUpdates !== false;
  let webUpdates: WebUpdateExecution = {
    requested: wantsLatestWebUpdates,
    used: wantsLatestWebUpdates
  };
  let initialResult: { parsed: Record<string, unknown>; execution: GeminiModelExecution };

  try {
    initialResult = await requestStructuredDraft([], wantsLatestWebUpdates);
  } catch (error) {
    const normalized =
      error instanceof Error
        ? ((error as GeminiRequestError).statusCode || (error as GeminiRequestError).retryable !== undefined
            ? (error as GeminiRequestError)
            : createGeminiError(error.message || "Gemini generation failed"))
        : createGeminiError("Gemini generation failed");

    if (wantsLatestWebUpdates && shouldFallbackWithoutGrounding(normalized)) {
      initialResult = await requestStructuredDraft(
        [
          "Live web updates are unavailable for this run, so improve the content only from the provided source and structured context.",
          "Do not mention missing web access in the final content."
        ],
        false
      );
      webUpdates = {
        requested: true,
        used: false,
        fallbackReason: normalized.message
      };
    } else {
      throw normalized;
    }
  }

  const parsed = initialResult.parsed;
  let execution = initialResult.execution;

  if (input.contentType === "article") {
    return {
      draft: normalizeGeneratedDraft({
        contentType: "article",
        title: String(parsed.title ?? "").trim(),
        slug: String(parsed.slug ?? parsed.title ?? "").trim(),
        excerpt: String(parsed.excerpt ?? "").trim(),
        bodyMarkdown: String(parsed.bodyMarkdown ?? "").trim(),
        seoTitle: String(parsed.seoTitle ?? parsed.title ?? "").trim(),
        seoDescription: String(parsed.seoDescription ?? parsed.excerpt ?? "").trim(),
        categorySlug: typeof parsed.categorySlug === "string" ? parsed.categorySlug : null,
        tagSlugs: normalizeStringArray(parsed.tagSlugs),
        authorSlug: typeof parsed.authorSlug === "string" ? parsed.authorSlug : null,
        outline: normalizeStringArray(parsed.outline),
        faqs: normalizeFaqs(parsed.faqs)
      }),
      model: execution,
      webUpdates
    };
  }

  if (input.contentType === "tutorial") {
    return {
      draft: normalizeGeneratedDraft({
        contentType: "tutorial",
        title: String(parsed.title ?? "").trim(),
        slug: String(parsed.slug ?? parsed.title ?? "").trim(),
        excerpt: String(parsed.excerpt ?? "").trim(),
        difficulty: parsed.difficulty === "intermediate" || parsed.difficulty === "advanced" ? parsed.difficulty : "beginner",
        estimatedTime: String(parsed.estimatedTime ?? "").trim(),
        categorySlug: typeof parsed.categorySlug === "string" ? parsed.categorySlug : null,
        tagSlugs: normalizeStringArray(parsed.tagSlugs),
        authorSlug: typeof parsed.authorSlug === "string" ? parsed.authorSlug : null,
        steps: normalizeTutorialSteps(parsed.steps),
        outline: normalizeStringArray(parsed.outline),
        seoTitle: String(parsed.seoTitle ?? parsed.title ?? "").trim(),
        seoDescription: String(parsed.seoDescription ?? parsed.excerpt ?? "").trim()
      }),
      model: execution,
      webUpdates
    };
  }

  if (input.contentType === "prompt") {
    return {
      draft: normalizeGeneratedDraft({
        contentType: "prompt",
        title: String(parsed.title ?? "").trim(),
        slug: String(parsed.slug ?? parsed.title ?? "").trim(),
        promptText: String(parsed.promptText ?? "").trim(),
        useCaseDescription: String(parsed.useCaseDescription ?? "").trim(),
        categorySlug: typeof parsed.categorySlug === "string" ? parsed.categorySlug : null,
        tagSlugs: normalizeStringArray(parsed.tagSlugs),
        recommendedModelSlugs: normalizeStringArray(parsed.recommendedModelSlugs),
        seoTitle: String(parsed.seoTitle ?? parsed.title ?? "").trim(),
        seoDescription: String(parsed.seoDescription ?? parsed.useCaseDescription ?? "").trim()
      }),
      model: execution,
      webUpdates
    };
  }

  if (input.contentType === "aiTool") {
    let toolDraft = parseAiToolDraft(parsed);

    if (sourceSuggestsStructuredPricing(input) && !hasMeaningfulPricingTabs(toolDraft)) {
      const retryResult = await requestStructuredDraft([
        "The source strongly suggests a real multi-plan pricing table.",
        "Regenerate the tool so pricingTabs is populated with at least one meaningful tab and at least two real plans.",
        "Do not return empty pricingTabs when the source includes multiple plans, tiers, audience segments, or monthly/yearly pricing.",
        "Use the source pricing labels and tier names as faithfully as possible."
      ]);

      toolDraft = parseAiToolDraft(retryResult.parsed);
      execution = retryResult.execution;

      if (!hasMeaningfulPricingTabs(toolDraft)) {
        throw new Error("Pricing structure was still incomplete after a stricter retry. Please improve the source pricing details and try again.");
      }
    }

    return {
      draft: toolDraft,
      model: execution,
      webUpdates
    };
  }

  return {
    draft: normalizeGeneratedDraft({
      contentType: "aiModel",
      name: String(parsed.name ?? "").trim(),
      slug: String(parsed.slug ?? parsed.name ?? "").trim(),
      vendor: String(parsed.vendor ?? "").trim(),
      description: String(parsed.description ?? "").trim(),
      contextWindow: String(parsed.contextWindow ?? "").trim(),
      modalities: normalizeStringArray(parsed.modalities),
      pricingSummary: String(parsed.pricingSummary ?? "").trim(),
      releaseDate: String(parsed.releaseDate ?? "").trim(),
      docsUrl: String(parsed.docsUrl ?? "").trim(),
      seoTitle: String(parsed.seoTitle ?? parsed.name ?? "").trim(),
      seoDescription: String(parsed.seoDescription ?? parsed.description ?? "").trim(),
      categorySlug: null,
      tagSlugs: []
    }),
    model: execution,
    webUpdates
  };
};

const buildSavePayload = (
  draft: GeneratedArticle,
  relations: {
    categories: Map<string, LookupEntry>;
    tags: Map<string, LookupEntry>;
    authors: Map<string, LookupEntry>;
    models: Map<string, LookupEntry>;
  }
) => {
  const category = draft.categorySlug ? relations.categories.get(draft.categorySlug) : null;
  const tags = draft.tagSlugs
    .map((slug) => relations.tags.get(slug)?.documentId)
    .filter((documentId): documentId is string => Boolean(documentId))
    .map((documentId) => ({ documentId }));

  const seo = {
    metaTitle: clampText(draft.seoTitle, 60),
    metaDescription: clampText(draft.seoDescription, 160)
  };

  if (draft.contentType === "article") {
    const author = draft.authorSlug ? relations.authors.get(draft.authorSlug) : null;
    return {
      title: draft.title,
      slug: draft.slug,
      excerpt: draft.excerpt,
      body: draft.bodyMarkdown,
      category: category?.documentId ?? null,
      tags: { connect: tags },
      author: author?.documentId ?? null,
      seo
    };
  }

  if (draft.contentType === "tutorial") {
    const author = draft.authorSlug ? relations.authors.get(draft.authorSlug) : null;
    return {
      title: draft.title,
      slug: draft.slug,
      excerpt: draft.excerpt,
      steps: draft.steps.map((step) => ({
        title: step.title,
        body: step.body,
        ...(step.codeBlock ? { codeBlock: step.codeBlock } : {})
      })),
      difficulty: draft.difficulty,
      estimatedTime: draft.estimatedTime,
      category: category?.documentId ?? null,
      tags: { connect: tags },
      author: author?.documentId ?? null,
      seo
    };
  }

  if (draft.contentType === "prompt") {
    const recommendedModels = draft.recommendedModelSlugs
      .map((slug) => relations.models.get(slug)?.documentId)
      .filter((documentId): documentId is string => Boolean(documentId))
      .map((documentId) => ({ documentId }));

    return {
      title: draft.title,
      slug: draft.slug,
      promptText: draft.promptText,
      useCaseDescription: draft.useCaseDescription,
      category: category?.documentId ?? null,
      tags: { connect: tags },
      recommendedModels: { connect: recommendedModels },
      seo
    };
  }

  if (draft.contentType === "aiTool") {
    return {
      name: draft.name,
      slug: draft.slug,
      shortDescription: draft.shortDescription,
      longDescription: draft.longDescription,
      websiteUrl: draft.websiteUrl,
      pricingModel: draft.pricingModel,
      pricingSummary: draft.pricingSummary,
      startingPrice: draft.startingPrice || null,
      billingPeriod: draft.billingPeriod || null,
      freeTierAvailable: draft.freeTierAvailable,
      pricingNotes: draft.pricingNotes || null,
      pricingDefaultTab: draft.pricingDefaultTab || null,
      pricingTabs: draft.pricingTabs,
      category: category?.documentId ?? null,
      tags: { connect: tags },
      pros: draft.pros,
      cons: draft.cons,
      featured: draft.featured,
      seo
    };
  }

  return {
    name: draft.name,
    slug: draft.slug,
    vendor: draft.vendor,
    description: draft.description,
    contextWindow: draft.contextWindow,
    modalities: draft.modalities,
    pricingSummary: draft.pricingSummary,
    releaseDate: draft.releaseDate || null,
    docsUrl: draft.docsUrl,
    seo
  };
};

const mergePreferredFields = (draft: GeneratedArticle, input: GenerateArticleInput) => {
  const config = contentTypeConfig[draft.contentType];
  const categorySlug = config.supportsCategory && input.categorySlug?.trim() ? input.categorySlug.trim() : draft.categorySlug;
  const tagSlugs =
    config.supportsTags && input.tagSlugs?.length
      ? Array.from(new Set(input.tagSlugs.map((slug) => slugify(slug))))
      : draft.tagSlugs;

  if (draft.contentType === "article") {
    return normalizeGeneratedDraft({
      ...draft,
      contentType: "article",
      categorySlug,
      tagSlugs,
      authorSlug: input.authorSlug?.trim() ? slugify(input.authorSlug) : draft.authorSlug
    });
  }

  if (draft.contentType === "tutorial") {
    return normalizeGeneratedDraft({
      ...draft,
      contentType: "tutorial",
      categorySlug,
      tagSlugs,
      authorSlug: input.authorSlug?.trim() ? slugify(input.authorSlug) : draft.authorSlug
    });
  }

  if (draft.contentType === "prompt" && input.recommendedModelSlugs?.length) {
    return normalizeGeneratedDraft({
      ...draft,
      contentType: "prompt",
      categorySlug,
      tagSlugs,
      recommendedModelSlugs: Array.from(new Set(input.recommendedModelSlugs.map((slug) => slugify(slug))))
    });
  }

  return normalizeGeneratedDraft({
    ...draft,
    categorySlug,
    tagSlugs
  });
};

const saveGeneratedArticle = async (strapi: Core.Strapi, input: SaveGeneratedArticleInput) => {
  const draft = normalizeGeneratedDraft(input.draft);
  const config = contentTypeConfig[draft.contentType];
  const categoryApi = strapi.documents("api::category.category") as unknown as DocumentApi;
  const tagApi = strapi.documents("api::tag.tag") as unknown as DocumentApi;
  const authorApi = strapi.documents("api::author.author") as unknown as DocumentApi;
  const modelApi = strapi.documents("api::ai-model.ai-model") as unknown as DocumentApi;
  const contentApi = strapi.documents(config.uid as never) as unknown as DocumentApi;

  const [categories, tags, authors, models, existingEntries] = await Promise.all([
    loadNamedDocuments(categoryApi),
    loadNamedDocuments(tagApi),
    loadNamedDocuments(authorApi),
    loadNamedDocuments(modelApi),
    loadExistingDocuments(contentApi)
  ]);

  const sourceDocumentId = input.sourceDocumentId ?? draft.sourceDocumentId;
  const sourceSlug = input.sourceSlug ?? draft.sourceSlug;
  const sourceTitle = input.sourceTitle;
  const hasSourceReference = Boolean(sourceDocumentId || sourceSlug || sourceTitle);
  const existingEntry = resolveExistingEntry(existingEntries, { sourceDocumentId, sourceSlug, sourceTitle });

  if (hasSourceReference && !existingEntry) {
    throw new Error(`Source ${config.label} could not be resolved. Please re-select it and try again.`);
  }

  const resolvedSourceDocumentId = existingEntry?.documentId ?? sourceDocumentId;
  const shouldUpdateExisting = Boolean(resolvedSourceDocumentId);
  const uniqueSlug = shouldUpdateExisting
    ? existingEntry?.slug ?? (sourceSlug ? slugify(sourceSlug) : draft.slug)
    : await createUniqueSlug(contentApi, draft.slug);

  const preparedDraft = normalizeGeneratedDraft({ ...draft, slug: uniqueSlug, sourceDocumentId: resolvedSourceDocumentId, sourceSlug });
  const payload = buildSavePayload(preparedDraft, {
    categories,
    tags,
    authors,
    models
  });

  const saved = input.status
    ? shouldUpdateExisting && resolvedSourceDocumentId
      ? await contentApi.update({
          documentId: resolvedSourceDocumentId,
          data: payload as never,
          status: input.status
        })
      : await contentApi.create({
          data: payload as never,
          status: input.status
        })
    : null;

  return {
    draft: preparedDraft,
    saved
  };
};

export const generateArticleDraft = async (strapi: Core.Strapi, input: GenerateArticleInput) => {
  const apiKey = getRequiredEnv("LLM_API_KEY");
  const categoryApi = strapi.documents("api::category.category") as unknown as DocumentApi;
  const authorApi = strapi.documents("api::author.author") as unknown as DocumentApi;
  const modelApi = strapi.documents("api::ai-model.ai-model") as unknown as DocumentApi;

  const [categories, tags, authors, models] = await Promise.all([
    categoryApi.findMany({ status: "published" }),
    (strapi.documents("api::tag.tag") as unknown as DocumentApi).findMany({ status: "published" }),
    authorApi.findMany({ status: "published" }),
    modelApi.findMany({ status: "published" })
  ]);

  const availableCategorySlugs = categories.map((category) => category.slug ?? "").filter(Boolean);
  const availableTagSlugs = tags.map((tag) => tag.slug ?? "").filter(Boolean);
  const availableAuthorSlugs = authors.map((author) => author.slug ?? "").filter(Boolean);
  const availableModelSlugs = models.map((model) => model.slug ?? "").filter(Boolean);

  const plan = input.brief?.trim()
    ? await requestPlan(apiKey, input.brief.trim(), input.contentType, availableCategorySlugs, availableTagSlugs)
    : {
        topic: input.topic,
        audience: input.audience,
        style: input.style,
        length: input.length,
        tone: input.tone,
        categorySlug: input.categorySlug ?? null,
        tagSlugs: input.tagSlugs ?? []
      };

  const resolvedInput: GenerateArticleInput = {
    ...input,
    mode: input.mode ?? "create",
    topic: input.topic?.trim() || input.sourceTitle?.trim() || plan.topic,
    audience: typeof input.audience === "string" && input.audience.trim() ? input.audience : plan.audience,
    style: typeof input.style === "string" && input.style.trim() ? input.style : plan.style,
    length: typeof input.length === "string" && input.length.trim() ? input.length : plan.length,
    tone: input.tone?.trim() || plan.tone,
    categorySlug: input.categorySlug?.trim() ? input.categorySlug : plan.categorySlug ?? null,
    tagSlugs: input.tagSlugs?.length ? input.tagSlugs : plan.tagSlugs,
    authorSlug: input.authorSlug?.trim() ? slugify(input.authorSlug) : undefined,
    recommendedModelSlugs: input.recommendedModelSlugs?.map((slug) => slugify(slug)).filter(Boolean)
  };

  const generated = await requestGemini(
    apiKey,
    resolvedInput,
    availableCategorySlugs,
    availableTagSlugs,
    availableAuthorSlugs,
    availableModelSlugs
  );

  const draft = mergePreferredFields(generated.draft, resolvedInput);

  const savedResult = await saveGeneratedArticle(strapi, {
    draft,
    status: resolvedInput.saveDraft ? "draft" : undefined,
    sourceDocumentId: resolvedInput.sourceDocumentId,
    sourceSlug: resolvedInput.sourceSlug,
    sourceTitle: resolvedInput.sourceTitle
  });

  return {
    ...savedResult,
    model: generated.model,
    webUpdates: generated.webUpdates
  };
};

export const publishGeneratedDraft = async (
  strapi: Core.Strapi,
  input: Pick<SaveGeneratedArticleInput, "draft" | "sourceDocumentId" | "sourceSlug" | "sourceTitle">
) => saveGeneratedArticle(strapi, { ...input, status: "published" });

export type { GenerateArticleInput, GeneratedArticle, SaveGeneratedArticleInput, StudioContentType };
