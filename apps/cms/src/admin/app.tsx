import type { StrapiApp } from "@strapi/strapi/admin";
import { Magic } from "@strapi/icons";
import { installAdminContentCacheListener } from "./content-cache";

export default {
  bootstrap(app: StrapiApp) {
    installAdminContentCacheListener();
    app.addMenuLink({
      to: "/plugins/ai-content-studio",
      icon: Magic,
      intlLabel: {
        id: "ai-content-studio.menu",
        defaultMessage: "AI Content Studio"
      },
      permissions: [],
      Component: () => import("./pages/AiContentStudio"),
      exact: true
    });
  }
};
