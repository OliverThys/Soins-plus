/**
 * Service de scan antivirus pour les fichiers uploadés
 * Supporte ClamAV (local ou distant) et Azure Defender
 */

import type NodeClam from "node-clamav";
import { env } from "../config/env";

let NodeClamClass: typeof NodeClam | null = null;
let clamavClient: NodeClam | null = null;

// Chargement dynamique de node-clamav pour éviter les erreurs si non installé
async function loadNodeClam() {
  if (NodeClamClass) return NodeClamClass;
  try {
    const module = await import("node-clamav");
    NodeClamClass = module.default;
    return NodeClamClass;
  } catch (error) {
    console.warn("node-clamav non disponible, scan désactivé");
    return null;
  }
}

/**
 * Initialise le client ClamAV
 */
async function getClamavClient(): Promise<NodeClam | null> {
  if (clamavClient) {
    return clamavClient;
  }

  const NodeClam = await loadNodeClam();
  if (!NodeClam) {
    return null;
  }

  // Configuration ClamAV depuis variables d'environnement
  const clamavHost = process.env.CLAMAV_HOST || "localhost";
  const clamavPort = Number(process.env.CLAMAV_PORT || 3310);
  const clamavTimeout = Number(process.env.CLAMAV_TIMEOUT || 30000);

  try {
    clamavClient = new NodeClam();
    await clamavClient.init({
      host: clamavHost,
      port: clamavPort,
      timeout: clamavTimeout,
    });
    return clamavClient;
  } catch (error) {
    console.warn("ClamAV non disponible, scan désactivé:", error);
    return null;
  }
}

/**
 * Scanne un fichier avec ClamAV
 * @param fileBuffer Buffer du fichier à scanner
 * @returns true si le fichier est sûr, false si infecté
 */
export async function scanFile(fileBuffer: Buffer): Promise<{ safe: boolean; virus?: string }> {
  // Si ClamAV n'est pas configuré, on accepte le fichier (mode développement)
  if (env.nodeEnv === "development" && !process.env.CLAMAV_HOST) {
    console.warn("ClamAV non configuré, fichier accepté sans scan");
    return { safe: true };
  }

  const client = await getClamavClient();
  if (!client) {
    // En production sans ClamAV, on rejette par sécurité
    if (env.nodeEnv === "production") {
      throw new Error("Service de scan antivirus non disponible");
    }
    return { safe: true };
  }

  try {
    const result = await client.scanBuffer(fileBuffer);
    
    if (result.isInfected) {
      return {
        safe: false,
        virus: result.viruses?.[0] || "Virus détecté",
      };
    }

    return { safe: true };
  } catch (error: any) {
    console.error("Erreur lors du scan antivirus:", error);
    // En cas d'erreur, on rejette par sécurité en production
    if (env.nodeEnv === "production") {
      throw new Error("Erreur lors du scan antivirus");
    }
    return { safe: true };
  }
}

/**
 * Scanne un fichier avec Azure Defender (alternative)
 * Note: Nécessite une intégration avec Azure Security Center
 */
export async function scanFileWithAzureDefender(fileBuffer: Buffer): Promise<{ safe: boolean; virus?: string }> {
  // TODO: Implémenter l'intégration Azure Defender
  // Pour l'instant, on utilise ClamAV
  return scanFile(fileBuffer);
}

