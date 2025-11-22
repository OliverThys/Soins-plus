import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultConfigs = [
  // Stripe
  { key: "STRIPE_SECRET_KEY", category: "stripe", description: "Clé secrète API Stripe" },
  { key: "STRIPE_WEBHOOK_SECRET", category: "stripe", description: "Secret pour valider les webhooks Stripe" },
  { key: "STRIPE_PRICE_ID_MONTHLY", category: "stripe", description: "ID du prix d'abonnement mensuel" },
  { key: "STRIPE_PRICE_ID_YEARLY", category: "stripe", description: "ID du prix d'abonnement annuel" },
  
  // Postmark
  { key: "POSTMARK_TOKEN", category: "postmark", description: "Token d'API Postmark pour l'envoi d'emails" },
  
  // Mailtrap (développement)
  { key: "MAILTRAP_USER", category: "mailtrap", description: "Nom d'utilisateur Mailtrap pour le développement" },
  { key: "MAILTRAP_PASS", category: "mailtrap", description: "Mot de passe Mailtrap pour le développement" },
  
  // Azure Storage
  { key: "STORAGE_URL", category: "storage", description: "URL de base du compte Azure Blob Storage" },
  { key: "STORAGE_SAS", category: "storage", description: "Token SAS pour l'accès au stockage" },
  
  // Sentry
  { key: "SENTRY_DSN", category: "sentry", description: "Data Source Name pour Sentry (backend)" },
  
  // Clarity
  { key: "CLARITY_PROJECT_ID", category: "clarity", description: "ID du projet Microsoft Clarity" },
  
  // Redis
  { key: "REDIS_URL", category: "redis", description: "URL de connexion Redis pour le cache" },
  
  // ClamAV
  { key: "CLAMAV_HOST", category: "clamav", description: "Adresse du serveur ClamAV" },
  { key: "CLAMAV_PORT", category: "clamav", description: "Port du serveur ClamAV" },
];

async function main() {
  console.log("🔧 Initialisation des configurations par défaut...\n");

  for (const config of defaultConfigs) {
    try {
      await (prisma as any).appConfig.upsert({
        where: { key: config.key },
        update: {
          description: config.description,
          category: config.category,
        },
        create: {
          key: config.key,
          value: "",
          description: config.description,
          category: config.category,
        },
      });
      console.log(`✅ ${config.key} initialisé`);
    } catch (error: any) {
      console.error(`❌ Erreur pour ${config.key}:`, error.message);
    }
  }

  console.log("\n✅ Initialisation terminée !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

