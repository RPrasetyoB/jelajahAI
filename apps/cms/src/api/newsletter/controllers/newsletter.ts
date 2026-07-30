import { factories } from "@strapi/strapi";

type NewsletterPayload = {
  email?: unknown;
};

const normalizeEmail = (value: unknown) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

export default factories.createCoreController("api::newsletter.newsletter", ({ strapi }) => ({
  async subscribe(ctx) {
    const payload = (ctx.request.body ?? {}) as NewsletterPayload;
    const email = normalizeEmail(payload.email);

    if (!email) {
      return ctx.badRequest("Email is required");
    }

    const existing = await strapi.db.query("api::newsletter.newsletter").findOne({
      where: { email }
    });

    if (existing) {
      ctx.status = 200;
      ctx.body = {
        message: "You are already subscribed.",
        email,
        status: "confirmed"
      };
      return;
    }

    await strapi.db.query("api::newsletter.newsletter").create({
      data: {
        email,
        subscribedAt: new Date().toISOString(),
        status: "pending"
      }
    });

    ctx.status = 201;
    ctx.body = {
      message: "Subscription saved.",
      email,
      status: "pending"
    };
  }
}));
