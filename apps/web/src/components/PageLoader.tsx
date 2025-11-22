import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export function PageLoader() {
  const location = useLocation();
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    // Afficher le loader immédiatement lors du changement de route
    setShowLoader(true);

    // Garder le loader visible pendant 0.3s minimum
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!showLoader) return null;

  return (
    <div className="page-loader">
      <div className="page-loader__spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
    </div>
  );
}

