import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { sendEnrollmentConfirmation } from "../notifications/service";
import { cacheGetJson, cacheSetJson } from "../../lib/redis";

export const registerCatalogRoutes = (app: FastifyInstance) => {
  app.get("/trainings", async (request) => {
    // Générer une clé de cache basée sur les filtres
    const cacheKey = `catalog:trainings:${JSON.stringify(request.query)}`;
    
    // Vérifier le cache (TTL 5 minutes)
    const cached = await cacheGetJson<any[]>(cacheKey);
    if (cached) {
      return cached;
    }
    const filters = z
      .object({
        type: z.enum(["VIDEO", "PRESENTIEL", "DISTANCIEL"]).optional(),
        accreditation: z.string().optional(),
        date: z.string().optional(),
        theme: z.string().optional(),
        search: z.string().optional(),
      })
      .parse(request.query);

    const dateFilter =
      filters.date && !Number.isNaN(Date.parse(filters.date))
        ? (() => {
            const start = new Date(filters.date);
            const end = new Date(start);
            end.setDate(end.getDate() + 1);
            return { gte: start, lt: end };
          })()
        : undefined;

    const where: any = {
      type: filters.type,
      accreditation: filters.accreditation === undefined ? undefined : filters.accreditation === "true",
      theme: filters.theme,
      startDate: dateFilter,
    };

    // Recherche améliorée (titre, description, formateur)
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { summary: { contains: filters.search, mode: "insensitive" } },
        {
          trainer: {
            user: {
              OR: [
                { firstName: { contains: filters.search, mode: "insensitive" } },
                { lastName: { contains: filters.search, mode: "insensitive" } },
              ],
            },
          },
        },
      ];
    }

    // Déterminer l'ordre de tri
    const sortParam = (request.query as any).sort || "date";
    let orderBy: any = { createdAt: "desc" };
    let shouldSortAfter = false;
    if (sortParam === "date") {
      orderBy = { startDate: "desc" };
    } else if (sortParam === "popularity") {
      // Tri par nombre d'inscriptions - on triera après la requête
      orderBy = { createdAt: "desc" }; // Tri par défaut, on triera après
      shouldSortAfter = true;
    } else if (sortParam === "relevance" && filters.search) {
      // Pour la pertinence, on triera après en fonction de la correspondance avec la recherche
      orderBy = { createdAt: "desc" };
      shouldSortAfter = true;
    }

    const trainings = await prisma.training.findMany({
      where,
      include: {
        trainer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        enrollments: {
          select: {
            id: true,
          },
        },
      },
      orderBy,
    });

    // Fonction helper pour calculer le score de pertinence
    const getRelevanceScore = (training: any, search: string): number => {
      let score = 0;
      const title = (training.title || "").toLowerCase();
      const description = (training.description || "").toLowerCase();
      const summary = (training.summary || "").toLowerCase();
      const trainerFirstName = (training.trainer?.user?.firstName || "").toLowerCase();
      const trainerLastName = (training.trainer?.user?.lastName || "").toLowerCase();
      const trainerName = `${trainerFirstName} ${trainerLastName}`.trim();

      // Score plus élevé si la recherche correspond au début du titre
      if (title.startsWith(search)) score += 10;
      // Score si le titre contient la recherche
      else if (title.includes(search)) score += 5;
      
      // Score si la description contient la recherche
      if (description.includes(search)) score += 3;
      if (summary.includes(search)) score += 2;
      
      // Score si le formateur correspond
      if (trainerName.includes(search)) score += 4;
      if (trainerFirstName.includes(search) || trainerLastName.includes(search)) score += 2;

      return score;
    };

    // Si tri par popularité ou pertinence, trier après la requête
    let sortedTrainings = trainings;
    if (sortParam === "popularity") {
      sortedTrainings = [...trainings].sort((a, b) => {
        const countA = a.enrollments?.length || 0;
        const countB = b.enrollments?.length || 0;
        return countB - countA; // Ordre décroissant
      });
    } else if (sortParam === "relevance" && filters.search) {
      // Tri par pertinence : priorité au titre, puis description, puis formateur
      const searchLower = filters.search.toLowerCase();
      sortedTrainings = [...trainings].sort((a, b) => {
        const scoreA = getRelevanceScore(a, searchLower);
        const scoreB = getRelevanceScore(b, searchLower);
        return scoreB - scoreA; // Ordre décroissant (plus pertinent en premier)
      });
    }

    // Ajouter le badge "NOUVEAU" pour les formations créées il y a moins de 30 jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = sortedTrainings.map((training) => ({
      ...training,
      isNew: training.createdAt > thirtyDaysAgo,
    }));

    // Mettre en cache pour 5 minutes
    await cacheSetJson(cacheKey, result, 300);

    return result;
  });

  app.get("/trainings/:id", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const userId = typeof request.user?.sub === "string" ? request.user.sub : request.headers["x-user-id"];
    const training = await prisma.training.findUnique({
      where: { id: params.id },
      include: {
        trainer: { include: { user: true } },
        chapters: { orderBy: { order: "asc" } },
        enrollments: true,
        quiz: { include: { questions: { include: { answers: true } } } },
      },
    });
    if (!training) {
      return reply.status(404).send({ message: "Formation introuvable" });
    }

    const progress = userId
      ? await prisma.chapterProgress.findMany({
          where: { trainingId: params.id, userId },
          select: { chapterId: true, completedAt: true },
        })
      : [];

    // Calculer la progression détaillée
    const chapters = training.chapters || [];
    const progressMap = new Map(progress.map((p) => [p.chapterId, p]));
    const completedChapters = progress.length;
    const totalChapters = chapters.length;
    const progressPercent = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

    return {
      ...training,
      progress,
      progressDetail: {
        completed: completedChapters,
        total: totalChapters,
        percent: progressPercent,
        chapters: chapters.map((chapter) => ({
          id: chapter.id,
          completed: progressMap.has(chapter.id),
          completedAt: progressMap.get(chapter.id)?.completedAt,
        })),
      },
    };
  });

  app.post("/trainings/:id/enroll", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const userId = typeof request.user?.sub === "string" ? request.user.sub : request.headers["x-user-id"];
    if (!userId || typeof userId !== "string") {
      return reply.status(401).send({ message: "Utilisateur requis" });
    }
    const training = await prisma.training.findUnique({
      where: { id: params.id },
      include: { enrollments: true },
    });
    if (!training) {
      return reply.status(404).send({ message: "Formation introuvable" });
    }

    if (
      training.maxParticipants &&
      training.enrollments &&
      training.enrollments.length >= training.maxParticipants
    ) {
      return reply.status(409).send({ message: "Plus aucune place disponible" });
    }

    const existing = training.enrollments?.find((enrollment) => enrollment.userId === userId);
    if (existing) {
      return existing;
    }
    const enrollment = await prisma.enrollment.create({
      data: {
        trainingId: params.id,
        userId,
      },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.email) {
      await sendEnrollmentConfirmation({
        email: user.email,
        trainingTitle: training.title,
        date: training.startDate?.toISOString(),
      });
    }

    return enrollment;
  });
};

