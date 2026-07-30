import type { ContentKind, HomeContent } from "../content-types";
import { contentRepository } from "../repositories/content-repository";

export const contentService = {
  getHomeContent(): Promise<HomeContent> {
    return contentRepository.getHomeContent();
  },

  getCollection(kind: ContentKind) {
    return contentRepository.getCollection(kind);
  }
};
