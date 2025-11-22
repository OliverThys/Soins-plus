-- Migration pour créer la table app_config
-- À exécuter directement dans Supabase SQL Editor

-- CreateTable
CREATE TABLE IF NOT EXISTS "app_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "app_config_key_key" ON "app_config"("key");

-- Marquer la migration comme appliquée dans la table _prisma_migrations
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
VALUES (
    '20251122000000_add_app_config',
    'a1b2c3d4e5f6', -- Checksum fictif, Prisma le recalculera
    NOW(),
    '20251122000000_add_app_config',
    NULL,
    NULL,
    NOW(),
    1
)
ON CONFLICT (migration_name) DO NOTHING;

