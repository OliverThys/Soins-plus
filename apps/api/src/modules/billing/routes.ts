import { FastifyInstance } from "fastify";
import { z } from "zod";
import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { stripe, createCustomerPortalSession, createCheckoutSession } from "../../lib/stripe";
import { env } from "../../config/env";

/**
 * Récupère la configuration Stripe depuis la base de données
 */
async function getStripeConfig() {
  const configs = await prisma.appConfig.findMany({
    where: {
      key: {
        in: ["STRIPE_SECRET_KEY", "STRIPE_PRICE_ID_MONTHLY", "STRIPE_PRICE_ID_YEARLY"],
      },
    },
  });

  const configMap = new Map(configs.map((c) => [c.key, c.value || ""]));

  return {
    secretKey: configMap.get("STRIPE_SECRET_KEY") || env.stripeSecretKey,
    priceIdMonthly: configMap.get("STRIPE_PRICE_ID_MONTHLY") || env.stripePriceIdMonthly,
    priceIdYearly: configMap.get("STRIPE_PRICE_ID_YEARLY") || env.stripePriceIdYearly,
  };
}

/**
 * Crée un client Stripe avec la clé de configuration
 */
function getStripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey, { apiVersion: "2024-06-20" });
}

export const registerBillingRoutes = (app: FastifyInstance) => {
  // Route publique pour récupérer les prix (sans authentification)
  app.get("/billing/prices", async (request, reply) => {
    const stripeConfig = await getStripeConfig();
    if (!stripeConfig.secretKey) {
      return reply.status(503).send({ message: "Stripe non configuré" });
    }

    try {
      const { getPrices } = await import("../../lib/stripe");
      const prices = await getPrices(stripeConfig.secretKey);
      
      app.log.info({ pricesCount: prices.length, priceIds: prices.map(p => p.id) }, "Prix récupérés depuis Stripe");
      
      // Trouver les prix mensuels et annuels
      let monthlyPrice: Stripe.Price | undefined;
      let yearlyPrice: Stripe.Price | undefined;

      // Si les price IDs sont configurés, les utiliser
      if (stripeConfig.priceIdMonthly) {
        monthlyPrice = prices.find((p) => p.id === stripeConfig.priceIdMonthly);
        app.log.info({ priceId: stripeConfig.priceIdMonthly, found: !!monthlyPrice }, "Recherche prix mensuel");
      }
      if (stripeConfig.priceIdYearly) {
        yearlyPrice = prices.find((p) => p.id === stripeConfig.priceIdYearly);
        app.log.info({ priceId: stripeConfig.priceIdYearly, found: !!yearlyPrice }, "Recherche prix annuel");
      }

      // Si les prix configurés ne sont pas trouvés, chercher par interval
      if (!monthlyPrice) {
        monthlyPrice = prices.find((p) => p.recurring?.interval === "month");
        app.log.info({ found: !!monthlyPrice }, "Recherche prix mensuel par interval");
      }
      if (!yearlyPrice) {
        yearlyPrice = prices.find((p) => p.recurring?.interval === "year");
        app.log.info({ found: !!yearlyPrice }, "Recherche prix annuel par interval");
      }

      return {
        monthly: monthlyPrice ? {
          id: monthlyPrice.id,
          amount: monthlyPrice.unit_amount ? monthlyPrice.unit_amount / 100 : 0,
          currency: monthlyPrice.currency || "eur",
          interval: monthlyPrice.recurring?.interval,
        } : null,
        yearly: yearlyPrice ? {
          id: yearlyPrice.id,
          amount: yearlyPrice.unit_amount ? yearlyPrice.unit_amount / 100 : 0,
          currency: yearlyPrice.currency || "eur",
          interval: yearlyPrice.recurring?.interval,
        } : null,
      };
    } catch (error: any) {
      app.log.error({ error: error.message, stack: error.stack }, "Erreur récupération prix");
      return reply.status(500).send({ message: "Erreur lors de la récupération des prix" });
    }
  });

  app.register(async (instance) => {
    // Middleware d'authentification pour toutes les routes billing
    instance.addHook("preHandler", async (request, reply) => {
      try {
        const auth = request.headers.authorization;
        if (!auth?.includes("Bearer ")) {
          return reply.status(401).send({ message: "Token manquant" });
        }
        
        const token = auth.replace("Bearer ", "");
        const payload = await instance.jwt.verify(token) as any;
        
        if (!payload || typeof payload !== "object" || !payload.sub) {
          return reply.status(401).send({ message: "Token invalide" });
        }
        
        (request as any).user = payload;
      } catch (error: any) {
        if (error.code === "FAST_JWT_EXPIRED" || error.message?.includes("expired")) {
          return reply.status(401).send({ message: "Token expiré. Veuillez vous reconnecter." });
        }
        return reply.status(401).send({ message: error.message || "Erreur d'authentification" });
      }
    });

    /**
     * Crée une session Checkout pour un utilisateur connecté
     */
    instance.post("/billing/checkout", async (request, reply) => {
    const userPayload = request.user as any;
    const userId = typeof userPayload?.sub === "string" ? userPayload.sub : request.headers["x-user-id"];

    if (!userId || typeof userId !== "string") {
      return reply.status(401).send({ message: "Utilisateur requis" });
    }

    // Charger la configuration Stripe depuis la base de données
    const stripeConfig = await getStripeConfig();

    if (!stripeConfig.secretKey) {
      return reply.status(503).send({ message: "Stripe non configuré. Veuillez configurer la clé secrète API dans /admin/configuration" });
    }

    const body = z
      .object({
        planType: z.enum(["monthly", "yearly"]),
      })
      .parse(request.body);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true, stripeCustomerId: true },
    });

    if (!user) {
      return reply.status(404).send({ message: "Utilisateur non trouvé" });
    }

    // Créer ou récupérer le customer Stripe
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      try {
        const { createStripeCustomer } = await import("../../lib/stripe");
        const customer = await createStripeCustomer(
          {
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            metadata: {
              userId: userId,
            },
          },
          stripeConfig.secretKey
        );
        customerId = customer.id;

        // Mettre à jour l'utilisateur avec le customer ID
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: customer.id },
        });
      } catch (error: any) {
        instance.log.error("Erreur création customer Stripe:", error);
        return reply.status(500).send({ message: "Erreur lors de la création du client Stripe" });
      }
    }

    // Sélectionner le prix selon le plan
    const priceId = body.planType === "yearly" ? stripeConfig.priceIdYearly : stripeConfig.priceIdMonthly;

    if (!priceId) {
      return reply.status(503).send({ message: `Prix Stripe ${body.planType === "yearly" ? "annuel" : "mensuel"} non configuré. Veuillez configurer les IDs de prix dans /admin/configuration` });
    }

    try {
      const session = await createCheckoutSession(
        {
          customerId: customerId!,
          customerEmail: user.email,
          customerName: `${user.firstName} ${user.lastName}`,
          userId: userId,
          priceId,
          successUrl: `${env.frontendUrl}/register?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${env.frontendUrl}/app/abonnement?canceled=true`,
        },
        stripeConfig.secretKey
      );

      return { url: session.url };
    } catch (error: any) {
      instance.log.error("Erreur création session Checkout:", error);
      return reply.status(500).send({ message: "Erreur lors de la création de la session de paiement" });
    }
    });

    /**
     * Vérifie le statut d'une session Checkout
     */
    instance.get("/billing/checkout/:sessionId", async (request, reply) => {
    const params = z.object({ sessionId: z.string() }).parse(request.params);
    const userPayload = request.user as any;
    const userId = typeof userPayload?.sub === "string" ? userPayload.sub : request.headers["x-user-id"];

    if (!userId || typeof userId !== "string") {
      return reply.status(401).send({ message: "Utilisateur requis" });
    }

    const stripeConfig = await getStripeConfig();
    if (!stripeConfig.secretKey) {
      return reply.status(503).send({ message: "Stripe non configuré" });
    }

    try {
      const stripeClient = getStripeClient(stripeConfig.secretKey);
      const session = await stripeClient.checkout.sessions.retrieve(params.sessionId);

      if (session.metadata?.userId !== userId) {
        return reply.status(403).send({ message: "Session non autorisée" });
      }

      return {
        sessionId: session.id,
        status: session.status,
        paymentStatus: session.payment_status,
        customerId: session.customer,
        subscriptionId: session.subscription,
      };
    } catch (error: any) {
      instance.log.error(error);
      return reply.status(400).send({ message: "Session invalide" });
    }
    });

    /**
     * Crée une session pour le portail client Stripe (gestion abonnement)
     */
    instance.post("/billing/portal", async (request, reply) => {
    const userPayload = request.user as any;
    const userId = typeof userPayload?.sub === "string" ? userPayload.sub : request.headers["x-user-id"];

    if (!userId || typeof userId !== "string") {
      return reply.status(401).send({ message: "Utilisateur requis" });
    }

    const stripeConfig = await getStripeConfig();
    if (!stripeConfig.secretKey) {
      return reply.status(503).send({ message: "Stripe non configuré" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return reply.status(404).send({ message: "Aucun abonnement trouvé" });
    }

    try {
      // Note: createCustomerPortalSession utilise le client Stripe global
      // Pour utiliser la config DB, il faudrait modifier cette fonction aussi
      const portalSession = await createCustomerPortalSession({
        customerId: user.stripeCustomerId,
        returnUrl: `${env.frontendUrl}/app/abonnement`,
      });

      return { url: portalSession.url };
    } catch (error: any) {
      instance.log.error(error);
      return reply.status(500).send({ message: "Erreur lors de la création du portail" });
    }
    });

    /**
     * Récupère les informations de l'abonnement de l'utilisateur
     */
    instance.get("/billing/subscription", async (request, reply) => {
    const userPayload = request.user as any;
    const userId = typeof userPayload?.sub === "string" ? userPayload.sub : request.headers["x-user-id"];

    if (!userId || typeof userId !== "string") {
      return reply.status(401).send({ message: "Utilisateur requis" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true, subscriptionActive: true },
    });

    if (!user?.stripeCustomerId) {
      return { active: false };
    }

    try {
      const stripeConfig = await getStripeConfig();
      if (!stripeConfig.secretKey) {
        return { active: user.subscriptionActive || false };
      }
      const stripeClient = getStripeClient(stripeConfig.secretKey);
      const subscriptions = await stripeClient.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "all",
        limit: 1,
      });

      const subscription = subscriptions.data[0];

      if (!subscription) {
        return { active: false };
      }

      return {
        active: subscription.status === "active" || subscription.status === "trialing",
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        plan: subscription.items.data[0]?.price,
      };
    } catch (error: any) {
      instance.log.error(error);
      return { active: user.subscriptionActive };
    }
    });

    /**
     * Récupère l'historique des paiements de l'utilisateur
     */
    instance.get("/billing/payments", async (request, reply) => {
    const userPayload = request.user as any;
    const userId = typeof userPayload?.sub === "string" ? userPayload.sub : request.headers["x-user-id"];

    if (!userId || typeof userId !== "string") {
      return reply.status(401).send({ message: "Utilisateur requis" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return [];
    }

    try {
      const stripeConfig = await getStripeConfig();
      if (!stripeConfig.secretKey) {
        return [];
      }
      const stripeClient = getStripeClient(stripeConfig.secretKey);
      const invoices = await stripeClient.invoices.list({
        customer: user.stripeCustomerId,
        limit: 50,
      });

      return invoices.data.map((invoice) => ({
        id: invoice.id,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
        status: invoice.status,
        date: invoice.created * 1000,
        periodStart: invoice.period_start * 1000,
        periodEnd: invoice.period_end * 1000,
        invoicePdf: invoice.invoice_pdf,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
      }));
    } catch (error: any) {
      instance.log.error(error);
      return reply.status(500).send({ message: "Erreur lors de la récupération des paiements" });
    }
    });

    /**
     * Change le plan d'abonnement de l'utilisateur
     */
    instance.post("/billing/change-plan", async (request, reply) => {
    const userPayload = request.user as any;
    const userId = typeof userPayload?.sub === "string" ? userPayload.sub : request.headers["x-user-id"];

    if (!userId || typeof userId !== "string") {
      return reply.status(401).send({ message: "Utilisateur requis" });
    }

    const stripeConfig = await getStripeConfig();
    if (!stripeConfig.secretKey) {
      return reply.status(503).send({ message: "Stripe non configuré" });
    }

    const body = z
      .object({
        priceId: z.string(), // Nouveau price ID (mensuel ou annuel)
      })
      .parse(request.body);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return reply.status(404).send({ message: "Aucun abonnement trouvé" });
    }

    try {
      const stripeClient = getStripeClient(stripeConfig.secretKey);
      // Récupérer l'abonnement actif
      const subscriptions = await stripeClient.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "active",
        limit: 1,
      });

      const subscription = subscriptions.data[0];
      if (!subscription) {
        return reply.status(404).send({ message: "Aucun abonnement actif" });
      }

      // Mettre à jour l'abonnement avec le nouveau prix
      const updatedSubscription = await stripeClient.subscriptions.update(subscription.id, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: body.priceId,
          },
        ],
        proration_behavior: "always_invoice", // Facturer immédiatement la différence
      });

      return {
        subscriptionId: updatedSubscription.id,
        status: updatedSubscription.status,
        currentPeriodEnd: updatedSubscription.current_period_end,
        plan: updatedSubscription.items.data[0]?.price,
      };
    } catch (error: any) {
      instance.log.error(error);
      return reply.status(500).send({ message: "Erreur lors du changement de plan" });
    }
  });
});
};

