import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { uploadDiploma } from "../../lib/storage";
import { getUserStats } from "./stats";

export const registerUserRoutes = (app: FastifyInstance) => {
  app.register(async (instance) => {
    // Middleware d'authentification pour toutes les routes /me/*
    instance.addHook("preHandler", async (request, reply) => {
      try {
        const auth = request.headers.authorization;
        if (!auth?.includes("Bearer ")) {
          return reply.status(401).send({ message: "Token manquant" });
        }
        
        const token = auth.replace("Bearer ", "");
        const payload = await instance.jwt.verify(token);
        
        if (!payload || typeof payload !== "object" || !("sub" in payload)) {
          return reply.status(401).send({ message: "Token invalide" });
        }
        
        (request as any).user = payload;
      } catch (error: any) {
        return reply.status(401).send({ message: error.message || "Erreur d'authentification" });
      }
    });

    instance.get("/me", async (request, reply) => {
      const userId = (request.user as any)?.sub;
      if (!userId || typeof userId !== "string") {
        return reply.status(401).send({ message: "Utilisateur requis" });
      }
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return user;
    });

    instance.patch("/me", async (request, reply) => {
      const userId = (request.user as any)?.sub;
      if (!userId || typeof userId !== "string") {
        return reply.status(401).send({ message: "Utilisateur requis" });
      }
      const schema = z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        nickname: z.string().optional(),
        phone: z.string().optional(),
        diplomaUrl: z.string().url().optional(),
      });
      const data = schema.parse(request.body);
      const user = await prisma.user.update({
        where: { id: userId },
        data,
      });
      return user;
    });

    instance.get("/me/trainings", async (request, reply) => {
      const userId = (request.user as any)?.sub;
      if (!userId || typeof userId !== "string") {
        return reply.status(401).send({ message: "Utilisateur requis" });
      }
      const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        include: { training: true, certificate: true },
      });
      return enrollments;
    });

    instance.get("/me/certificates", async (request, reply) => {
      const userId = (request.user as any)?.sub;
      if (!userId || typeof userId !== "string") {
        return reply.status(401).send({ message: "Utilisateur requis" });
      }
      return prisma.certificate.findMany({
        where: { userId },
        include: {
          training: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { issuedAt: "desc" },
      });
    });

    instance.get("/me/certificates/:id", async (request, reply) => {
      const params = z.object({ id: z.string() }).parse(request.params);
      const userId = (request.user as any)?.sub;
      if (!userId || typeof userId !== "string") {
        return reply.status(401).send({ message: "Utilisateur requis" });
      }
      const certificate = await prisma.certificate.findFirst({
        where: { id: params.id, userId },
      });
      if (!certificate) {
        return reply.status(404).send({ message: "Attestation introuvable" });
      }
      return certificate;
    });

    /**
     * Récupère les statistiques complètes de l'utilisateur
     */
    instance.get("/me/stats", async (request, reply) => {
      const userId = (request.user as any)?.sub;
      if (!userId || typeof userId !== "string") {
        return reply.status(401).send({ message: "Utilisateur requis" });
      }
      return getUserStats(userId);
    });

    instance.post("/upload/diploma", async (request, reply) => {
      const userId = (request.user as any)?.sub;
      if (!userId || typeof userId !== "string") {
        return reply.status(401).send({ message: "Utilisateur requis" });
      }

      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ message: "Aucun fichier fourni" });
      }

      try {
        const buffer = await data.toBuffer();
        const result = await uploadDiploma(buffer, data.filename, userId);

        // Mise à jour de l'URL du diplôme dans le profil utilisateur
        await prisma.user.update({
          where: { id: userId },
          data: { diplomaUrl: result.fileUrl },
        });

        return { fileUrl: result.fileUrl, fileName: result.fileName };
      } catch (error: any) {
        instance.log.error(error);
        return reply.status(400).send({ message: error.message || "Erreur lors de l'upload" });
      }
    });
  });
};

