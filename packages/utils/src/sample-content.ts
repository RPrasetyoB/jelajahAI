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

export interface SampleContentBundle {
  siteSettings: SiteSettings;
  categories: Category[];
  tags: Tag[];
  authors: Author[];
  articles: Article[];
  tools: AiTool[];
  models: AiModel[];
  prompts: Prompt[];
  tutorials: Tutorial[];
  newsletter: NewsletterEntry[];
}

const categories: Category[] = [
  { id: 1, name: "AI News", slug: "ai-news", description: "Updates and analysis from the AI ecosystem." },
  { id: 2, name: "Prompting", slug: "prompting", description: "Practical prompt design and workflows." },
  { id: 3, name: "Tooling", slug: "tooling", description: "Curated software for AI-powered work." },
  { id: 4, name: "Tutorials", slug: "tutorials", description: "Step-by-step learning paths." }
];

const tags: Tag[] = [
  { id: 1, name: "RAG", slug: "rag", description: "Retrieval augmented generation." },
  { id: 2, name: "Agents", slug: "agents", description: "Agent design and orchestration." },
  { id: 3, name: "OpenAI", slug: "openai", description: "OpenAI platform and model coverage." },
  { id: 4, name: "Productivity", slug: "productivity", description: "Tools and workflows that save time." }
];

const authors: Author[] = [
  {
    id: 1,
    name: "Ayu Rahman",
    slug: "ayu-rahman",
    bio: "Writes about AI workflows, tooling, and practical shipping habits.",
    websiteUrl: "https://example.com",
    githubUrl: "https://github.com/example"
  },
  {
    id: 2,
    name: "Dimas Pratama",
    slug: "dimas-pratama",
    bio: "Focuses on prompt engineering and model evaluation."
  }
];

const categoryRef = (name: string): ContentReference => {
  const category = categories.find((entry) => entry.name === name);

  if (!category) {
    throw new Error(`Missing sample category: ${name}`);
  }

  return { id: category.id, name: category.name, slug: category.slug };
};

const tagRef = (name: string): ContentReference => {
  const tag = tags.find((entry) => entry.name === name);

  if (!tag) {
    throw new Error(`Missing sample tag: ${name}`);
  }

  return { id: tag.id, name: tag.name, slug: tag.slug };
};

const authorRef = (name: string): ContentReference => {
  const author = authors.find((entry) => entry.name === name);

  if (!author) {
    throw new Error(`Missing sample author: ${name}`);
  }

  return { id: author.id, name: author.name, slug: author.slug };
};

const articles: Article[] = [
  {
    id: 1,
    title: "How to evaluate an AI tool without getting lost in features",
    slug: "evaluate-ai-tool-without-lost-in-features",
    excerpt: "A practical framework for comparing AI products by fit, not hype.",
    body: "Use problem framing, workflow fit, pricing, and reliability as your primary lenses.",
    category: categoryRef("AI News"),
    tags: [tagRef("Productivity"), tagRef("Agents")],
    author: authorRef("Ayu Rahman"),
    coverImage: {
      url: "/images/featured-evaluate-tool.png",
      alt: "Evaluating AI tools framework diagram",
      width: 1200,
      height: 675
    },
    seo: {
      metaTitle: "Evaluate AI Tools with a Clear Framework",
      metaDescription: "A practical way to compare AI tools by workflow fit, reliability, and price."
    }
  },
  {
    id: 2,
    title: "What prompt libraries get wrong",
    slug: "what-prompt-libraries-get-wrong",
    excerpt: "Why copy-paste prompt collections need structure to stay useful.",
    body: "Good libraries need intent, model guidance, and examples that reflect real tasks.",
    category: categoryRef("Prompting"),
    tags: [tagRef("OpenAI"), tagRef("RAG")],
    author: authorRef("Dimas Pratama")
  },
  {
    id: 3,
    title: "Designing workflows for autonomous AI agents",
    slug: "designing-workflows-for-autonomous-ai-agents",
    excerpt: "An in-depth look at state-machine architectures, routing, and tool-calling validation for production-ready agentic workflows.",
    body: "Enterprise agent deployments require deterministic fallback states and runtime constraint guardrails.",
    category: categoryRef("AI News"),
    tags: [tagRef("Agents"), tagRef("Productivity")],
    author: authorRef("Ayu Rahman")
  },
  {
    id: 4,
    title: "Hybrid search strategies in modern RAG systems",
    slug: "hybrid-search-strategies-in-modern-rag-systems",
    excerpt: "Optimizing retrieval quality by combining keyword lexical matching with dense vector embeddings.",
    body: "Standard vector retrieval struggles with exact keyword queries. Combining it with BM25 via Reciprocal Rank Fusion solves it.",
    category: categoryRef("AI News"),
    tags: [tagRef("RAG"), tagRef("OpenAI")],
    author: authorRef("Dimas Pratama"),
    coverImage: {
      url: "/images/rag-hybrid-search.png",
      alt: "RAG hybrid search database query visual",
      width: 1200,
      height: 675
    }
  },
  {
    id: 5,
    title: "Getting started with GPT-5 reasoning capabilities",
    slug: "getting-started-with-gpt-5-reasoning-capabilities",
    excerpt: "Understanding reasoning tokens, system prompts, and multi-turn planning in the newest frontier model.",
    body: "GPT-5 introduces native search execution and architectural reasoning steps prior to generating final output sequences.",
    category: categoryRef("AI News"),
    tags: [tagRef("OpenAI"), tagRef("Agents")],
    author: authorRef("Dimas Pratama"),
    coverImage: {
      url: "/images/gpt5-reasoning.png",
      alt: "GPT-5 neural pathways reasoning diagram",
      width: 1200,
      height: 675
    }
  },
  {
    id: 6,
    title: "Building a model comparison interface with Astro",
    slug: "building-model-comparison-interface-with-astro",
    excerpt: "A step-by-step tutorial on building a high-performance model comparison page using Astro's server-side rendering.",
    body: "Leverage Astro islands for client-side comparison filter logic while keeping static references pre-rendered on the server.",
    category: categoryRef("Tutorials"),
    tags: [tagRef("Productivity")],
    author: authorRef("Ayu Rahman")
  },
  {
    id: 7,
    title: "The shift towards open weight model orchestration",
    slug: "shift-towards-open-weight-model-orchestration",
    excerpt: "Why enterprise teams are shifting from closed API models to hosting open-weight models like Llama 3 on private clouds.",
    body: "Data privacy regulations and cost-at-scale optimizations make local open weight model hosting highly attractive.",
    category: categoryRef("Tooling"),
    tags: [tagRef("Productivity"), tagRef("Agents")],
    author: authorRef("Ayu Rahman")
  }
];

const tools: AiTool[] = [
  {
    id: 1,
    name: "Cursor",
    slug: "cursor",
    shortDescription: "AI-first code editor for shipping faster.",
    longDescription: "A popular editor that blends chat, edits, and codebase-aware assistance.",
    websiteUrl: "https://cursor.com",
    pricingModel: "freemium",
    pricingSummary: "Free tier available, with paid plans unlocking advanced AI features and higher usage limits.",
    startingPrice: "$20",
    billingPeriod: "month",
    freeTierAvailable: true,
    pricingNotes: "Teams typically start on the free tier and upgrade for higher usage limits and premium AI features.",
    pricingDefaultTab: "monthly",
    pricingTabs: [
      {
        id: "monthly",
        label: "Monthly",
        description: "Flexible month-to-month plans for solo developers and teams.",
        plans: [
          {
            name: "Hobby",
            priceLabel: "Free",
            billingLabel: "No credit card required",
            ctaLabel: "Download",
            ctaUrl: "https://cursor.com",
            highlights: ["Limited agent requests", "Access to Composer", "Good for trying the workflow"],
            featured: false
          },
          {
            name: "Individual",
            description: "For daily development with deeper AI usage.",
            priceLabel: "$20",
            billingLabel: "per user / month",
            badge: "Most popular",
            ctaLabel: "Get Pro",
            ctaUrl: "https://cursor.com/pricing",
            highlights: ["Extended agent limits", "Frontier model access", "MCPs, skills, and hooks", "Cloud agents"],
            featured: true
          },
          {
            name: "Teams",
            description: "Shared billing and collaboration controls.",
            priceLabel: "$40",
            billingLabel: "per user / month",
            ctaLabel: "Get Teams",
            ctaUrl: "https://cursor.com/pricing",
            highlights: ["Centralized billing", "Internal rules and skills", "Usage analytics", "SAML/SSO support"],
            featured: false
          },
          {
            name: "Enterprise",
            description: "Procurement-friendly plans with admin controls.",
            priceLabel: "Custom",
            billingLabel: "Contact sales",
            ctaLabel: "Contact sales",
            ctaUrl: "https://cursor.com/pricing",
            highlights: ["Invoice or PO billing", "Advanced access controls", "Audit logs", "Priority support"],
            featured: false
          }
        ]
      },
      {
        id: "yearly",
        label: "Yearly",
        description: "Lower effective pricing for teams committing annually.",
        plans: [
          {
            name: "Hobby",
            priceLabel: "Free",
            billingLabel: "No credit card required",
            ctaLabel: "Download",
            ctaUrl: "https://cursor.com",
            highlights: ["Limited agent requests", "Access to Composer", "Good for trying the workflow"],
            featured: false
          },
          {
            name: "Individual",
            description: "Annual discount for solo developers.",
            priceLabel: "$16",
            billingLabel: "per user / month billed yearly",
            badge: "Save yearly",
            ctaLabel: "Get Pro",
            ctaUrl: "https://cursor.com/pricing",
            highlights: ["Extended agent limits", "Frontier model access", "MCPs, skills, and hooks", "Cloud agents"],
            featured: true
          },
          {
            name: "Teams",
            description: "Annual commitment for collaborative teams.",
            priceLabel: "$32",
            billingLabel: "per user / month billed yearly",
            ctaLabel: "Get Teams",
            ctaUrl: "https://cursor.com/pricing",
            highlights: ["Centralized billing", "Internal rules and skills", "Usage analytics", "SAML/SSO support"],
            featured: false
          },
          {
            name: "Enterprise",
            description: "Custom procurement and security review support.",
            priceLabel: "Custom",
            billingLabel: "Annual contract",
            ctaLabel: "Contact sales",
            ctaUrl: "https://cursor.com/pricing",
            highlights: ["Invoice or PO billing", "Advanced access controls", "Audit logs", "Priority support"],
            featured: false
          }
        ]
      }
    ],
    category: categoryRef("Tooling"),
    tags: [tagRef("Productivity"), tagRef("Agents")],
    pros: ["Fast iteration", "Strong editing workflow", "Good developer ergonomics"],
    cons: ["Requires habit change", "Some advanced features are paid"],
    featured: true,
    seo: {
      metaTitle: "Cursor Review",
      metaDescription: "An AI-first code editor with a strong editing workflow."
    }
  }
];

const models: AiModel[] = [
  {
    id: 1,
    name: "GPT-5",
    slug: "gpt-5",
    vendor: "OpenAI",
    description: "General-purpose model suited for reasoning and writing tasks.",
    contextWindow: "Large",
    modalities: ["text"],
    pricingSummary: "See OpenAI pricing",
    releaseDate: "2026-01-01",
    docsUrl: "https://openai.com"
  },
  {
    id: 2,
    name: "Claude",
    slug: "claude",
    vendor: "Anthropic",
    description: "Strong at long-form analysis and structured writing.",
    contextWindow: "Large",
    modalities: ["text"],
    pricingSummary: "See Anthropic pricing",
    releaseDate: "2026-01-01",
    docsUrl: "https://anthropic.com"
  }
];

const prompts: Prompt[] = [
  {
    id: 1,
    title: "Turn a rough idea into a launch plan",
    slug: "turn-rough-idea-into-launch-plan",
    promptText: "Act as a product strategist...",
    useCaseDescription: "Great for product brainstorming and roadmap shaping.",
    category: categoryRef("Prompting"),
    tags: [tagRef("Productivity")],
    recommendedModels: [{ id: 1, name: "GPT-5", slug: "gpt-5" }]
  }
];

const tutorials: Tutorial[] = [
  {
    id: 1,
    title: "Build a simple AI knowledge workflow",
    slug: "build-simple-ai-knowledge-workflow",
    excerpt: "Plan a content workflow that stays searchable and reusable.",
    steps: [
      {
        title: "Define the content buckets",
        body: "Split the library into articles, prompts, tutorials, tools, and models."
      },
      {
        title: "Connect the source of truth",
        body: "Use the CMS as the canonical source, then hydrate the frontend from it."
      }
    ],
    difficulty: "beginner",
    estimatedTime: "20 min",
    category: categoryRef("Tutorials"),
    tags: [tagRef("Agents")],
    author: authorRef("Ayu Rahman")
  }
];

export const sampleContent: SampleContentBundle = {
  siteSettings: {
    siteTitle: "JelajahAI",
    tagline: "A clean AI knowledge hub for articles, tools, prompts, tutorials, and models.",
    socialLinks: [
      { label: "GitHub", url: "https://github.com" },
      { label: "X", url: "https://x.com" }
    ],
    footerContent: "Curated for readers who want signal, not noise."
  },
  categories,
  tags,
  authors,
  articles,
  tools,
  models,
  prompts,
  tutorials,
  newsletter: [
    { id: 1, email: "reader@example.com", subscribedAt: "2026-07-22T00:00:00.000Z", status: "confirmed" }
  ]
};
