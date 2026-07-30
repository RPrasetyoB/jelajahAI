# PRD.md

# JelajahAI — Product Requirements Document

> Companion to AGENT.md. This file defines **what** to build and **why**. AGENT.md defines **how** to build it (stack, coding rules, architecture). AI coding agents should read both before starting work, and re-check this file before making scope or content-model decisions.

---

# 1. Product Vision

A single destination for staying current on AI: articles, a curated tools directory, a prompt library, tutorials, and model comparisons — searchable, fast, and well-organized.

**Primary purpose:** a portfolio project demonstrating senior-level full-stack engineering (Astro + Strapi, clean architecture, performance, accessibility) using only free-tier infrastructure.

**Secondary purpose:** a genuinely useful reference site people would bookmark and return to.

This dual purpose matters for scope decisions: when in doubt, favor the choice that best demonstrates engineering quality over the choice that adds the most content or features.

---

# 2. Target Users

| User | Need |
|---|---|
| AI-curious developer | Wants to discover new tools, compare models, learn via tutorials |
| Hiring manager / recruiter | Evaluating the codebase and UX as a portfolio piece |
| Prompt engineer / power user | Wants a searchable library of reusable prompts |
| Casual reader | Wants digestible articles without wading through jargon |

---

# 3. Scope

## In scope — Version 1

- AI Articles (read, browse, filter by category/tag)
- AI Tools Directory (browse, filter, compare at a glance)
- Prompt Library (browse, copy, filter by category)
- Tutorials (step-based long-form content)
- AI Models (reference pages: capabilities, pricing, links)
- Categories & Tags (shared taxonomy across content types)
- Authors (byline pages)
- Global Search (client-side, Fuse.js)
- Newsletter signup (capture only, no send pipeline required for v1)
- SEO (metadata, sitemap, RSS, JSON-LD)
- Dark mode

## Explicitly out of scope — Version 1

- Authentication / user accounts
- Bookmarks / saved items
- Comments
- Any LLM-powered feature (see Version 2)
- Semantic search
- Payments / monetization

## In scope — Version 2 (only after V1 meets Definition of Done)

- AI Recommendation (related tools/tutorials)
- AI Summary (per-article)
- AI Chat (ask questions about an article)
- Prompt Improver
- AI Comparison (dynamic model/tool comparisons)
- AI Tutor (generates a learning path)

Full detail on each Version 2 feature lives in AGENT.md § "Version 2 — AI Features." This PRD governs prioritization and acceptance criteria for them; AGENT.md governs implementation constraints (service-layer isolation, env vars, graceful fallback).

---

# 4. Content Model (plain-language spec)

AGENT.md lists the Strapi collections; this section defines their shape so agents don't invent fields ad hoc.

### Article
- Title, slug, excerpt, cover image, body (rich text)
- Category (relation), Tags (relation, many)
- Author (relation)
- Published date, updated date
- SEO fields (meta title, meta description, OG image)
- Draft & Publish enabled

### AI Tool
- Name, slug, logo, short description, long description
- Website URL
- Pricing model (free / freemium / paid / enterprise — enum)
- Category (relation), Tags (relation, many)
- Pros / Cons (list)
- Featured flag (boolean, for homepage highlighting)

### AI Model
- Name, slug, vendor (e.g. Anthropic, OpenAI, Google)
- Description
- Context window, modality (text/image/audio/video — multi-select)
- Pricing summary (input/output cost, or "see vendor")
- Release date
- Link to official docs

### Prompt
- Title, slug, prompt text, use-case description
- Category (relation), Tags (relation, many)
- Recommended model(s) (relation to AI Model, optional)
- Copy-to-clipboard is a required UI affordance

### Tutorial
- Title, slug, excerpt, cover image
- Steps (dynamic zone or ordered components — each step has title + rich text + optional code block/image)
- Difficulty level (beginner / intermediate / advanced)
- Estimated time
- Category (relation), Tags (relation, many)
- Author (relation)

### Category / Tag
- Name, slug, description (optional)
- Shared across all content types listed above (polymorphic-style relations, not duplicated per type)

### Author
- Name, slug, avatar, bio, social links (optional)

### Newsletter
- Email, subscribed date, status (pending/confirmed — if using double opt-in later)

### Site Settings
- Site title, tagline, default SEO image, social links, footer content
- Single type in Strapi

---

# 5. Core User Stories (Version 1)

- As a visitor, I can browse articles by category or tag and read one without layout shift or slow image loads.
- As a visitor, I can search across all content types from one search bar and get relevant results instantly.
- As a visitor, I can browse the AI Tools directory, filter by category/pricing, and open a tool's site.
- As a visitor, I can browse the Prompt Library, filter by category, and copy a prompt in one click.
- As a visitor, I can follow a Tutorial step by step.
- As a visitor, I can compare AI Models side by side on a reference page.
- As a visitor, I can subscribe to the newsletter from any page.
- As a visitor, I can toggle dark/light mode and my preference persists.
- As a search engine, I can crawl a sitemap, read structured data, and index accurate metadata for every page.
- As a screen reader user, I can navigate all core flows (browse, search, read) without barriers (WCAG AA).

---

# 6. Success Criteria

Beyond the Lighthouse targets already defined in AGENT.md (Performance >95, Accessibility >95, SEO 100, Best Practices 100):

- Every content type has at least one working end-to-end flow: list → detail → related content.
- Global search returns relevant results across articles, tools, prompts, tutorials, and models.
- Site is fully navigable and readable with JavaScript disabled where SSG allows it (progressive enhancement for interactive islands only).
- No content type is a dead end — every detail page links to related items (same category/tag, or same author).
- README documents setup clearly enough that a stranger could clone, configure env vars, and run the project locally.

---

# 7. Version 2 Prioritization

If/when Version 2 begins, build in this order (highest value-to-effort first):

1. **AI Summary** — self-contained, cheapest to cache, clear user value.
2. **AI Recommendation** — reuses existing taxonomy (category/tag) as a fallback if no LLM key is present.
3. **Prompt Improver** — small, isolated feature, good demo of LLM API integration.
4. **AI Comparison** — depends on AI Model content model being complete.
5. **AI Chat** — higher complexity (context handling, cost management).
6. **AI Tutor** — highest complexity (multi-step generation, longer sessions); build last.

Each Version 2 feature must ship with:
- A non-AI fallback state (loading, error, or "unavailable" UI) so the app never breaks without an API key.
- Response caching where the same input would produce the same output (e.g. article summaries).

---

# 8. Open Questions

Track decisions here as they're made so agents don't re-litigate them mid-project.

- [ ] Which LLM provider/model powers Version 2 features?
- [ ] Does the newsletter need actual email delivery in v1, or is capture-to-database sufficient?
- [ ] Is content seeded manually or via a seed script (AGENT.md milestone 7 assumes seeding — format TBD)?
- [ ] How many items per content type are needed for the directory/library to feel populated for portfolio review?

---

# 9. Relationship to AGENT.md

| This file (PRD.md) | AGENT.md |
|---|---|
| What to build | How to build it |
| Content model, user stories | Stack, coding rules, folder structure |
| Prioritization, success criteria | Milestones, Definition of Done, agent behavior rules |
| Product decisions | Engineering decisions |

Agents should read PRD.md first to understand intent, then AGENT.md to understand execution constraints, for every milestone.
