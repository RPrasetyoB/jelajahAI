import type { AiModel, AiTool, Article, Prompt, Tutorial, TutorialStep } from "@jelajahai/types";
import type { ContentCard, ContentDetail, ContentKind, HomeContent } from "./content-types";

export type CollectionEntry = Article | AiTool | Prompt | Tutorial | AiModel;

export const toCard = (entry: CollectionEntry): ContentCard => {
  const card: ContentCard = {
    title: "",
    slug: "",
    excerpt: ""
  };

  if ("shortDescription" in entry) {
    card.title = entry.name;
    card.slug = entry.slug;
    card.excerpt = entry.shortDescription;
    if (entry.category) {
      card.category = entry.category;
    }
    return card;
  }

  if ("promptText" in entry) {
    card.title = entry.title;
    card.slug = entry.slug;
    card.excerpt = entry.useCaseDescription;
    if (entry.category) {
      card.category = entry.category;
    }
    return card;
  }

  if ("steps" in entry) {
    card.title = entry.title;
    card.slug = entry.slug;
    card.excerpt = entry.excerpt ?? entry.estimatedTime;
    if (entry.category) {
      card.category = entry.category;
    }
    return card;
  }

  if ("vendor" in entry) {
    card.title = entry.name;
    card.slug = entry.slug;
    card.excerpt = entry.description ?? entry.pricingSummary ?? "";
    return card;
  }

  card.title = entry.title;
  card.slug = entry.slug;
  card.excerpt = entry.excerpt ?? "";
  if (entry.category) {
    card.category = entry.category;
  }
  return card;
};

const toDetail = (entry: CollectionEntry): ContentDetail => {
  if ("shortDescription" in entry) {
    return {
      title: entry.name,
      slug: entry.slug,
      excerpt: entry.shortDescription,
      body: entry.longDescription,
      category: entry.category,
      tags: entry.tags
    };
  }

  if ("promptText" in entry) {
    return {
      title: entry.title,
      slug: entry.slug,
      excerpt: entry.useCaseDescription,
      body: entry.promptText,
      category: entry.category,
      tags: entry.tags
    };
  }

  if ("steps" in entry) {
    return {
      title: entry.title,
      slug: entry.slug,
      excerpt: entry.excerpt,
      body: entry.steps.map((step: TutorialStep) => `${step.title}\n${step.body}`).join("\n\n"),
      category: entry.category,
      tags: entry.tags,
      author: entry.author
    };
  }

  if ("vendor" in entry) {
    return {
      title: entry.name,
      slug: entry.slug,
      excerpt: entry.description,
      body: entry.pricingSummary
    };
  }

  const detail: ContentDetail = {
    title: entry.title,
    slug: entry.slug,
    excerpt: entry.excerpt,
    body: entry.body
  };

  if (entry.category) {
    detail.category = entry.category;
  }

  if (entry.tags) {
    detail.tags = entry.tags;
  }

  if (entry.author) {
    detail.author = entry.author;
  }

  return detail;
};

export const getCollectionEntries = (content: HomeContent, kind: ContentKind): CollectionEntry[] => {
  if (kind === "articles") {
    return content.articles;
  }

  if (kind === "tools") {
    return content.tools;
  }

  if (kind === "prompts") {
    return content.prompts;
  }

  if (kind === "tutorials") {
    return content.tutorials;
  }

  return content.models;
};

export const getCollectionEntry = (content: HomeContent, kind: ContentKind, slug: string) =>
  getCollectionEntries(content, kind).find((entry) => entry.slug === slug) ?? null;

export const getCollectionCards = (content: HomeContent, kind: ContentKind): ContentCard[] =>
  getCollectionEntries(content, kind).map((entry) => toCard(entry));

export const getCategories = (content: HomeContent) => content.categories;
export const getTags = (content: HomeContent) => content.tags;
export const getAuthors = (content: HomeContent) => content.authors;

export const getCategoryCollections = (content: HomeContent, slug: string) => ({
  articles: content.articles.filter((entry) => entry.category?.slug === slug),
  tools: content.tools.filter((entry) => entry.category?.slug === slug),
  prompts: content.prompts.filter((entry) => entry.category?.slug === slug),
  tutorials: content.tutorials.filter((entry) => entry.category?.slug === slug)
});

export const getTagCollections = (content: HomeContent, slug: string) => ({
  articles: content.articles.filter((entry) => entry.tags.some((tag) => tag.slug === slug)),
  tools: content.tools.filter((entry) => entry.tags.some((tag) => tag.slug === slug)),
  prompts: content.prompts.filter((entry) => entry.tags.some((tag) => tag.slug === slug)),
  tutorials: content.tutorials.filter((entry) => entry.tags.some((tag) => tag.slug === slug))
});

export const getAuthorCollections = (content: HomeContent, slug: string) => ({
  articles: content.articles.filter((entry) => entry.author?.slug === slug),
  tutorials: content.tutorials.filter((entry) => entry.author?.slug === slug)
});

export type SearchIndexItem = {
  title: string;
  slug: string;
  kind: ContentKind | "categories" | "tags" | "authors";
  url: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
};

export const getSearchIndex = (content: HomeContent): SearchIndexItem[] => {
  const build = (kind: SearchIndexItem["kind"], entry: CollectionEntry): SearchIndexItem => {
    const card = toCard(entry);
    const category = card.category?.name ?? "";
    const tags =
      "tags" in entry ? entry.tags.map((tag) => tag.name) : [];
    const author = "author" in entry && entry.author ? entry.author.name : "";

    return {
      title: card.title,
      slug: card.slug,
      kind,
      url: `/${kind}/${card.slug}/`,
      excerpt: card.excerpt,
      category,
      tags,
      author
    };
  };

  return [
    ...content.articles.map((entry) => build("articles", entry)),
    ...content.tools.map((entry) => build("tools", entry)),
    ...content.prompts.map((entry) => build("prompts", entry)),
    ...content.tutorials.map((entry) => build("tutorials", entry)),
    ...content.models.map((entry) => build("models", entry)),
    ...content.categories.map((entry) => ({
      title: entry.name,
      slug: entry.slug,
      kind: "categories" as const,
      url: `/categories/${entry.slug}/`,
      excerpt: entry.description ?? "Browse related content in this category.",
      category: entry.name,
      tags: [],
      author: ""
    })),
    ...content.tags.map((entry) => ({
      title: entry.name,
      slug: entry.slug,
      kind: "tags" as const,
      url: `/tags/${entry.slug}/`,
      excerpt: entry.description ?? "Browse related content with this tag.",
      category: "",
      tags: [],
      author: ""
    })),
    ...content.authors.map((entry) => ({
      title: entry.name,
      slug: entry.slug,
      kind: "authors" as const,
      url: `/authors/${entry.slug}/`,
      excerpt: entry.bio ?? "Browse work by this author.",
      category: "",
      tags: [],
      author: entry.name
    }))
  ];
};

export const getCollectionDetail = (content: HomeContent, kind: ContentKind, slug: string) => {
  const item = getCollectionEntries(content, kind).find((entry) => entry.slug === slug);
  return item ? toDetail(item) : null;
};

export const getCollectionTitle = (kind: ContentKind) => {
  if (kind === "articles") return "Articles";
  if (kind === "tools") return "Tools";
  if (kind === "prompts") return "Prompt Library";
  if (kind === "tutorials") return "Tutorials";
  return "Models";
};

export const getCollectionDescription = (kind: ContentKind) => {
  if (kind === "articles") return "Browse AI articles and editorial reads.";
  if (kind === "tools") return "Compare AI tools at a glance.";
  if (kind === "prompts") return "Copy-ready prompts organized by use case.";
  if (kind === "tutorials") return "Step-by-step tutorials for practical learning.";
  return "Reference pages for major AI models.";
};
