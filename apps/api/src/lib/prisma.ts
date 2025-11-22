import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
});

// Log toutes les requêtes Prisma
(prisma.$on as any)("query", (e: any) => {
  console.log("🔍 Query Prisma:", {
    query: e.query?.substring(0, 200) + (e.query?.length > 200 ? "..." : ""),
    params: e.params,
    duration: `${e.duration}ms`,
  });
});

(prisma.$on as any)("error", (e: any) => {
  console.error("❌ Erreur Prisma:", e);
});

(prisma.$on as any)("info", (e: any) => {
  console.log("ℹ️ Info Prisma:", e);
});

(prisma.$on as any)("warn", (e: any) => {
  console.warn("⚠️ Warning Prisma:", e);
});

