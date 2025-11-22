import { FastifyInstance } from "fastify";
import Stripe from "stripe";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { sendPaymentFailed, sendSubscriptionRenewed, sendSubscriptionRenewalReminder } from "../notifications/service";
import { stripe } from "../../lib/stripe";

export const registerWebhookRoutes = (app: FastifyInstance) => {
  app.post("/webhooks/stripe", { config: { rawBody: true } }, async (request, reply) => {
    const sig = request.headers["stripe-signature"];
    if (!sig || typeof sig !== "string" || !env.stripeWebhookSecret) {
      return reply.status(400).send();
    }

    if (!env.stripeSecretKey) {
      return reply.status(503).send({ message: "Stripe non configuré" });
    }

    const rawBody = request.rawBody as Buffer;
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, env.stripeWebhookSecret);
    } catch (err) {
      app.log.error(err);
      return reply.status(400).send({ message: "Signature invalide" });
    }

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        if (typeof subscription.customer === "string") {
          const user = await prisma.user.findFirst({
            where: { stripeCustomerId: subscription.customer },
          });

          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: { subscriptionActive: subscription.status === "active" },
            });

            // Envoi email de confirmation si nouvel abonnement activé
            if (event.type === "customer.subscription.created" && subscription.status === "active") {
              const price = subscription.items.data[0]?.price;
              const amount = price ? (price.unit_amount || 0) / 100 : 0;
              const nextBillingDate = new Date(subscription.current_period_end * 1000).toLocaleDateString("fr-BE");

              sendSubscriptionRenewed({
                email: user.email,
                firstName: user.firstName,
                amount,
                nextBillingDate,
              }).catch((err) => app.log.error("Erreur envoi email renouvellement:", err));
            }
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        if (typeof subscription.customer === "string") {
          await prisma.user.updateMany({
            where: { stripeCustomerId: subscription.customer },
            data: { subscriptionActive: false },
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription && typeof invoice.customer === "string") {
          const user = await prisma.user.findFirst({
            where: { stripeCustomerId: invoice.customer },
          });

          if (user && invoice.billing_reason === "subscription_cycle") {
            // Renouvellement automatique réussi
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
            const price = subscription.items.data[0]?.price;
            const amount = price ? (price.unit_amount || 0) / 100 : 0;
            const nextBillingDate = new Date(subscription.current_period_end * 1000).toLocaleDateString("fr-BE");

            sendSubscriptionRenewed({
              email: user.email,
              firstName: user.firstName,
              amount,
              nextBillingDate,
            }).catch((err) => app.log.error("Erreur envoi email renouvellement:", err));
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (typeof invoice.customer === "string") {
          const user = await prisma.user.findFirst({
            where: { stripeCustomerId: invoice.customer },
          });

          if (user) {
            const retryDate = invoice.next_payment_attempt
              ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString("fr-BE")
              : undefined;

            sendPaymentFailed({
              email: user.email,
              firstName: user.firstName,
              retryDate,
            }).catch((err) => app.log.error("Erreur envoi email échec paiement:", err));
          }
        }
        break;
      }

      case "invoice.upcoming": {
        // Envoi du rappel 7 jours avant renouvellement
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription && typeof invoice.customer === "string") {
          const user = await prisma.user.findFirst({
            where: { stripeCustomerId: invoice.customer },
          });

          if (user) {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
            const renewalDate = new Date(subscription.current_period_end * 1000).toLocaleDateString("fr-BE");

            sendSubscriptionRenewalReminder({
              email: user.email,
              firstName: user.firstName,
              renewalDate,
            }).catch((err) => app.log.error("Erreur envoi email rappel:", err));
          }
        }
        break;
      }

      default:
        break;
    }

    return { received: true };
  });
};

