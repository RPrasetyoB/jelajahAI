export type NewsletterSubscribeResponse = {
  message: string;
  email: string;
  status: "pending" | "confirmed";
};

const getApiUrl = () => {
  const url = import.meta.env.PUBLIC_API_URL;
  return typeof url === "string" && url.length > 0 ? url : null;
};

const buildUrl = (path: string) => {
  const apiUrl = getApiUrl();

  if (!apiUrl) {
    return null;
  }

  return new URL(path, apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`);
};

export const newsletterClient = {
  isConfigured() {
    return getApiUrl() !== null;
  },

  async subscribe(email: string): Promise<NewsletterSubscribeResponse> {
    const url = buildUrl("/api/newsletters/subscribe");

    if (!url) {
      throw new Error("Newsletter API is not configured");
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const payload = (await response.json()) as Partial<NewsletterSubscribeResponse> & {
      error?: { message?: string };
    };

    if (!response.ok) {
      throw new Error(payload.error?.message ?? payload.message ?? "Failed to subscribe");
    }

    return {
      message: payload.message ?? "Subscription saved.",
      email: payload.email ?? email,
      status: payload.status ?? "pending"
    };
  }
};
