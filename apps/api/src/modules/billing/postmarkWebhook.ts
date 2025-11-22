import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";

/**
 * Webhook Postmark pour gérer les bounces et spam
 * https://postmarkapp.com/developer/webhooks/webhooks-overview
 */
export const registerPostmarkWebhookRoutes = (app: FastifyInstance) => {
  app.post("/webhooks/postmark", async (request, reply) => {
    const body = request.body as any;

    // Vérification du type d'événement
    switch (body.RecordType) {
      case "Bounce": {
        // Email bounce (hard ou soft)
        const email = body.Email;
        const bounceType = body.Type; // "HardBounce" ou "SoftBounce"
        
        app.log.info(`Bounce reçu pour ${email}: ${bounceType}`);

        // Optionnel: marquer l'utilisateur comme ayant un email invalide
        if (bounceType === "HardBounce") {
          await prisma.user.updateMany({
            where: { email },
            data: {
              // On pourrait ajouter un champ emailValid dans le schema
            },
          });
        }
        break;
      }

      case "SpamComplaint": {
        // Plainte de spam
        const email = body.Email;
        app.log.warn(`Plainte spam pour ${email}`);
        // Optionnel: désactiver l'envoi d'emails à cet utilisateur
        break;
      }

      case "SubscriptionChange": {
        // Changement d'abonnement Postmark (pas lié à Stripe)
        app.log.info("Changement d'abonnement Postmark");
        break;
      }

      default:
        app.log.info(`Événement Postmark non géré: ${body.RecordType}`);
    }

    return { received: true };
  });
};

