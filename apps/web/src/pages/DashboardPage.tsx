import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import { api } from "../services/api.js";
import { Icon } from "../components/Icon.js";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#4DB5A6", "#2A6F6A", "#0F2827", "#1A3837"];

export function DashboardPage() {
  const statsQuery = useQuery({
    queryKey: ["me-stats"],
    queryFn: async () => {
      const response = await api.get("/me/stats");
      return response.data;
    },
  });
  const trainingsQuery = useQuery({
    queryKey: ["me-trainings"],
    queryFn: async () => {
      const response = await api.get("/me/trainings");
      return response.data;
    },
  });
  const newsQuery = useQuery({
    queryKey: ["news"],
    queryFn: async () => (await api.get("/news")).data,
  });

  const stats = statsQuery.data || {
    totalTrainings: 0,
    inProgress: 0,
    completed: 0,
    upcoming: 0,
    totalHoursCompleted: 0,
    yearlyGoal: 20,
    progressPercent: 0,
    recentTrainings: [],
    certificatesCount: 0,
  };

  const enrollments: any[] = Array.isArray(trainingsQuery.data) ? trainingsQuery.data : [];
  const news = Array.isArray(newsQuery.data) ? newsQuery.data.slice(0, 4) : [];
  const nextTraining = enrollments
    .filter((t) => Boolean(t.training.startDate))
    .sort((a, b) => new Date(a.training.startDate).getTime() - new Date(b.training.startDate).getTime())[0];
  const recentTimeline = stats.recentTrainings || enrollments.slice(0, 4);

  return (
    <section className="page page--cinematic">
      <div className="page-shell dashboard">
      <article className="card progress-card">
        <p className="muted">Progression annuelle</p>
        <h2 className="title-lg">
          Vous avez validé {stats.totalHoursCompleted.toFixed(1)}h sur {stats.yearlyGoal}h prévues
        </h2>
        <div className="progress-card__bar">
          <span style={{ width: `${stats.progressPercent}%` }} />
        </div>
        <p className="muted">
          Objectif : {stats.yearlyGoal}h de formation continue · {stats.completed} formations terminées · {stats.certificatesCount} attestations
        </p>
      </article>

      <div className="grid-3">
        <StatsCard
          label="Formations en cours"
          value={stats.inProgress}
          trend={stats.inProgress > 0 ? "En progression" : "À planifier"}
        />
        <StatsCard
          label="Formations terminées"
          value={stats.completed}
          trend={stats.completed > 0 ? "Attestations générées" : "Aucune terminée"}
        />
        <StatsCard
          label="Formations à venir"
          value={stats.upcoming}
          trend={stats.upcoming > 0 ? "Planifiées" : "Aucune planifiée"}
        />
      </div>

      <div className="grid-2" style={{ marginTop: "2rem" }}>
        <article className="card">
          <header className="home-panel-header">
            <div>
              <p className="muted">Progression</p>
              <h3 className="title-md">Répartition des formations</h3>
            </div>
          </header>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: "Terminées", value: stats.completed },
                  { name: "En cours", value: stats.inProgress },
                  { name: "À venir", value: stats.upcoming },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[
                  { name: "Terminées", value: stats.completed },
                  { name: "En cours", value: stats.inProgress },
                  { name: "À venir", value: stats.upcoming },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </article>

        <article className="card">
          <header className="home-panel-header">
            <div>
              <p className="muted">Heures de formation</p>
              <h3 className="title-md">Progression mensuelle</h3>
            </div>
          </header>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={generateMonthlyData(stats.totalHoursCompleted, stats.yearlyGoal)}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="completed" stroke="#4DB5A6" strokeWidth={2} name="Heures complétées" />
              <Line type="monotone" dataKey="goal" stroke="#2A6F6A" strokeWidth={2} strokeDasharray="5 5" name="Objectif mensuel" />
            </LineChart>
          </ResponsiveContainer>
        </article>
      </div>

      <div className="grid-2">
        <article className="card">
          <header className="home-panel-header">
            <div>
              <p className="muted">Progression</p>
              <h3 className="title-md">Évolution des formations</h3>
            </div>
          </header>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: "Terminées", value: stats.completed },
                { name: "En cours", value: stats.inProgress },
                { name: "À venir", value: stats.upcoming },
              ]}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#4DB5A6" radius={[8, 8, 0, 0]}>
                {[
                  { name: "Terminées", value: stats.completed },
                  { name: "En cours", value: stats.inProgress },
                  { name: "À venir", value: stats.upcoming },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>
        <article className="card">
          <header className="home-panel-header">
            <div>
              <p className="muted">Timeline</p>
              <h3 className="title-md">Parcours récent</h3>
            </div>
          </header>
          <ol className="timeline">
            {recentTimeline.length === 0 ? (
              <p className="muted">Votre parcours de formation apparaîtra ici.</p>
            ) : (
              recentTimeline.map((item: any) => {
                const enrollment = enrollments.find((e) => e.training.id === item.id) || item;
                return (
                  <li key={item.id || enrollment.id} className="timeline__item">
                    <div className="home-timeline-row">
                      <strong>{item.title || enrollment.training.title}</strong>
                      <span className="muted">
                        {item.completedAt
                          ? `Terminée le ${new Date(item.completedAt).toLocaleDateString("fr-BE")}`
                          : enrollment.training.startDate
                          ? new Date(enrollment.training.startDate).toLocaleDateString("fr-BE")
                          : "En ligne"}
                      </span>
                    </div>
                    <span className="badge badge-new">{item.status || enrollment.status}</span>
                  </li>
                );
              })
            )}
          </ol>
        </article>
      </div>

      <div className="grid-2">
        <article className="card">
          <header className="home-panel-header">
            <div>
              <p className="muted">Ma prochaine formation</p>
              <h3 className="title-md">{nextTraining?.training.title ?? "Planifiez votre prochaine session"}</h3>
            </div>
            <span className="badge badge-new">Countdown</span>
          </header>
          {nextTraining ? (
            <>
              <p className="muted">
                {nextTraining.training.startDate
                  ? new Date(nextTraining.training.startDate).toLocaleString("fr-BE")
                  : "À la demande"}
              </p>
              <p className="muted">
                <Icon name="users" size={16} aria-hidden /> {nextTraining.training.enrollments?.length ?? 0}/
                {nextTraining.training.maxParticipants ?? 0} participants
              </p>
              <div className="home-next-card__countdown" style={{ marginTop: "1.5rem" }}>
                <NavLinkButton />
              </div>
            </>
          ) : (
            <p className="muted">Aucune inscription enregistrée. Explorez le catalogue pour rester à jour.</p>
          )}
        </article>
      </div>

      <article className="card">
        <header className="home-panel-header">
          <div>
            <p className="muted">Formations à venir</p>
            <h3 className="title-md">Vos prochaines sessions</h3>
          </div>
        </header>
        <ul className="upcoming-list">
          {enrollments.length === 0 ? (
            <p className="muted">Aucune formation inscrite. Explorez le catalogue pour démarrer.</p>
          ) : (
            enrollments.map((enrollment) => (
              <li key={enrollment.id}>
                <div>
                  <strong>{enrollment.training.title}</strong>
                  <span className="muted">
                    {enrollment.training.startDate
                      ? new Date(enrollment.training.startDate).toLocaleString("fr-BE")
                      : "En ligne"}
                  </span>
                </div>
                <span className="badge badge-new">{enrollment.status}</span>
              </li>
            ))
          )}
        </ul>
      </article>

      <article className="card">
        <header className="home-panel-header">
          <div>
            <p className="muted">Actualités</p>
            <h3 className="title-md">Informations SOINS+</h3>
          </div>
        </header>
        <div className="news-carousel">
          {news.length === 0 ? (
            <p className="muted">Aucune actualité disponible pour le moment.</p>
          ) : (
            news.map((item: any) => (
              <div key={item.id} className="news-card">
                <p className="muted">{item.author ?? "SOINS+ Équipe"}</p>
                <h4>{item.title}</h4>
                <span className="badge badge-new">Mis à jour le {new Date(item.publishedAt).toLocaleDateString("fr-BE")}</span>
              </div>
            ))
          )}
        </div>
      </article>
      </div>
    </section>
  );
}

const StatsCard = ({ label, value, trend }: { label: string; value: number; trend: string }) => (
  <div className="card home-stat-card">
    <p className="muted">{label}</p>
    <h3 className="title-md">{value}</h3>
    <span className="badge badge-new">{trend}</span>
  </div>
);

const NavLinkButton = () => {
  return (
    <NavLink to="/app/catalogue" className="btn btn-primary">
      Voir la fiche formation
    </NavLink>
  );
};

function generateMonthlyData(totalHours: number, yearlyGoal: number) {
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const currentMonth = new Date().getMonth();
  const monthlyGoal = yearlyGoal / 12;
  
  // Calculer la progression cumulative
  let cumulativeHours = 0;
  return months.map((month, index) => {
    if (index <= currentMonth) {
      // Répartir les heures complétées de manière progressive
      cumulativeHours = (totalHours / (currentMonth + 1)) * (index + 1);
    }
    return {
      month,
      completed: Math.max(0, cumulativeHours),
      goal: monthlyGoal,
    };
  });
}

