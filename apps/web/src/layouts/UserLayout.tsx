import clsx from "clsx";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import { Icon, type IconName } from "../components/Icon";
import { useTheme } from "../hooks/useTheme.js";
import { clearSession } from "../services/session.js";
import { PageLoader } from "../components/PageLoader.js";
import { RequireSubscription } from "../components/RequireSubscription.js";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api.js";
import { HelpTicketModal } from "../components/HelpTicketModal.js";

const links: Array<{ to: string; label: string; icon: IconName }> = [
  { to: "/app", label: "Tableau de bord", icon: "home" },
  { to: "/app/catalogue", label: "Catalogue", icon: "catalog" },
  { to: "/app/mes-formations", label: "Mes formations", icon: "learning" },
  { to: "/app/juridique", label: "Juridique", icon: "legal" },
];

export function UserLayout() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const userQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const response = await api.get("/me");
        return response.data;
      } catch {
        return null;
      }
    },
  });

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  const user = userQuery.data;

  return (
    <RequireSubscription>
      <div className="user-layout">
        <PageLoader />
        <aside className="user-sidebar">
        <div>
          <BrandLogo tag="espace pro" size="sm" />
        </div>
        <nav className="user-sidebar__nav">
          {links.map((link) => (
            <NavLink 
              key={link.to} 
              to={link.to} 
              end={link.to === "/app"}
              className={({ isActive }) => clsx("sidebar-link", { active: isActive })}
            >
              <Icon name={link.icon} size={18} style={{ marginRight: "0.5rem" }} aria-hidden />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="user-sidebar__footer">
          <div className="user-sidebar__footer-actions">
            <button className="theme-toggle" onClick={toggleTheme} aria-label={theme === "light" ? "Activer le mode sombre" : "Activer le mode clair"}>
              <Icon name={theme === "light" ? "moon" : "sun"} size={20} aria-hidden />
            </button>
            <button
              className="btn btn-ghost help-button"
              onClick={() => setIsHelpModalOpen(true)}
              aria-label="Ouvrir un ticket d'aide"
            >
              <Icon name="document" size={18} aria-hidden />
              <span>Aide</span>
            </button>
          </div>
          <button className="btn btn-ghost btn-logout" onClick={handleLogout} aria-label="Se déconnecter">
            <Icon name="log-out" size={18} aria-hidden />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
      <div className="user-content">
        <div className="user-topbar">
          <div>
            <p className="muted">Bonjour Camille 👋</p>
            <h1 className="title-lg">Votre tableau de bord SOINS+</h1>
          </div>
          <div className="user-status-chip">
            <Icon name="shield" size={18} aria-hidden />
            <div>
              <strong>Espace sécurisé</strong>
              <p className="muted">Données personnelles protégées</p>
            </div>
          </div>
        </div>
        <Outlet />
      </div>
      <nav className="mobile-bottom-nav">
        {links.map((link) => (
          <NavLink 
            key={link.to} 
            to={link.to} 
            end={link.to === "/app"}
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            <Icon name={link.icon} size={18} aria-hidden />
            {link.label}
          </NavLink>
        ))}
      </nav>
      </div>

      <HelpTicketModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        userId={user?.id}
        userEmail={user?.email}
        userName={user ? `${user.firstName} ${user.lastName}` : undefined}
      />
    </RequireSubscription>
  );
}

