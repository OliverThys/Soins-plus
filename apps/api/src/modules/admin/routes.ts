import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
// @ts-expect-error - json2csv n'a pas de types
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import { getAdminAnalytics } from "./analytics";
import argon2 from "argon2";
import { uploadThumbnail, deleteThumbnail } from "../../lib/storage";

// Helper pour valider les URLs optionnelles (peuvent être vides)
const optionalUrl = z.union([z.string().url(), z.literal("")]).optional().or(z.null());

const trainingSchema = z.object({
  title: z.string(),
  summary: z.string(),
  description: z.string(),
  type: z.enum(["VIDEO", "PRESENTIEL", "DISTANCIEL"]),
  trainerId: z.string().optional().or(z.null()),
  location: z.string().optional().or(z.null()),
  videoUrl: optionalUrl,
  link: optionalUrl,
  thumbnailUrl: optionalUrl,
  accreditation: z.boolean().optional().default(false),
  theme: z.string(),
  durationMinutes: z.coerce.number().min(15),
  maxParticipants: z.coerce.number().min(1),
  startDate: z.string().optional().or(z.null()),
  endDate: z.string().optional().or(z.null()),
});

export const registerAdminRoutes = (app: FastifyInstance) => {
  app.register(async (instance) => {
    instance.addHook("preHandler", async (request, reply) => {
      const auth = request.headers.authorization;
      if (!auth?.includes("Bearer ")) {
        return reply.status(401).send({ message: "Token manquant" });
      }
      const token = auth.replace("Bearer ", "");
      try {
        const payload = await instance.jwt.verify(token) as any;
        if (payload.role !== "admin") {
          return reply.status(403).send({ message: "Accès refusé. Rôle admin requis." });
        }
        request.user = payload;
      } catch (error: any) {
        // Gérer les erreurs de token (expiré, invalide, etc.)
        if (error.code === "FAST_JWT_EXPIRED" || error.message?.includes("expired")) {
          return reply.status(401).send({ message: "Token expiré. Veuillez vous reconnecter." });
        }
        return reply.status(401).send({ message: "Token invalide" });
      }
    });

    instance.get("/admin/trainers", async () => {
      return prisma.trainer.findMany({
        include: { user: true },
      });
    });

    instance.post("/admin/trainings", async (request) => {
      const raw = trainingSchema.parse(request.body);
      const data: any = {
        ...raw,
        // Convertir les chaînes vides en null pour les URLs optionnelles
        videoUrl: raw.videoUrl === "" ? null : raw.videoUrl,
        link: raw.link === "" ? null : raw.link,
        thumbnailUrl: raw.thumbnailUrl === "" ? null : raw.thumbnailUrl,
        trainerId: raw.trainerId === "" ? null : raw.trainerId,
        location: raw.location === "" ? null : raw.location,
        startDate: raw.startDate ? new Date(raw.startDate) : null,
        endDate: raw.endDate ? new Date(raw.endDate) : null,
      };
      const training = await prisma.training.create({ data });
      return training;
    });

    instance.patch("/admin/trainings/:id", async (request, reply) => {
      const params = z.object({ id: z.string() }).parse(request.params);
      const raw = trainingSchema.partial().parse(request.body);
      const data: any = { ...raw };
      
      // Convertir les chaînes vides en null pour les URLs optionnelles
      if (raw.videoUrl === "") data.videoUrl = null;
      if (raw.link === "") data.link = null;
      if (raw.thumbnailUrl === "") data.thumbnailUrl = null;
      if (raw.trainerId === "") data.trainerId = null;
      if (raw.location === "") data.location = null;
      
      // Gérer les dates : convertir les chaînes vides en null, sinon convertir en Date
      if (raw.startDate === "" || raw.startDate === null) {
        data.startDate = null;
      } else if (raw.startDate) {
        data.startDate = new Date(raw.startDate);
      }
      
      if (raw.endDate === "" || raw.endDate === null) {
        data.endDate = null;
      } else if (raw.endDate) {
        data.endDate = new Date(raw.endDate);
      }
      const training = await prisma.training.update({
        where: { id: params.id },
        data,
      });
      return training;
    });

    instance.delete("/admin/trainings/:id", async (request) => {
      const params = z.object({ id: z.string() }).parse(request.params);
      
      // Récupérer la formation avec ses relations
      const training = await prisma.training.findUnique({ 
        where: { id: params.id },
        include: {
          chapters: true,
          quiz: {
            include: {
              questions: {
                include: {
                  answers: true,
                },
              },
            },
          },
          enrollments: true,
          certificates: true,
          chapterProgress: true,
        },
      });

      if (!training) {
        return { status: "not_found", message: "Formation introuvable" };
      }

      // Supprimer la miniature si elle existe
      if (training.thumbnailUrl) {
        try {
          const urlParts = training.thumbnailUrl.split("/");
          const fileName = urlParts.slice(-3).join("/"); // trainings/{id}/{filename}
          await deleteThumbnail(fileName);
        } catch (error: any) {
          instance.log.warn("Erreur lors de la suppression de la miniature:", error?.message || String(error));
        }
      }

      // Supprimer toutes les relations en cascade dans une transaction
      await prisma.$transaction(async (tx) => {
        // 1. Supprimer les réponses des questions du quiz
        if (training.quiz) {
          for (const question of training.quiz.questions) {
            await tx.answer.deleteMany({
              where: { questionId: question.id },
            });
          }
          // 2. Supprimer les questions du quiz
          await tx.question.deleteMany({
            where: { quizId: training.quiz.id },
          });
          // 3. Supprimer le quiz
          await tx.quiz.delete({
            where: { id: training.quiz.id },
          });
        }

        // 4. Supprimer les progressions de chapitres
        await tx.chapterProgress.deleteMany({
          where: { trainingId: params.id },
        });

        // 5. Supprimer les chapitres
        await tx.chapter.deleteMany({
          where: { trainingId: params.id },
        });

        // 6. Supprimer les certificats
        await tx.certificate.deleteMany({
          where: { trainingId: params.id },
        });

        // 7. Supprimer les inscriptions
        await tx.enrollment.deleteMany({
          where: { trainingId: params.id },
        });

        // 8. Enfin, supprimer la formation
        await tx.training.delete({
          where: { id: params.id },
        });
      });

      return { status: "deleted" };
    });

    /**
     * Upload une miniature pour une formation
     */
    instance.post("/admin/trainings/:id/thumbnail", async (request, reply) => {
      const params = z.object({ id: z.string() }).parse(request.params);
      
      // Vérifier que la formation existe
      const training = await prisma.training.findUnique({ where: { id: params.id } });
      if (!training) {
        return reply.status(404).send({ message: "Formation introuvable" });
      }

      const fileData = await request.file();
      if (!fileData) {
        return reply.status(400).send({ message: "Aucun fichier fourni" });
      }

      try {
        const buffer = await fileData.toBuffer();
        const result = await uploadThumbnail(buffer, fileData.filename, params.id);

        // Supprimer l'ancienne miniature si elle existe
        if (training.thumbnailUrl) {
          try {
            const urlParts = training.thumbnailUrl.split("/");
            const fileName = urlParts.slice(-3).join("/");
            await deleteThumbnail(fileName);
          } catch (error: any) {
            // Ignorer les erreurs de suppression
            instance.log.warn("Erreur lors de la suppression de l'ancienne miniature:", error?.message || String(error));
          }
        }

        // Mettre à jour la formation avec la nouvelle URL
        const updated = await prisma.training.update({
          where: { id: params.id },
          data: { thumbnailUrl: result.fileUrl },
        });

        return { fileUrl: result.fileUrl, fileName: result.fileName, training: updated };
      } catch (error: any) {
        instance.log.error(error);
        return reply.status(400).send({ message: error.message || "Erreur lors de l'upload" });
      }
    });

    instance.get("/admin/trainings/:id/participants", async (request, reply) => {
      const params = z.object({ id: z.string(), format: z.string().optional() }).parse({
        id: (request.params as any).id,
        format: (request.query as any).format,
      });
      const training = await prisma.training.findUnique({ where: { id: params.id } });
      if (!training) {
        return reply.status(404).send({ message: "Formation introuvable" });
      }

      const enrollments = await prisma.enrollment.findMany({
        where: { trainingId: params.id },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      });

      if (params.format === "csv") {
        const parser = new Parser({
          fields: [
            { label: "Prénom", value: "user.firstName" },
            { label: "Nom", value: "user.lastName" },
            { label: "Email", value: "user.email" },
            { label: "Téléphone", value: "user.phone" },
            { label: "INAMI", value: "user.nationalRegistry" },
            { label: "Statut", value: "status" },
            { label: "Présence", value: (row: any) => (row.attendance ? "Présent" : "Absent") },
            { label: "Score", value: "score" },
            { label: "Date d'inscription", value: (row: any) => new Date(row.createdAt).toLocaleDateString("fr-BE") },
          ],
        });
        const csv = parser.parse(enrollments);
        reply.header("Content-Type", "text/csv; charset=utf-8");
        reply.header("Content-Disposition", `attachment; filename=participants-${training.title.replace(/[^a-z0-9]/gi, "_")}.csv`);
        return csv;
      }

      if (params.format === "pdf") {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];
        
        doc.fontSize(20).text(`Liste des participants - ${training.title}`, { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Formation: ${training.title}`, { align: "left" });
        doc.text(`Date: ${training.startDate ? new Date(training.startDate).toLocaleDateString("fr-BE") : "N/A"}`);
        doc.text(`Total participants: ${enrollments.length}`);
        doc.moveDown();
        
        let y = doc.y;
        doc.fontSize(10);
        doc.text("Nom", 50, y, { width: 150 });
        doc.text("Email", 200, y, { width: 200 });
        doc.text("Statut", 400, y, { width: 80 });
        doc.text("Présence", 480, y, { width: 80 });
        y += 20;
        doc.moveTo(50, y).lineTo(550, y).stroke();
        y += 10;

        enrollments.forEach((enrollment) => {
          if (y > 700) {
            doc.addPage();
            y = 50;
          }
          doc.text(`${enrollment.user.firstName} ${enrollment.user.lastName}`, 50, y, { width: 150 });
          doc.text(enrollment.user.email, 200, y, { width: 200 });
          doc.text(enrollment.status, 400, y, { width: 80 });
          doc.text(enrollment.attendance ? "Présent" : "Absent", 480, y, { width: 80 });
          y += 20;
        });

        doc.end();
        return await new Promise<Buffer>((resolve) => {
          doc.on("data", (chunk) => chunks.push(chunk));
          doc.on("end", () => {
            reply.header("Content-Type", "application/pdf");
            reply.header("Content-Disposition", `attachment; filename=participants-${training.title.replace(/[^a-z0-9]/gi, "_")}.pdf`);
            resolve(Buffer.concat(chunks));
          });
        });
      }

      return enrollments;
    });

    instance.post("/admin/trainings/:id/chapters", async (request, reply) => {
      const params = z.object({ id: z.string() }).parse(request.params);
      const body = z
        .object({
          title: z.string(),
          videoUrl: z.string().url().optional(),
          duration: z.number().optional(),
          order: z.number().optional(),
        })
        .parse(request.body);

      const training = await prisma.training.findUnique({ where: { id: params.id } });
      if (!training) {
        return reply.status(404).send({ message: "Formation introuvable" });
      }

      const maxOrder = await prisma.chapter.findFirst({
        where: { trainingId: params.id },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      const chapter = await prisma.chapter.create({
        data: {
          title: body.title,
          videoUrl: body.videoUrl,
          duration: body.duration,
          order: body.order ?? (maxOrder ? maxOrder.order + 1 : 1),
          trainingId: params.id,
        },
      });

      return chapter;
    });

    instance.patch("/admin/trainings/:id/chapters/:chapterId", async (request, reply) => {
      const params = z.object({ id: z.string(), chapterId: z.string() }).parse(request.params);
      const body = z
        .object({
          title: z.string().optional(),
          videoUrl: z.string().url().optional(),
          duration: z.number().optional(),
          order: z.number().optional(),
        })
        .parse(request.body);

      const chapter = await prisma.chapter.findUnique({
        where: { id: params.chapterId },
      });

      if (!chapter || chapter.trainingId !== params.id) {
        return reply.status(404).send({ message: "Chapitre introuvable" });
      }

      const updated = await prisma.chapter.update({
        where: { id: params.chapterId },
        data: body,
      });

      return updated;
    });

    instance.delete("/admin/trainings/:id/chapters/:chapterId", async (request, reply) => {
      const params = z.object({ id: z.string(), chapterId: z.string() }).parse(request.params);

      const chapter = await prisma.chapter.findUnique({
        where: { id: params.chapterId },
      });

      if (!chapter || chapter.trainingId !== params.id) {
        return reply.status(404).send({ message: "Chapitre introuvable" });
      }

      await prisma.chapter.delete({ where: { id: params.chapterId } });
      return { status: "deleted" };
    });

    instance.post("/admin/trainings/:id/quiz", async (request, reply) => {
      const params = z.object({ id: z.string() }).parse(request.params);
      const body = z
        .object({
          passingScore: z.number().min(0).max(100),
          questions: z
            .array(
              z.object({
                label: z.string(),
                multiple: z.boolean().optional(),
                answers: z.array(
                  z.object({
                    label: z.string(),
                    isCorrect: z.boolean(),
                  })
                ),
              })
            )
            .optional(),
        })
        .parse(request.body);

      const training = await prisma.training.findUnique({ where: { id: params.id } });
      if (!training) {
        return reply.status(404).send({ message: "Formation introuvable" });
      }

      const quiz = await prisma.quiz.upsert({
        where: { trainingId: params.id },
        update: { passingScore: body.passingScore },
        create: {
          trainingId: params.id,
          passingScore: body.passingScore,
        },
      });

      if (body.questions && body.questions.length > 0) {
        // Supprimer les anciennes questions
        await prisma.question.deleteMany({ where: { quizId: quiz.id } });

        // Créer les nouvelles questions
        for (const questionData of body.questions) {
          const question = await prisma.question.create({
            data: {
              label: questionData.label,
              multiple: questionData.multiple ?? false,
              quizId: quiz.id,
            },
          });

          for (const answerData of questionData.answers) {
            await prisma.answer.create({
              data: {
                label: answerData.label,
                isCorrect: answerData.isCorrect,
                questionId: question.id,
              },
            });
          }
        }
      }

      return await prisma.quiz.findUnique({
        where: { id: quiz.id },
        include: { questions: { include: { answers: true } } },
      });
    });

    instance.patch("/admin/enrollments/:id", async (request, reply) => {
      const params = z.object({ id: z.string() }).parse(request.params);
      const body = z
        .object({
          attendance: z.boolean().optional(),
          status: z.enum(["REGISTERED", "CONFIRMED", "COMPLETED", "CANCELLED"]).optional(),
        })
        .parse(request.body);

      const enrollment = await prisma.enrollment.update({
        where: { id: params.id },
        data: body,
      });

      return enrollment;
    });

    instance.post("/admin/enrollments/:id/certificate", async (request, reply) => {
      const params = z.object({ id: z.string() }).parse(request.params);
      const { issueCertificate } = await import("../learning/certificates");
      const { sendCertificateIssuedEmail } = await import("../notifications/service");

      const enrollment = await prisma.enrollment.findUnique({
        where: { id: params.id },
        include: { user: true, training: true },
      });

      if (!enrollment) {
        return reply.status(404).send({ message: "Inscription introuvable" });
      }

      if (!enrollment.attendance) {
        return reply.status(400).send({ message: "L'utilisateur doit être marqué comme présent pour recevoir une attestation" });
      }

      const { certificate, pdfBuffer, user, training } = await issueCertificate({
        userId: enrollment.userId,
        trainingId: enrollment.trainingId,
        enrollmentId: enrollment.id,
        score: enrollment.score || undefined,
      });

      if (user.email) {
        await sendCertificateIssuedEmail({
          email: user.email,
          trainingTitle: training.title,
          certificateUrl: certificate.fileUrl,
        });
      }

      return { certificate, message: "Attestation générée et envoyée avec succès" };
    });

    instance.post("/admin/trainers", async (request) => {
      const schema = z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        expertise: z.array(z.string()),
      });
      const trainerData = schema.parse(request.body);
      const user = await prisma.user.create({
        data: {
          email: trainerData.email,
          firstName: trainerData.firstName,
          lastName: trainerData.lastName,
          password: "",
          nationalRegistry: "",
          phone: "",
          diplomaUrl: "",
          role: "trainer",
        },
      });
      const trainer = await prisma.trainer.create({
        data: {
          userId: user.id,
          expertise: trainerData.expertise,
        },
      });
      return trainer;
    });

    instance.get("/admin/users", async () => {
      return prisma.user.findMany();
    });

    instance.post("/admin/users", async (request) => {
      const body = z
        .object({
          email: z.string().email(),
          password: z.string().min(8),
          firstName: z.string(),
          lastName: z.string(),
          nationalRegistry: z.string().optional(),
          phone: z.string().optional(),
          diplomaUrl: z.string().optional(),
          role: z.enum(["user", "admin", "trainer"]).optional(),
          subscriptionActive: z.boolean().optional(),
        })
        .parse(request.body);

      const existing = await prisma.user.findUnique({ where: { email: body.email } });
      if (existing) {
        throw new Error("Email déjà utilisé");
      }

      const hashedPassword = await argon2.hash(body.password);

      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          firstName: body.firstName,
          lastName: body.lastName,
          nationalRegistry: body.nationalRegistry || "",
          phone: body.phone || "",
          diplomaUrl: body.diplomaUrl || "",
          role: body.role || "user",
          subscriptionActive: body.subscriptionActive ?? false,
        },
      });

      return user;
    });

    instance.patch("/admin/users/:id", async (request) => {
      const params = z.object({ id: z.string() }).parse(request.params);
      const body = z
        .object({
          subscriptionActive: z.boolean().optional(),
          role: z.enum(["user", "admin", "trainer"]).optional(),
          deleted: z.boolean().optional(),
        })
        .parse(request.body);
      const data: Record<string, unknown> = { ...body };
      if (body.deleted) {
        await prisma.user.delete({ where: { id: params.id } });
        return { status: "deleted" };
      }
      delete data.deleted;
      return prisma.user.update({ where: { id: params.id }, data });
    });

    /**
     * Dashboard analytics admin
     */
    instance.get("/admin/analytics", async () => {
      return getAdminAnalytics();
    });

    /**
     * Configuration - Récupérer toutes les configurations
     */
    instance.get("/admin/config", async () => {
      const configs = await (prisma as any).appConfig.findMany({
        orderBy: { category: "asc" },
      });
      
      // Organiser par catégorie
      const organized: Record<string, any[]> = {};
      configs.forEach((config: any) => {
        if (!organized[config.category]) {
          organized[config.category] = [];
        }
        organized[config.category].push({
          key: config.key,
          value: config.value || "",
          description: config.description,
        });
      });
      
      return organized;
    });

    /**
     * Configuration - Mettre à jour une configuration
     */
    instance.patch("/admin/config", async (request) => {
      const body = z
        .object({
          key: z.string(),
          value: z.string().optional(),
          description: z.string().optional(),
          category: z.string().optional(),
        })
        .parse(request.body);

      const config = await (prisma as any).appConfig.upsert({
        where: { key: body.key },
        update: {
          value: body.value,
          description: body.description,
          category: body.category,
        },
        create: {
          key: body.key,
          value: body.value || "",
          description: body.description,
          category: body.category || "general",
        },
      });

      return config;
    });

    /**
     * Configuration - Mettre à jour plusieurs configurations
     */
    instance.patch("/admin/config/bulk", async (request) => {
      const body = z
        .object({
          configs: z.array(
            z.object({
              key: z.string(),
              value: z.string().optional(),
              description: z.string().optional(),
              category: z.string().optional(),
            })
          ),
        })
        .parse(request.body);

      const results = await Promise.all(
        body.configs.map((config) =>
          (prisma as any).appConfig.upsert({
            where: { key: config.key },
            update: {
              value: config.value,
              description: config.description,
              category: config.category,
            },
            create: {
              key: config.key,
              value: config.value || "",
              description: config.description,
              category: config.category || "general",
            },
          })
        )
      );

      return { updated: results.length, configs: results };
    });

    /**
     * Dupliquer une formation
     */
    instance.post("/admin/trainings/:id/duplicate", async (request) => {
      const params = z.object({ id: z.string() }).parse(request.params);

      const original = await prisma.training.findUnique({
        where: { id: params.id },
        include: {
          chapters: true,
          quiz: {
            include: {
              questions: {
                include: {
                  answers: true,
                },
              },
            },
          },
        },
      });

      if (!original) {
        throw new Error("Formation non trouvée");
      }

      // Créer la nouvelle formation
      const duplicated = await prisma.training.create({
        data: {
          title: `${original.title} (Copie)`,
          summary: original.summary,
          description: original.description,
          type: original.type,
          trainerId: original.trainerId,
          location: original.location,
          videoUrl: original.videoUrl,
          link: original.link,
          accreditation: original.accreditation,
          theme: original.theme,
          durationMinutes: original.durationMinutes,
          maxParticipants: original.maxParticipants,
          startDate: null, // Réinitialiser les dates
          endDate: null,
          isNew: true,
          chapters: {
            create: original.chapters.map((chapter) => ({
              title: chapter.title,
              order: chapter.order,
              videoUrl: chapter.videoUrl,
              duration: chapter.duration,
            })),
          },
          quiz: original.quiz
            ? {
                create: {
                  passingScore: original.quiz.passingScore,
                  questions: {
                    create: original.quiz.questions.map((question) => ({
                      label: question.label,
                      multiple: question.multiple,
                      answers: {
                        create: question.answers.map((answer) => ({
                          label: answer.label,
                          isCorrect: answer.isCorrect,
                        })),
                      },
                    })),
                  },
                },
              }
            : undefined,
        },
      });

      return duplicated;
    });

    /**
     * Réorganiser l'ordre des chapitres
     */
    instance.patch("/admin/trainings/:id/chapters/reorder", async (request) => {
      const params = z.object({ id: z.string() }).parse(request.params);
      const body = z
        .object({
          chapterOrders: z.array(
            z.object({
              chapterId: z.string(),
              order: z.number(),
            })
          ),
        })
        .parse(request.body);

      // Mettre à jour l'ordre de chaque chapitre
      await Promise.all(
        body.chapterOrders.map(({ chapterId, order }) =>
          prisma.chapter.update({
            where: { id: chapterId },
            data: { order },
          })
        )
      );

      return { status: "ok" };
    });

    /**
     * Importer les présences depuis un CSV
     */
    instance.post("/admin/trainings/:id/import-attendance", async (request, reply) => {
      const params = z.object({ id: z.string() }).parse(request.params);
      const fileData = await request.file();

      if (!fileData) {
        return reply.status(400).send({ message: "Fichier CSV requis" });
      }

      const buffer = await fileData.toBuffer();
      const csvContent = buffer.toString("utf-8");

      // Parser le CSV (format attendu: email,attendance)
      const lines = csvContent.split("\n").filter((line) => line.trim());
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      const emailIndex = headers.indexOf("email");
      const attendanceIndex = headers.indexOf("attendance") !== -1 ? headers.indexOf("attendance") : headers.indexOf("présence");

      if (emailIndex === -1) {
        return reply.status(400).send({ message: "Colonne 'email' requise dans le CSV" });
      }

      const results = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const email = values[emailIndex];
        const attendance = attendanceIndex !== -1 ? values[attendanceIndex]?.toLowerCase() === "true" || values[attendanceIndex] === "1" : true;

        if (!email) continue;

        // Trouver l'utilisateur et son inscription
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          results.push({ email, status: "user_not_found" });
          continue;
        }

        const enrollment = await prisma.enrollment.findFirst({
          where: {
            userId: user.id,
            trainingId: params.id,
          },
        });

        if (!enrollment) {
          results.push({ email, status: "not_enrolled" });
          continue;
        }

        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { attendance },
        });

        results.push({ email, status: "updated" });
      }

      return { results };
    });
  });
};

