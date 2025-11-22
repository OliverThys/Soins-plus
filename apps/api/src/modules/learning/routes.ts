import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { issueCertificate } from "./certificates";
import { sendCertificateIssuedEmail } from "../notifications/service";

const quizSubmission = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answerIds: z.array(z.string()),
    })
  ),
});

export const registerLearningRoutes = (app: FastifyInstance) => {
  app.get("/trainings/:id/chapters", async (request) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    return prisma.chapter.findMany({
      where: { trainingId: params.id },
      orderBy: { order: "asc" },
    });
  });

  app.post("/trainings/:id/chapters/:chapterId/progress", async (request, reply) => {
    const schema = z.object({
      id: z.string(),
      chapterId: z.string(),
    });
    const params = schema.parse({ ...request.params });
    const body = z.object({ position: z.number().optional() }).parse(request.body || {});
    const userId = typeof request.user?.sub === "string" ? request.user.sub : request.headers["x-user-id"];
    if (!userId || typeof userId !== "string") {
      return reply.status(401).send({ message: "Utilisateur requis" });
    }

    const chapter = await prisma.chapter.findUnique({ where: { id: params.chapterId } });
    if (!chapter || chapter.trainingId !== params.id) {
      return reply.status(404).send({ message: "Chapitre introuvable" });
    }

    await prisma.chapterProgress.upsert({
      where: {
        userId_chapterId: {
          userId,
          chapterId: params.chapterId,
        },
      },
      update: {
        completedAt: new Date(),
        // Note: videoPosition nécessiterait une migration, on l'ajoutera plus tard
      },
      create: {
        userId,
        trainingId: params.id,
        chapterId: params.chapterId,
      },
    });

    const [completed, total] = await Promise.all([
      prisma.chapterProgress.count({
        where: { trainingId: params.id, userId },
      }),
      prisma.chapter.count({
        where: { trainingId: params.id },
      }),
    ]);

    if (total > 0 && completed === total) {
      await prisma.enrollment.updateMany({
        where: { trainingId: params.id, userId },
        data: { status: "CONFIRMED" },
      });
    }

    return { status: "validated", completed, total };
  });

  /**
   * Récupère la progression détaillée d'une formation pour l'utilisateur
   */
  app.get("/trainings/:id/progress", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const userId = typeof request.user?.sub === "string" ? request.user.sub : request.headers["x-user-id"];
    if (!userId || typeof userId !== "string") {
      return reply.status(401).send({ message: "Utilisateur requis" });
    }

    const [chapters, progress] = await Promise.all([
      prisma.chapter.findMany({
        where: { trainingId: params.id },
        orderBy: { order: "asc" },
      }),
      prisma.chapterProgress.findMany({
        where: { trainingId: params.id, userId },
      }),
    ]);

    const progressMap = new Map(progress.map((p) => [p.chapterId, p]));

    return {
      chapters: chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        order: chapter.order,
        duration: chapter.duration,
        completed: progressMap.has(chapter.id),
        completedAt: progressMap.get(chapter.id)?.completedAt,
      })),
      total: chapters.length,
      completed: progress.length,
      percent: chapters.length > 0 ? Math.round((progress.length / chapters.length) * 100) : 0,
    };
  });

  app.post("/trainings/:id/quiz/submit", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = quizSubmission.parse(request.body);
    const userId = typeof request.user?.sub === "string" ? request.user.sub : request.headers["x-user-id"];
    if (!userId || typeof userId !== "string") {
      return reply.status(401).send({ message: "Utilisateur requis" });
    }

    const [quiz, enrollment] = await Promise.all([
      prisma.quiz.findUnique({
        where: { trainingId: params.id },
        include: { questions: { include: { answers: true } } },
      }),
      prisma.enrollment.findFirst({
        where: { trainingId: params.id, userId },
      }),
    ]);
    if (!quiz) {
      return reply.status(404).send({ message: "Quiz introuvable" });
    }

    let total = quiz.questions.length;
    let score = 0;
    for (const q of quiz.questions) {
      const submission = body.answers.find((a) => a.questionId === q.id);
      if (!submission) continue;
      const correctIds = q.answers.filter((a) => a.isCorrect).map((a) => a.id).sort();
      const submitted = submission.answerIds.slice().sort();
      if (JSON.stringify(correctIds) === JSON.stringify(submitted)) {
        score++;
      }
    }
    const percent = Math.round((score / total) * 100);
    const passed = percent >= quiz.passingScore;

    await prisma.enrollment.updateMany({
      where: { trainingId: params.id, userId },
      data: {
        status: passed ? "COMPLETED" : "REGISTERED",
        score: percent,
        completedAt: passed ? new Date() : null,
      },
    });

    if (passed) {
      const { certificate, pdfBuffer, user, training } = await issueCertificate({
        userId,
        trainingId: params.id,
        enrollmentId: enrollment?.id,
        score: percent,
      });

      if (user.email) {
        await sendCertificateIssuedEmail({
          email: user.email,
          trainingTitle: training.title,
          certificateUrl: certificate.fileUrl,
        });
      }

      return reply.header("Content-Type", "application/pdf").send(pdfBuffer);
    }

    return { score: percent, passed };
  });
};

