import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Vérification des comptes mockés...\n");

  const mockEmails = ["adminmock@soins.plus", "usermock@soins.plus"];

  for (const email of mockEmails) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        subscriptionActive: true,
        password: true,
      },
    });

    if (user) {
      console.log(`✅ ${email} existe dans la base de données`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Nom: ${user.firstName} ${user.lastName}`);
      console.log(`   - Rôle: ${user.role}`);
      console.log(`   - Abonnement actif: ${user.subscriptionActive}`);
      
      // Tester le mot de passe
      try {
        const testPassword = "SoinsPlus2025!";
        const isValid = await argon2.verify(user.password, testPassword);
        console.log(`   - Mot de passe valide: ${isValid ? "✅ OUI" : "❌ NON"}`);
      } catch (error) {
        console.log(`   - Erreur lors de la vérification du mot de passe: ${error}`);
      }
      console.log("");
    } else {
      console.log(`❌ ${email} n'existe PAS dans la base de données\n`);
    }
  }

  // Vérifier tous les utilisateurs
  const allUsers = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
    },
  });

  console.log(`\n📊 Total d'utilisateurs dans la base: ${allUsers.length}`);
  console.log("Liste des emails:");
  allUsers.forEach((u) => {
    console.log(`   - ${u.email} (${u.role})`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Erreur:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

