/**
 * Service d'analytics pour le dashboard admin
 */

import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { cacheGetJson, cacheSetJson } from "../../lib/redis";

export interface AdminAnalytics {
  users: {
    total: number;
    active: number;
    withSubscription: number;
    newThisMonth: number;
  };
  trainings: {
    total: number;
    active: number;
    completed: number;
    upcoming: number;
  };
  enrollments: {
    total: number;
    completed: number;
    inProgress: number;
    upcoming: number;
  };
  revenue: {
    monthly: number;
    yearly: number;
    total: number;
  };
  popularTrainings: Array<{
    id: string;
    title: string;
    enrollments: number;
    completionRate: number;
  }>;
  completionRates: {
    average: number;
    byTraining: Array<{
      trainingId: string;
      trainingTitle: string;
      rate: number;
    }>;
  };
}

/**
 * Récupère les statistiques analytics pour le dashboard admin
 */
export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  // Vérifier le cache Redis (TTL 5 minutes)
  const cacheKey = "admin:analytics";
  const cached = await cacheGetJson<AdminAnalytics>(cacheKey);
  if (cached) {
    return cached;
  }

  // Statistiques utilisateurs
  const [totalUsers, activeUsers, usersWithSubscription, newUsersThisMonth] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { subscriptionActive: true } }),
    prisma.user.count({ where: { subscriptionActive: true } }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ]);

  // Statistiques formations
  const now = new Date();
  const [totalTrainings, activeTrainings, completedTrainings, upcomingTrainings] = await Promise.all([
    prisma.training.count(),
    prisma.training.count({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
    }),
    prisma.training.count({
      where: {
        endDate: { lt: now },
      },
    }),
    prisma.training.count({
      where: {
        startDate: { gt: now },
      },
    }),
  ]);

  // Statistiques inscriptions
  const [totalEnrollments, completedEnrollments, inProgressEnrollments, upcomingEnrollments] = await Promise.all([
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { status: "COMPLETED" } }),
    prisma.enrollment.count({
      where: {
        status: { in: ["REGISTERED", "CONFIRMED"] },
        training: {
          startDate: { lte: now },
          endDate: { gte: now },
        },
      },
    }),
    prisma.enrollment.count({
      where: {
        status: { in: ["REGISTERED", "CONFIRMED"] },
        training: {
          startDate: { gt: now },
        },
      },
    }),
  ]);

  // Revenus (depuis Stripe)
  let monthlyRevenue = 0;
  let yearlyRevenue = 0;
  try {
    const subscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
    });

    for (const sub of subscriptions.data) {
      const price = sub.items.data[0]?.price;
      if (price) {
        const amount = (price.unit_amount || 0) / 100;
        if (price.recurring?.interval === "month") {
          monthlyRevenue += amount;
        } else if (price.recurring?.interval === "year") {
          yearlyRevenue += amount;
        }
      }
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des revenus:", error);
  }

  // Formations populaires
  const popularTrainings = await prisma.training.findMany({
    include: {
      enrollments: true,
      _count: {
        select: {
          enrollments: {
            where: { status: "COMPLETED" },
          },
        },
      },
    },
    orderBy: {
      enrollments: {
        _count: "desc",
      },
    },
    take: 10,
  });

  const popularTrainingsData = popularTrainings.map((training) => {
    const totalEnrollments = training.enrollments.length;
    const completed = training._count.enrollments;
    return {
      id: training.id,
      title: training.title,
      enrollments: totalEnrollments,
      completionRate: totalEnrollments > 0 ? (completed / totalEnrollments) * 100 : 0,
    };
  });

  // Taux de complétion
  const allTrainings = await prisma.training.findMany({
    include: {
      enrollments: true,
      _count: {
        select: {
          enrollments: {
            where: { status: "COMPLETED" },
          },
        },
      },
    },
  });

  const completionRates = allTrainings.map((training) => {
    const total = training.enrollments.length;
    const completed = training._count.enrollments;
    return {
      trainingId: training.id,
      trainingTitle: training.title,
      rate: total > 0 ? (completed / total) * 100 : 0,
    };
  });

  const averageCompletionRate =
    completionRates.length > 0
      ? completionRates.reduce((sum, r) => sum + r.rate, 0) / completionRates.length
      : 0;

  const analytics: AdminAnalytics = {
    users: {
      total: totalUsers,
      active: activeUsers,
      withSubscription: usersWithSubscription,
      newThisMonth: newUsersThisMonth,
    },
    trainings: {
      total: totalTrainings,
      active: activeTrainings,
      completed: completedTrainings,
      upcoming: upcomingTrainings,
    },
    enrollments: {
      total: totalEnrollments,
      completed: completedEnrollments,
      inProgress: inProgressEnrollments,
      upcoming: upcomingEnrollments,
    },
    revenue: {
      monthly: monthlyRevenue,
      yearly: yearlyRevenue,
      total: monthlyRevenue * 12 + yearlyRevenue,
    },
    popularTrainings: popularTrainingsData,
    completionRates: {
      average: averageCompletionRate,
      byTraining: completionRates,
    },
  };

  // Mettre en cache pour 5 minutes
  await cacheSetJson(cacheKey, analytics, 300);

  return analytics;
}

