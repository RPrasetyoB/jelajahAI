export const siteConfig = {
  name: "JelajahAI",
  siteUrl: "https://jelajahai.dev",
  description: "Unlock AI Knowledge",
  defaultLocale: "en",
  newsletterEndpoint: "/api/newsletters/subscribe",
  navigation: [
    { label: "Search", href: "/search/" },
    { label: "Articles", href: "/articles/" },
    { label: "Models", href: "/models/" }
  ],
  socialLinks: [
    { label: "GitHub", url: "https://github.com" },
    { label: "X", url: "https://x.com" }
  ]
} as const;

export const contentKinds = ["articles", "tools", "prompts", "tutorials", "models"] as const;

export const createAbsoluteUrl = (pathname = "/") =>
  new URL(pathname, siteConfig.siteUrl).toString();
