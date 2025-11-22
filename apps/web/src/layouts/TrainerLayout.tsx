import { Outlet } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import { Icon } from "../components/Icon";
import { useTheme } from "../hooks/useTheme.js";
import { PageLoader } from "../components/PageLoader.js";

export function TrainerLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="trainer-shell">
      <PageLoader />
      <header className="trainer-header">
        <div className="container public-header__inner" style={{ padding: "1.5rem 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <BrandLogo tag="formateurs" size="sm" />
          <button className="theme-toggle" onClick={toggleTheme} aria-label={theme === "light" ? "Activer le mode sombre" : "Activer le mode clair"}>
            <Icon name={theme === "light" ? "moon" : "sun"} size={20} aria-hidden />
          </button>
        </div>
      </header>
      <main className="trainer-main">
        <Outlet />
      </main>
    </div>
  );
}

