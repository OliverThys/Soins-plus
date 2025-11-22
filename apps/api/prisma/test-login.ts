import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function testLogin(email: string, password: string) {
  console.log(`\n🔐 Test de connexion pour ${email}...`);
  
  const user = await prisma.user.findUnique({ 
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      subscriptionActive: true,
      firstName: true,
      lastName: true,
    }
  });

  if (!user) {
    console.log(`❌ Utilisateur non trouvé`);
    return false;
  }

  console.log(`✅ Utilisateur trouvé:`);
  console.log(`   - ID: ${user.id}`);
  console.log(`   - Nom: ${user.firstName} ${user.lastName}`);
  console.log(`   - Rôle: ${user.role}`);
  console.log(`   - Abonnement actif: ${user.subscriptionActive}`);

  try {
    const valid = await argon2.verify(user.password, password);
    if (valid) {
      console.log(`✅ Mot de passe valide`);
      return true;
    } else {
      console.log(`❌ Mot de passe invalide`);
      return false;
    }
  } catch (error: any) {
    console.log(`❌ Erreur lors de la vérification: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("🧪 Test de connexion pour les comptes mockés\n");
  
  const password = "SoinsPlus2025!";
  
  await testLogin("adminmock@soins.plus", password);
  await testLogin("usermock@soins.plus", password);
}

main()
  .catch((e) => {
    console.error("❌ Erreur:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

