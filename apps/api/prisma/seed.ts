import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Démarrage du seeding...");

  // Nettoyer les données existantes (optionnel - commentez si vous voulez garder)
  await prisma.chapterProgress.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.training.deleteMany();
  await prisma.trainer.deleteMany();
  await prisma.newsArticle.deleteMany();
  await prisma.faqEntry.deleteMany();
  await prisma.legalTicket.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Données existantes nettoyées");

  // Créer des utilisateurs
  const hashedPassword = await argon2.hash("SoinsPlus2025!");

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@soins.plus",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "SOINS+",
      nationalRegistry: "00000000000",
      phone: "+32 470 00 00 00",
      diplomaUrl: "https://example.com/diploma.pdf",
      role: "admin",
      subscriptionActive: true,
    },
  });

  const trainerUser1 = await prisma.user.create({
    data: {
      email: "formateur@soins.plus",
      password: hashedPassword,
      firstName: "Dr. Marie",
      lastName: "Dupont",
      nationalRegistry: "11111111111",
      phone: "+32 470 11 11 11",
      diplomaUrl: "https://example.com/diploma.pdf",
      role: "user",
      subscriptionActive: true,
    },
  });

  const trainerUser2 = await prisma.user.create({
    data: {
      email: "formateur2@soins.plus",
      password: hashedPassword,
      firstName: "Dr. Jean",
      lastName: "Martin",
      nationalRegistry: "22222222222",
      phone: "+32 470 22 22 22",
      diplomaUrl: "https://example.com/diploma.pdf",
      role: "user",
      subscriptionActive: true,
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      email: "utilisateur@soins.plus",
      password: hashedPassword,
      firstName: "Camille",
      lastName: "Beaumont",
      nationalRegistry: "33333333333",
      phone: "+32 470 33 33 33",
      diplomaUrl: "https://example.com/diploma.pdf",
      role: "user",
      subscriptionActive: true,
    },
  });

  // Créer les comptes mockés
  const adminMockUser = await prisma.user.create({
    data: {
      email: "adminmock@soins.plus",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "Mock",
      nationalRegistry: "99999999999",
      phone: "+32 470 99 99 99",
      diplomaUrl: "https://example.com/diploma.pdf",
      role: "admin",
      subscriptionActive: true,
    },
  });

  const userMockUser = await prisma.user.create({
    data: {
      email: "usermock@soins.plus",
      password: hashedPassword,
      firstName: "User",
      lastName: "Mock",
      nationalRegistry: "88888888888",
      phone: "+32 470 88 88 88",
      diplomaUrl: "https://example.com/diploma.pdf",
      role: "user",
      subscriptionActive: true,
    },
  });

  console.log("✅ Utilisateurs créés");
  console.log(`   Admin: admin@soins.plus / SoinsPlus2025!`);
  console.log(`   Formateur: formateur@soins.plus / SoinsPlus2025!`);
  console.log(`   Utilisateur: utilisateur@soins.plus / SoinsPlus2025!`);
  console.log(`   Admin Mock: adminmock@soins.plus / SoinsPlus2025!`);
  console.log(`   User Mock: usermock@soins.plus / SoinsPlus2025!`);

  // Créer des profils formateurs
  const trainer1 = await prisma.trainer.create({
    data: {
      userId: trainerUser1.id,
      bio: "Spécialiste en soins d'urgence avec 15 ans d'expérience en milieu hospitalier.",
      expertise: ["Urgence", "Pédiatrie"],
    },
  });

  const trainer2 = await prisma.trainer.create({
    data: {
      userId: trainerUser2.id,
      bio: "Expert en gériatrie et soins palliatifs, formateur agréé depuis 2010.",
      expertise: ["Gériatrie", "Soins palliatifs"],
    },
  });

  console.log("✅ Profils formateurs créés");

  // Créer des formations variées
  const now = new Date();
  const futureDate1 = new Date(now);
  futureDate1.setDate(now.getDate() + 7);
  futureDate1.setHours(14, 0, 0, 0);

  const futureDate2 = new Date(now);
  futureDate2.setDate(now.getDate() + 14);
  futureDate2.setHours(10, 0, 0, 0);

  const videoTraining = await prisma.training.create({
    data: {
      title: "Gestion des urgences néonatales",
      summary: "Maîtrisez les gestes essentiels en réanimation néonatale",
      description:
        "Formation complète sur la prise en charge des urgences néonatales : détresse respiratoire, réanimation cardio-pulmonaire, hypothermie thérapeutique. Parcours vidéo avec QCM de validation.",
      type: "VIDEO",
      theme: "Urgence",
      durationMinutes: 120,
      trainerId: trainer1.id,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      maxParticipants: 50,
      accreditation: true,
      isNew: true,
      chapters: {
        create: [
          {
            title: "Introduction aux urgences néonatales",
            order: 1,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            duration: 15,
          },
          {
            title: "Détresse respiratoire du nouveau-né",
            order: 2,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            duration: 25,
          },
          {
            title: "Réanimation cardio-pulmonaire néonatale",
            order: 3,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            duration: 30,
          },
        ],
      },
      quiz: {
        create: {
          passingScore: 80,
          questions: {
            create: [
              {
                label: "Quelle est la fréquence cardiaque normale d'un nouveau-né ?",
                answers: {
                  create: [
                    { label: "60-80 bpm", isCorrect: false },
                    { label: "120-160 bpm", isCorrect: true },
                    { label: "180-200 bpm", isCorrect: false },
                  ],
                },
              },
              {
                label: "Quel est le premier geste en cas de détresse respiratoire ?",
                answers: {
                  create: [
                    { label: "Administrer de l'oxygène", isCorrect: false },
                    { label: "Dégager les voies aériennes", isCorrect: true },
                    { label: "Appeler les urgences", isCorrect: false },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  });

  await prisma.training.create({
    data: {
      title: "Soins palliatifs : accompagnement en fin de vie",
      summary: "Techniques d'accompagnement et gestion de la douleur",
      description:
        "Formation complète sur l'accompagnement des patients en fin de vie, la gestion de la douleur, et le soutien aux familles. Approche multidisciplinaire et éthique.",
      type: "PRESENTIEL",
      theme: "Gériatrie",
      durationMinutes: 180,
      trainerId: trainer2.id,
      location: "CHU Brugmann, Avenue J.J. Crocq 1, 1020 Bruxelles",
      startDate: futureDate1,
      maxParticipants: 20,
      accreditation: true,
      isNew: false,
    },
  });

  await prisma.training.create({
    data: {
      title: "Prévention et dépistage en santé mentale",
      summary: "Identifier et orienter les patients en détresse psychologique",
      description:
        "Formation sur le dépistage précoce des troubles mentaux, l'écoute active, et l'orientation vers les ressources adaptées. Cas pratiques et mises en situation.",
      type: "DISTANCIEL",
      theme: "Santé mentale",
      durationMinutes: 90,
      trainerId: trainer1.id,
      link: "https://meet.google.com/abc-defg-hij",
      startDate: futureDate2,
      maxParticipants: 30,
      accreditation: true,
      isNew: true,
    },
  });

  await prisma.training.create({
    data: {
      title: "Pharmacologie clinique : antibiotiques et résistances",
      summary: "Utilisation rationnelle des antibiotiques en pratique",
      description:
        "Parcours vidéo sur les antibiotiques, les mécanismes de résistance, et les bonnes pratiques de prescription. Études de cas cliniques et recommandations actualisées.",
      type: "VIDEO",
      theme: "Pharmacologie",
      durationMinutes: 90,
      trainerId: trainer2.id,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      maxParticipants: 100,
      accreditation: false,
      isNew: false,
      chapters: {
        create: [
          {
            title: "Classes d'antibiotiques",
            order: 1,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            duration: 20,
          },
          {
            title: "Mécanismes de résistance",
            order: 2,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            duration: 25,
          },
        ],
      },
    },
  });

  await prisma.training.create({
    data: {
      title: "Prise en charge des plaies chroniques",
      summary: "Évaluation et traitement des ulcères et escarres",
      description:
        "Formation pratique sur l'évaluation, le nettoyage, et le traitement des plaies chroniques. Choix des pansements, prévention des infections, et suivi à domicile.",
      type: "PRESENTIEL",
      theme: "Prévention",
      durationMinutes: 120,
      trainerId: trainer1.id,
      location: "Clinique Saint-Luc, Rue Bellard 10, 1040 Bruxelles",
      startDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
      maxParticipants: 15,
      accreditation: true,
      isNew: false,
    },
  });

  await prisma.training.create({
    data: {
      title: "Pédiatrie : vaccinations et calendrier vaccinal",
      summary: "Mise à jour sur le calendrier vaccinal belge",
      description:
        "Formation sur les recommandations actuelles en matière de vaccination pédiatrique, les contre-indications, et la communication avec les parents.",
      type: "VIDEO",
      theme: "Pédiatrie",
      durationMinutes: 60,
      trainerId: trainer2.id,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      maxParticipants: 80,
      accreditation: true,
      isNew: true,
      chapters: {
        create: [
          {
            title: "Calendrier vaccinal 2025",
            order: 1,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            duration: 30,
          },
          {
            title: "Contre-indications et effets secondaires",
            order: 2,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            duration: 30,
          },
        ],
      },
      quiz: {
        create: {
          passingScore: 75,
          questions: {
            create: [
              {
                label: "À quel âge administre-t-on le premier vaccin RRO ?",
                answers: {
                  create: [
                    { label: "6 mois", isCorrect: false },
                    { label: "12 mois", isCorrect: true },
                    { label: "18 mois", isCorrect: false },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  });

  console.log("✅ Formations créées (6 formations)");

  // ============================================
  // CRÉATION DES DONNÉES MOCKÉES POUR LES COMPTES MOCKÉS
  // ============================================

  const pastDate1 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Il y a 30 jours
  const pastDate2 = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000); // Il y a 15 jours
  const futureDate3 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // Dans 10 jours
  const futureDate4 = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000); // Dans 20 jours

  // Créer des formations mockées supplémentaires
  const mockTraining1 = await prisma.training.create({
    data: {
      title: "Hygiène et prévention des infections nosocomiales",
      summary: "Protocoles d'hygiène et prévention des infections en milieu de soins",
      description:
        "Formation complète sur les protocoles d'hygiène, la prévention des infections nosocomiales, et les bonnes pratiques en milieu hospitalier. Parcours vidéo avec validation QCM.",
      type: "VIDEO",
      theme: "Hygiène",
      durationMinutes: 90,
      trainerId: trainer1.id,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      maxParticipants: 200,
      accreditation: true,
      isNew: false,
      chapters: {
        create: [
          {
            title: "Introduction aux infections nosocomiales",
            order: 1,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            duration: 20,
          },
          {
            title: "Protocoles d'hygiène des mains",
            order: 2,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            duration: 25,
          },
          {
            title: "Équipements de protection individuelle",
            order: 3,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            duration: 20,
          },
          {
            title: "Gestion des déchets médicaux",
            order: 4,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            duration: 15,
          },
        ],
      },
      quiz: {
        create: {
          passingScore: 80,
          questions: {
            create: [
              {
                label: "Quelle est la durée minimale recommandée pour le lavage des mains ?",
                answers: {
                  create: [
                    { label: "10 secondes", isCorrect: false },
                    { label: "20 secondes", isCorrect: true },
                    { label: "30 secondes", isCorrect: false },
                  ],
                },
              },
              {
                label: "Quand doit-on utiliser une solution hydroalcoolique ?",
                answers: {
                  create: [
                    { label: "Seulement si les mains sont sales", isCorrect: false },
                    { label: "Quand les mains ne sont pas visiblement souillées", isCorrect: true },
                    { label: "Jamais, il faut toujours se laver les mains", isCorrect: false },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  });

  const mockTraining2 = await prisma.training.create({
    data: {
      title: "Gestion de la douleur chronique",
      summary: "Évaluation et traitement de la douleur chronique en soins à domicile",
      description:
        "Formation sur l'évaluation de la douleur, les échelles de mesure, et les stratégies thérapeutiques pour la gestion de la douleur chronique. Approche multidisciplinaire.",
      type: "VIDEO",
      theme: "Soins à domicile",
      durationMinutes: 120,
      trainerId: trainer2.id,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      maxParticipants: 150,
      accreditation: true,
      isNew: true,
      chapters: {
        create: [
          {
            title: "Comprendre la douleur chronique",
            order: 1,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            duration: 30,
          },
          {
            title: "Échelles d'évaluation de la douleur",
            order: 2,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            duration: 25,
          },
          {
            title: "Traitements pharmacologiques",
            order: 3,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            duration: 35,
          },
        ],
      },
      quiz: {
        create: {
          passingScore: 75,
          questions: {
            create: [
              {
                label: "Quelle échelle est utilisée pour évaluer la douleur chez les patients non communicants ?",
                answers: {
                  create: [
                    { label: "Échelle visuelle analogique (EVA)", isCorrect: false },
                    { label: "Échelle comportementale (ECPA)", isCorrect: true },
                    { label: "Échelle numérique (EN)", isCorrect: false },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  });

  const mockTraining3 = await prisma.training.create({
    data: {
      title: "Nutrition clinique et troubles alimentaires",
      summary: "Prise en charge nutritionnelle en milieu hospitalier",
      description:
        "Formation sur l'évaluation nutritionnelle, la prise en charge des troubles alimentaires, et l'adaptation des régimes en fonction des pathologies.",
      type: "PRESENTIEL",
      theme: "Nutrition",
      durationMinutes: 180,
      trainerId: trainer1.id,
      location: "Hôpital Erasme, Route de Lennik 808, 1070 Bruxelles",
      startDate: futureDate3,
      maxParticipants: 25,
      accreditation: true,
      isNew: true,
    },
  });

  const mockTraining4 = await prisma.training.create({
    data: {
      title: "Soins infirmiers en oncologie",
      summary: "Accompagnement des patients atteints de cancer",
      description:
        "Formation sur les spécificités des soins en oncologie, la gestion des effets secondaires des traitements, et le soutien psychologique des patients et familles.",
      type: "DISTANCIEL",
      theme: "Oncologie",
      durationMinutes: 150,
      trainerId: trainer2.id,
      link: "https://meet.google.com/mock-oncology-training",
      startDate: futureDate4,
      maxParticipants: 40,
      accreditation: true,
      isNew: false,
    },
  });

  const mockTraining5 = await prisma.training.create({
    data: {
      title: "Premiers secours et réanimation de base",
      summary: "Gestes de premiers secours et réanimation cardio-pulmonaire",
      description:
        "Formation pratique sur les gestes de premiers secours, la réanimation cardio-pulmonaire (RCP), et l'utilisation du défibrillateur automatisé externe (DAE).",
      type: "VIDEO",
      theme: "Urgence",
      durationMinutes: 60,
      trainerId: trainer1.id,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      maxParticipants: 300,
      accreditation: true,
      isNew: false,
      chapters: {
        create: [
          {
            title: "Protocole d'alerte et protection",
            order: 1,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            duration: 15,
          },
          {
            title: "Réanimation cardio-pulmonaire",
            order: 2,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            duration: 25,
          },
          {
            title: "Utilisation du DAE",
            order: 3,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            duration: 20,
          },
        ],
      },
    },
  });

  console.log("✅ Formations mockées créées (5 formations supplémentaires)");

  // Créer des inscriptions et données pour adminmock@soins.plus
  // Formation complétée 1
  const adminEnrollment1 = await prisma.enrollment.create({
    data: {
      userId: adminMockUser.id,
      trainingId: mockTraining1.id,
      status: "COMPLETED",
      score: 85,
      completedAt: pastDate1,
      attendance: true,
    },
  });

  // Progression complète pour la formation 1
  const mockTraining1Chapters = await prisma.chapter.findMany({
    where: { trainingId: mockTraining1.id },
  });
  for (const chapter of mockTraining1Chapters) {
    await prisma.chapterProgress.create({
      data: {
        userId: adminMockUser.id,
        trainingId: mockTraining1.id,
        chapterId: chapter.id,
        completedAt: pastDate1,
      },
    });
  }

  // Certificat pour la formation complétée
  await prisma.certificate.create({
    data: {
      userId: adminMockUser.id,
      trainingId: mockTraining1.id,
      enrollmentId: adminEnrollment1.id,
      fileUrl: "https://example.com/certificates/adminmock-hygiene-2025.pdf",
      issuedAt: pastDate1,
    },
  });

  // Formation complétée 2
  const adminEnrollment2 = await prisma.enrollment.create({
    data: {
      userId: adminMockUser.id,
      trainingId: mockTraining5.id,
      status: "COMPLETED",
      score: 92,
      completedAt: pastDate2,
      attendance: true,
    },
  });

  const mockTraining5Chapters = await prisma.chapter.findMany({
    where: { trainingId: mockTraining5.id },
  });
  for (const chapter of mockTraining5Chapters) {
    await prisma.chapterProgress.create({
      data: {
        userId: adminMockUser.id,
        trainingId: mockTraining5.id,
        chapterId: chapter.id,
        completedAt: pastDate2,
      },
    });
  }

  await prisma.certificate.create({
    data: {
      userId: adminMockUser.id,
      trainingId: mockTraining5.id,
      enrollmentId: adminEnrollment2.id,
      fileUrl: "https://example.com/certificates/adminmock-premiers-secours-2025.pdf",
      issuedAt: pastDate2,
    },
  });

  // Formation en cours (partiellement complétée)
  const adminEnrollment3 = await prisma.enrollment.create({
    data: {
      userId: adminMockUser.id,
      trainingId: mockTraining2.id,
      status: "CONFIRMED",
      attendance: false,
    },
  });

  // Progression partielle (2 chapitres sur 3)
  const mockTraining2Chapters = await prisma.chapter.findMany({
    where: { trainingId: mockTraining2.id },
    orderBy: { order: "asc" },
  });
  for (let i = 0; i < 2; i++) {
    await prisma.chapterProgress.create({
      data: {
        userId: adminMockUser.id,
        trainingId: mockTraining2.id,
        chapterId: mockTraining2Chapters[i].id,
        completedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Formation à venir
  await prisma.enrollment.create({
    data: {
      userId: adminMockUser.id,
      trainingId: mockTraining3.id,
      status: "REGISTERED",
      attendance: false,
    },
  });

  await prisma.enrollment.create({
    data: {
      userId: adminMockUser.id,
      trainingId: mockTraining4.id,
      status: "REGISTERED",
      attendance: false,
    },
  });

  // Créer des tickets de test variés
  await prisma.legalTicket.createMany({
    data: [
      // Tickets résolus
      {
        userId: adminMockUser.id,
        name: "Admin Mock",
        email: "adminmock@soins.plus",
        phone: "+32 470 99 99 99",
        subject: "Question sur les quotas de formation",
        message: "Bonjour, j'aimerais savoir si les formations vidéo comptent pour les quotas INAMI. Merci.",
        status: "RESOLVED",
        priority: "NORMAL",
        adminNotes: "Répondu par email le 15/01. Les formations vidéo comptent effectivement pour les quotas INAMI.",
        resolvedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        userId: userMockUser.id,
        name: "User Mock",
        email: "usermock@soins.plus",
        phone: "+32 470 88 88 88",
        subject: "Problème de connexion résolu",
        message: "J'avais des difficultés à me connecter à mon compte. Le problème est maintenant résolu, merci pour votre aide rapide !",
        status: "RESOLVED",
        priority: "NORMAL",
        adminNotes: "Problème de cache résolu. Utilisateur satisfait.",
        resolvedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        userId: null,
        name: "Marie Dubois",
        email: "marie.dubois@example.be",
        phone: "+32 470 77 77 77",
        subject: "Demande d'information sur l'abonnement",
        message: "Bonjour, je souhaiterais obtenir plus d'informations sur les différents plans d'abonnement disponibles. Pouvez-vous me renseigner sur les tarifs et les avantages de chaque formule ?",
        status: "RESOLVED",
        priority: "LOW",
        adminNotes: "Informations envoyées par email avec brochure détaillée.",
        resolvedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      },
      // Tickets en cours
      {
        userId: adminMockUser.id,
        name: "Admin Mock",
        email: "adminmock@soins.plus",
        phone: "+32 470 99 99 99",
        subject: "Problème avec le téléchargement d'attestation",
        message: "Je n'arrive pas à télécharger mon attestation de formation. Le lien semble cassé. J'ai essayé plusieurs fois mais ça ne fonctionne pas. Pouvez-vous vérifier ?",
        status: "IN_PROGRESS",
        priority: "HIGH",
        adminNotes: "En cours d'investigation. Le problème semble lié au stockage Azure. Contact avec l'équipe technique.",
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: userMockUser.id,
        name: "User Mock",
        email: "usermock@soins.plus",
        phone: "+32 470 88 88 88",
        subject: "Question sur la certification",
        message: "J'ai terminé une formation mais je ne vois pas mon certificat dans mon espace. Est-ce normal ? Combien de temps faut-il pour le recevoir ?",
        status: "IN_PROGRESS",
        priority: "NORMAL",
        adminNotes: "Vérification de l'état de la formation et du processus de certification.",
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        userId: null,
        name: "Jean Martin",
        email: "jean.martin@example.be",
        phone: "+32 470 66 66 66",
        subject: "Erreur lors du paiement",
        message: "J'ai essayé de souscrire à un abonnement mais la transaction a échoué. Mon compte bancaire a bien été débité mais je n'ai pas reçu de confirmation. Pouvez-vous vérifier ?",
        status: "IN_PROGRESS",
        priority: "URGENT",
        adminNotes: "URGENT - Vérification avec Stripe en cours. Contact client nécessaire.",
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // Il y a 6 heures
      },
      // Tickets ouverts
      {
        userId: adminMockUser.id,
        name: "Admin Mock",
        email: "adminmock@soins.plus",
        phone: "+32 470 99 99 99",
        subject: "Demande d'information sur les formations présentielles",
        message: "Quand seront programmées les prochaines formations présentielles en gériatrie ? Je souhaiterais m'inscrire à l'avance.",
        status: "OPEN",
        priority: "LOW",
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        userId: userMockUser.id,
        name: "User Mock",
        email: "usermock@soins.plus",
        phone: "+32 470 88 88 88",
        subject: "Suggestion d'amélioration",
        message: "Bonjour, j'aimerais suggérer d'ajouter une fonctionnalité de recherche avancée dans le catalogue. Cela faciliterait la recherche de formations par critères multiples.",
        status: "OPEN",
        priority: "LOW",
        createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // Il y a 12 heures
      },
      {
        userId: null,
        name: "Sophie Lambert",
        email: "sophie.lambert@example.be",
        phone: "+32 470 55 55 55",
        subject: "Problème de lecture vidéo",
        message: "Les vidéos de formation se coupent régulièrement. J'ai une bonne connexion internet donc je ne pense pas que ce soit de mon côté. Y a-t-il un problème technique ?",
        status: "OPEN",
        priority: "HIGH",
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000), // Il y a 3 heures
      },
      {
        userId: null,
        name: "Pierre Durand",
        email: "pierre.durand@example.be",
        phone: null,
        subject: "Question sur les formations accréditées",
        message: "Bonjour, toutes les formations proposées sont-elles accréditées INAMI ? Je dois justifier mes heures de formation continue.",
        status: "OPEN",
        priority: "NORMAL",
        createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000), // Il y a 8 heures
      },
      {
        userId: null,
        name: "Lucie Bernard",
        email: "lucie.bernard@example.be",
        phone: "+32 470 44 44 44",
        subject: "Demande de remboursement",
        message: "J'ai souscrit à un abonnement annuel mais je dois annuler pour des raisons personnelles. Est-il possible d'obtenir un remboursement partiel ?",
        status: "OPEN",
        priority: "NORMAL",
        createdAt: new Date(now.getTime() - 18 * 60 * 60 * 1000), // Il y a 18 heures
      },
      {
        userId: userMockUser.id,
        name: "User Mock",
        email: "usermock@soins.plus",
        phone: "+32 470 88 88 88",
        subject: "Bug dans l'interface",
        message: "Lorsque je clique sur 'Mes formations', la page ne se charge pas correctement. J'ai essayé de rafraîchir mais le problème persiste. Pouvez-vous corriger cela ?",
        status: "OPEN",
        priority: "HIGH",
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // Il y a 4 heures
      },
      // Tickets fermés
      {
        userId: null,
        name: "Thomas Moreau",
        email: "thomas.moreau@example.be",
        phone: "+32 470 33 33 33",
        subject: "Question générale",
        message: "Bonjour, j'ai une question générale sur le fonctionnement de la plateforme.",
        status: "CLOSED",
        priority: "LOW",
        adminNotes: "Question résolue. Ticket fermé après réponse.",
        resolvedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        userId: null,
        name: "Emma Petit",
        email: "emma.petit@example.be",
        phone: "+32 470 22 22 22",
        subject: "Demande d'information",
        message: "Je souhaite obtenir des informations sur les formations disponibles.",
        status: "CLOSED",
        priority: "LOW",
        adminNotes: "Informations fournies. Ticket fermé.",
        resolvedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("✅ Données mockées créées pour adminmock@soins.plus");

  // Créer des inscriptions et données pour usermock@soins.plus
  // Formation complétée 1
  const userEnrollment1 = await prisma.enrollment.create({
    data: {
      userId: userMockUser.id,
      trainingId: mockTraining1.id,
      status: "COMPLETED",
      score: 88,
      completedAt: pastDate1,
      attendance: true,
    },
  });

  for (const chapter of mockTraining1Chapters) {
    await prisma.chapterProgress.create({
      data: {
        userId: userMockUser.id,
        trainingId: mockTraining1.id,
        chapterId: chapter.id,
        completedAt: pastDate1,
      },
    });
  }

  await prisma.certificate.create({
    data: {
      userId: userMockUser.id,
      trainingId: mockTraining1.id,
      enrollmentId: userEnrollment1.id,
      fileUrl: "https://example.com/certificates/usermock-hygiene-2025.pdf",
      issuedAt: pastDate1,
    },
  });

  // Formation complétée 2
  const userEnrollment2 = await prisma.enrollment.create({
    data: {
      userId: userMockUser.id,
      trainingId: mockTraining5.id,
      status: "COMPLETED",
      score: 90,
      completedAt: pastDate2,
      attendance: true,
    },
  });

  for (const chapter of mockTraining5Chapters) {
    await prisma.chapterProgress.create({
      data: {
        userId: userMockUser.id,
        trainingId: mockTraining5.id,
        chapterId: chapter.id,
        completedAt: pastDate2,
      },
    });
  }

  await prisma.certificate.create({
    data: {
      userId: userMockUser.id,
      trainingId: mockTraining5.id,
      enrollmentId: userEnrollment2.id,
      fileUrl: "https://example.com/certificates/usermock-premiers-secours-2025.pdf",
      issuedAt: pastDate2,
    },
  });

  // Formation en cours (partiellement complétée)
  const userEnrollment3 = await prisma.enrollment.create({
    data: {
      userId: userMockUser.id,
      trainingId: mockTraining2.id,
      status: "CONFIRMED",
      attendance: false,
    },
  });

  // Progression partielle (1 chapitre sur 3)
  await prisma.chapterProgress.create({
    data: {
      userId: userMockUser.id,
      trainingId: mockTraining2.id,
      chapterId: mockTraining2Chapters[0].id,
      completedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  // Formation à venir
  await prisma.enrollment.create({
    data: {
      userId: userMockUser.id,
      trainingId: mockTraining3.id,
      status: "REGISTERED",
      attendance: false,
    },
  });

  await prisma.enrollment.create({
    data: {
      userId: userMockUser.id,
      trainingId: mockTraining4.id,
      status: "REGISTERED",
      attendance: false,
    },
  });

  console.log("✅ Données mockées créées pour usermock@soins.plus");

  // Créer des actualités
  await prisma.newsArticle.createMany({
    data: [
      {
        title: "Nouveaux quotas SPF Santé 2025",
        content:
          "Le SPF Santé Publique a annoncé une révision des quotas de formation continue pour les prestataires indépendants. Les formations en ligne comptent désormais pour 50% du total requis.",
        author: "SPF Santé Publique",
        publishedAt: new Date(),
      },
      {
        title: "Mise à jour du calendrier vaccinal pédiatrique",
        content:
          "Le Conseil Supérieur de la Santé a publié les nouvelles recommandations pour le calendrier vaccinal 2025. Formation dédiée disponible dans le catalogue.",
        author: "Dr. Marie Dupont",
        publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Plateforme SOINS+ : nouvelles fonctionnalités",
        content:
          "Découvrez le nouveau lecteur vidéo avec contrôles avancés, le suivi de progression par chapitre, et les attestations automatiques en PDF.",
        author: "Équipe SOINS+",
        publishedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Subventions pour la formation continue",
        content:
          "L'INAMI propose des subsides pour les prestataires indépendants qui suivent des formations accréditées. Renseignements et démarches dans notre espace juridique.",
        author: "Cabinet juridique partenaire",
        publishedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("✅ Actualités créées (4 articles)");

  // Créer des FAQ
  await prisma.faqEntry.createMany({
    data: [
      {
        question: "Comment obtenir mon attestation de formation ?",
        answer:
          "Les attestations sont générées automatiquement dès la validation de votre formation (QCM réussi ou présence confirmée par le formateur). Elles sont disponibles en PDF dans votre espace 'Mes formations'.",
        category: "Formations",
      },
      {
        question: "Les formations en ligne sont-elles reconnues par l'INAMI ?",
        answer:
          "Oui, toutes les formations marquées 'accréditées' sont reconnues par l'INAMI et comptent pour vos heures de formation continue obligatoires.",
        category: "Accréditation",
      },
      {
        question: "Puis-je annuler mon inscription à une formation ?",
        answer:
          "Vous pouvez annuler votre inscription jusqu'à 48h avant le début de la formation. Contactez le support via l'espace juridique.",
        category: "Inscriptions",
      },
      {
        question: "Comment fonctionne l'abonnement SOINS+ ?",
        answer:
          "L'abonnement mensuel vous donne accès illimité à toutes les formations vidéo et à un crédit de 3 formations présentielles/distancielles par mois.",
        category: "Facturation",
      },
      {
        question: "Quelles sont les conditions pour devenir formateur ?",
        answer:
          "Les formateurs doivent justifier d'une expertise reconnue dans leur domaine et d'une expérience de transmission pédagogique. Contactez-nous via l'espace juridique pour plus d'informations.",
        category: "Formateurs",
      },
    ],
  });

  console.log("✅ FAQ créée (5 entrées)");

  // Créer une inscription de test pour l'utilisateur
  await prisma.enrollment.create({
    data: {
      userId: regularUser.id,
      trainingId: videoTraining.id,
      status: "REGISTERED",
    },
  });

  console.log("✅ Inscription de test créée");

  console.log("\n🎉 Seeding terminé avec succès!");
  console.log("\n📝 Comptes de test créés :");
  console.log("   • Admin: admin@soins.plus");
  console.log("   • Formateur: formateur@soins.plus");
  console.log("   • Utilisateur: utilisateur@soins.plus");
  console.log("   • Mot de passe commun: SoinsPlus2025!");
  console.log("\n🎭 Comptes mockés créés :");
  console.log("   • Admin Mock: adminmock@soins.plus (accès admin hub)");
  console.log("     - 2 formations complétées avec certificats");
  console.log("     - 1 formation en cours (66% complétée)");
  console.log("     - 2 formations à venir");
  console.log("     - 3 tickets juridiques");
  console.log("   • User Mock: usermock@soins.plus (accès utilisateur uniquement)");
  console.log("     - 2 formations complétées avec certificats");
  console.log("     - 1 formation en cours (33% complétée)");
  console.log("     - 2 formations à venir");
  console.log("   • Mot de passe commun: SoinsPlus2025!");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

