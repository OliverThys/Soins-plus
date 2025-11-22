import crypto from "crypto";

/**
 * Génère des secrets JWT sécurisés
 * Utilisez ces secrets dans votre fichier .env
 */
function generateJWTSecrets() {
  // Générer des secrets aléatoires de 64 caractères
  const accessSecret = crypto.randomBytes(32).toString("hex");
  const refreshSecret = crypto.randomBytes(32).toString("hex");

  console.log("🔐 Secrets JWT générés :\n");
  console.log("Ajoutez ces lignes à votre fichier .env :\n");
  console.log(`JWT_ACCESS_SECRET="${accessSecret}"`);
  console.log(`JWT_REFRESH_SECRET="${refreshSecret}"`);
  console.log("\n✅ Ces secrets sont sécurisés et uniques pour votre application.");
  console.log("⚠️  Ne les partagez jamais et gardez-les secrets !");
}

generateJWTSecrets();

