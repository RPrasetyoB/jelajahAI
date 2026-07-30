export const pricingModels = ["free", "freemium", "paid", "enterprise"] as const;
export type PricingModel = (typeof pricingModels)[number];

export const difficultyLevels = ["beginner", "intermediate", "advanced"] as const;
export type DifficultyLevel = (typeof difficultyLevels)[number];

export const newsletterStatuses = ["pending", "confirmed"] as const;
export type NewsletterStatus = (typeof newsletterStatuses)[number];

export const modelModalities = ["text", "image", "audio", "video"] as const;
export type ModelModality = (typeof modelModalities)[number];

export interface MediaAsset {
  id?: number;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface SeoFields {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: MediaAsset | null;
}

export interface ContentReference {
  id: number;
  name: string;
  slug: string;
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
}

export interface Author {
  id: number;
  name: string;
  slug: string;
  avatar?: MediaAsset | null;
  bio?: string | null;
  websiteUrl?: string | null;
  xUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: MediaAsset | null;
  body: string;
  category?: ContentReference | null;
  tags: ContentReference[];
  author?: ContentReference | null;
  seo?: SeoFields | null;
}

export interface ToolPricingPlan {
  name: string;
  description?: string | null;
  priceLabel: string;
  billingLabel?: string | null;
  badge?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  highlights: string[];
  featured?: boolean;
}

export interface ToolPricingTab {
  id: string;
  label: string;
  description?: string | null;
  plans: ToolPricingPlan[];
}

export interface AiTool {
  id: number;
  name: string;
  slug: string;
  logo?: MediaAsset | null;
  shortDescription: string;
  longDescription?: string | null;
  websiteUrl: string;
  pricingModel: PricingModel;
  pricingSummary?: string | null;
  startingPrice?: string | null;
  billingPeriod?: string | null;
  freeTierAvailable?: boolean;
  pricingNotes?: string | null;
  pricingDefaultTab?: string | null;
  pricingTabs: ToolPricingTab[];
  category?: ContentReference | null;
  tags: ContentReference[];
  pros: string[];
  cons: string[];
  featured: boolean;
  seo?: SeoFields | null;
}

export interface AiModel {
  id: number;
  name: string;
  slug: string;
  vendor: string;
  description?: string | null;
  contextWindow?: string | null;
  modalities: ModelModality[];
  pricingSummary?: string | null;
  releaseDate?: string | null;
  docsUrl: string;
  seo?: SeoFields | null;
}

export interface Prompt {
  id: number;
  title: string;
  slug: string;
  promptText: string;
  useCaseDescription: string;
  category?: ContentReference | null;
  tags: ContentReference[];
  recommendedModels: ContentReference[];
  seo?: SeoFields | null;
}

export interface TutorialStep {
  title: string;
  body: string;
  codeBlock?: string | null;
  image?: MediaAsset | null;
}

export interface Tutorial {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: MediaAsset | null;
  steps: TutorialStep[];
  difficulty: DifficultyLevel;
  estimatedTime: string;
  category?: ContentReference | null;
  tags: ContentReference[];
  author?: ContentReference | null;
  seo?: SeoFields | null;
}

export interface NewsletterEntry {
  id: number;
  email: string;
  subscribedAt?: string | null;
  status: NewsletterStatus;
}

export interface SiteSettings {
  siteTitle: string;
  tagline?: string | null;
  defaultSeoImage?: MediaAsset | null;
  socialLinks: SocialLink[];
  footerContent?: string | null;
}
