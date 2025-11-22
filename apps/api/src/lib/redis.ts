/**
 * Service de cache Redis pour améliorer les performances
 */

import type Redis from "ioredis";
import { env } from "../config/env";

let RedisClass: typeof Redis | null = null;
let redisClient: Redis | null = null;

// Chargement dynamique d'ioredis pour éviter les erreurs si non installé
async function loadRedis() {
  if (RedisClass) return RedisClass;
  try {
    const module = await import("ioredis");
    RedisClass = module.default;
    return RedisClass;
  } catch (error) {
    console.warn("ioredis non disponible, cache désactivé");
    return null;
  }
}

/**
 * Obtient ou crée le client Redis
 */
export async function getRedisClient(): Promise<Redis | null> {
  if (redisClient) {
    return redisClient;
  }

  const Redis = await loadRedis();
  if (!Redis) {
    return null;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn("Redis non configuré, cache désactivé");
    return null;
  }

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on("error", (err) => {
      console.error("Erreur Redis:", err);
    });

    redisClient.on("connect", () => {
      console.log("Redis connecté");
    });

    return redisClient;
  } catch (error) {
    console.error("Impossible de se connecter à Redis:", error);
    return null;
  }
}

/**
 * Cache une valeur avec expiration
 */
export async function cacheSet(key: string, value: string, ttlSeconds: number = 3600): Promise<void> {
  const client = await getRedisClient();
  if (!client) return;

  try {
    await client.setex(key, ttlSeconds, value);
  } catch (error) {
    console.error("Erreur lors du cache set:", error);
  }
}

/**
 * Récupère une valeur du cache
 */
export async function cacheGet(key: string): Promise<string | null> {
  const client = await getRedisClient();
  if (!client) return null;

  try {
    return await client.get(key);
  } catch (error) {
    console.error("Erreur lors du cache get:", error);
    return null;
  }
}

/**
 * Supprime une clé du cache
 */
export async function cacheDelete(key: string): Promise<void> {
  const client = await getRedisClient();
  if (!client) return;

  try {
    await client.del(key);
  } catch (error) {
    console.error("Erreur lors du cache delete:", error);
  }
}

/**
 * Supprime toutes les clés correspondant à un pattern
 */
export async function cacheDeletePattern(pattern: string): Promise<void> {
  const client = await getRedisClient();
  if (!client) return;

  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch (error) {
    console.error("Erreur lors du cache delete pattern:", error);
  }
}

/**
 * Cache un objet JSON
 */
export async function cacheSetJson(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
  await cacheSet(key, JSON.stringify(value), ttlSeconds);
}

/**
 * Récupère un objet JSON du cache
 */
export async function cacheGetJson<T>(key: string): Promise<T | null> {
  const value = await cacheGet(key);
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

