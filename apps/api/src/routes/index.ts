import { FastifyInstance } from "fastify";
import { registerAuthRoutes } from "../modules/auth/routes";
import { registerCatalogRoutes } from "../modules/catalog/routes";
import { registerLearningRoutes } from "../modules/learning/routes";
import { registerUserRoutes } from "../modules/users/routes";
import { registerAdminRoutes } from "../modules/admin/routes";
import { registerTrainerRoutes } from "../modules/trainers/routes";
import { registerContentRoutes } from "../modules/content/routes";
import { registerWebhookRoutes } from "../modules/billing/webhooks";
import { registerPostmarkWebhookRoutes } from "../modules/billing/postmarkWebhook";
import { registerBillingRoutes } from "../modules/billing/routes";

export const registerRoutes = (app: FastifyInstance) => {
  app.get("/healthz", async () => ({ status: "ok" }));
  app.get("/readyz", async () => ({ ready: true }));

  registerAuthRoutes(app);
  registerCatalogRoutes(app);
  registerLearningRoutes(app);
  registerUserRoutes(app);
  registerAdminRoutes(app);
  registerTrainerRoutes(app);
  registerContentRoutes(app);
  registerBillingRoutes(app);
  registerWebhookRoutes(app);
  registerPostmarkWebhookRoutes(app);
};

