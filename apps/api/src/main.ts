import { buildApp } from "./app";
import { env } from "./config/env";
import { startReminderJob } from "./modules/notifications/reminderJob";
import { prisma } from "./lib/prisma";

// Logs de démarrage avec séparateur visible
console.log("\n" + "=".repeat(60));
console.log("🚀 DÉMARRAGE DU SERVEUR SOINS+ API");
console.log("=".repeat(60));
console.log("📋 Configuration:");
console.log(`   - Port: ${env.port}`);
console.log(`   - Frontend URL: ${env.frontendUrl}`);
console.log(`   - Node Env: ${env.nodeEnv}`);
console.log(`   - Database: ${env.databaseUrl ? "✅ Configurée" : "❌ Non configurée"}`);
console.log("=".repeat(60) + "\n");

// Test de connexion à la base de données
prisma.$connect()
  .then(() => {
    console.log("✅ Connexion à la base de données réussie\n");
  })
  .catch((error) => {
    console.error("\n" + "=".repeat(60));
    console.error("❌ ERREUR DE CONNEXION À LA BASE DE DONNÉES");
    console.error("=".repeat(60));
    console.error("Erreur:", error.message);
    console.error("DATABASE_URL:", env.databaseUrl ? "Configurée" : "Manquante");
    console.error("=".repeat(60) + "\n");
  });

const app = buildApp();
const stopReminderJob = startReminderJob(app.log);

const gracefulShutdown = async () => {
  console.log("🛑 Arrêt du serveur en cours...");
  stopReminderJob();
  try {
    await prisma.$disconnect();
    await app.close();
    console.log("✅ Serveur arrêté proprement");
  } catch (error) {
    app.log.error({ error }, "Erreur lors de l'arrêt");
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// Gestion des erreurs non capturées
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
  app.log.error({ reason, promise }, "Unhandled Rejection");
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  app.log.error({ error }, "Uncaught Exception");
  gracefulShutdown();
});

// Fonction pour démarrer le serveur avec gestion automatique du port
const startServer = async (port: number, maxAttempts: number = 10): Promise<void> => {
  return new Promise((resolve, reject) => {
    app.listen({ port, host: "0.0.0.0" }, (err, address) => {
      if (err) {
        // Si le port est occupé, essayer le port suivant
        if (err.code === "EADDRINUSE" && port < env.port + maxAttempts) {
          console.warn(`⚠️  Port ${port} occupé, tentative sur le port ${port + 1}...`);
          return startServer(port + 1, maxAttempts).then(resolve).catch(reject);
        }
        // Autre erreur ou trop de tentatives
        console.error("❌ Erreur au démarrage:", err);
        app.log.error({ err }, "Erreur au démarrage du serveur");
        stopReminderJob();
        reject(err);
        return;
      }
      
      // Succès !
      const actualPort = port;
      console.log("\n" + "=".repeat(60));
      if (actualPort !== env.port) {
        console.log(`⚠️  Port ${env.port} occupé, serveur démarré sur le port ${actualPort}`);
        console.log(`⚠️  ATTENTION: Mettez à jour VITE_API_URL dans apps/web/.env avec: http://localhost:${actualPort}`);
      }
      console.log(`✅ SOINS+ API DÉMARRÉE AVEC SUCCÈS`);
      console.log(`   URL: ${address}`);
      console.log(`   - Health check: ${address}/healthz`);
      console.log(`   - API docs: ${address}/documentation`);
      console.log("=".repeat(60) + "\n");
      app.log.info(`SOINS+ API running at ${address}`);
      resolve();
    });
  });
};

// Démarrer le serveur
startServer(env.port).catch((error) => {
  console.error("❌ Impossible de démarrer le serveur après plusieurs tentatives");
  process.exit(1);
});

