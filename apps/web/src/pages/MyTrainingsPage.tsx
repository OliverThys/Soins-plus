import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import { api, getCertificates } from "../services/api.js";
import { Icon } from "../components/Icon.js";

export function MyTrainingsPage() {
  const trainingsQuery = useQuery({
    queryKey: ["me-trainings"],
    queryFn: async () => (await api.get("/me/trainings")).data,
  });

  const certificatesQuery = useQuery({
    queryKey: ["me-certificates"],
    queryFn: () => getCertificates(),
  });

  if (trainingsQuery.isLoading) {
    return <p className="muted">Chargement...</p>;
  }

  const enrollments: Array<any> = trainingsQuery.data ?? [];
  const upcoming = enrollments.filter((enrollment) => enrollment.status !== "COMPLETED");
  const completed = enrollments.filter((enrollment) => enrollment.status === "COMPLETED");

  const certificatesByTraining = new Map(
    (certificatesQuery.data ?? []).map((certificate: any) => [certificate.trainingId, certificate])
  );

  return (
    <section className="page page--cinematic">
      <div className="page-shell dashboard">
        <header className="my-trainings-header">
          <div>
            <p className="eyebrow">Parcours personnalisé</p>
            <h1 className="title-lg">Mes formations</h1>
          </div>
        </header>

        <section className="my-trainings-section">
          <div className="my-trainings-section__header">
            <div>
              <p className="eyebrow">Planifiées</p>
              <h2 className="title-md">Formations à venir et en cours</h2>
            </div>
            {upcoming.length > 0 && (
              <span className="my-trainings-count">{upcoming.length} formation{upcoming.length > 1 ? "s" : ""}</span>
            )}
          </div>
          {upcoming.length === 0 ? (
            <div className="my-trainings-empty">
              <Icon name="calendar" size={48} aria-hidden />
              <h3 className="title-md">Aucune inscription future</h3>
              <p className="muted">Explorez le catalogue pour découvrir nos formations.</p>
              <NavLink to="/app/catalogue" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                Explorer le catalogue
              </NavLink>
            </div>
          ) : (
            <div className="my-trainings-grid">
              {upcoming.map((enrollment) => (
                <article key={enrollment.id} className="my-training-card">
                  <div className="my-training-card__header">
                    <span className="my-training-card__theme">{enrollment.training.theme}</span>
                    <span className={`my-training-card__status my-training-card__status--${enrollment.status.toLowerCase()}`}>
                      {enrollment.status === "CONFIRMED" ? "Confirmée" : enrollment.status === "REGISTERED" ? "Inscrite" : "En cours"}
                    </span>
                  </div>
                  <h3 className="my-training-card__title">{enrollment.training.title}</h3>
                  <div className="my-training-card__meta">
                    <div className="my-training-card__meta-item">
                      <Icon name="calendar" size={16} aria-hidden />
                      <span>
                        {enrollment.training.startDate
                          ? new Date(enrollment.training.startDate).toLocaleDateString("fr-BE", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "À la demande"}
                      </span>
                    </div>
                    <div className="my-training-card__meta-item">
                      <Icon
                        name={enrollment.training.type === "VIDEO" ? "video" : enrollment.training.type === "PRESENTIEL" ? "onsite" : "remote"}
                        size={16}
                        aria-hidden
                      />
                      <span>{enrollment.training.type}</span>
                    </div>
                  </div>
                  {enrollment.status !== "CONFIRMED" && (
                    <div className="my-training-card__progress">
                      <div className="my-training-card__progress-bar">
                        <div
                          className="my-training-card__progress-fill"
                          style={{
                            width:
                              enrollment.status === "REGISTERED"
                                ? "50%"
                                : enrollment.status === "IN_PROGRESS"
                                ? "75%"
                                : "100%",
                          }}
                        />
                      </div>
                      <span className="my-training-card__progress-text">
                        {enrollment.status === "REGISTERED" ? "50%" : enrollment.status === "IN_PROGRESS" ? "75%" : "100%"} complété
                      </span>
                    </div>
                  )}
                  <div className="my-training-card__actions">
                    <NavLink to={`/formations/${enrollment.training.id}`} className="btn btn-primary">
                      Consulter
                    </NavLink>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="my-trainings-section">
          <div className="my-trainings-section__header">
            <div>
              <p className="eyebrow">Historique</p>
              <h2 className="title-md">Formations terminées & attestations</h2>
            </div>
            {completed.length > 0 && (
              <span className="my-trainings-count">{completed.length} formation{completed.length > 1 ? "s" : ""}</span>
            )}
          </div>
          {completed.length === 0 ? (
            <div className="my-trainings-empty">
              <Icon name="check" size={48} aria-hidden />
              <h3 className="title-md">Aucune formation terminée</h3>
              <p className="muted">Vos formations complétées apparaîtront ici avec leurs attestations.</p>
            </div>
          ) : (
            <div className="my-trainings-grid">
              {completed.map((enrollment) => {
                const certificate = certificatesByTraining.get(enrollment.training.id) ?? enrollment.certificate;
                return (
                  <article key={enrollment.id} className="my-training-card my-training-card--completed">
                    <div className="my-training-card__header">
                      <span className="my-training-card__theme">{enrollment.training.theme}</span>
                      <span className="my-training-card__status my-training-card__status--completed">
                        <Icon name="check" size={14} aria-hidden /> Terminée
                      </span>
                    </div>
                    <h3 className="my-training-card__title">{enrollment.training.title}</h3>
                    <div className="my-training-card__meta">
                      <div className="my-training-card__meta-item">
                        <Icon name="calendar" size={16} aria-hidden />
                        <span>
                          Validée le{" "}
                          {enrollment.completedAt
                            ? new Date(enrollment.completedAt).toLocaleDateString("fr-BE", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : "Date inconnue"}
                        </span>
                      </div>
                    </div>
                    <div className="my-training-card__actions">
                      <NavLink to={`/formations/${enrollment.training.id}`} className="btn btn-secondary">
                        Revoir le contenu
                      </NavLink>
                      {certificate?.fileUrl && (
                        <a className="btn btn-primary" href={certificate.fileUrl} target="_blank" rel="noreferrer">
                          <Icon name="download" size={16} aria-hidden /> Télécharger l'attestation
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

