import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import { Icon } from "../components/Icon";
import { useTheme } from "../hooks/useTheme.js";
import { PageLoader } from "../components/PageLoader.js";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api.js";
import { HelpTicketModal } from "../components/HelpTicketModal.js";
import { clearSession, getAccessToken } from "../services/session.js";

export function PublicLayout() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const userQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const response = await api.get("/me");
        return response.data;
      } catch (error: any) {
        // Si 401, l'utilisateur n'est pas authentifié
        if (error.response?.status === 401) {
          return null;
        }
        // Pour les autres erreurs, retourner null aussi
        return null;
      }
    },
    retry: false,
    staleTime: 30000, // Considérer les données comme fraîches pendant 30 secondes
  });

  const user = userQuery.data;
  const hasToken = !!getAccessToken();
  
  // L'utilisateur est authentifié si :
  // 1. Il y a un token ET la requête a réussi avec un utilisateur
  // 2. OU si la requête est en cours de chargement et qu'il y a un token (pour éviter le flash de "Connexion")
  const isAuthenticated = hasToken && (!!user || userQuery.isLoading);
  const hasSubscription = user?.subscriptionActive === true;

  const handleLogout = () => {
    clearSession();
    // Invalider le cache de l'utilisateur
    queryClient.setQueryData(["me"], null);
    queryClient.invalidateQueries({ queryKey: ["me"] });
    navigate("/");
  };

  return (
    <div className="app-shell">
      <PageLoader />
      <header className="public-header">
        <div className="container public-header__inner">
          <NavLink to="/" aria-label="Accueil SOINS+">
            <BrandLogo tag="formations continues" size="md" />
          </NavLink>
          <nav className="public-nav">
            <NavLink to="/catalogue" className={({ isActive }) => (isActive ? "active" : undefined)}>
              Formations
            </NavLink>
            <NavLink to="/legal" className={({ isActive }) => (isActive ? "active" : undefined)}>
              Espace juridique
            </NavLink>
            <button className="theme-toggle" onClick={toggleTheme} aria-label={theme === "light" ? "Activer le mode sombre" : "Activer le mode clair"}>
              <Icon name={theme === "light" ? "moon" : "sun"} size={20} aria-hidden />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                className="help-button help-button--header"
                onClick={() => setIsHelpModalOpen(true)}
                aria-label="Ouvrir un ticket d'aide"
              >
                <Icon name="document" size={18} aria-hidden />
                <span>Aide</span>
              </button>
              {isAuthenticated ? (
                <>
                  {!hasSubscription && (
                    <NavLink to="/abonnement" className="btn btn-primary">
                      Abonnement
                    </NavLink>
                  )}
                  {hasSubscription && (
                    <NavLink to="/app" className="btn btn-primary">
                      Mon espace
                    </NavLink>
                  )}
                  <div style={{ position: "relative" }}>
                    <button
                      className="btn btn-ghost"
                      onClick={handleLogout}
                      aria-label="Se déconnecter"
                      style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                    >
                      <Icon name="log-out" size={18} aria-hidden />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : undefined)}>
                    Connexion
                  </NavLink>
                  <NavLink to="/register" className="btn btn-primary">
                    Abonnement
                  </NavLink>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="public-footer">
        © {new Date().getFullYear()} SOINS+ — Formations continues accréditées
      </footer>

      <HelpTicketModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        userId={user?.id}
        userEmail={user?.email}
        userName={user ? `${user.firstName} ${user.lastName}` : undefined}
      />
    </div>
  );
}

