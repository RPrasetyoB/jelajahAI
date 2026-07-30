FROM node:22-bookworm-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

WORKDIR /app

FROM base AS build

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/cms/package.json apps/cms/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/utils/package.json packages/utils/package.json

RUN pnpm install --frozen-lockfile

COPY apps/cms apps/cms
COPY packages/types packages/types
COPY packages/utils packages/utils

RUN pnpm --filter @jelajahai/types build \
  && pnpm --filter @jelajahai/utils build \
  && pnpm --filter @jelajahai/cms build

FROM node:22-bookworm-slim AS runtime

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NODE_ENV=production
ENV HOST=0.0.0.0

RUN corepack enable

WORKDIR /app

COPY --from=build /app /app

WORKDIR /app/apps/cms

EXPOSE 1337

CMD ["pnpm", "start"]
