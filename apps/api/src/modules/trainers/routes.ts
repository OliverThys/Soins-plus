import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { issueCertificate } from "../learning/certificates";
import { sendCertificateIssuedEmail } from "../notifications/service";

export const registerTrainerRoutes = (app: FastifyInstance) => {
  app.register(async (instance) => {
    instance.addHook("preHandler", async (request, reply) => {
      try {
        const auth = request.headers.authorization;
        if (!auth?.includes("Bearer ")) {
          return reply.status(401).send({ message: "Token manquant" });
        }
        const token = auth.replace("Bearer ", "");
        const payload = await instance.jwt.verify(token);
        const userId = (payload as any).sub;
        
        if (!userId) {
          return reply.status(401).send({ message: "Token invalide" });
        }
        
        // Vérifier si l'utilisateur a un profil Trainer (même si role = "user")
        const trainer = await prisma.trainer.findUnique({
          where: { userId },
          select: { id: true },
        });
        
        if (!trainer && payload.role !== "trainer") {
          return reply.status(403).send({ message: "Accès réservé aux formateurs" });
        }
        
        request.user = payload;
      } catch (error: any) {
        return reply.status(401).send({ message: error.message || "Erreur d'authentification" });
      }
    });

    instance.get("/trainer/trainings", async (request, reply) => {
      try {
        const userId = (request.user as any).sub;
        const trainer = await prisma.trainer.findUnique({
          where: { userId },
          select: { id: true },
        });
        if (!trainer) {
          return [];
        }
        return await prisma.training.findMany({
          where: { trainerId: trainer.id },
          include: {
            enrollments: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
          orderBy: { startDate: "desc" },
        });
      } catch (error: any) {
        return reply.status(500).send({ message: error.message || "Erreur serveur" });
      }
    });

    instance.get("/trainer/dashboard", async (request, reply) => {
      try {
        const userId = (request.user as any).sub;
        const trainer = await prisma.trainer.findUnique({
          where: { userId },
          select: { id: true },
        });
        if (!trainer) {
          return { upcomingTrainings: [], totalParticipants: 0, totalTrainings: 0 };
        }

        const now = new Date();
        const upcomingTrainings = await prisma.training.findMany({
          where: {
            trainerId: trainer.id,
            startDate: { gte: now },
          },
          include: {
            enrollments: {
              select: { id: true },
            },
          },
          orderBy: { startDate: "asc" },
          take: 5,
        });

        const totalTrainings = await prisma.training.count({
          where: { trainerId: trainer.id },
        });

        const totalParticipants = await prisma.enrollment.count({
          where: {
            training: {
              trainerId: trainer.id,
            },
          },
        });

        return {
          upcomingTrainings,
          totalParticipants,
          totalTrainings,
        };
      } catch (error: any) {
        return reply.status(500).send({ message: error.message || "Erreur serveur" });
      }
    });

    instance.get("/trainer/trainings/:id/participants", async (request, reply) => {
      try {
        const params = z.object({ id: z.string() }).parse(request.params);
        const userId = (request.user as any).sub;
        const trainer = await prisma.trainer.findUnique({
          where: { userId },
          select: { id: true },
        });
        if (!trainer) {
          return reply.status(403).send({ message: "Formateur non trouvé" });
        }

        const training = await prisma.training.findUnique({
          where: { id: params.id },
          select: { trainerId: true, title: true, startDate: true },
        });
        if (!training || training.trainerId !== trainer.id) {
          return reply.status(403).send({ message: "Formation non assignée à ce formateur" });
        }

        const enrollments = await prisma.enrollment.findMany({
          where: { trainingId: params.id },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        return {
          training: {
            id: params.id,
            title: training.title,
            startDate: training.startDate,
          },
          participants: enrollments,
        };
      } catch (error: any) {
        return reply.status(500).send({ message: error.message || "Erreur serveur" });
      }
    });

    instance.post("/trainer/trainings/:id/attendance", async (request, reply) => {
      const params = z.object({ id: z.string() }).parse(request.params);
      const userId = (request.user as any).sub;
      const trainer = await prisma.trainer.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!trainer) {
        return reply.status(403).send({ message: "Formateur non trouvé" });
      }

      // Vérifier que la formation appartient au formateur
      const training = await prisma.training.findUnique({
        where: { id: params.id },
        select: { trainerId: true },
      });
      if (!training || training.trainerId !== trainer.id) {
        return reply.status(403).send({ message: "Formation non assignée à ce formateur" });
      }

      const body = z.object({
        entries: z.array(
          z.object({
            enrollmentId: z.string(),
            present: z.boolean(),
            comment: z.string().optional(),
          })
        ),
      });
      const data = body.parse(request.body);
      
      await Promise.all(
        data.entries.map((entry) =>
          prisma.enrollment.update({
            where: { id: entry.enrollmentId },
            data: { attendance: entry.present },
          })
        )
      );

      const attendanceValidatedIds = data.entries.filter((entry) => entry.present).map((entry) => entry.enrollmentId);
      if (attendanceValidatedIds.length > 0) {
        const enrollments = await prisma.enrollment.findMany({
          where: {
            id: { in: attendanceValidatedIds },
          },
          include: {
            user: true,
            training: true,
            certificate: true,
          },
        });

        for (const enrollment of enrollments) {
          if (enrollment.certificate) continue;
          const { certificate, user, training } = await issueCertificate({
            userId: enrollment.userId,
            trainingId: enrollment.trainingId,
            enrollmentId: enrollment.id,
          });

          if (user.email) {
            await sendCertificateIssuedEmail({
              email: user.email,
              trainingTitle: training.title,
              certificateUrl: certificate.fileUrl,
            });
          }
        }
      }

      return { status: "updated", validated: attendanceValidatedIds.length };
    });

    instance.post("/trainer/trainings/:id/attendance/bulk", async (request, reply) => {
      const params = z.object({ id: z.string() }).parse(request.params);
      const userId = (request.user as any).sub;
      const trainer = await prisma.trainer.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!trainer) {
        return reply.status(403).send({ message: "Formateur non trouvé" });
      }

      const training = await prisma.training.findUnique({
        where: { id: params.id },
        select: { trainerId: true },
      });
      if (!training || training.trainerId !== trainer.id) {
        return reply.status(403).send({ message: "Formation non assignée à ce formateur" });
      }

      const body = z.object({
        allPresent: z.boolean(),
      }).parse(request.body);

      const enrollments = await prisma.enrollment.findMany({
        where: { trainingId: params.id },
      });

      await Promise.all(
        enrollments.map((enrollment) =>
          prisma.enrollment.update({
            where: { id: enrollment.id },
            data: { attendance: body.allPresent },
          })
        )
      );

      if (body.allPresent) {
        for (const enrollment of enrollments) {
          const existingCert = await prisma.certificate.findFirst({
            where: { enrollmentId: enrollment.id },
          });
          if (existingCert) continue;

          const { certificate, user, training: trainingData } = await issueCertificate({
            userId: enrollment.userId,
            trainingId: enrollment.trainingId,
            enrollmentId: enrollment.id,
          });

          if (user.email) {
            await sendCertificateIssuedEmail({
              email: user.email,
              trainingTitle: trainingData.title,
              certificateUrl: certificate.fileUrl,
            });
          }
        }
      }

      return { status: "updated", count: enrollments.length };
    });
  });
};

