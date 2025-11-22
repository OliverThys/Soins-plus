import Stripe from "stripe";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../.env") });

// Accepter la clé depuis les arguments de ligne de commande ou l'environnement
const stripeSecretKey = process.argv[2] || process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error("❌ STRIPE_SECRET_KEY n'est pas défini.");
  console.error("Usage: npm run create-zero-price [STRIPE_SECRET_KEY]");
  console.error("Ou définissez STRIPE_SECRET_KEY dans votre .env");
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-12-18.acacia",
});

async function createZeroPrice() {
  try {
    console.log("🔧 Création d'un produit et prix à 0€ dans Stripe...\n");

    // Créer un produit
    const product = await stripe.products.create({
      name: "SOINS+ Abonnement Test (0€)",
      description: "Abonnement de test à 0€ pour SOINS+",
      metadata: {
        type: "test",
        created_by: "script",
      },
    });

    console.log(`✅ Produit créé: ${product.id} (${product.name})`);

    // Créer un prix mensuel à 0€
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 0, // 0€
      currency: "eur",
      recurring: {
        interval: "month",
      },
      metadata: {
        type: "monthly",
        test: "true",
      },
    });

    console.log(`✅ Prix mensuel créé: ${monthlyPrice.id}`);
    console.log(`   Montant: ${(monthlyPrice.unit_amount || 0) / 100}€ / mois`);

    // Créer un prix annuel à 0€
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 0, // 0€
      currency: "eur",
      recurring: {
        interval: "year",
      },
      metadata: {
        type: "yearly",
        test: "true",
      },
    });

    console.log(`✅ Prix annuel créé: ${yearlyPrice.id}`);
    console.log(`   Montant: ${(yearlyPrice.unit_amount || 0) / 100}€ / an\n`);

    console.log("📋 Ajoutez ces lignes à votre fichier .env :\n");
    console.log(`STRIPE_PRICE_ID_MONTHLY=${monthlyPrice.id}`);
    console.log(`STRIPE_PRICE_ID_YEARLY=${yearlyPrice.id}\n`);

    console.log("✅ Script terminé avec succès !");
  } catch (error: any) {
    console.error("❌ Erreur lors de la création:", error.message);
    if (error.type === "StripeAuthenticationError") {
      console.error("   Vérifiez que votre STRIPE_SECRET_KEY est correct.");
    }
    process.exit(1);
  }
}

createZeroPrice();

