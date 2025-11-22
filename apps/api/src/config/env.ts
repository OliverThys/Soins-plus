import dotenv from "dotenv";

dotenv.config();

console.log("🔧 Chargement des variables d'environnement...");

const required = [
  "DATABASE_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "FRONTEND_URL"
] as const;

for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Variable d'environnement manquante: ${key}`);
    throw new Error(`Missing environment variable ${key}`);
  } else {
    console.log(`✅ ${key}: ${key.includes("SECRET") || key === "DATABASE_URL" ? "***" : process.env[key]}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL!,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET!,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripePriceIdMonthly: process.env.STRIPE_PRICE_ID_MONTHLY ?? "",
  stripePriceIdYearly: process.env.STRIPE_PRICE_ID_YEARLY ?? "",
  postmarkToken: process.env.POSTMARK_TOKEN ?? "",
  sentryDsn: process.env.SENTRY_DSN,
  clarityProjectId: process.env.CLARITY_PROJECT_ID,
  frontendUrl: process.env.FRONTEND_URL!,
  storageUrl: process.env.STORAGE_URL ?? "",
  storageSas: process.env.STORAGE_SAS ?? "",
};

