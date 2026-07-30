# AGENT.md

# JelajahAI (AI Knowledge Hub)

> Master instruction file for AI coding agents (Claude Code, Cursor, Codex CLI, Roo Code, Windsurf, Kiro).

## Mission

Build a **production-quality AI Knowledge Hub** using modern, free-tier services and clean architecture. The codebase should be portfolio-worthy, scalable, well-tested, accessible, SEO-friendly, and maintainable.

---

# Architecture

```text
GitHub
   │
GitHub Actions
   ├── Astro (Vercel)
   └── Strapi (Strapi Cloud)

Strapi
 ├── Neon PostgreSQL
 └── Cloudinary

Users
   ↓
Astro Frontend
```

## Stack

- Astro 5
- Strapi 5
- TypeScript (strict)
- Tailwind CSS v4
- shadcn/ui
- pnpm
- Turborepo
- Neon PostgreSQL
- Cloudinary
- Vercel (Frontend)
- Strapi Cloud (Backend)
- GitHub Actions
- Fuse.js
- Vitest
- Playwright

---

# Core Features

- AI Articles
- AI Tools Directory
- Prompt Library
- Tutorials
- AI Models
- Categories
- Tags
- Authors
- Global Search
- Newsletter
- SEO
- RSS
- Sitemap
- Dark Mode

Future:
- Authentication
- Bookmarks
- AI recommendations
- Comments
- Semantic search

---

# Repository

```text
apps/
  web/
  cms/

packages/
  ui/
  types/
  utils/
  config/

docs/

.github/
```

---

# Coding Rules

- TypeScript only.
- `"strict": true`
- Never use `any`.
- Never ignore lint errors.
- Never disable type checking.
- Prefer composition.
- SOLID principles.
- Small reusable components.
- No duplicated logic.
- No inline styles.
- Keep files under ~300 lines where practical.

---

# Frontend Rules

- Mobile first.
- Astro Islands only for interactive UI.
- Prefer SSG.
- Lazy load images.
- Use Astro Image.
- Use View Transitions.
- Accessibility first.
- WCAG AA.

---

# Backend Rules

Collections:

- Articles
- Categories
- Tags
- Authors
- AI Tools
- AI Models
- Prompts
- Tutorials
- Newsletter
- Site Settings

Use:
- Draft & Publish
- UID Slugs
- Relations
- Components
- Dynamic Zones where appropriate

---

# API

Never fetch directly in UI.

Flow:

Page
→ Service
→ Repository
→ API Client
→ Strapi

---

# Design

Inspired by:
- Vercel
- Linear
- OpenAI

Minimal.
Clean.
Professional.

Support:
- Dark
- Light

---

# SEO

Every page:

- Title
- Description
- Canonical
- OG
- Twitter Card
- JSON-LD
- Sitemap
- RSS
- robots.txt

---

# Performance

Targets

- Lighthouse Performance >95
- Accessibility >95
- SEO 100
- Best Practices 100

Avoid unnecessary hydration.

---

# Deployment

Frontend
- Vercel

Backend
- Strapi Cloud

Database
- Neon

Media
- Cloudinary

---

# Environment

Required variables

Frontend

- PUBLIC_API_URL

CMS

- DATABASE_URL
- CLOUDINARY_NAME
- CLOUDINARY_KEY
- CLOUDINARY_SECRET
- APP_KEYS
- API_TOKEN_SALT
- JWT_SECRET

Version 2 (AI Features)

- LLM_API_KEY

---

# Milestones

1. Initialize monorepo
2. Configure Astro
3. Configure Strapi
4. Configure Neon
5. Configure Cloudinary
6. Create content types
7. Seed sample data
8. Build shared UI
9. Homepage
10. Articles
11. Tools
12. Prompts
13. Tutorials
14. Models
15. Search
16. SEO
17. Accessibility
18. Tests
19. Deploy
20. Polish portfolio

Each milestone must:
- Build
- Pass lint
- Pass typecheck
- Deploy successfully

---

# Definition of Done

- Responsive
- Accessible
- SEO complete
- Search works
- RSS works
- Sitemap generated
- No TS errors
- No ESLint errors
- CI passing
- Production deployed
- README complete

---

# Version 2 — AI Features

Once Version 1 is complete, you can start adding AI-powered features.

For example:

## AI Recommendation

```text
User visits Cursor.
   ↓
AI recommends
   • Claude Code
   • Codex
   • GitHub Copilot
   • Similar tutorials
```

## AI Summary

Instead of reading a long article:

```text
Summarize this article
```

AI returns

```text
• Main idea
• Pros
• Cons
• Key takeaways
```

Requires an LLM API.

## AI Chat

```text
Ask about this article
```

Example:

```text
Explain RAG like I'm five.
```

Requires an LLM API.

## Prompt Improver

```text
Original Prompt
   ↓
  AI
   ↓
Improved Prompt
```

Requires an LLM API.

## AI Comparison

```text
Compare
   Claude
     vs
    GPT-5
     vs
   Gemini
```

Generate a comparison dynamically.

Requires an LLM API.

## AI Tutor

```text
I want to learn AI agents.
   ↓
AI generates
   Week 1
     ↓
   Week 2
     ↓
   Week 3
```

Requires an LLM API.

## Notes for AI Agents

- Do not start Version 2 work until Version 1 meets the Definition of Done.
- Each AI feature is additive and optional — the app must remain fully functional without an LLM API key configured.
- Isolate AI feature logic behind a dedicated service layer (e.g. `packages/utils/ai/`), never call the LLM API directly from UI components.
- Never hardcode API keys; use environment variables.
- Handle LLM API failures and rate limits gracefully with clear UI fallback states.
- Keep AI feature costs in mind — prefer caching AI responses (e.g. summaries) instead of regenerating on every request.

---

# AI Agent Behavior

Before coding:

1. Understand requirement.
2. Design architecture.
3. Create types.
4. Create API.
5. Create reusable components.
6. Implement pages.
7. Optimize performance.
8. Test.
9. Document.

Never:
- Leave TODOs.
- Ship broken code.
- Duplicate logic.
- Hardcode secrets.
- Add unnecessary dependencies.

Always leave the repository in a deployable state.

End goal:
A portfolio project demonstrating senior-level full-stack engineering with Astro + Strapi using only free-tier infrastructure.
