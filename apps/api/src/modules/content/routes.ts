import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { cacheGetJson, cacheSetJson } from "../../lib/redis";
import { sendEnrollmentConfirmation } from "../notifications/service";

// Helper pour vérifier l'authentification admin
const requireAdmin = async (app: FastifyInstance, request: any, reply: any) => {
  const auth = request.headers.authorization;
  if (!auth?.includes("Bearer ")) {
    reply.status(401).send({ message: "Token manquant" });
    return;
  }
  const token = auth.replace("Bearer ", "");
  try {
    const payload = await app.jwt.verify(token);
    if (payload.role !== "admin") {
      reply.status(403).send({ message: "Non autorisé" });
      return;
    }
    request.user = payload;
  } catch (error: any) {
    reply.status(401).send({ message: error.message || "Erreur d'authentification" });
    return;
  }
};

export const registerContentRoutes = (app: FastifyInstance) => {
  app.get("/news", async (request) => {
    const query = z
      .object({
        category: z.string().optional(),
        tag: z.string().optional(),
        search: z.string().optional(),
        limit: z.coerce.number().optional(),
      })
      .parse(request.query);

    // Générer une clé de cache
    const cacheKey = `content:news:${JSON.stringify(query)}`;
    
    // Vérifier le cache (TTL 5 minutes)
    const cached = await cacheGetJson<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const where: any = {
      isPublished: true,
      OR: [
        { scheduledAt: null },
        { scheduledAt: { lte: new Date() } },
      ],
    };

    if (query.category) {
      where.category = query.category;
    }
    if (query.tag) {
      where.tags = { has: query.tag };
    }
    if (query.search) {
      where.OR = [
        ...(where.OR || []),
        { title: { contains: query.search, mode: "insensitive" } },
        { content: { contains: query.search, mode: "insensitive" } },
        { excerpt: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const articles = await prisma.newsArticle.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: query.limit || 50,
    });

    // Mettre en cache pour 5 minutes
    await cacheSetJson(cacheKey, articles, 300);

    return articles;
  });

  app.get("/news/:id", async (request, reply) => {
    try {
      const params = z.object({ id: z.string() }).parse(request.params);
      const article = await prisma.newsArticle.findUnique({
        where: { id: params.id },
      });

      if (!article) {
        return reply.status(404).send({ message: "Article introuvable" });
      }

      // Incrémenter les vues (si le champ existe)
      try {
        await prisma.newsArticle.update({
          where: { id: params.id },
          data: { views: { increment: 1 } },
        });
        return { ...article, views: (article.views || 0) + 1 };
      } catch (error: any) {
        // Si le champ views n'existe pas encore, retourner l'article sans incrémenter
        return { ...article, views: 0 };
      }
    } catch (error: any) {
      return reply.status(500).send({ message: error.message || "Erreur serveur" });
    }
  });

  app.get("/news/categories", async () => {
    const categories = await prisma.newsArticle.findMany({
      where: {
        isPublished: true,
        category: { not: null },
      },
      select: { category: true },
      distinct: ["category"],
    });
    return categories.map((c) => c.category).filter(Boolean);
  });

  app.get("/news/tags", async () => {
    const articles = await prisma.newsArticle.findMany({
      where: { isPublished: true },
      select: { tags: true },
    });
    const allTags = articles.flatMap((a) => a.tags || []);
    return Array.from(new Set(allTags));
  });

  app.get("/faq", async (request) => {
    const query = z
      .object({
        search: z.string().optional(),
        category: z.string().optional(),
      })
      .parse(request.query);

    const where: any = {};
    if (query.search) {
      where.OR = [
        { question: { contains: query.search, mode: "insensitive" } },
        { answer: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query.category) {
      where.category = query.category;
    }

    return prisma.faqEntry.findMany({
      where,
      orderBy: [{ category: "asc" }, { views: "desc" }],
    });
  });

  app.get("/faq/categories", async () => {
    const categories = await prisma.faqEntry.findMany({
      select: { category: true },
      distinct: ["category"],
    });
    return categories.map((c) => c.category);
  });

  app.post("/faq/:id/view", async (request) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    await prisma.faqEntry.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    });
    return { status: "ok" };
  });

  app.post("/legal/ticket", async (request) => {
    const schema = z.object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string().optional(),
      subject: z.string(),
      message: z.string(),
      userId: z.string().optional(),
    });
    const data = schema.parse(request.body);

    const ticket = await prisma.legalTicket.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        userId: data.userId,
      },
    });

    // TODO: Envoyer notification email aux admins
    app.log.info({ ticketId: ticket.id, email: data.email }, "Nouveau ticket juridique créé");

    return { id: ticket.id, status: "created" };
  });

  app.get("/admin/faq", async (request, reply) => {
    await requireAdmin(app, request, reply);
    if (reply.sent) return;
    return prisma.faqEntry.findMany({ orderBy: { createdAt: "desc" } });
  });

  app.post("/admin/faq", async (request, reply) => {
    await requireAdmin(app, request, reply);
    if (reply.sent) return;
    const schema = z.object({
      question: z.string(),
      answer: z.string(),
      category: z.string(),
    });
    const data = schema.parse(request.body);
    return prisma.faqEntry.create({ data });
  });

  app.patch("/admin/faq/:id", async (request, reply) => {
    await requireAdmin(app, request, reply);
    if (reply.sent) return;
    const params = z.object({ id: z.string() }).parse(request.params);
    const schema = z
      .object({
        question: z.string().optional(),
        answer: z.string().optional(),
        category: z.string().optional(),
      })
      .parse(request.body);
    return prisma.faqEntry.update({
      where: { id: params.id },
      data: schema,
    });
  });

  app.delete("/admin/faq/:id", async (request, reply) => {
    await requireAdmin(app, request, reply);
    if (reply.sent) return;
    const params = z.object({ id: z.string() }).parse(request.params);
    await prisma.faqEntry.delete({ where: { id: params.id } });
    return { status: "deleted" };
  });

  app.get("/admin/legal/tickets", async (request, reply) => {
    await requireAdmin(app, request, reply);
    if (reply.sent) return;
    const query = z
      .object({
        status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
      })
      .parse(request.query);

    const where: any = {};
    if (query.status) {
      where.status = query.status;
    }

    return prisma.legalTicket.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  });

  app.patch("/admin/legal/tickets/:id", async (request, reply) => {
    await requireAdmin(app, request, reply);
    if (reply.sent) return;
    const params = z.object({ id: z.string() }).parse(request.params);
    const schema = z
      .object({
        status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
        priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
        adminNotes: z.string().optional(),
      })
      .parse(request.body);

    const data: any = { ...schema };
    if (schema.status === "RESOLVED" || schema.status === "CLOSED") {
      data.resolvedAt = new Date();
    }

    return prisma.legalTicket.update({
      where: { id: params.id },
      data,
    });
  });

  app.get("/admin/news", async (request, reply) => {
    await requireAdmin(app, request, reply);
    if (reply.sent) return;
    return prisma.newsArticle.findMany({ orderBy: { createdAt: "desc" } });
  });

  app.post("/admin/news", async (request, reply) => {
    await requireAdmin(app, request, reply);
    if (reply.sent) return;
    const schema = z.object({
      title: z.string(),
      content: z.string(),
      excerpt: z.string().optional(),
      author: z.string(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      imageUrl: z.string().url().optional(),
      scheduledAt: z.string().optional(),
      isPublished: z.boolean().optional(),
    });
    const data = schema.parse(request.body);
    const articleData: any = {
      title: data.title,
      content: data.content,
      author: data.author,
      excerpt: data.excerpt,
      category: data.category,
      tags: data.tags || [],
      imageUrl: data.imageUrl,
      isPublished: data.isPublished ?? true,
    };
    if (data.scheduledAt) {
      articleData.scheduledAt = new Date(data.scheduledAt);
      articleData.isPublished = false;
    }
    return prisma.newsArticle.create({ data: articleData });
  });

  app.patch("/admin/news/:id", async (request, reply) => {
    await requireAdmin(app, request, reply);
    if (reply.sent) return;
    const params = z.object({ id: z.string() }).parse(request.params);
    const schema = z
      .object({
        title: z.string().optional(),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        author: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        imageUrl: z.string().url().optional(),
        scheduledAt: z.string().optional(),
        isPublished: z.boolean().optional(),
      })
      .parse(request.body);

    const updateData: any = { ...schema };
    if (schema.scheduledAt) {
      updateData.scheduledAt = new Date(schema.scheduledAt);
    }
    if (schema.scheduledAt === null) {
      updateData.scheduledAt = null;
    }

    return prisma.newsArticle.update({
      where: { id: params.id },
      data: updateData,
    });
  });

  app.delete("/admin/news/:id", async (request, reply) => {
    await requireAdmin(app, request, reply);
    if (reply.sent) return;
    const params = z.object({ id: z.string() }).parse(request.params);
    await prisma.newsArticle.delete({ where: { id: params.id } });
    return { status: "deleted" };
  });
};

