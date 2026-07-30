import type {
  AiModel,
  AiTool,
  Article,
  Author,
  Category,
  ContentReference,
  Prompt,
  SiteSettings,
  Tag,
  Tutorial,
  NewsletterEntry
} from "@jelajahai/types";

export type ContentKind = "articles" | "tools" | "prompts" | "tutorials" | "models";

export type HomeContent = {
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

export interface ContentCard {
  title: string;
  slug: string;
  excerpt: string;
  category?: ContentReference | null | undefined;
}

export interface ContentDetail {
  title: string;
  slug: string;
  excerpt?: string | null | undefined;
  body?: string | null | undefined;
  category?: ContentReference | null | undefined;
  tags?: ContentReference[] | undefined;
  author?: ContentReference | null | undefined;
}
