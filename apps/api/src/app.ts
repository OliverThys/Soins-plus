import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import jwt from "@fastify/jwt";
import fastifyRawBody from "fastify-raw-body";
import { env } from "./config/env";
import { registerRoutes } from "./routes";
import { initSentry } from "./config/sentry";

initSentry();

export const buildApp = () => {
  const app = Fastify({
    logger: {
      level: "info",
      serializers: {
        req: (req) => ({
          method: req.method,
          url: req.url,
          ip: req.ip,
        }),
        res: (res) => ({
          statusCode: res.statusCode,
        }),
      },
    },
    trustProxy: true,
  });

  // Log toutes les requêtes entrantes
  app.addHook("onRequest", async (request, reply) => {
    app.log.info({
      method: request.method,
      url: request.url,
      ip: request.ip,
      headers: {
        authorization: request.headers.authorization ? "Bearer ***" : undefined,
        "user-agent": request.headers["user-agent"],
      },
    }, "📥 Requête entrante");
  });

  // Log toutes les réponses
  app.addHook("onResponse", async (request, reply) => {
    app.log.info({
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: reply.elapsedTime,
    }, "📤 Réponse envoyée");
  });

  app.register(cors, {
    origin: [env.frontendUrl],
    credentials: true,
  });

  app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 1,
    },
  });

  app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  app.register(swagger, {
    openapi: {
      info: {
        title: "SOINS+ API",
        version: "0.1.0",
      },
    },
  });

  app.register(fastifyRawBody, {
    field: "rawBody",
    global: false,
    encoding: false,
  });

  app.register(jwt, {
    secret: {
      private: env.jwtAccessSecret,
      public: env.jwtAccessSecret,
    },
    sign: { expiresIn: "15m" },
  });

  registerRoutes(app);

  // Gestionnaire d'erreurs global
  app.setErrorHandler((error, request, reply) => {
    app.log.error({
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: (error as any).code,
        statusCode: error.statusCode,
      },
      request: {
        url: request.url,
        method: request.method,
        body: request.body,
        query: request.query,
        params: request.params,
        headers: {
          ...request.headers,
          authorization: request.headers.authorization ? "Bearer ***" : undefined,
        },
      },
    }, "❌ Erreur non gérée");

    const statusCode = error.statusCode || 500;
    reply.status(statusCode).send({
      message: error.message || "Erreur serveur",
      statusCode,
    });
  });

  return app;
};

