import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api.js";
import { Icon } from "../../components/Icon.js";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";

export function TrainerDashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ["trainer-dashboard"],
    queryFn: async () => (await api.get("/trainer/dashboard")).data,
  });

  const trainingsQuery = useQuery({
    queryKey: ["trainer-trainings"],
    queryFn: async () => (await api.get("/trainer/trainings")).data,
  });

  if (dashboardQuery.isLoading || trainingsQuery.isLoading) {
    return <p className="muted">Chargement...</p>;
  }

  const dashboard = dashboardQuery.data;
  const trainings = trainingsQuery.data || [];

  return (
    <section className="page page--cinematic">
      <div className="page-shell trainer-page">
        <header className="card card--gradient">
          <p className="eyebrow">Tableau de bord</p>
          <h1 className="title-lg">Mes formations</h1>
          <p>Gérez vos formations et validez les présences des participants.</p>
        </header>

        <div className="grid-3" style={{ marginTop: "2rem" }}>
          <article className="card">
            <div className="home-panel-header">
              <div>
                <p className="muted">Total formations</p>
                <h2 className="title-lg">{dashboard?.totalTrainings || 0}</h2>
              </div>
              <Icon name="book" size={24} aria-hidden />
            </div>
          </article>

          <article className="card">
            <div className="home-panel-header">
              <div>
                <p className="muted">Total participants</p>
                <h2 className="title-lg">{dashboard?.totalParticipants || 0}</h2>
              </div>
              <Icon name="users" size={24} aria-hidden />
            </div>
          </article>

          <article className="card">
            <div className="home-panel-header">
              <div>
                <p className="muted">Formations à venir</p>
                <h2 className="title-lg">{dashboard?.upcomingTrainings?.length || 0}</h2>
              </div>
              <Icon name="calendar" size={24} aria-hidden />
            </div>
          </article>
        </div>

        <div className="stack" style={{ marginTop: "2rem" }}>
          <div className="home-panel-header">
            <h2 className="title-md">Formations à venir</h2>
          </div>

          {dashboard?.upcomingTrainings?.length === 0 ? (
            <div className="card">
              <p className="muted text-center">Aucune formation à venir</p>
            </div>
          ) : (
            dashboard?.upcomingTrainings?.map((training: any) => (
              <article key={training.id} className="card">
                <div className="home-panel-header">
                  <div>
                    <h3 className="title-md">{training.title}</h3>
                    <p className="muted">
                      {training.startDate
                        ? format(new Date(training.startDate), "dd MMMM yyyy 'à' HH:mm", { locale: fr })
                        : "Date à définir"}
                    </p>
                    <p className="muted">
                      {training.enrollments?.length || 0} participant{training.enrollments?.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Link to={`/formateur/formations/${training.id}`} className="btn btn-primary">
                    <Icon name="eye" size={16} aria-hidden /> Gérer
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="stack" style={{ marginTop: "2rem" }}>
          <div className="home-panel-header">
            <h2 className="title-md">Toutes mes formations</h2>
          </div>

          {trainings.length === 0 ? (
            <div className="card">
              <p className="muted text-center">Aucune formation assignée</p>
            </div>
          ) : (
            trainings.map((training: any) => (
              <article key={training.id} className="card">
                <div className="home-panel-header">
                  <div>
                    <h3 className="title-md">{training.title}</h3>
                    <p className="muted">
                      {training.startDate
                        ? format(new Date(training.startDate), "dd MMMM yyyy 'à' HH:mm", { locale: fr })
                        : "Date à définir"}
                    </p>
                    <p className="muted">
                      {training.enrollments?.length || 0} participant{training.enrollments?.length !== 1 ? "s" : ""} ·{" "}
                      {training.enrollments?.filter((e: any) => e.attendance).length || 0} présent
                      {(training.enrollments?.filter((e: any) => e.attendance).length || 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Link to={`/formateur/formations/${training.id}`} className="btn btn-secondary">
                    <Icon name="edit" size={16} aria-hidden /> Valider présences
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

