import { FastifyInstance } from "fastify";
import { z } from "zod";
import argon2 from "argon2";
import crypto from "node:crypto";
import { prisma } from "../../lib/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../lib/jwt";
import { env } from "../../config/env";
import { sendPasswordResetEmail, sendWelcomeEmail } from "../notifications/service";
import { uploadDiploma } from "../../lib/storage";
import { createStripeCustomer, createCheckoutSession } from "../../lib/stripe";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10),
  firstName: z.string(),
  lastName: z.string(),
  nickname: z.string().optional(),
  inami: z.string(),
  phone: z.string(),
  diplomaUrl: z.string().url().optional(),
  planType: z.enum(["monthly", "yearly"]).optional().default("monthly"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const registerAuthRoutes = (app: FastifyInstance) => {
  app.post("/auth/register", async (request, reply) => {
    // Gestion du fichier diplôme si présent
    let diplomaUrl: string | undefined;
    const fileData = await request.file();
    
    if (fileData) {
      try {
        const buffer = await fileData.toBuffer();
        // On crée un ID temporaire pour l'upload, puis on le mettra à jour après création de l'utilisateur
        const tempUserId = crypto.randomBytes(16).toString("hex");
        const result = await uploadDiploma(buffer, fileData.filename, tempUserId);
        diplomaUrl = result.fileUrl;
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({ message: error.message || "Erreur lors de l'upload du diplôme" });
      }
    }

    // Parse du body (sans le fichier)
    const bodyData = request.body as any;
    const body = registerSchema.parse({
      ...bodyData,
      diplomaUrl: diplomaUrl || bodyData.diplomaUrl,
    });

    if (!body.diplomaUrl) {
      return reply.status(400).send({ message: "Diplôme requis" });
    }

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return reply.status(409).send({ message: "Email déjà utilisé" });
    }

    const password = await argon2.hash(body.password);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password,
        firstName: body.firstName,
        lastName: body.lastName,
        nickname: body.nickname,
        nationalRegistry: body.inami,
        phone: body.phone,
        diplomaUrl: body.diplomaUrl,
      },
    });

    // Création du customer Stripe
    let stripeCustomerId: string | undefined;
    try {
      const customer = await createStripeCustomer({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user.id,
          inami: body.inami,
        },
      });
      stripeCustomerId = customer.id;

      // Mise à jour de l'utilisateur avec le customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id },
      });
    } catch (error: any) {
      app.log.error("Erreur création customer Stripe:", error);
      // On continue même si la création du customer échoue
    }

    // Ne plus créer automatiquement une session checkout
    // L'utilisateur pourra souscrire depuis la page /register après création du compte

    // Envoi de l'email de bienvenue (sans attendre)
    sendWelcomeEmail({ email: user.email, firstName: user.firstName }).catch((err) => {
      app.log.error("Erreur envoi email bienvenue:", err);
    });

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id });

    return {
      accessToken,
      refreshToken,
      user,
    };
  });

  app.post("/auth/login", async (request, reply) => {
    try {
      app.log.info({ email: (request.body as any)?.email }, "🔐 Tentative de connexion");
      
      const body = loginSchema.parse(request.body);
      app.log.info({ email: body.email }, "📧 Email validé, recherche de l'utilisateur...");
      
      const user = await prisma.user.findUnique({ where: { email: body.email } });
      
      if (!user) {
        app.log.warn({ email: body.email }, "❌ Utilisateur non trouvé");
        return reply.status(401).send({ message: "Identifiants invalides" });
      }
      
      app.log.info({ userId: user.id, email: user.email, role: user.role }, "✅ Utilisateur trouvé, vérification du mot de passe...");
      
      const valid = await argon2.verify(user.password, body.password);
      
      if (!valid) {
        app.log.warn({ email: body.email, userId: user.id }, "❌ Mot de passe invalide");
        return reply.status(401).send({ message: "Identifiants invalides" });
      }
      
      app.log.info({ userId: user.id, email: user.email, role: user.role }, "✅ Mot de passe valide, génération des tokens...");
      
      const accessToken = signAccessToken({ sub: user.id, role: user.role });
      const refreshToken = signRefreshToken({ sub: user.id });
      
      app.log.info({ userId: user.id, email: user.email, role: user.role }, "✅ Connexion réussie");
      
      // Retourner uniquement les champs nécessaires, sans le mot de passe
      const userResponse = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        nickname: user.nickname,
        role: user.role,
        subscriptionActive: user.subscriptionActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
      
      return { accessToken, refreshToken, user: userResponse };
    } catch (error: any) {
      app.log.error({ 
        error: error.message, 
        stack: error.stack,
        body: request.body 
      }, "❌ Erreur lors de la connexion");
      throw error;
    }
  });

  app.post("/auth/refresh", async (request, reply) => {
    const token = request.headers["x-refresh-token"];
    if (!token || typeof token !== "string") {
      return reply.status(401).send({ message: "Token manquant" });
    }
    const payload = verifyRefreshToken(token) as { sub: string };
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return reply.status(401).send({ message: "Utilisateur introuvable" });
    }
    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id });
    return { accessToken, refreshToken };
  });

  app.post("/auth/password/forgot", async (request) => {
    const schema = z.object({ email: z.string().email() });
    const { email } = schema.parse(request.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { status: "ok" };
    }

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h

    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    const resetLink = `${env.frontendUrl}/reinitialisation-mot-de-passe?token=${rawToken}`;
    await sendPasswordResetEmail({ email: user.email, resetLink });

    return { status: "sent" };
  });

  app.post("/auth/password/reset", async (request, reply) => {
    const schema = z.object({
      token: z.string(),
      password: z.string().min(10),
    });
    const { token, password } = schema.parse(request.body);
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const record = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (!record) {
      return reply.status(400).send({ message: "Lien invalide ou expiré" });
    }
    const hash = await argon2.hash(password);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { password: hash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      }),
    ]);
    return { status: "updated" };
  });
};

