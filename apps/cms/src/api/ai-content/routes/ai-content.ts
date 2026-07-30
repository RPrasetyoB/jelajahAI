export default {
  routes: [
    {
      method: "GET",
      path: "/ai-content/options",
      handler: "ai-content.options",
      config: {
        auth: false
      }
    },
    {
      method: "POST",
      path: "/ai-content/generate",
      handler: "ai-content.generate",
      config: {
        auth: false
      }
    },
    {
      method: "POST",
      path: "/ai-content/publish",
      handler: "ai-content.publish",
      config: {
        auth: false
      }
    }
  ]
};
