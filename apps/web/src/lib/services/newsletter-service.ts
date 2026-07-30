import { newsletterRepository } from "../repositories/newsletter-repository";

export const newsletterService = {
  isConfigured() {
    return newsletterRepository.isConfigured();
  },

  subscribe(email: string) {
    return newsletterRepository.subscribe(email);
  }
};
