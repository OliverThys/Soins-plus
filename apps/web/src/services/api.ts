import axios from "axios";
import { getSessionUser, getAccessToken } from "./session";

// Fonction pour détecter automatiquement le port du backend
const detectBackendPort = async (): Promise<string> => {
  const configuredUrl = import.meta.env.VITE_API_URL;
  if (configuredUrl) {
    return configuredUrl;
  }

  // Essayer les ports 4000, 4001, 4002, etc.
  const ports = [4000, 4001, 4002, 4003, 4004];
  
  for (const port of ports) {
    try {
      const response = await fetch(`http://localhost:${port}/healthz`, {
        method: "GET",
        signal: AbortSignal.timeout(500), // Timeout de 500ms
      });
      if (response.ok) {
        console.log(`✅ Backend détecté sur le port ${port}`);
        return `http://localhost:${port}`;
      }
    } catch (error) {
      // Port non disponible, continuer
      continue;
    }
  }
  
  // Par défaut, utiliser le port 4000
  console.warn("⚠️ Backend non détecté, utilisation du port 4000 par défaut");
  return "http://localhost:4000";
};

// Détecter le port au chargement (une seule fois)
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Essayer de détecter automatiquement le port si non configuré
if (!import.meta.env.VITE_API_URL && typeof window !== "undefined") {
  detectBackendPort().then((url) => {
    // Mettre à jour l'instance axios avec le nouveau baseURL
    api.defaults.baseURL = url;
    console.log(`✅ API configurée pour utiliser: ${url}`);
  }).catch(() => {
    // En cas d'erreur, utiliser le port par défaut
    console.warn("⚠️ Impossible de détecter le port du backend, utilisation du port 4000");
  });
}

api.interceptors.request.use((config) => {
  const userId = getSessionUser();
  const token = getAccessToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (userId) {
    // Fallback pour les routes qui utilisent encore x-user-id
    config.headers["x-user-id"] = userId;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Routes publiques qui ne doivent pas rediriger vers login
      const publicRoutes = ["/trainings", "/healthz"];
      const isPublicRoute = publicRoutes.some((route) => error.config?.url?.includes(route));
      
      // Ne pas rediriger si c'est une route publique ou si on est déjà sur une page publique
      if (!isPublicRoute && typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        const publicPaths = ["/catalogue", "/", "/login", "/register"];
        const isOnPublicPath = publicPaths.some((path) => currentPath.startsWith(path));
        
        // Seulement rediriger si on n'est pas déjà sur une page publique
        if (!isOnPublicPath) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export const getTrainings = async (filters: Record<string, string | undefined> = {}) => {
  const response = await api.get("/trainings", { params: filters });
  return response.data;
};

export const getTraining = async (id: string) => {
  const response = await api.get(`/trainings/${id}`);
  return response.data;
};

export const enrollTraining = async (id: string) => {
  const response = await api.post(`/trainings/${id}/enroll`);
  return response.data;
};

export const trackChapterProgress = async (trainingId: string, chapterId: string) => {
  const response = await api.post(`/trainings/${trainingId}/chapters/${chapterId}/progress`);
  return response.data;
};

export const requestPasswordReset = (email: string) => api.post("/auth/password/forgot", { email });

export const resetPassword = (token: string, password: string) =>
  api.post("/auth/password/reset", { token, password });

export const getCertificates = async () => {
  const response = await api.get("/me/certificates");
  return response.data;
};

