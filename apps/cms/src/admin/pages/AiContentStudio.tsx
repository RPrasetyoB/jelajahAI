import * as React from "react";
import { invalidateAdminContentCache } from "../content-cache";

type StudioContentType = "article" | "tutorial" | "prompt" | "aiTool" | "aiModel";
type GenerationMode = "create" | "seo" | "improve";
type Audience = "beginner" | "intermediate" | "advanced";
type ContentStyle = "guide" | "tutorial" | "comparison" | "news" | "case-study";
type ContentLength = "short" | "medium" | "long";
type PricingModel = "free" | "freemium" | "paid" | "enterprise";
type TutorialDifficulty = "beginner" | "intermediate" | "advanced";

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
  faqs: Array<{ question: string; answer: string }>;
};

type TutorialDraft = BaseDraft & {
  contentType: "tutorial";
  title: string;
  excerpt: string;
  difficulty: TutorialDifficulty;
  estimatedTime: string;
  authorSlug?: string | null;
  steps: Array<{ title: string; body: string; codeBlock?: string }>;
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

type GeneratedDraft = ArticleDraft | TutorialDraft | PromptDraft | AiToolDraft | AiModelDraft;

type StudioResult = {
  ok: boolean;
  draft: GeneratedDraft;
  saved: {
    documentId?: string;
    title?: string;
    slug?: string;
    name?: string;
  } | null;
  model?: {
    requestedModel: string;
    usedModel: string;
    fallbackUsed: boolean;
    attemptedModels: string[];
  };
  webUpdates?: {
    requested: boolean;
    used: boolean;
    fallbackReason?: string;
  };
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

type StudioOptions = {
  categories: StudioOption[];
  tags: StudioOption[];
  authors: StudioOption[];
  models: StudioOption[];
  entries: StudioEntryOption[];
};

type FormState = {
  contentType: StudioContentType;
  brief: string;
  useLatestWebUpdates: boolean;
  topic: string;
  audience: Audience;
  style: ContentStyle;
  length: ContentLength;
  tone: string;
  categorySlug: string;
  tagSlugs: string[];
  authorSlug: string;
  recommendedModelSlugs: string[];
  sourceEntryDocumentId: string;
  sourceEntrySlug: string;
  sourceTitle: string;
  sourceExcerpt: string;
  sourceContent: string;
  saveDraft: boolean;
};

type Preset = {
  label: string;
  description: string;
  contentType: StudioContentType;
  values: Partial<FormState>;
};

type HistoryItem = {
  id: string;
  createdAt: string;
  contentType: StudioContentType;
  mode: GenerationMode;
  useLatestWebUpdates: boolean;
  status: "draft" | "published" | "generated";
  brief: string;
  title: string;
  topic: string;
  audience: Audience;
  style: ContentStyle;
  length: ContentLength;
  tone: string;
  categorySlug: string;
  tagSlugs: string[];
  authorSlug: string;
  recommendedModelSlugs: string[];
  sourceEntryDocumentId: string;
  sourceEntrySlug: string;
};

const storageKey = "jelajahai-ai-studio-key";
const historyKey = "jelajahai-ai-studio-history";

const contentTypeCards: Array<{ type: StudioContentType; label: string; description: string; managerPath: string }> = [
  {
    type: "article",
    label: "Article",
    description: "Long-form editorial articles with markdown body, excerpt, author, and SEO.",
    managerPath: "/admin/content-manager/collection-types/api::article.article?page=1&pageSize=10&sort=publishedAt%3ADESC"
  },
  {
    type: "tutorial",
    label: "Tutorial",
    description: "Step-based tutorials with difficulty, time estimate, author, and structured steps.",
    managerPath: "/admin/content-manager/collection-types/api::tutorial.tutorial?page=1&pageSize=10&sort=publishedAt%3ADESC"
  },
  {
    type: "prompt",
    label: "Prompt",
    description: "Reusable prompt templates with use-case notes and recommended models.",
    managerPath: "/admin/content-manager/collection-types/api::prompt.prompt?page=1&pageSize=10&sort=publishedAt%3ADESC"
  },
  {
    type: "aiTool",
    label: "AI Tool",
    description: "Tool profiles with pricing, pros, cons, and positioning copy.",
    managerPath: "/admin/content-manager/collection-types/api::ai-tool.ai-tool?page=1&pageSize=10&sort=publishedAt%3ADESC"
  },
  {
    type: "aiModel",
    label: "AI Model",
    description: "Reference entries for vendors, context window, modalities, pricing, and docs.",
    managerPath: "/admin/content-manager/collection-types/api::ai-model.ai-model?page=1&pageSize=10&sort=publishedAt%3ADESC"
  }
];

const presets: Preset[] = [
  {
    label: "Comparison article",
    description: "Side-by-side article for readers choosing a tool.",
    contentType: "article",
    values: {
      topic: "Claude vs ChatGPT for research workflows",
      audience: "intermediate",
      style: "comparison",
      length: "medium",
      tone: "balanced, practical, and specific",
      categorySlug: "tooling",
      tagSlugs: ["openai"]
    }
  },
  {
    label: "Hands-on tutorial",
    description: "Step-by-step tutorial with examples and implementation detail.",
    contentType: "tutorial",
    values: {
      topic: "Build a Strapi AI content workflow",
      audience: "beginner",
      style: "tutorial",
      length: "long",
      tone: "friendly, clear, and instructional",
      categorySlug: "tutorials",
      tagSlugs: ["agents", "rag"]
    }
  },
  {
    label: "Prompt template",
    description: "Create a prompt pack with use-case guidance and model suggestions.",
    contentType: "prompt",
    values: {
      topic: "Prompt for turning rough notes into polished blog outlines",
      audience: "beginner",
      style: "guide",
      length: "short",
      tone: "clear and copy-ready",
      categorySlug: "productivity"
    }
  },
  {
    label: "Tool profile",
    description: "Structured listing for an AI product with pros, cons, and pricing.",
    contentType: "aiTool",
    values: {
      topic: "Profile an AI meeting assistant for busy teams",
      audience: "beginner",
      style: "guide",
      length: "medium",
      tone: "useful, concrete, and trustworthy",
      categorySlug: "productivity"
    }
  },
  {
    label: "Model reference",
    description: "Reference entry for a model family with capabilities and vendor details.",
    contentType: "aiModel",
    values: {
      topic: "Create a model reference for a multimodal reasoning model",
      audience: "intermediate",
      style: "guide",
      length: "medium",
      tone: "clear, factual, and practical"
    }
  }
];

const quickBriefExamples = [
  { contentType: "article" as const, brief: "write an article comparing claude and chatgpt for research" },
  { contentType: "tutorial" as const, brief: "create a tutorial for building an ai content workflow with strapi" },
  { contentType: "prompt" as const, brief: "make a reusable prompt for turning notes into linkedin posts" },
  { contentType: "aiTool" as const, brief: "profile an ai sales assistant for startups" },
  { contentType: "aiModel" as const, brief: "create a model profile for a long-context coding model" }
];

const modeCards: Array<{ mode: GenerationMode; label: string; description: string }> = [
  {
    mode: "create",
    label: "Create",
    description: "Generate a new entry from a quick brief or structured request."
  },
  {
    mode: "seo",
    label: "SEO only",
    description: "Tighten metadata and positioning without changing the main intent."
  },
  {
    mode: "improve",
    label: "Improve",
    description: "Update an existing Strapi entry in place with stronger structure and clarity."
  }
];

const defaultForm: FormState = {
  contentType: "article",
  brief: "",
  useLatestWebUpdates: true,
  topic: "What is MCP?",
  audience: "beginner",
  style: "guide",
  length: "medium",
  tone: "clear, helpful, and practical",
  categorySlug: "",
  tagSlugs: [],
  authorSlug: "",
  recommendedModelSlugs: [],
  sourceEntryDocumentId: "",
  sourceEntrySlug: "",
  sourceTitle: "",
  sourceExcerpt: "",
  sourceContent: "",
  saveDraft: true
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 16,
  border: "1px solid rgba(148, 163, 184, 0.2)",
  background: "rgba(15, 23, 42, 0.72)",
  color: "#e2e8f0",
  padding: "1.12rem 1.24rem",
  fontSize: "1.22rem",
  outline: "none"
};

const cardStyle: React.CSSProperties = {
  borderRadius: 28,
  border: "1px solid rgba(148, 163, 184, 0.16)",
  background: "rgba(2, 6, 23, 0.78)",
  boxShadow: "0 24px 80px rgba(2, 6, 23, 0.35)"
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 10,
  fontSize: "1.2rem",
  color: "#cbd5e1",
  fontWeight: 600
};

const softButton: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(15, 23, 42, 0.72)",
  color: "#e2e8f0",
  padding: "1rem 1.12rem",
  fontSize: "1.14rem",
  cursor: "pointer"
};

const prettyJson = (value: unknown) => JSON.stringify(value, null, 2);

const loadJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const saveJson = (key: string, value: unknown) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

const cloneDraft = <T,>(draft: T): T => JSON.parse(JSON.stringify(draft)) as T;
const linesToArray = (value: string) => value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
const arrayToLines = (value: string[]) => value.join("\n");
const normalizeToolPricingTabs = (value: unknown): ToolPricingTab[] =>
  Array.isArray(value)
    ? value
        .map((tab) => {
          if (!tab || typeof tab !== "object") return null;
          const item = tab as Record<string, unknown>;
          const id = typeof item.id === "string" ? item.id.trim() : "";
          const label = typeof item.label === "string" ? item.label.trim() : "";
          const plans = Array.isArray(item.plans)
            ? item.plans
                .map((plan) => {
                  if (!plan || typeof plan !== "object") return null;
                  const planItem = plan as Record<string, unknown>;
                  const name = typeof planItem.name === "string" ? planItem.name.trim() : "";
                  const priceLabel = typeof planItem.priceLabel === "string" ? planItem.priceLabel.trim() : "";
                  if (!name || !priceLabel) return null;
                  return {
                    name,
                    description: typeof planItem.description === "string" ? planItem.description.trim() : "",
                    priceLabel,
                    billingLabel: typeof planItem.billingLabel === "string" ? planItem.billingLabel.trim() : "",
                    badge: typeof planItem.badge === "string" ? planItem.badge.trim() : "",
                    ctaLabel: typeof planItem.ctaLabel === "string" ? planItem.ctaLabel.trim() : "",
                    ctaUrl: typeof planItem.ctaUrl === "string" ? planItem.ctaUrl.trim() : "",
                    highlights: Array.isArray(planItem.highlights) ? planItem.highlights.map((item) => String(item ?? "").trim()).filter(Boolean) : [],
                    featured: Boolean(planItem.featured)
                  };
                })
                .filter((plan): plan is NonNullable<typeof plan> => plan !== null)
            : [];

          if (!id || !label || !plans.length) return null;

          return {
            id,
            label,
            description: typeof item.description === "string" ? item.description.trim() : "",
            plans
          };
        })
        .filter((tab): tab is NonNullable<typeof tab> => tab !== null)
    : [];
const serializeToolPricingTabs = (tabs: ToolPricingTab[]) => JSON.stringify(tabs, null, 2);

const supportsCategory = (contentType: StudioContentType) => contentType !== "aiModel";
const supportsTags = (contentType: StudioContentType) => contentType !== "aiModel";
const supportsAuthor = (contentType: StudioContentType) => contentType === "article" || contentType === "tutorial";
const supportsRecommendedModels = (contentType: StudioContentType) => contentType === "prompt";

const getManagerPath = (contentType: StudioContentType) =>
  contentTypeCards.find((card) => card.type === contentType)?.managerPath ??
  "/admin/content-manager/collection-types/api::article.article?page=1&pageSize=10&sort=publishedAt%3ADESC";

const getContentTypeLabel = (contentType: StudioContentType) =>
  contentTypeCards.find((card) => card.type === contentType)?.label ?? "Content";

const createDraftShell = (contentType: StudioContentType, form: FormState): GeneratedDraft => {
  const baseDraft: BaseDraft = {
    contentType,
    slug: "",
    seoTitle: "",
    seoDescription: "",
    categorySlug: supportsCategory(contentType) ? form.categorySlug || null : null,
    tagSlugs: supportsTags(contentType) ? [...form.tagSlugs] : [],
    sourceDocumentId: form.sourceEntryDocumentId || undefined,
    sourceSlug: form.sourceEntrySlug || undefined
  };

  if (contentType === "article") {
    return {
      ...baseDraft,
      contentType: "article",
      title: form.topic || "",
      excerpt: "",
      bodyMarkdown: "",
      authorSlug: supportsAuthor(contentType) ? form.authorSlug || null : null,
      outline: [],
      faqs: []
    };
  }

  if (contentType === "tutorial") {
    return {
      ...baseDraft,
      contentType: "tutorial",
      title: form.topic || "",
      excerpt: "",
      difficulty: form.audience === "advanced" ? "advanced" : form.audience === "intermediate" ? "intermediate" : "beginner",
      estimatedTime: "",
      authorSlug: supportsAuthor(contentType) ? form.authorSlug || null : null,
      steps: [],
      outline: []
    };
  }

  if (contentType === "prompt") {
    return {
      ...baseDraft,
      contentType: "prompt",
      title: form.topic || "",
      promptText: "",
      useCaseDescription: "",
      recommendedModelSlugs: [...form.recommendedModelSlugs]
    };
  }

  if (contentType === "aiTool") {
    return {
      ...baseDraft,
      contentType: "aiTool",
      name: form.topic || "",
      shortDescription: "",
      longDescription: "",
      websiteUrl: "",
      pricingModel: "freemium",
      pricingSummary: "",
      startingPrice: "",
      billingPeriod: "",
      freeTierAvailable: false,
      pricingNotes: "",
      pricingDefaultTab: "",
      pricingTabs: [],
      pros: [],
      cons: [],
      featured: false
    };
  }

  return {
    ...baseDraft,
    contentType: "aiModel",
    name: form.topic || "",
    vendor: "",
    description: "",
    contextWindow: "",
    modalities: [],
    pricingSummary: "",
    releaseDate: "",
    docsUrl: ""
  };
};

const renderMarkdownPreview = (markdown: string) => {
  const lines = markdown.split(/\r?\n/);
  const nodes: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (!listItems.length) return;

    nodes.push(
      <ul key={`list-${nodes.length}`} style={{ margin: "0.35rem 0 1.1rem 1.35rem", color: "#e2e8f0", lineHeight: 1.7 }}>
        {listItems.map((item, index) => (
          <li key={`${item}-${index}`} style={{ marginBottom: 6 }}>
            {item}
          </li>
        ))}
      </ul>
    );

    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    if (line.startsWith("### ")) {
      flushList();
      nodes.push(
        <h4 key={`h4-${nodes.length}`} style={{ margin: "1rem 0 0.5rem", color: "#f8fafc" }}>
          {line.replace(/^###\s+/, "")}
        </h4>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      flushList();
      nodes.push(
        <h3 key={`h3-${nodes.length}`} style={{ margin: "1.15rem 0 0.55rem", color: "#f8fafc" }}>
          {line.replace(/^##\s+/, "")}
        </h3>
      );
      continue;
    }

    if (line.startsWith("# ")) {
      flushList();
      nodes.push(
        <h2 key={`h2-${nodes.length}`} style={{ margin: "1.25rem 0 0.65rem", color: "#f8fafc" }}>
          {line.replace(/^#\s+/, "")}
        </h2>
      );
      continue;
    }

    if (line.startsWith("- ")) {
      listItems.push(line.replace(/^-+\s+/, ""));
      continue;
    }

    flushList();
    nodes.push(
      <p key={`p-${nodes.length}`} style={{ margin: "0 0 0.9rem", color: "#e2e8f0", lineHeight: 1.75 }}>
        {line}
      </p>
    );
  }

  flushList();
  return nodes;
};

const getDraftSourceContent = (draft: GeneratedDraft) => {
  if (draft.contentType === "article") {
    return draft.bodyMarkdown;
  }

  if (draft.contentType === "tutorial") {
    return draft.steps
      .map((step, index) => [`Step ${index + 1}: ${step.title}`, step.body, step.codeBlock ? `Code:\n${step.codeBlock}` : ""].filter(Boolean).join("\n\n"))
      .join("\n\n");
  }

  if (draft.contentType === "prompt") {
    return `Prompt:\n${draft.promptText}\n\nUse case:\n${draft.useCaseDescription}`;
  }

  if (draft.contentType === "aiTool") {
    return [
      `Short description: ${draft.shortDescription}`,
      draft.longDescription ? `Long description:\n${draft.longDescription}` : "",
      draft.websiteUrl ? `Website: ${draft.websiteUrl}` : "",
      draft.pricingModel ? `Pricing: ${draft.pricingModel}` : "",
      draft.pricingSummary ? `Pricing summary:\n${draft.pricingSummary}` : "",
      draft.startingPrice ? `Starting price: ${draft.startingPrice}` : "",
      draft.billingPeriod ? `Billing period: ${draft.billingPeriod}` : "",
      `Free tier available: ${draft.freeTierAvailable ? "yes" : "no"}`,
      draft.pricingNotes ? `Pricing notes:\n${draft.pricingNotes}` : "",
      draft.pricingDefaultTab ? `Default pricing tab: ${draft.pricingDefaultTab}` : "",
      draft.pricingTabs.length ? `Pricing tabs:\n${serializeToolPricingTabs(draft.pricingTabs)}` : "",
      draft.pros.length ? `Pros: ${draft.pros.join(", ")}` : "",
      draft.cons.length ? `Cons: ${draft.cons.join(", ")}` : ""
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  return [
    draft.vendor ? `Vendor: ${draft.vendor}` : "",
    draft.description ? `Description:\n${draft.description}` : "",
    draft.contextWindow ? `Context window: ${draft.contextWindow}` : "",
    draft.modalities.length ? `Modalities: ${draft.modalities.join(", ")}` : "",
    draft.pricingSummary ? `Pricing: ${draft.pricingSummary}` : "",
    draft.releaseDate ? `Release date: ${draft.releaseDate}` : "",
    draft.docsUrl ? `Docs: ${draft.docsUrl}` : ""
  ]
    .filter(Boolean)
    .join("\n\n");
};

const RelationFields = ({
  contentType,
  categories,
  tags,
  authors,
  models,
  categorySlug,
  tagSlugs,
  authorSlug,
  recommendedModelSlugs,
  onCategoryChange,
  onTagChange,
  onAuthorChange,
  onModelChange
}: {
  contentType: StudioContentType;
  categories: StudioOption[];
  tags: StudioOption[];
  authors: StudioOption[];
  models: StudioOption[];
  categorySlug: string;
  tagSlugs: string[];
  authorSlug: string;
  recommendedModelSlugs: string[];
  onCategoryChange: (value: string) => void;
  onTagChange: (value: string[]) => void;
  onAuthorChange: (value: string) => void;
  onModelChange: (value: string[]) => void;
}) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 20 }}>
    {supportsCategory(contentType) ? (
      <div>
        <label style={labelStyle}>Category</label>
        <select value={categorySlug} onChange={(event) => onCategoryChange(event.target.value)} style={inputStyle}>
          <option value="">Auto-select</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
    ) : (
      <div />
    )}

    {supportsTags(contentType) ? (
      <div>
        <label style={labelStyle}>Tags</label>
        <select
          multiple
          value={tagSlugs}
          onChange={(event) => onTagChange(Array.from(event.currentTarget.selectedOptions).map((option) => option.value))}
          style={inputStyle}
          size={Math.max(4, Math.min(8, tags.length || 4))}
        >
          {tags.map((tag) => (
            <option key={tag.slug} value={tag.slug}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>
    ) : (
      <div />
    )}

    {supportsAuthor(contentType) ? (
      <div>
        <label style={labelStyle}>Author</label>
        <select value={authorSlug} onChange={(event) => onAuthorChange(event.target.value)} style={inputStyle}>
          <option value="">Auto-select</option>
          {authors.map((author) => (
            <option key={author.slug} value={author.slug}>
              {author.name}
            </option>
          ))}
        </select>
      </div>
    ) : (
      <div />
    )}

    {supportsRecommendedModels(contentType) ? (
      <div>
        <label style={labelStyle}>Recommended models</label>
        <select
          multiple
          value={recommendedModelSlugs}
          onChange={(event) => onModelChange(Array.from(event.currentTarget.selectedOptions).map((option) => option.value))}
          style={inputStyle}
          size={Math.max(4, Math.min(8, models.length || 4))}
        >
          {models.map((model) => (
            <option key={model.slug} value={model.slug}>
              {model.name}
            </option>
          ))}
        </select>
      </div>
    ) : (
      <div />
    )}
  </div>
);

export default function AiContentStudio() {
  const [form, setForm] = React.useState<FormState>(defaultForm);
  const [mode, setMode] = React.useState<GenerationMode>("create");
  const [viewportWidth, setViewportWidth] = React.useState(() => (typeof window === "undefined" ? 1440 : window.innerWidth));
  const [studioKey, setStudioKey] = React.useState("");
  const [options, setOptions] = React.useState<StudioOptions>({ categories: [], tags: [], authors: [], models: [], entries: [] });
  const [optionsLoading, setOptionsLoading] = React.useState(true);
  const [entrySearch, setEntrySearch] = React.useState("");
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState<StudioResult | null>(null);
  const [draftEditor, setDraftEditor] = React.useState<GeneratedDraft | null>(null);
  const [pricingTabsEditor, setPricingTabsEditor] = React.useState("[]");
  const [pricingTabsError, setPricingTabsError] = React.useState("");

  const isMobile = viewportWidth < 840;
  const isTablet = viewportWidth < 1100;
  const isCompact = viewportWidth < 1500;
  const pagePadding = isMobile ? "1.15rem" : isCompact ? "1.8rem 1.5rem" : "3.6rem 3.9rem";
  const pageScale = isCompact ? "none" : "scale(1.08)";
  const pageMaxWidth = isCompact ? "100%" : 1480;
  const pageGap = isMobile ? 22 : isCompact ? 30 : 40;
  const twoColumnGrid = isCompact ? "minmax(0, 1fr)" : "minmax(0, 1.02fr) minmax(430px, 0.98fr)";
  const formTwoColumnGrid = isTablet ? "minmax(0, 1fr)" : "repeat(2, minmax(0, 1fr))";
  const cardPadding = isMobile ? "1.45rem" : isCompact ? "1.9rem" : "2.7rem";
  const sectionGap = isMobile ? 32 : isCompact ? 38 : 50;

  const hasBrief = form.brief.trim().length > 0;
  const activeDraft = draftEditor ?? result?.draft ?? null;
  const activeContentType = activeDraft?.contentType ?? form.contentType;
  const hasGeneratedDraft = Boolean(result?.draft);
  const draftSourcePreview = activeDraft ? getDraftSourceContent(activeDraft).trim() : "";

  const selectedSourceEntry = React.useMemo(
    () =>
      options.entries.find(
        (entry) =>
          entry.contentType === form.contentType &&
          (entry.documentId === form.sourceEntryDocumentId || entry.slug === form.sourceEntrySlug)
      ) ?? null,
    [form.contentType, form.sourceEntryDocumentId, form.sourceEntrySlug, options.entries]
  );

  const filteredEntries = React.useMemo(() => {
    const query = entrySearch.trim().toLowerCase();

    return options.entries
      .filter((entry) => entry.contentType === form.contentType)
      .filter((entry) => {
        if (!query) return true;
        const haystack = `${entry.title} ${entry.slug} ${entry.excerpt}`.toLowerCase();
        return haystack.includes(query);
      });
  }, [entrySearch, form.contentType, options.entries]);

  const createMode = mode === "create";

  React.useEffect(() => {
    const savedKey = window.localStorage.getItem(storageKey);
    if (savedKey) setStudioKey(savedKey);
    setHistory(loadJson<HistoryItem[]>(historyKey, []));
  }, []);

  React.useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth);
    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);
    return () => window.removeEventListener("resize", updateViewportWidth);
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();

    const loadOptions = async () => {
      try {
        setOptionsLoading(true);
        const response = await fetch("/api/ai-content/options", { signal: controller.signal });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message ?? "Unable to load options");
        }

        setOptions({
          categories: Array.isArray(payload?.categories) ? payload.categories : [],
          tags: Array.isArray(payload?.tags) ? payload.tags : [],
          authors: Array.isArray(payload?.authors) ? payload.authors : [],
          models: Array.isArray(payload?.models) ? payload.models : [],
          entries: Array.isArray(payload?.entries) ? payload.entries : []
        });
      } catch (currentError) {
        if (currentError instanceof DOMException && currentError.name === "AbortError") return;
        setOptions({ categories: [], tags: [], authors: [], models: [], entries: [] });
      } finally {
        setOptionsLoading(false);
      }
    };

    void loadOptions();
    return () => controller.abort();
  }, []);

  React.useEffect(() => {
    if (form.sourceEntryDocumentId || !form.sourceEntrySlug) {
      return;
    }

    const matched = options.entries.find(
      (entry) => entry.contentType === form.contentType && entry.slug === form.sourceEntrySlug
    );

    if (!matched) {
      return;
    }

    setForm((current) => ({
      ...current,
      sourceEntryDocumentId: matched.documentId
    }));
  }, [form.contentType, form.sourceEntryDocumentId, form.sourceEntrySlug, options.entries]);

  React.useEffect(() => {
    if (!activeDraft || activeDraft.contentType !== "aiTool") {
      setPricingTabsEditor("[]");
      setPricingTabsError("");
      return;
    }

    setPricingTabsEditor(serializeToolPricingTabs(activeDraft.pricingTabs));
    setPricingTabsError("");
  }, [activeDraft]);

  React.useEffect(() => {
    if (result?.draft || draftEditor || form.contentType !== "aiTool") {
      return;
    }

    setDraftEditor(createDraftShell("aiTool", form));
  }, [
    draftEditor,
    form,
    result?.draft
  ]);

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateDraftField = (field: string, value: unknown) => {
    setDraftEditor((current) => {
      if (!current) return current;
      return { ...current, [field]: value } as GeneratedDraft;
    });
  };

  const commitPricingTabsEditor = () => {
    if (!activeDraft || activeDraft.contentType !== "aiTool") {
      return;
    }

    try {
      const parsed = JSON.parse(pricingTabsEditor) as unknown;
      updateDraftField("pricingTabs", normalizeToolPricingTabs(parsed));
      setPricingTabsError("");
    } catch {
      setPricingTabsError("Pricing tabs must be valid JSON before saving or publishing.");
    }
  };

  const appendHistory = (entry: Omit<HistoryItem, "id" | "createdAt">) => {
    const nextHistory: HistoryItem[] = [
      {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString()
      },
      ...history
    ].slice(0, 10);

    setHistory(nextHistory);
    saveJson(historyKey, nextHistory);
  };

  const persistSessionKey = () => {
    window.localStorage.setItem(storageKey, studioKey.trim());
  };

  const clearSource = React.useCallback(() => {
    setForm((current) => ({
      ...current,
      sourceEntryDocumentId: "",
      sourceEntrySlug: "",
      sourceTitle: "",
      sourceExcerpt: "",
      sourceContent: ""
    }));
  }, []);

  const selectContentType = (contentType: StudioContentType) => {
    setForm((current) => ({
      ...current,
      contentType,
      sourceEntryDocumentId: "",
      sourceEntrySlug: "",
      sourceTitle: "",
      sourceExcerpt: "",
      sourceContent: "",
      categorySlug: supportsCategory(contentType) ? current.categorySlug : "",
      tagSlugs: supportsTags(contentType) ? current.tagSlugs : [],
      authorSlug: supportsAuthor(contentType) ? current.authorSlug : "",
      recommendedModelSlugs: supportsRecommendedModels(contentType) ? current.recommendedModelSlugs : []
    }));
    setResult(null);
    setDraftEditor(null);
    setEntrySearch("");
    if (mode !== "create") {
      clearSource();
    }
  };

  const applyPreset = (preset: Preset) => {
    setMode("create");
    setForm((current) => ({
      ...current,
      contentType: preset.contentType,
      sourceEntryDocumentId: "",
      sourceEntrySlug: "",
      sourceTitle: "",
      sourceExcerpt: "",
      sourceContent: "",
      ...preset.values,
      tagSlugs: preset.values.tagSlugs ?? current.tagSlugs,
      recommendedModelSlugs: preset.values.recommendedModelSlugs ?? current.recommendedModelSlugs
    }));
  };

  const applyQuickBrief = (contentType: StudioContentType, brief: string) => {
    setMode("create");
    setForm((current) => ({
      ...current,
      contentType,
      brief,
      sourceEntryDocumentId: "",
      sourceEntrySlug: "",
      sourceTitle: "",
      sourceExcerpt: "",
      sourceContent: ""
    }));
  };

  const applySourceEntry = (documentId: string) => {
    const entry = options.entries.find((candidate) => candidate.documentId === documentId && candidate.contentType === form.contentType) ?? null;

    if (!entry) {
      clearSource();
      return;
    }

    setMode("improve");
    setForm((current) => ({
      ...current,
      sourceEntryDocumentId: entry.documentId,
      sourceEntrySlug: entry.slug,
      topic: entry.title,
      sourceTitle: entry.title,
      sourceExcerpt: entry.excerpt,
      sourceContent: entry.sourceContent,
      categorySlug: supportsCategory(entry.contentType) ? entry.categorySlug ?? current.categorySlug : "",
      tagSlugs: supportsTags(entry.contentType) ? entry.tagSlugs : [],
      authorSlug: supportsAuthor(entry.contentType) ? entry.authorSlug ?? "" : "",
      recommendedModelSlugs: supportsRecommendedModels(entry.contentType) ? entry.recommendedModelSlugs : [],
      brief: "",
      saveDraft: false
    }));
  };

  const applyHistoryItem = (item: HistoryItem) => {
    setMode(item.mode);
    setForm((current) => ({
      ...current,
      contentType: item.contentType,
      brief: item.brief,
      useLatestWebUpdates: item.useLatestWebUpdates,
      topic: item.topic,
      audience: item.audience,
      style: item.style,
      length: item.length,
      tone: item.tone,
      categorySlug: item.categorySlug,
      tagSlugs: item.tagSlugs,
      authorSlug: item.authorSlug,
      recommendedModelSlugs: item.recommendedModelSlugs,
      sourceEntryDocumentId: item.sourceEntryDocumentId,
      sourceEntrySlug: item.sourceEntrySlug
    }));
  };

  const openContentManager = (contentType: StudioContentType) => {
    window.location.assign(getManagerPath(contentType));
  };

  const buildRequestBody = () => {
    const sourceTitle = mode === "create" ? "" : form.sourceTitle || selectedSourceEntry?.title || "";
    const sourceExcerpt = mode === "create" ? "" : form.sourceExcerpt || selectedSourceEntry?.excerpt || "";
    const sourceContent =
      mode === "create"
        ? ""
        : form.sourceContent || selectedSourceEntry?.sourceContent || (activeDraft ? getDraftSourceContent(activeDraft) : "");

    return {
      contentType: form.contentType,
      mode,
      useLatestWebUpdates: mode === "improve" ? form.useLatestWebUpdates : undefined,
      brief: form.brief.trim() || undefined,
      topic: createMode && !hasBrief ? form.topic : sourceTitle || form.topic,
      audience: form.audience,
      style: form.style,
      length: form.length,
      tone: form.tone,
      sourceSlug: mode === "create" ? undefined : form.sourceEntrySlug || selectedSourceEntry?.slug || undefined,
      sourceTitle: mode === "create" ? undefined : sourceTitle || undefined,
      sourceExcerpt: mode === "create" ? undefined : sourceExcerpt || undefined,
      sourceContent: mode === "create" ? undefined : sourceContent || undefined,
      sourceDocumentId: mode === "create" ? undefined : form.sourceEntryDocumentId || selectedSourceEntry?.documentId || activeDraft?.sourceDocumentId || undefined,
      categorySlug: supportsCategory(form.contentType) ? form.categorySlug.trim() || null : null,
      tagSlugs: supportsTags(form.contentType) ? form.tagSlugs : [],
      authorSlug: supportsAuthor(form.contentType) ? form.authorSlug || null : null,
      recommendedModelSlugs: supportsRecommendedModels(form.contentType) ? form.recommendedModelSlugs : [],
      saveDraft: form.saveDraft
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      persistSessionKey();

      const response = await fetch("/api/ai-content/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(studioKey.trim() ? { "x-ai-studio-key": studioKey.trim() } : {})
        },
        body: JSON.stringify(buildRequestBody())
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message ?? payload?.error?.message ?? "AI generation failed");
      }

      const nextResult = payload as StudioResult;
      setResult(nextResult);
      setDraftEditor(cloneDraft(nextResult.draft));

      if (nextResult.saved) {
        invalidateAdminContentCache();
      }

      appendHistory({
        contentType: form.contentType,
        brief: form.brief,
        useLatestWebUpdates: form.useLatestWebUpdates,
        title: "title" in nextResult.draft ? nextResult.draft.title : nextResult.draft.name,
        topic: form.topic,
        audience: form.audience,
        style: form.style,
        length: form.length,
        tone: form.tone,
        categorySlug: nextResult.draft.categorySlug ?? form.categorySlug,
        tagSlugs: nextResult.draft.tagSlugs,
        authorSlug: "authorSlug" in nextResult.draft ? nextResult.draft.authorSlug ?? "" : "",
        recommendedModelSlugs: "recommendedModelSlugs" in nextResult.draft ? nextResult.draft.recommendedModelSlugs : [],
        sourceEntryDocumentId: form.sourceEntryDocumentId,
        sourceEntrySlug: form.sourceEntrySlug,
        mode,
        status: nextResult.saved ? "draft" : "generated"
      });
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!activeDraft) return;

    setPublishing(true);
    setError("");

    try {
      persistSessionKey();

      const response = await fetch("/api/ai-content/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(studioKey.trim() ? { "x-ai-studio-key": studioKey.trim() } : {})
        },
        body: JSON.stringify({
          draft: activeDraft,
          sourceDocumentId: activeDraft.sourceDocumentId || form.sourceEntryDocumentId || undefined,
          sourceSlug: activeDraft.sourceSlug || form.sourceEntrySlug || selectedSourceEntry?.slug || undefined,
          sourceTitle: form.sourceTitle || selectedSourceEntry?.title || ("title" in activeDraft ? activeDraft.title : activeDraft.name)
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message ?? payload?.error?.message ?? "Publish failed");
      }

      const nextResult = payload as StudioResult;
      setResult((current) => (current ? { ...current, saved: nextResult.saved, draft: nextResult.draft } : nextResult));
      setDraftEditor(cloneDraft(nextResult.draft));
      invalidateAdminContentCache();

      appendHistory({
        contentType: activeDraft.contentType,
        brief: form.brief,
        useLatestWebUpdates: form.useLatestWebUpdates,
        title: "title" in activeDraft ? activeDraft.title : activeDraft.name,
        topic: form.topic,
        audience: form.audience,
        style: form.style,
        length: form.length,
        tone: form.tone,
        categorySlug: activeDraft.categorySlug ?? form.categorySlug,
        tagSlugs: activeDraft.tagSlugs,
        authorSlug: "authorSlug" in activeDraft ? activeDraft.authorSlug ?? "" : "",
        recommendedModelSlugs: "recommendedModelSlugs" in activeDraft ? activeDraft.recommendedModelSlugs : [],
        sourceEntryDocumentId: form.sourceEntryDocumentId,
        sourceEntrySlug: form.sourceEntrySlug,
        mode,
        status: "published"
      });

      openContentManager(activeDraft.contentType);
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  const updateTutorialStep = (index: number, field: "title" | "body" | "codeBlock", value: string) => {
    setDraftEditor((current) => {
      if (!current || current.contentType !== "tutorial") return current;
      const nextSteps = current.steps.map((step, currentIndex) => (currentIndex === index ? { ...step, [field]: value } : step));
      return { ...current, steps: nextSteps };
    });
  };

  const addTutorialStep = () => {
    setDraftEditor((current) => {
      if (!current || current.contentType !== "tutorial") return current;
      return {
        ...current,
        steps: [...current.steps, { title: "New step", body: "", codeBlock: "" }]
      };
    });
  };

  const removeTutorialStep = (index: number) => {
    setDraftEditor((current) => {
      if (!current || current.contentType !== "tutorial") return current;
      return {
        ...current,
        steps: current.steps.filter((_, currentIndex) => currentIndex !== index)
      };
    });
  };

  const modeLabel =
    mode === "seo"
      ? `Optimize ${getContentTypeLabel(form.contentType)} SEO`
      : mode === "improve"
        ? `Improve ${getContentTypeLabel(form.contentType)}`
        : hasBrief
          ? `Generate ${getContentTypeLabel(form.contentType)} From Brief`
          : `Generate ${getContentTypeLabel(form.contentType)}`;

  const modeNote =
    mode === "create"
      ? `Use the brief or the structured form to create a new ${getContentTypeLabel(form.contentType).toLowerCase()}.`
      : mode === "seo"
        ? `Use a source ${getContentTypeLabel(form.contentType).toLowerCase()} to strengthen metadata and positioning.`
        : `Pick an existing ${getContentTypeLabel(form.contentType).toLowerCase()} entry to rewrite in place.`;

  const renderDraftEditor = () => {
    if (!activeDraft) {
      return (
        <p style={{ color: "#cbd5e1", marginBottom: 0 }}>
          Generate or load a draft to see the structured output here. The editor adapts to the selected content type so you can review and publish cleanly.
        </p>
      );
    }

    const titleValue = "title" in activeDraft ? activeDraft.title : activeDraft.name;

    return (
      <div style={{ display: "grid", gap: 20, marginTop: 20 }}>
        {!hasGeneratedDraft ? (
          <div style={{ borderRadius: 16, border: "1px solid rgba(56, 189, 248, 0.22)", background: "rgba(8, 47, 73, 0.32)", color: "#bae6fd", padding: "0.95rem 1rem", lineHeight: 1.6 }}>
            Tool pricing fields are ready here before generation, so you can seed cost details manually or let AI fill them when you generate or improve.
          </div>
        ) : null}
        <div style={{ display: "grid", gridTemplateColumns: formTwoColumnGrid, gap: 20 }}>
          <div>
            <label style={labelStyle}>{"title" in activeDraft ? "Title" : "Name"}</label>
            <input
              value={titleValue}
              onChange={(event) => updateDraftField("title" in activeDraft ? "title" : "name", event.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Slug</label>
            <input value={activeDraft.slug} onChange={(event) => updateDraftField("slug", event.target.value)} style={inputStyle} />
          </div>
        </div>

        {activeDraft.contentType === "article" ? (
          <>
            <div>
              <label style={labelStyle}>Excerpt</label>
              <textarea value={activeDraft.excerpt} onChange={(event) => updateDraftField("excerpt", event.target.value)} rows={3} style={{ ...inputStyle, minHeight: 96, resize: "vertical" }} />
            </div>
            <div>
              <label style={labelStyle}>Body markdown</label>
              <textarea value={activeDraft.bodyMarkdown} onChange={(event) => updateDraftField("bodyMarkdown", event.target.value)} rows={12} style={{ ...inputStyle, minHeight: 260, resize: "vertical" }} />
            </div>
          </>
        ) : null}

        {activeDraft.contentType === "tutorial" ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: formTwoColumnGrid, gap: 20 }}>
              <div>
                <label style={labelStyle}>Excerpt</label>
                <textarea value={activeDraft.excerpt} onChange={(event) => updateDraftField("excerpt", event.target.value)} rows={3} style={{ ...inputStyle, minHeight: 96, resize: "vertical" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: formTwoColumnGrid, gap: 20 }}>
                <div>
                  <label style={labelStyle}>Difficulty</label>
                  <select value={activeDraft.difficulty} onChange={(event) => updateDraftField("difficulty", event.target.value as TutorialDifficulty)} style={inputStyle}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Estimated time</label>
                  <input value={activeDraft.estimatedTime} onChange={(event) => updateDraftField("estimatedTime", event.target.value)} style={inputStyle} />
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Steps</label>
                <button type="button" onClick={addTutorialStep} style={softButton}>
                  Add step
                </button>
              </div>
              <div style={{ display: "grid", gap: 16 }}>
                {activeDraft.steps.map((step, index) => (
                  <div key={`${step.title}-${index}`} style={{ borderRadius: 18, border: "1px solid rgba(148, 163, 184, 0.16)", padding: "1rem", background: "rgba(15, 23, 42, 0.48)" }}>
                    <div style={{ display: "grid", gap: 12 }}>
                      <input value={step.title} onChange={(event) => updateTutorialStep(index, "title", event.target.value)} placeholder={`Step ${index + 1} title`} style={inputStyle} />
                      <textarea value={step.body} onChange={(event) => updateTutorialStep(index, "body", event.target.value)} rows={5} placeholder="Step body" style={{ ...inputStyle, minHeight: 140, resize: "vertical" }} />
                      <textarea value={step.codeBlock ?? ""} onChange={(event) => updateTutorialStep(index, "codeBlock", event.target.value)} rows={4} placeholder="Optional code block" style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} />
                      <div>
                        <button type="button" onClick={() => removeTutorialStep(index)} style={softButton}>
                          Remove step
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {activeDraft.contentType === "prompt" ? (
          <>
            <div>
              <label style={labelStyle}>Prompt text</label>
              <textarea value={activeDraft.promptText} onChange={(event) => updateDraftField("promptText", event.target.value)} rows={10} style={{ ...inputStyle, minHeight: 220, resize: "vertical" }} />
            </div>
            <div>
              <label style={labelStyle}>Use-case description</label>
              <textarea value={activeDraft.useCaseDescription} onChange={(event) => updateDraftField("useCaseDescription", event.target.value)} rows={4} style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} />
            </div>
          </>
        ) : null}

        {activeDraft.contentType === "aiTool" ? (
          <>
            <div>
              <label style={labelStyle}>Short description</label>
              <textarea value={activeDraft.shortDescription} onChange={(event) => updateDraftField("shortDescription", event.target.value)} rows={3} style={{ ...inputStyle, minHeight: 96, resize: "vertical" }} />
            </div>
            <div>
              <label style={labelStyle}>Long description</label>
              <textarea value={activeDraft.longDescription} onChange={(event) => updateDraftField("longDescription", event.target.value)} rows={8} style={{ ...inputStyle, minHeight: 220, resize: "vertical" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: formTwoColumnGrid, gap: 20 }}>
              <div>
                <label style={labelStyle}>Website URL</label>
                <input value={activeDraft.websiteUrl} onChange={(event) => updateDraftField("websiteUrl", event.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Pricing model</label>
                <select value={activeDraft.pricingModel} onChange={(event) => updateDraftField("pricingModel", event.target.value as PricingModel)} style={inputStyle}>
                  <option value="free">Free</option>
                  <option value="freemium">Freemium</option>
                  <option value="paid">Paid</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Pricing summary</label>
              <textarea value={activeDraft.pricingSummary} onChange={(event) => updateDraftField("pricingSummary", event.target.value)} rows={4} style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: formTwoColumnGrid, gap: 20 }}>
              <div>
                <label style={labelStyle}>Starting price</label>
                <input value={activeDraft.startingPrice} onChange={(event) => updateDraftField("startingPrice", event.target.value)} style={inputStyle} placeholder="e.g. $20" />
              </div>
              <div>
                <label style={labelStyle}>Billing period</label>
                <input value={activeDraft.billingPeriod} onChange={(event) => updateDraftField("billingPeriod", event.target.value)} style={inputStyle} placeholder="e.g. month, seat/month, usage-based" />
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 12, color: "#e2e8f0", fontSize: "1.14rem" }}>
              <input type="checkbox" checked={activeDraft.freeTierAvailable} onChange={(event) => updateDraftField("freeTierAvailable", event.target.checked)} />
              Free tier available
            </label>
            <div>
              <label style={labelStyle}>Pricing notes</label>
              <textarea value={activeDraft.pricingNotes} onChange={(event) => updateDraftField("pricingNotes", event.target.value)} rows={4} style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: formTwoColumnGrid, gap: 20 }}>
              <div>
                <label style={labelStyle}>Default pricing tab</label>
                <input value={activeDraft.pricingDefaultTab} onChange={(event) => updateDraftField("pricingDefaultTab", event.target.value)} style={inputStyle} placeholder="e.g. monthly, individuals" />
              </div>
              <div style={{ color: "#94a3b8", fontSize: "1rem", lineHeight: 1.65, alignSelf: "end" }}>
                Use pricing tabs for layouts like `monthly / yearly` or `individuals / businesses`, each with multiple plan cards.
              </div>
            </div>
            <div>
              <label style={labelStyle}>Pricing tabs JSON</label>
              <textarea
                value={pricingTabsEditor}
                onChange={(event) => setPricingTabsEditor(event.target.value)}
                onBlur={commitPricingTabsEditor}
                rows={12}
                style={{ ...inputStyle, minHeight: 320, resize: "vertical", fontFamily: "\"JetBrains Mono\", monospace", fontSize: "1rem", lineHeight: 1.65 }}
              />
              {pricingTabsError ? <div style={{ color: "#fca5a5", marginTop: 10, lineHeight: 1.6 }}>{pricingTabsError}</div> : null}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: formTwoColumnGrid, gap: 20 }}>
              <div>
                <label style={labelStyle}>Pros</label>
                <textarea value={arrayToLines(activeDraft.pros)} onChange={(event) => updateDraftField("pros", linesToArray(event.target.value))} rows={6} style={{ ...inputStyle, minHeight: 160, resize: "vertical" }} />
              </div>
              <div>
                <label style={labelStyle}>Cons</label>
                <textarea value={arrayToLines(activeDraft.cons)} onChange={(event) => updateDraftField("cons", linesToArray(event.target.value))} rows={6} style={{ ...inputStyle, minHeight: 160, resize: "vertical" }} />
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 12, color: "#e2e8f0", fontSize: "1.14rem" }}>
              <input type="checkbox" checked={activeDraft.featured} onChange={(event) => updateDraftField("featured", event.target.checked)} />
              Featured tool
            </label>
          </>
        ) : null}

        {activeDraft.contentType === "aiModel" ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: formTwoColumnGrid, gap: 20 }}>
              <div>
                <label style={labelStyle}>Vendor</label>
                <input value={activeDraft.vendor} onChange={(event) => updateDraftField("vendor", event.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Context window</label>
                <input value={activeDraft.contextWindow} onChange={(event) => updateDraftField("contextWindow", event.target.value)} style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea value={activeDraft.description} onChange={(event) => updateDraftField("description", event.target.value)} rows={8} style={{ ...inputStyle, minHeight: 220, resize: "vertical" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: formTwoColumnGrid, gap: 20 }}>
              <div>
                <label style={labelStyle}>Modalities</label>
                <textarea value={arrayToLines(activeDraft.modalities)} onChange={(event) => updateDraftField("modalities", linesToArray(event.target.value))} rows={4} style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} />
              </div>
              <div>
                <label style={labelStyle}>Pricing summary</label>
                <textarea value={activeDraft.pricingSummary} onChange={(event) => updateDraftField("pricingSummary", event.target.value)} rows={4} style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: formTwoColumnGrid, gap: 20 }}>
              <div>
                <label style={labelStyle}>Release date</label>
                <input value={activeDraft.releaseDate} onChange={(event) => updateDraftField("releaseDate", event.target.value)} style={inputStyle} placeholder="YYYY-MM-DD" />
              </div>
              <div>
                <label style={labelStyle}>Docs URL</label>
                <input value={activeDraft.docsUrl} onChange={(event) => updateDraftField("docsUrl", event.target.value)} style={inputStyle} />
              </div>
            </div>
          </>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: formTwoColumnGrid, gap: 20 }}>
          <div>
            <label style={labelStyle}>SEO Title</label>
            <input value={activeDraft.seoTitle} onChange={(event) => updateDraftField("seoTitle", event.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>SEO Description</label>
            <textarea value={activeDraft.seoDescription} onChange={(event) => updateDraftField("seoDescription", event.target.value)} rows={3} style={{ ...inputStyle, minHeight: 96, resize: "vertical" }} />
          </div>
        </div>

        <RelationFields
          contentType={activeDraft.contentType}
          categories={options.categories}
          tags={options.tags}
          authors={options.authors}
          models={options.models}
          categorySlug={activeDraft.categorySlug ?? ""}
          tagSlugs={activeDraft.tagSlugs}
          authorSlug={"authorSlug" in activeDraft ? activeDraft.authorSlug ?? "" : ""}
          recommendedModelSlugs={"recommendedModelSlugs" in activeDraft ? activeDraft.recommendedModelSlugs : []}
          onCategoryChange={(value) => updateDraftField("categorySlug", value || null)}
          onTagChange={(value) => updateDraftField("tagSlugs", value)}
          onAuthorChange={(value) => updateDraftField("authorSlug", value || null)}
          onModelChange={(value) => updateDraftField("recommendedModelSlugs", value)}
        />

        {"faqs" in activeDraft ? (
          <div>
            <div style={{ color: "#93c5fd", fontSize: "0.98rem", textTransform: "uppercase", letterSpacing: "0.14em" }}>FAQ preview</div>
            <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
              {activeDraft.faqs.length ? (
                activeDraft.faqs.map((faq, index) => (
                  <div key={`${faq.question}-${index}`} style={{ borderRadius: 18, background: "rgba(15, 23, 42, 0.55)", padding: "1.05rem 1.15rem" }}>
                    <strong>{faq.question}</strong>
                    <div style={{ color: "#cbd5e1", marginTop: 6, lineHeight: 1.72, fontSize: "1.03rem" }}>{faq.answer}</div>
                  </div>
                ))
              ) : (
                <div style={{ color: "#cbd5e1" }}>No FAQ items yet.</div>
              )}
            </div>
          </div>
        ) : null}

        {"outline" in activeDraft ? (
          <div>
            <label style={labelStyle}>Outline</label>
            <textarea value={arrayToLines(activeDraft.outline)} onChange={(event) => updateDraftField("outline", linesToArray(event.target.value))} rows={5} style={{ ...inputStyle, minHeight: 150, resize: "vertical" }} />
          </div>
        ) : null}

        <div>
          <div style={{ color: "#93c5fd", fontSize: "0.98rem", textTransform: "uppercase", letterSpacing: "0.14em" }}>Saved state</div>
          <div style={{ color: "#e2e8f0" }}>{result?.saved ? `${result.saved.title ?? result.saved.name ?? result.saved.slug ?? "Saved"}` : "Not saved yet"}</div>
        </div>

        {result?.model ? (
          <div>
            <div style={{ color: "#93c5fd", fontSize: "0.98rem", textTransform: "uppercase", letterSpacing: "0.14em" }}>Model used</div>
            <div style={{ color: "#e2e8f0", lineHeight: 1.65 }}>
              {result.model.usedModel}
              {result.model.fallbackUsed ? ` (fallback from ${result.model.requestedModel})` : ""}
            </div>
            {result.model.fallbackUsed ? (
              <div style={{ color: "#94a3b8", marginTop: 6, fontSize: "1rem", lineHeight: 1.6 }}>
                Tried: {result.model.attemptedModels.join(", ")}
              </div>
            ) : null}
          </div>
        ) : null}
        {result?.webUpdates?.requested ? (
          <div>
            <div style={{ color: "#93c5fd", fontSize: "0.98rem", textTransform: "uppercase", letterSpacing: "0.14em" }}>Latest web updates</div>
            <div style={{ color: "#e2e8f0", lineHeight: 1.65 }}>
              {result.webUpdates.used ? "Enabled and used for this improve run." : "Requested, but this run fell back to source-only improvement."}
            </div>
            {!result.webUpdates.used && result.webUpdates.fallbackReason ? (
              <div style={{ color: "#94a3b8", marginTop: 6, fontSize: "1rem", lineHeight: 1.6 }}>
                Fallback reason: {result.webUpdates.fallbackReason}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: pagePadding,
        background:
          "radial-gradient(circle at top left, rgba(59, 130, 246, 0.2), transparent 32%), radial-gradient(circle at top right, rgba(16, 185, 129, 0.16), transparent 28%), linear-gradient(180deg, #020617 0%, #0f172a 48%, #111827 100%)",
        color: "#f8fafc"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: pageMaxWidth,
          margin: "0 auto",
          transform: pageScale,
          transformOrigin: "top center",
          display: "grid",
          gap: pageGap
        }}
      >
        <header style={{ ...cardStyle, padding: isMobile ? "1.4rem 1.25rem" : isCompact ? "1.8rem 1.6rem" : "2.35rem 2.65rem", display: "grid", gap: isMobile ? 10 : 14 }}>
          <p style={{ margin: 0, letterSpacing: "0.16em", textTransform: "uppercase", color: "#38bdf8", fontSize: "1.12rem" }}>Content workflow</p>
          <h1 style={{ margin: 0, fontSize: isMobile ? "2.35rem" : isCompact ? "2.9rem" : "3.5rem", lineHeight: 1.06 }}>AI Content Studio</h1>
          <p style={{ margin: 0, maxWidth: 1100, color: "#cbd5e1", fontSize: isMobile ? "1.14rem" : isCompact ? "1.24rem" : "1.36rem", lineHeight: 1.72 }}>
            Create, improve, and publish articles, tutorials, prompts, tool listings, and model reference entries from one workspace.
          </p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: twoColumnGrid, gap: isCompact ? 20 : 30, alignItems: "start" }}>
          <form onSubmit={handleSubmit} style={{ ...cardStyle, padding: cardPadding, display: "grid", gap: sectionGap, alignSelf: "start" }}>
            <div>
              <div style={labelStyle}>Content type</div>
              <div style={{ display: "grid", gridTemplateColumns: isTablet ? "minmax(0, 1fr)" : "repeat(5, minmax(0, 1fr))", gap: 16 }}>
                {contentTypeCards.map((card) => {
                  const active = form.contentType === card.type;
                  return (
                    <button
                      key={card.type}
                      type="button"
                      onClick={() => selectContentType(card.type)}
                      style={{
                        ...softButton,
                        textAlign: "left",
                        borderColor: active ? "rgba(56, 189, 248, 0.65)" : "rgba(148, 163, 184, 0.18)",
                        background: active ? "rgba(8, 47, 73, 0.9)" : softButton.background,
                        boxShadow: active ? "0 0 0 1px rgba(56, 189, 248, 0.35) inset" : "none"
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: 8, fontSize: "1.2rem" }}>{card.label}</div>
                      <div style={{ fontSize: "1.1rem", color: "#94a3b8", lineHeight: 1.5 }}>{card.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div style={labelStyle}>Mode</div>
              <div style={{ display: "grid", gridTemplateColumns: isTablet ? "minmax(0, 1fr)" : "repeat(3, minmax(0, 1fr))", gap: 16 }}>
                {modeCards.map((card) => {
                  const active = mode === card.mode;

                  return (
                    <button
                      key={card.mode}
                      type="button"
                      onClick={() => {
                        setMode(card.mode);
                        if (card.mode === "improve") {
                          setForm((current) => ({ ...current, saveDraft: false }));
                        }
                      }}
                      style={{
                        ...softButton,
                        borderColor: active ? "rgba(56, 189, 248, 0.65)" : "rgba(148, 163, 184, 0.18)",
                        background: active ? "rgba(8, 47, 73, 0.9)" : softButton.background,
                        boxShadow: active ? "0 0 0 1px rgba(56, 189, 248, 0.35) inset" : "none"
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: 8, fontSize: "1.2rem" }}>{card.label}</div>
                      <div style={{ fontSize: "1.14rem", color: "#94a3b8", lineHeight: 1.55 }}>{card.description}</div>
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: 12, color: "#94a3b8", fontSize: "1.14rem", lineHeight: 1.55 }}>{modeNote}</div>
            </div>

            <div>
              <label style={labelStyle} htmlFor="studio-key">
                AI studio key
              </label>
              <input id="studio-key" type="password" value={studioKey} onChange={(event) => setStudioKey(event.target.value)} placeholder="Optional if AI_STUDIO_KEY is not set" style={inputStyle} />
            </div>

            {createMode ? (
              <>
                <div>
                  <label style={labelStyle} htmlFor="brief">
                    Quick brief
                  </label>
                  <textarea id="brief" value={form.brief} onChange={(event) => updateField("brief", event.target.value)} placeholder={`Describe the ${getContentTypeLabel(form.contentType).toLowerCase()} you want`} rows={3} style={{ ...inputStyle, minHeight: 118, resize: "vertical" }} />
                  <div style={{ marginTop: 12, color: "#94a3b8", fontSize: "1.14rem", lineHeight: 1.55 }}>
                    Use one sentence if you want Gemini to infer the structure, positioning, and metadata.
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 16 }}>
                    {quickBriefExamples.map((example) => (
                      <button key={`${example.contentType}-${example.brief}`} type="button" onClick={() => applyQuickBrief(example.contentType, example.brief)} style={softButton}>
                        {example.brief}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <div style={labelStyle}>Examples</div>
                  <div style={{ display: "grid", gridTemplateColumns: formTwoColumnGrid, gap: 18 }}>
                    {presets.map((preset) => (
                      <button key={preset.label} type="button" onClick={() => applyPreset(preset)} style={{ ...softButton, textAlign: "left" }}>
                        <div style={{ fontWeight: 700, marginBottom: 8, fontSize: "1.2rem" }}>{preset.label}</div>
                        <div style={{ fontSize: "1.14rem", color: "#94a3b8", lineHeight: 1.55 }}>{preset.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {mode === "improve" ? (
                  <div style={{ display: "grid", gap: 10 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 12, color: "#e2e8f0", fontSize: "1.14rem" }}>
                      <input type="checkbox" checked={form.useLatestWebUpdates} onChange={(event) => updateField("useLatestWebUpdates", event.target.checked)} />
                      Check latest web updates before improving
                    </label>
                    <div style={{ color: "#94a3b8", fontSize: "1.02rem", lineHeight: 1.65 }}>
                      When enabled, the studio tries grounded web verification first. If your Gemini key or project cannot use that feature, it automatically retries with source-only improvement.
                    </div>
                  </div>
                ) : null}
                <div style={{ marginTop: 8 }}>
                  <label style={labelStyle} htmlFor="source-entry-search">
                    Source {getContentTypeLabel(form.contentType).toLowerCase()}
                  </label>
                  <input id="source-entry-search" value={entrySearch} onChange={(event) => setEntrySearch(event.target.value)} placeholder={`Search ${getContentTypeLabel(form.contentType).toLowerCase()} entries`} style={{ ...inputStyle, marginBottom: 10 }} />
                  <select id="source-entry" value={form.sourceEntryDocumentId || selectedSourceEntry?.documentId || ""} onChange={(event) => applySourceEntry(event.target.value)} style={inputStyle}>
                    <option value="">Choose a published entry</option>
                    {filteredEntries.map((entry) => (
                      <option key={entry.documentId} value={entry.documentId}>
                        {entry.title}
                      </option>
                    ))}
                  </select>
                  <div style={{ marginTop: 12, color: "#94a3b8", fontSize: "1.14rem", lineHeight: 1.55 }}>
                    {optionsLoading ? "Loading entries..." : `Pick an existing ${getContentTypeLabel(form.contentType).toLowerCase()} entry to improve.`}
                  </div>
                </div>

                {selectedSourceEntry ? (
                  <div style={{ borderRadius: 18, border: "1px solid rgba(148, 163, 184, 0.16)", padding: "1rem", background: "rgba(15, 23, 42, 0.45)" }}>
                    <div style={{ color: "#93c5fd", fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "0.14em" }}>Loaded source</div>
                    <div style={{ fontWeight: 700, marginTop: 4 }}>{selectedSourceEntry.title}</div>
                    <div style={{ color: "#cbd5e1", marginTop: 6 }}>{selectedSourceEntry.excerpt || "No excerpt available."}</div>
                  </div>
                ) : null}
              </>
            )}

            <div>
              <label style={labelStyle} htmlFor="topic">
                Topic
              </label>
              <input id="topic" value={form.topic} onChange={(event) => updateField("topic", event.target.value)} placeholder={`What should this ${getContentTypeLabel(form.contentType).toLowerCase()} cover?`} style={inputStyle} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: formTwoColumnGrid, gap: 20 }}>
              <div>
                <label style={labelStyle}>Audience</label>
                <select value={form.audience} onChange={(event) => updateField("audience", event.target.value as Audience)} style={inputStyle}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Style</label>
                <select value={form.style} onChange={(event) => updateField("style", event.target.value as ContentStyle)} style={inputStyle}>
                  <option value="guide">Guide</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="comparison">Comparison</option>
                  <option value="news">News</option>
                  <option value="case-study">Case study</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: formTwoColumnGrid, gap: 20 }}>
              <div>
                <label style={labelStyle}>Length</label>
                <select value={form.length} onChange={(event) => updateField("length", event.target.value as ContentLength)} style={inputStyle}>
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tone</label>
                <input value={form.tone} onChange={(event) => updateField("tone", event.target.value)} style={inputStyle} />
              </div>
            </div>

            {!createMode ? (
              <>
                <div>
                  <label style={labelStyle}>Source title</label>
                  <input value={form.sourceTitle} onChange={(event) => updateField("sourceTitle", event.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Source excerpt</label>
                  <textarea value={form.sourceExcerpt} onChange={(event) => updateField("sourceExcerpt", event.target.value)} rows={3} style={{ ...inputStyle, minHeight: 118, resize: "vertical" }} />
                </div>
                <div>
                  <label style={labelStyle}>Source content</label>
                  <textarea value={form.sourceContent} onChange={(event) => updateField("sourceContent", event.target.value)} rows={12} style={{ ...inputStyle, minHeight: 280, resize: "vertical" }} />
                  <div style={{ marginTop: 12, color: "#94a3b8", fontSize: "1.14rem", lineHeight: 1.55 }}>
                    Review or adjust the current source content before regenerating an improved version.
                  </div>
                </div>
              </>
            ) : null}

            <RelationFields
              contentType={form.contentType}
              categories={options.categories}
              tags={options.tags}
              authors={options.authors}
              models={options.models}
              categorySlug={form.categorySlug}
              tagSlugs={form.tagSlugs}
              authorSlug={form.authorSlug}
              recommendedModelSlugs={form.recommendedModelSlugs}
              onCategoryChange={(value) => updateField("categorySlug", value)}
              onTagChange={(value) => updateField("tagSlugs", value)}
              onAuthorChange={(value) => updateField("authorSlug", value)}
              onModelChange={(value) => updateField("recommendedModelSlugs", value)}
            />

            <label style={{ display: "flex", alignItems: "center", gap: 12, color: "#e2e8f0", fontSize: "1.14rem" }}>
              <input type="checkbox" checked={form.saveDraft} onChange={(event) => updateField("saveDraft", event.target.checked)} />
              Save as a Strapi draft after generation
            </label>
            <div style={{ color: "#94a3b8", fontSize: "1.14rem", marginTop: -4, lineHeight: 1.55 }}>
              Draft saves stay in admin for review. Turn it off when you only want a generated preview before publishing.
            </div>

            {error ? (
              <div style={{ borderRadius: 16, border: "1px solid rgba(248, 113, 113, 0.35)", background: "rgba(127, 29, 29, 0.3)", color: "#fecaca", padding: "0.9rem 1rem" }}>
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              style={{
                border: "none",
                borderRadius: 14,
                padding: "0.95rem 1.2rem",
                fontSize: "1.08rem",
                fontWeight: 700,
                color: "#020617",
                background: loading ? "linear-gradient(135deg, #a5b4fc 0%, #bfdbfe 100%)" : "linear-gradient(135deg, #38bdf8 0%, #22c55e 100%)",
                cursor: loading ? "progress" : "pointer"
              }}
            >
              {loading ? "Generating..." : modeLabel}
            </button>
          </form>

          <section style={{ display: "grid", gap: 24, alignSelf: "start" }}>
            <div style={{ ...cardStyle, padding: isMobile ? "1.25rem" : isCompact ? "1.5rem" : "1.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: isCompact ? "flex-start" : "center", flexDirection: isCompact ? "column" : "row" }}>
                <h2 style={{ marginTop: 0, marginBottom: 0, fontSize: isMobile ? "1.52rem" : isCompact ? "1.72rem" : "2rem" }}>
                  {getContentTypeLabel(activeContentType)} draft preview
                </h2>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", width: isCompact ? "100%" : undefined }}>
                  {activeDraft && hasGeneratedDraft ? (
                    <button
                      type="button"
                      onClick={handlePublish}
                      disabled={publishing}
                      style={{
                        border: "none",
                        borderRadius: 14,
                        padding: "1rem 1.15rem",
                        fontSize: "1.2rem",
                        fontWeight: 700,
                        color: "#020617",
                        background: publishing ? "linear-gradient(135deg, #fde68a 0%, #fca5a5 100%)" : "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
                        cursor: publishing ? "progress" : "pointer",
                        width: isCompact ? "100%" : undefined
                      }}
                    >
                      {publishing ? "Publishing..." : "Publish to Strapi"}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => openContentManager(activeContentType)}
                    style={{
                      border: "1px solid rgba(148, 163, 184, 0.22)",
                      borderRadius: 14,
                      padding: "1rem 1.15rem",
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      color: "#e2e8f0",
                      background: "rgba(15, 23, 42, 0.72)",
                      cursor: "pointer",
                      width: isCompact ? "100%" : undefined
                    }}
                  >
                    Open {getContentTypeLabel(activeContentType)} Manager
                  </button>
                </div>
              </div>

              {renderDraftEditor()}
            </div>

            <div style={{ ...cardStyle, padding: isMobile ? "1.25rem" : isCompact ? "1.5rem" : "2.2rem" }}>
              <h2 style={{ marginTop: 0, marginBottom: 14, fontSize: isMobile ? "1.52rem" : isCompact ? "1.72rem" : "1.92rem" }}>Source preview</h2>
              <div style={{ color: "#cbd5e1", fontSize: isMobile ? "1.08rem" : "1.16rem", lineHeight: 1.7 }}>
                {selectedSourceEntry?.sourceContent
                  ? renderMarkdownPreview(selectedSourceEntry.sourceContent)
                  : draftSourcePreview
                    ? renderMarkdownPreview(draftSourcePreview)
                    : "No source loaded yet."}
              </div>
            </div>

            <div style={{ ...cardStyle, padding: isMobile ? "1.25rem" : isCompact ? "1.5rem" : "2.2rem" }}>
              <h2 style={{ marginTop: 0, marginBottom: 14, fontSize: isMobile ? "1.52rem" : isCompact ? "1.72rem" : "1.92rem" }}>Structured JSON</h2>
              <pre
                style={{
                  margin: 0,
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                  color: "#e2e8f0",
                  fontSize: isMobile ? "1.08rem" : isCompact ? "1.16rem" : "1.22rem",
                  lineHeight: 1.6
                }}
              >
                {activeDraft ? prettyJson(activeDraft) : "No draft generated yet."}
              </pre>
            </div>

            <div style={{ ...cardStyle, padding: isMobile ? "1.25rem" : isCompact ? "1.5rem" : "2.2rem" }}>
              <h2 style={{ marginTop: 0, marginBottom: 14, fontSize: isMobile ? "1.52rem" : isCompact ? "1.72rem" : "1.92rem" }}>Recent generations</h2>
              {history.length ? (
                <div style={{ display: "grid", gap: 14 }}>
                  {history.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => applyHistoryItem(item)}
                      style={{
                        textAlign: "left",
                        borderRadius: 18,
                        border: "1px solid rgba(148, 163, 184, 0.16)",
                        background: "rgba(15, 23, 42, 0.72)",
                        color: "#e2e8f0",
                        padding: "1.08rem 1.18rem",
                        cursor: "pointer"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                        <strong>{item.title}</strong>
                        <span style={{ color: "#94a3b8", fontSize: "1.12rem" }}>
                          {getContentTypeLabel(item.contentType)} / {item.mode} / {item.status}
                        </span>
                      </div>
                      <div style={{ color: "#94a3b8", marginTop: 6, fontSize: "1.14rem", lineHeight: 1.55 }}>{item.brief || item.topic}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#cbd5e1", marginBottom: 0 }}>Your recent generations will appear here for quick reuse.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
