/**
 * Intégration Microsoft Clarity pour le tracking des utilisateurs
 * https://clarity.microsoft.com/
 */

declare global {
  interface Window {
    clarity?: (action: string, ...args: any[]) => void;
  }
}

export function initClarity(projectId?: string) {
  if (typeof window === "undefined" || !projectId) {
    return;
  }

  // Vérifier si Clarity est déjà chargé
  if (window.clarity) {
    return;
  }

  // Créer et injecter le script Clarity
  (function (c: any, l: any, a: any, r: any, i: any, t: any, y: any) {
    c[a] =
      c[a] ||
      function () {
        (c[a].q = c[a].q || []).push(arguments);
      };
    t = l.createElement(r);
    t.async = 1;
    t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode?.insertBefore(t, y);
  })(window, document, "clarity", "script", projectId);
}

/**
 * Track un événement personnalisé dans Clarity
 */
export function trackClarityEvent(eventName: string, data?: Record<string, any>) {
  if (typeof window === "undefined" || !window.clarity) {
    return;
  }

  try {
    window.clarity("event", eventName, data);
  } catch (error) {
    console.warn("Erreur lors du tracking Clarity:", error);
  }
}

/**
 * Identifie un utilisateur dans Clarity
 */
export function identifyClarityUser(userId: string, metadata?: Record<string, any>) {
  if (typeof window === "undefined" || !window.clarity) {
    return;
  }

  try {
    window.clarity("identify", userId, metadata);
  } catch (error) {
    console.warn("Erreur lors de l'identification Clarity:", error);
  }
}

