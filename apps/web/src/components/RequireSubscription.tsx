import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api.js";

interface RequireSubscriptionProps {
  children: React.ReactNode;
}

export function RequireSubscription({ children }: RequireSubscriptionProps) {
  const location = useLocation();
  const userQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const response = await api.get("/me");
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 401) {
          // Non authentifié, rediriger vers login
          window.location.href = "/login";
          return null;
        }
        throw error;
      }
    },
    retry: false,
  });

  // Si on est déjà sur la page d'abonnement, autoriser l'accès
  if (location.pathname === "/app/abonnement") {
    return <>{children}</>;
  }

  // En cours de chargement
  if (userQuery.isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <p className="muted">Vérification de l'abonnement...</p>
      </div>
    );
  }

  // Erreur ou utilisateur non trouvé
  if (userQuery.isError || !userQuery.data) {
    return <Navigate to="/login" replace />;
  }

  // Vérifier l'abonnement
  const user = userQuery.data;
  if (!user.subscriptionActive) {
    // Rediriger vers la page d'accueil si pas d'abonnement actif
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  // Abonnement actif, autoriser l'accès
  return <>{children}</>;
}

