# JelajahAI

AI Knowledge Hub built as a portfolio-grade monorepo with Astro and Strapi.

## Astro + Strapi integration

This project uses Astro as the public frontend and Strapi as the headless CMS in a single monorepo.

- Astro handles the site UI, routing, and static rendering for the public pages.
- Strapi stores and manages the content model for articles, tools, prompts, tutorials, models, taxonomy, and site settings.
- The web app follows a `page -> service -> repository -> API client -> Strapi` flow instead of fetching directly in components.
- Content is loaded from Strapi when `PUBLIC_API_URL` is configured.
- If Strapi is unavailable or not configured, the web app falls back to seeded local sample content so the site still works during development and review.
- The current project uses the integration mainly for deployment/content delivery, with the frontend reading CMS content at runtime and rendering it into Astro pages.

Recruiter-friendly summary:

> Yes, I’ve used Astro + Strapi together in this project. Astro is the frontend, Strapi is the CMS, and the frontend consumes CMS content through a service/repository/API client layer with a local seeded fallback when the CMS is not connected.

## Stack

- Astro 5
- Strapi 5
- TypeScript
- Tailwind CSS v4
- pnpm
- Turborepo

## Workspace

- `apps/web` - public frontend
- `apps/cms` - Strapi backend
- `packages/types` - shared domain types
- `packages/utils` - shared sample content and helpers
- `packages/ui` - shared UI class names and primitives
- `packages/config` - shared site and runtime config

## Requirements

The repo includes the version 1 foundations from `docs/PRD.md` and the implementation rules from `docs/AGENT.md`:

- AI articles, tools, prompts, tutorials, and model pages
- Categories, tags, and author taxonomy pages
- Global search with Fuse.js
- Dark mode
- Sitemap, robots.txt, RSS, and JSON-LD
- Strapi CMS collections and sample seed data

## Local setup

1. Install dependencies.

```bash
pnpm install
```

2. Create env files from the examples.

- `apps/web/.env.example` -> `apps/web/.env`
- `apps/cms/.env.example` -> `apps/cms/.env`

3. Start the CMS in one terminal.

```bash
pnpm --filter @jelajahai/cms dev
```

The CMS runs on `http://localhost:1337` by default and uses SQLite locally unless you set production database values.

4. Start the frontend in a second terminal.

```bash
pnpm --filter @jelajahai/web dev
```

The frontend runs on `http://localhost:4321` by default and reads content from `PUBLIC_API_URL`.

## Environment variables

Frontend:

- `PUBLIC_API_URL`
- `PUBLIC_SITE_URL`

CMS:

- `HOST`
- `PORT`
- `DATABASE_CLIENT`
- `DATABASE_FILENAME`
- `DATABASE_URL`
- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_NAME`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `DATABASE_SSL`
- `DATABASE_SCHEMA`
- `APP_KEYS`
- `API_TOKEN_SALT`
- `ADMIN_JWT_SECRET`
- `TRANSFER_TOKEN_SALT`
- `JWT_SECRET`
- `ENCRYPTION_KEY`
- `CORS_ORIGIN`
- `CLOUDINARY_NAME`
- `CLOUDINARY_KEY`
- `CLOUDINARY_SECRET`
- `LLM_API_KEY`

## Verification

Run the workspace checks from the repo root:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Notes

- The web app falls back to seeded sample content when the CMS URL is not configured.
- Version 2 AI features are intentionally not started yet.

## Docker CMS deployment

The repo includes a root-level `Dockerfile` for the Strapi CMS so it can be deployed from the monorepo root on Docker-based hosts like Koyeb.

- Build context: repository root
- Runtime app: `apps/cms`
- Required runtime env vars: the values from [`apps/cms/.env.example`](D:/repository/portfolio/jelajahAI/apps/cms/.env.example)
- Important: if you want uploaded media to survive redeploys on a free host, use external storage such as Cloudinary instead of the local filesystem
