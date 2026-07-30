import { newsletterClient } from "../api/newsletter-client";

export const newsletterRepository = {
  isConfigured() {
    return newsletterClient.isConfigured();
  },

  subscribe(email: string) {
    return newsletterClient.subscribe(email);
  }
};
