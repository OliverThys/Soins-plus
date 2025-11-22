import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { TrainingCard } from "../components/TrainingCard.js";
import { TrainingCardLocked } from "../components/TrainingCardLocked.js";
import { getTrainings } from "../services/api.js";
import { api } from "../services/api.js";
import { Icon } from "../components/Icon.js";

const themes = ["Urgence", "Pédiatrie", "Gériatrie", "Santé mentale", "Oncologie", "Prévention"];
const types = [
  { label: "Vidéo", value: "VIDEO" },
  { label: "Présentiel", value: "PRESENTIEL" },
  { label: "Distanciel", value: "DISTANCIEL" },
];

export function CatalogPage() {
  const [filters, setFilters] = useState<{
    theme?: string;
    type?: string;
    search?: string;
    accreditation?: boolean;
    date?: string;
    sort?: "relevance" | "date" | "popularity";
  }>({ sort: "date" });
  const queryFilters = useMemo(() => {
    const params: Record<string, string | undefined> = {
      theme: filters.theme,
      type: filters.type,
      search: filters.search,
      date: filters.date,
      sort: filters.sort || "date", // Tri par défaut si non spécifié
    };
    if (typeof filters.accreditation === "boolean") {
      params.accreditation = filters.accreditation.toString();
    }
    return params;
  }, [filters]);
  const trainingsQuery = useQuery({
    queryKey: ["trainings", queryFilters],
    queryFn: () => getTrainings(queryFilters),
  });

  // Vérifier l'authentification et l'abonnement (sans bloquer l'affichage)
  const userQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const response = await api.get("/me");
        return response.data;
      } catch (error: any) {
        // 401 = non authentifié, c'est normal pour une page publique
        if (error.response?.status === 401 || error.response?.status === 403) {
          return null;
        }
        // Autres erreurs, on retourne null aussi pour ne pas bloquer
        return null;
      }
    },
    retry: false,
    // Ne pas refetch automatiquement pour éviter les redirections
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const subscriptionQuery = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      try {
        return (await api.get("/billing/subscription")).data;
      } catch (error: any) {
        // Erreur normale si non authentifié ou sans abonnement
        return { active: false };
      }
    },
    enabled: !!userQuery.data, // Seulement si l'utilisateur est connecté
    retry: false,
    refetchOnWindowFocus: false,
  });

  const isAuthenticated = !!userQuery.data;
  const hasActiveSubscription = subscriptionQuery.data?.active || userQuery.data?.subscriptionActive;
  const isLocked = !isAuthenticated || !hasActiveSubscription;

  const allTrainings = Array.isArray(trainingsQuery.data) ? trainingsQuery.data : [];
  const accreditedCount = allTrainings.filter((t: any) => t.accreditation).length;
  const videoCount = allTrainings.filter((t: any) => t.type === "VIDEO").length;
  const onsiteCount = allTrainings.filter((t: any) => t.type === "PRESENTIEL").length;

  const toggleTheme = (theme: string) =>
    setFilters((prev) => ({ ...prev, theme: prev.theme === theme ? undefined : theme }));

  return (
    <section className="page page--cinematic">
      <div className="container">
        {isLocked && (
          <div className="catalog-lock-banner">
            <div className="catalog-lock-banner__content">
              <div className="catalog-lock-banner__icon">
                <Icon name="lock" size={24} />
              </div>
              <div className="catalog-lock-banner__text">
                <h2 className="title-md">Accédez à toutes les formations</h2>
                <p className="muted">
                  {!isAuthenticated
                    ? "Connectez-vous et abonnez-vous pour débloquer l'accès à toutes les formations."
                    : "Abonnez-vous pour débloquer l'accès à toutes les formations."}
                </p>
              </div>
              <div className="catalog-lock-banner__cta">
                {!isAuthenticated ? (
                  <Link to="/login" className="btn btn-primary">
                    Se connecter
                  </Link>
                ) : (
                  <Link to="/app/abonnement" className="btn btn-primary">
                    S'abonner maintenant
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="catalog-layout">
          <aside className="catalog-sidebar">
            <div className="catalog-filters">
              <div className="catalog-filters__search">
                <Icon name="search" size={20} className="catalog-filters__search-icon" aria-hidden />
                <input
                  type="search"
                  className="catalog-filters__input"
                  placeholder="Recherche par titre, thème ou formateur"
                  value={filters.search ?? ""}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                />
              </div>
              
              <div className="catalog-filters__section">
                <span className="catalog-filters__section-title">Type</span>
                <div className="catalog-filters__buttons">
                  {types.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      className={`catalog-filters__button ${filters.type === type.value ? "catalog-filters__button--active" : ""}`}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          type: prev.type === type.value ? undefined : type.value,
                        }))
                      }
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="catalog-filters__section">
                <label className="catalog-filters__checkbox">
                  <input
                    type="checkbox"
                    checked={Boolean(filters.accreditation)}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        accreditation: event.target.checked ? true : undefined,
                      }))
                    }
                  />
                  <span className="catalog-filters__checkbox-indicator">
                    <Icon name="check" size={14} />
                  </span>
                  <span className="catalog-filters__checkbox-label">Formations accréditées</span>
                </label>
              </div>

              <div className="catalog-filters__section">
                <span className="catalog-filters__section-title">Date</span>
                <label className="catalog-filters__date">
                  <Icon name="calendar" size={18} aria-hidden />
                  <input
                    type="date"
                    value={filters.date ?? ""}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        date: event.target.value || undefined,
                      }))
                    }
                  />
                </label>
              </div>

              <div className="catalog-filters__section">
                <span className="catalog-filters__section-title">Trier par</span>
                <div className="catalog-filters__buttons">
                  <button
                    type="button"
                    className={`catalog-filters__button ${filters.sort === "date" ? "catalog-filters__button--active" : ""}`}
                    onClick={() => setFilters((prev) => ({ 
                      ...prev, 
                      sort: prev.sort === "date" ? undefined : "date" 
                    }))}
                  >
                    Date
                  </button>
                  <button
                    type="button"
                    className={`catalog-filters__button ${filters.sort === "popularity" ? "catalog-filters__button--active" : ""}`}
                    onClick={() => setFilters((prev) => ({ 
                      ...prev, 
                      sort: prev.sort === "popularity" ? undefined : "popularity" 
                    }))}
                  >
                    Popularité
                  </button>
                  {filters.search && (
                    <button
                      type="button"
                      className={`catalog-filters__button ${filters.sort === "relevance" ? "catalog-filters__button--active" : ""}`}
                      onClick={() => setFilters((prev) => ({ 
                        ...prev, 
                        sort: prev.sort === "relevance" ? undefined : "relevance" 
                      }))}
                    >
                      Pertinence
                    </button>
                  )}
                </div>
              </div>

              <div className="catalog-filters__section">
                <span className="catalog-filters__section-title">Thèmes</span>
                <div className="catalog-filters__themes">
                  {themes.map((theme) => (
                    <button
                      type="button"
                      key={theme}
                      className={`catalog-filters__theme-button ${filters.theme === theme ? "catalog-filters__theme-button--active" : ""}`}
                      onClick={() => toggleTheme(theme)}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="catalog-content">
            <header className="card catalog-hero">
              <div>
                <p className="eyebrow">Catalogue immersif</p>
                <h1 className="title-lg">Choisissez vos prochaines formations</h1>
                <p className="muted">
                  {isLocked
                    ? "Découvrez notre catalogue de formations professionnelles. Abonnez-vous pour accéder au contenu complet."
                    : "Grille interactive, filtres intelligents et suggestions personnalisées selon votre spécialité."}
                </p>
              </div>
              <div className="catalog-hero__stats">
                <div>
                  <strong>{accreditedCount}</strong>
                  <span>Formations accréditées</span>
                </div>
                <div>
                  <strong>{videoCount}</strong>
                  <span>Capsules vidéo</span>
                </div>
                <div>
                  <strong>{onsiteCount}</strong>
                  <span>Sessions présentiel</span>
                </div>
              </div>
            </header>

            {trainingsQuery.isLoading && <p className="muted">Chargement du catalogue…</p>}
            {trainingsQuery.isError && <p className="muted">Impossible de récupérer les formations.</p>}

            <div className="catalog-grid">
              {allTrainings.length === 0 && !trainingsQuery.isLoading ? (
                <p className="muted">Aucune formation disponible pour le moment.</p>
              ) : (
                allTrainings.map((training: any) =>
                  isLocked ? (
                    <TrainingCardLocked training={training} isAuthenticated={isAuthenticated} key={training.id} />
                  ) : (
                    <TrainingCard training={training} key={training.id} />
                  )
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

