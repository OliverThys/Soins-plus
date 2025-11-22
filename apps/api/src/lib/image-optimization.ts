/**
 * Service d'optimisation d'images avec Sharp
 */

import sharp from "sharp";
import { env } from "../config/env";

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "avif" | "jpeg" | "png";
  maxSize?: number; // Taille maximale en bytes
}

export interface OptimizedImageResult {
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
  size: number;
}

/**
 * Optimise une image avec Sharp
 * @param inputBuffer Buffer de l'image source
 * @param options Options d'optimisation
 * @returns Buffer optimisé et métadonnées
 */
export async function optimizeImage(
  inputBuffer: Buffer,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const {
    width = 1920,
    height = 1080,
    quality = 85,
    format = "webp",
    maxSize = 2 * 1024 * 1024, // 2MB par défaut
  } = options;

  // Obtenir les métadonnées de l'image source
  const metadata = await sharp(inputBuffer).metadata();

  // Déterminer le format de sortie
  let outputFormat: "webp" | "avif" | "jpeg" | "png" = format;
  
  // Si le format source est PNG et qu'on veut WebP/AVIF, on convertit
  if (metadata.format === "png" && (format === "webp" || format === "avif")) {
    outputFormat = format;
  } else if (metadata.format === "jpeg" || metadata.format === "jpg") {
    // Pour les JPEG, on peut convertir en WebP/AVIF ou garder JPEG
    if (format === "webp" || format === "avif") {
      outputFormat = format;
    } else {
      outputFormat = "jpeg";
    }
  } else {
    // Garder le format original si pas de conversion demandée
    outputFormat = (metadata.format as any) || "jpeg";
  }

  // Créer le pipeline Sharp
  let pipeline = sharp(inputBuffer).resize(width, height, {
    fit: "inside",
    withoutEnlargement: true,
  });

  // Appliquer les options selon le format
  switch (outputFormat) {
    case "webp":
      pipeline = pipeline.webp({ quality });
      break;
    case "avif":
      pipeline = pipeline.avif({ quality });
      break;
    case "jpeg":
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      break;
    case "png":
      pipeline = pipeline.png({ quality, compressionLevel: 9 });
      break;
  }

  // Optimiser l'image
  let optimizedBuffer = await pipeline.toBuffer();

  // Si la taille est encore trop grande, réduire la qualité progressivement
  let currentQuality = quality;
  while (optimizedBuffer.length > maxSize && currentQuality > 50) {
    currentQuality -= 10;
    
    pipeline = sharp(inputBuffer).resize(width, height, {
      fit: "inside",
      withoutEnlargement: true,
    });

    switch (outputFormat) {
      case "webp":
        pipeline = pipeline.webp({ quality: currentQuality });
        break;
      case "avif":
        pipeline = pipeline.avif({ quality: currentQuality });
        break;
      case "jpeg":
        pipeline = pipeline.jpeg({ quality: currentQuality, mozjpeg: true });
        break;
      case "png":
        pipeline = pipeline.png({ quality: currentQuality, compressionLevel: 9 });
        break;
    }

    optimizedBuffer = await pipeline.toBuffer();
  }

  // Obtenir les métadonnées finales
  const finalMetadata = await sharp(optimizedBuffer).metadata();

  return {
    buffer: optimizedBuffer,
    format: outputFormat,
    width: finalMetadata.width || width,
    height: finalMetadata.height || height,
    size: optimizedBuffer.length,
  };
}

/**
 * Génère plusieurs formats d'une image (WebP, AVIF, JPEG)
 * @param inputBuffer Buffer de l'image source
 * @param options Options d'optimisation
 * @returns Objet avec les différents formats
 */
export async function generateImageFormats(
  inputBuffer: Buffer,
  options: Omit<ImageOptimizationOptions, "format"> = {}
): Promise<{
  webp?: Buffer;
  avif?: Buffer;
  jpeg?: Buffer;
  original?: Buffer;
}> {
  const results: any = {};

  try {
    // Générer WebP
    results.webp = (
      await optimizeImage(inputBuffer, { ...options, format: "webp" })
    ).buffer;
  } catch (error) {
    console.warn("Erreur lors de la génération WebP:", error);
  }

  try {
    // Générer AVIF (si supporté)
    results.avif = (
      await optimizeImage(inputBuffer, { ...options, format: "avif" })
    ).buffer;
  } catch (error) {
    console.warn("Erreur lors de la génération AVIF:", error);
  }

  try {
    // Générer JPEG optimisé
    results.jpeg = (
      await optimizeImage(inputBuffer, { ...options, format: "jpeg" })
    ).buffer;
  } catch (error) {
    console.warn("Erreur lors de la génération JPEG:", error);
  }

  // Garder l'original si nécessaire
  if (options.maxSize && inputBuffer.length <= options.maxSize) {
    results.original = inputBuffer;
  }

  return results;
}

/**
 * Détermine le meilleur format d'image selon le navigateur
 * @param userAgent User-Agent du navigateur
 * @returns Format recommandé
 */
export function getBestImageFormat(userAgent?: string): "webp" | "avif" | "jpeg" {
  if (!userAgent) return "webp";

  // AVIF est supporté par les navigateurs modernes
  if (
    userAgent.includes("Chrome/") ||
    userAgent.includes("Edge/") ||
    userAgent.includes("Firefox/")
  ) {
    // Vérifier la version pour AVIF
    const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
    if (chromeMatch && Number(chromeMatch[1]) >= 85) {
      return "avif";
    }
    return "webp";
  }

  // Fallback sur WebP pour les autres navigateurs
  return "webp";
}

