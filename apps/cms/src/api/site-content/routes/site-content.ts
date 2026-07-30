export default {
  routes: [
    {
      method: "GET",
      path: "/site-content",
      handler: "site-content.index",
      config: {
        auth: false
      }
    }
  ]
};
