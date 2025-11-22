import { prisma } from "../../lib/prisma";

export interface UserStats {
  totalTrainings: number;
  inProgress: number;
  completed: number;
  upcoming: number;
  totalHoursCompleted: number;
  yearlyGoal: number;
  progressPercent: number;
  recentTrainings: Array<{
    id: string;
    title: string;
    status: string;
    completedAt?: Date;
  }>;
  certificatesCount: number;
}

/**
 * Récupère les statistiques complètes d'un utilisateur
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const [enrollments, certificates] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId },
      include: {
        training: {
          select: {
            id: true,
            title: true,
            durationMinutes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.certificate.findMany({
      where: { userId },
      select: { id: true },
    }),
  ]);

  const inProgress = enrollments.filter(
    (e) => e.status === "REGISTERED" || e.status === "CONFIRMED"
  );
  const completed = enrollments.filter((e) => e.status === "COMPLETED");
  const upcoming = enrollments.filter(
    (e) => e.status === "REGISTERED" && e.training.startDate && new Date(e.training.startDate) > new Date()
  );

  const totalHoursCompleted = completed.reduce(
    (sum, e) => sum + (e.training.durationMinutes ?? 90) / 60,
    0
  );
  const yearlyGoal = 20; // Objectif annuel en heures
  const progressPercent = yearlyGoal > 0 ? Math.min((totalHoursCompleted / yearlyGoal) * 100, 100) : 0;

  return {
    totalTrainings: enrollments.length,
    inProgress: inProgress.length,
    completed: completed.length,
    upcoming: upcoming.length,
    totalHoursCompleted,
    yearlyGoal,
    progressPercent: Math.round(progressPercent),
    recentTrainings: enrollments.slice(0, 5).map((e) => ({
      id: e.training.id,
      title: e.training.title,
      status: e.status,
      completedAt: e.completedAt || undefined,
    })),
    certificatesCount: certificates.length,
  };
}

