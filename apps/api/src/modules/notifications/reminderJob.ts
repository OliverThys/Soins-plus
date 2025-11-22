import type { FastifyBaseLogger } from "fastify";
import { prisma } from "../../lib/prisma";
import { sendReminderEmail } from "./service";

const ONE_HOUR = 1000 * 60 * 60;
const ONE_DAY = 24 * ONE_HOUR;
const SEVEN_DAYS = 7 * ONE_DAY;

/**
 * Job de rappels automatiques pour les formations
 * - Rappel 7 jours avant formation présentielle
 * - Rappel 1 jour avant formation présentielle
 * - Rappel pour formations vidéo non complétées (après 7 jours d'inactivité)
 */
export const startReminderJob = (logger?: FastifyBaseLogger) => {
  const interval = setInterval(async () => {
    try {
      const now = new Date();
      const in7Days = new Date(now.getTime() + SEVEN_DAYS);
      const in1Day = new Date(now.getTime() + ONE_DAY);
      const sevenDaysAgo = new Date(now.getTime() - SEVEN_DAYS);

      // Rappel 7 jours avant formation présentielle
      const enrollments7Days = await prisma.enrollment.findMany({
        where: {
          remindersSent: { lt: 1 }, // Pas encore de rappel envoyé
          training: {
            type: { in: ["PRESENTIEL", "DISTANCIEL"] },
            startDate: {
              gte: new Date(now.getTime() + 6 * ONE_DAY), // Entre 6 et 7 jours
              lte: in7Days,
            },
          },
        },
        include: {
          user: true,
          training: true,
        },
      });

      for (const enrollment of enrollments7Days) {
        if (!enrollment.user.email || !enrollment.training.startDate) continue;
        await sendReminderEmail({
          email: enrollment.user.email,
          trainingTitle: enrollment.training.title,
          date: enrollment.training.startDate.toISOString(),
        });
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { remindersSent: enrollment.remindersSent + 1 },
        });
        logger?.info(`Rappel 7 jours envoyé pour ${enrollment.user.email} - ${enrollment.training.title}`);
      }

      // Rappel 1 jour avant formation présentielle
      const enrollments1Day = await prisma.enrollment.findMany({
        where: {
          remindersSent: { gte: 1, lt: 2 }, // Un rappel déjà envoyé (7 jours)
          training: {
            type: { in: ["PRESENTIEL", "DISTANCIEL"] },
            startDate: {
              gte: now,
              lte: in1Day,
            },
          },
        },
        include: {
          user: true,
          training: true,
        },
      });

      for (const enrollment of enrollments1Day) {
        if (!enrollment.user.email || !enrollment.training.startDate) continue;
        await sendReminderEmail({
          email: enrollment.user.email,
          trainingTitle: enrollment.training.title,
          date: enrollment.training.startDate.toISOString(),
        });
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { remindersSent: enrollment.remindersSent + 1 },
        });
        logger?.info(`Rappel 1 jour envoyé pour ${enrollment.user.email} - ${enrollment.training.title}`);
      }

      // Rappel pour formations vidéo non complétées (après 7 jours d'inactivité)
      const videoEnrollments = await prisma.enrollment.findMany({
        where: {
          status: { in: ["REGISTERED", "CONFIRMED"] },
          training: {
            type: "VIDEO",
          },
          updatedAt: {
            lte: sevenDaysAgo, // Dernière activité il y a plus de 7 jours
          },
        },
        include: {
          user: true,
          training: {
            include: {
              chapters: true,
            },
          },
        },
      });

      for (const enrollment of videoEnrollments) {
        if (!enrollment.user.email) continue;

        // Vérifier si la formation a des chapitres non complétés
        const progress = await prisma.chapterProgress.count({
          where: {
            userId: enrollment.userId,
            trainingId: enrollment.trainingId,
          },
        });

        const totalChapters = enrollment.training.chapters.length;
        if (totalChapters > 0 && progress < totalChapters) {
          // Envoyer un rappel seulement si moins de 50% complété
          const completionPercent = (progress / totalChapters) * 100;
          if (completionPercent < 50) {
            await sendReminderEmail({
              email: enrollment.user.email,
              trainingTitle: enrollment.training.title,
              date: "À compléter",
            });
            await prisma.enrollment.update({
              where: { id: enrollment.id },
              data: { updatedAt: new Date() }, // Mettre à jour pour éviter les rappels répétés
            });
            logger?.info(`Rappel vidéo envoyé pour ${enrollment.user.email} - ${enrollment.training.title}`);
          }
        }
      }
    } catch (error) {
      logger?.error({ err: error }, "Reminder job failed");
    }
  }, ONE_HOUR);

  return () => clearInterval(interval);
};

