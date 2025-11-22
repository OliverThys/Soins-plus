import clsx from "clsx";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import { Icon } from "../components/Icon";
import { useTheme } from "../hooks/useTheme.js";
import { clearSession } from "../services/session.js";
import { PageLoader } from "../components/PageLoader.js";

const adminLinks = [
  { to: "/admin/formations", label: "Formations" },
  { to: "/admin/contenu", label: "Contenu" },
  { to: "/admin/utilisateurs", label: "Utilisateurs" },
  { to: "/admin/tickets", label: "Tickets" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/configuration", label: "Configuration" },
];

export function AdminLayout() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <div className="admin-shell">
      <PageLoader />
      <aside className="admin-sidebar">
        <BrandLogo tag="admin hub" size="sm" />
        <nav className="admin-nav">
          {adminLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => clsx({ active: isActive })}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <button className="theme-toggle" onClick={toggleTheme} aria-label={theme === "light" ? "Activer le mode sombre" : "Activer le mode clair"}>
            <Icon name={theme === "light" ? "moon" : "sun"} size={20} aria-hidden />
          </button>
          <button className="btn btn-ghost btn-logout" onClick={handleLogout} aria-label="Se déconnecter">
            <Icon name="log-out" size={18} aria-hidden />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

