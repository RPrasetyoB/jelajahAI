type StrapiCollectionResponse = {
  data: Array<{
    id: number;
    documentId?: string;
    attributes?: Record<string, unknown>;
  }>;
};

type StrapiSiteContentResponse = {
  ok: boolean;
  message?: string;
  siteSettings?: unknown;
  categories?: unknown;
  tags?: unknown;
  authors?: unknown;
  articles?: unknown;
  tools?: unknown;
  prompts?: unknown;
  tutorials?: unknown;
  models?: unknown;
  newsletter?: unknown;
};

const getApiUrl = () => {
  const url = import.meta.env.PUBLIC_API_URL;
  return typeof url === "string" && url.length > 0 ? url : null;
};

const buildUrl = (path: string, params?: Record<string, string>) => {
  const apiUrl = getApiUrl();

  if (!apiUrl) {
    return null;
  }

  const url = new URL(path, apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`);

  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.set(key, value);
  }

  return url;
};

const normalize = <T extends object>(entry: {
  id: number;
  documentId?: string;
  attributes?: Record<string, unknown>;
}) => {
  const attributes = entry.attributes ?? {};

  return {
    id: entry.id,
    documentId: entry.documentId,
    ...attributes
  } as T & { id: number; documentId?: string };
};

const fetchJson = async <T,>(url: URL): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url.pathname.replace(/^\/api\//, "") || "content"} from Strapi`);
  }

  return (await response.json()) as T;
};

export const strapiClient = {
  isConfigured() {
    return getApiUrl() !== null;
  },

  async findMany<T extends object>(
    collection: string,
    params?: Record<string, string>
  ): Promise<T[]> {
    const url = buildUrl(`/api/${collection}`, params);

    if (!url) {
      return [];
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${collection} from Strapi`);
    }

    const payload = (await response.json()) as StrapiCollectionResponse;
    return payload.data.map((entry) => normalize<T>(entry));
  },

  async fetchSiteContent() {
    const url = buildUrl("/api/site-content");

    if (!url) {
      return null;
    }

    return fetchJson<StrapiSiteContentResponse>(url);
  }
};
