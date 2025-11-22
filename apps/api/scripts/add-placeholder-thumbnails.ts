import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Script pour ajouter des images placeholder à toutes les formations qui n'ont pas de miniature
 * Utilise picsum.photos pour générer des images aléatoires basées sur l'ID de la formation
 */
async function addPlaceholderThumbnails() {
  console.log("🖼️  Ajout des miniatures placeholder aux formations...");

  try {
    // D'abord, vérifier et créer la colonne si elle n'existe pas
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Training" 
        ADD COLUMN IF NOT EXISTS "thumbnailUrl" TEXT;
      `);
      console.log("✅ Colonne thumbnailUrl vérifiée/créée");
    } catch (error: any) {
      // La colonne existe peut-être déjà, continuer
      console.log("ℹ️  Colonne thumbnailUrl déjà présente ou erreur (continuer quand même)");
    }

    // Récupérer toutes les formations
    const trainings = await prisma.$queryRawUnsafe<Array<{ id: string; title: string; thumbnailUrl: string | null }>>(`
      SELECT id, title, "thumbnailUrl" 
      FROM "Training"
      WHERE "thumbnailUrl" IS NULL OR "thumbnailUrl" = '';
    `);

    console.log(`📊 ${trainings.length} formations sans miniature trouvées`);

    let updated = 0;
    for (const training of trainings) {
      // Utiliser picsum.photos avec une seed basée sur l'ID pour avoir une image cohérente
      // Format: https://picsum.photos/seed/{seed}/800/600
      // On utilise un hash simple de l'ID pour avoir une image différente par formation
      const seed = training.id.substring(0, 8);
      const placeholderUrl = `https://picsum.photos/seed/${seed}/800/600`;

      try {
        // Utiliser SQL brut pour être sûr que ça fonctionne
        await prisma.$executeRawUnsafe(
          `UPDATE "Training" SET "thumbnailUrl" = $1 WHERE id = $2`,
          placeholderUrl,
          training.id
        );
        updated++;
        console.log(`✅ ${training.title} - ${placeholderUrl}`);
      } catch (error: any) {
        console.error(`❌ Erreur pour ${training.title}:`, error.message);
      }
    }

    console.log(`\n✨ ${updated} formations mises à jour avec des miniatures placeholder`);
  } catch (error: any) {
    console.error("❌ Erreur:", error.message);
    throw error;
  }
}

addPlaceholderThumbnails()
  .catch((error) => {
    console.error("❌ Erreur:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

