import { BlobServiceClient, BlockBlobClient } from "@azure/storage-blob";
import { env } from "../config/env";
import crypto from "node:crypto";

let blobServiceClient: BlobServiceClient | null = null;

function getBlobServiceClient(): BlobServiceClient | null {
  if (!env.storageUrl || !env.storageSas) {
    return null;
  }

  if (!blobServiceClient) {
    const accountName = env.storageUrl.match(/https?:\/\/([^.]+)\.blob\.core\.windows\.net/)?.[1];
    if (!accountName) {
      return null;
    }
    blobServiceClient = new BlobServiceClient(`${env.storageUrl}${env.storageSas}`);
  }

  return blobServiceClient;
}

const CONTAINER_NAME = "diplomes";
const THUMBNAILS_CONTAINER_NAME = "thumbnails";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5 MB pour les miniatures
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const ALLOWED_THUMBNAIL_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export interface UploadResult {
  fileUrl: string;
  fileName: string;
}

/**
 * Upload un fichier diplôme vers Azure Blob Storage
 * @param fileBuffer Buffer du fichier
 * @param originalFileName Nom original du fichier
 * @param userId ID de l'utilisateur (pour le nom du fichier)
 * @returns URL du fichier uploadé
 */
export async function uploadDiploma(
  fileBuffer: Buffer,
  originalFileName: string,
  userId: string
): Promise<UploadResult> {
  const client = getBlobServiceClient();
  if (!client) {
    throw new Error("Azure Blob Storage non configuré");
  }

  // Validation de la taille
  if (fileBuffer.length > MAX_FILE_SIZE) {
    throw new Error(`Fichier trop volumineux. Maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Validation du type MIME (basique, peut être amélioré avec file-type)
  const extension = originalFileName.split(".").pop()?.toLowerCase();
  if (!extension || !["pdf", "jpg", "jpeg", "png", "webp"].includes(extension)) {
    throw new Error("Format de fichier non autorisé. Formats acceptés: PDF, JPG, PNG, WEBP");
  }

  // Scan antivirus (optionnel)
  try {
    const { scanFile } = await import("./antivirus");
    const scanResult = await scanFile(fileBuffer);
    if (!scanResult.safe) {
      throw new Error(`Fichier rejeté par l'antivirus: ${scanResult.virus || "Virus détecté"}`);
    }
  } catch (error: any) {
    // Si le scan n'est pas disponible, on accepte le fichier en développement
    if (env.nodeEnv === "production") {
      throw new Error("Service de scan antivirus non disponible");
    }
    console.warn("Scan antivirus non disponible, fichier accepté:", error.message);
  }

  // Génération d'un nom de fichier sécurisé
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(8).toString("hex");
  const sanitizedExtension = extension.toLowerCase();
  const fileName = `${userId}/${timestamp}-${randomId}.${sanitizedExtension}`;

  // Obtention du container (création si nécessaire)
  const containerClient = client.getContainerClient(CONTAINER_NAME);
  try {
    await containerClient.createIfNotExists({
      access: "private",
    });
  } catch (error) {
    // Container existe déjà ou erreur de permissions
  }

  // Upload du fichier
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
    blobHTTPHeaders: {
      blobContentType: getContentType(extension),
    },
    metadata: {
      userId,
      originalFileName,
      uploadedAt: new Date().toISOString(),
    },
  });

  // Génération de l'URL avec SAS pour accès sécurisé
  // Note: En production, générer une URL SAS avec expiration
  const fileUrl = blockBlobClient.url;

  return {
    fileUrl,
    fileName,
  };
}

/**
 * Supprime un fichier diplôme
 */
export async function deleteDiploma(fileName: string): Promise<void> {
  const client = getBlobServiceClient();
  if (!client) {
    return;
  }

  const containerClient = client.getContainerClient(CONTAINER_NAME);
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  await blockBlobClient.deleteIfExists();
}

/**
 * Upload une miniature de formation vers Azure Blob Storage
 * @param fileBuffer Buffer du fichier image
 * @param originalFileName Nom original du fichier
 * @param trainingId ID de la formation (pour le nom du fichier)
 * @returns URL du fichier uploadé
 */
export async function uploadThumbnail(
  fileBuffer: Buffer,
  originalFileName: string,
  trainingId: string
): Promise<UploadResult> {
  const client = getBlobServiceClient();
  if (!client) {
    throw new Error("Azure Blob Storage non configuré");
  }

  // Validation de la taille
  if (fileBuffer.length > MAX_THUMBNAIL_SIZE) {
    throw new Error(`Fichier trop volumineux. Maximum: ${MAX_THUMBNAIL_SIZE / 1024 / 1024}MB`);
  }

  // Validation du type MIME (images uniquement)
  const extension = originalFileName.split(".").pop()?.toLowerCase();
  if (!extension || !["jpg", "jpeg", "png", "webp"].includes(extension)) {
    throw new Error("Format de fichier non autorisé. Formats acceptés: JPG, PNG, WEBP");
  }

  // Scan antivirus (optionnel)
  try {
    const { scanFile } = await import("./antivirus");
    const scanResult = await scanFile(fileBuffer);
    if (!scanResult.safe) {
      throw new Error(`Fichier rejeté par l'antivirus: ${scanResult.virus || "Virus détecté"}`);
    }
  } catch (error: any) {
    // Si le scan n'est pas disponible, on accepte le fichier en développement
    if (env.nodeEnv === "production") {
      throw new Error("Service de scan antivirus non disponible");
    }
    console.warn("Scan antivirus non disponible, fichier accepté:", error.message);
  }

  // Génération d'un nom de fichier sécurisé
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(8).toString("hex");
  const sanitizedExtension = extension.toLowerCase();
  const fileName = `trainings/${trainingId}/${timestamp}-${randomId}.${sanitizedExtension}`;

  // Obtention du container (création si nécessaire)
  const containerClient = client.getContainerClient(THUMBNAILS_CONTAINER_NAME);
  try {
    await containerClient.createIfNotExists({
      access: "blob" as const, // Public read access pour les miniatures
    });
  } catch (error) {
    // Container existe déjà ou erreur de permissions
  }

  // Upload du fichier
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
    blobHTTPHeaders: {
      blobContentType: getContentType(extension),
    },
    metadata: {
      trainingId,
      originalFileName,
      uploadedAt: new Date().toISOString(),
    },
  });

  // Génération de l'URL
  const fileUrl = blockBlobClient.url;

  return {
    fileUrl,
    fileName,
  };
}

/**
 * Supprime une miniature de formation
 */
export async function deleteThumbnail(fileName: string): Promise<void> {
  const client = getBlobServiceClient();
  if (!client) {
    return;
  }

  const containerClient = client.getContainerClient(THUMBNAILS_CONTAINER_NAME);
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  await blockBlobClient.deleteIfExists();
}

function getContentType(extension: string): string {
  const map: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };
  return map[extension] || "application/octet-stream";
}

