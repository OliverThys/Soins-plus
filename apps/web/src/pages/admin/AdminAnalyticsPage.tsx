import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api.js";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Icon } from "../../components/Icon.js";

const COLORS = ["#4DB5A6", "#2A6F6A", "#0F2827", "#1A3837"];

// Fonction pour diviser un texte long en 2 lignes
const formatLabel = (text: string, maxLength: number = 15) => {
  if (text.length <= maxLength) return text;
  const words = text.split(" ");
  let line1 = "";
  let line2 = "";
  
  for (const word of words) {
    if ((line1 + " " + word).length <= maxLength) {
      line1 += (line1 ? " " : "") + word;
    } else {
      line2 += (line2 ? " " : "") + word;
    }
  }
  
  return line2 ? `${line1}\n${line2}` : line1;
};

// Composant personnalisé pour les ticks de l'axe X avec support multi-lignes
const CustomTick = ({ x, y, payload }: any) => {
  const text = formatLabel(payload.value);
  const lines = text.split("\n");
  
  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line: string, index: number) => (
        <text
          key={index}
          x={0}
          y={0}
          dy={index === 0 ? 0 : 12}
          textAnchor="end"
          fill="#666"
          fontSize={11}
          transform={`rotate(-45)`}
        >
          {line}
        </text>
      ))}
    </g>
  );
};

export function AdminAnalyticsPage() {
  const analyticsQuery = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => (await api.get("/admin/analytics")).data,
  });

  const analytics = analyticsQuery.data;

  if (analyticsQuery.isLoading) {
    return (
      <section className="page page--cinematic">
        <div className="container">
          <p className="muted">Chargement des statistiques...</p>
        </div>
      </section>
    );
  }

  if (!analytics) {
    return (
      <section className="page page--cinematic">
        <div className="container">
          <p className="muted">Erreur lors du chargement des statistiques</p>
        </div>
      </section>
    );
  }

  const completionData = analytics.completionRates.byTraining.slice(0, 10).map((item: any) => ({
    name: item.trainingTitle,
    rate: Math.round(item.rate),
  }));

  const popularData = analytics.popularTrainings.map((item: any) => ({
    name: item.title,
    enrollments: item.enrollments,
    completionRate: Math.round(item.completionRate),
  }));

  return (
    <section className="page page--cinematic">
      <div className="page-shell admin-page">
        <header className="home-panel-header">
          <div>
            <p className="muted">Analytics</p>
            <h1 className="title-lg">Dashboard Analytics</h1>
            <p className="muted">Vue d'ensemble de la plateforme SOINS+</p>
          </div>
        </header>

        <div className="analytics-grid">
          <div className="analytics-card analytics-card--users">
            <div className="analytics-card__header">
              <div className="analytics-card__icon analytics-card__icon--users">
                <Icon name="users" size={24} />
              </div>
              <h2 className="analytics-card__title">Utilisateurs</h2>
            </div>
            <div className="analytics-card__stats">
              <div className="analytics-stat">
                <span className="analytics-stat__label">Total</span>
                <span className="analytics-stat__value">{analytics.users.total}</span>
              </div>
              <div className="analytics-stat">
                <span className="analytics-stat__label">Actifs</span>
                <span className="analytics-stat__value analytics-stat__value--success">{analytics.users.active}</span>
              </div>
              <div className="analytics-stat">
                <span className="analytics-stat__label">Avec abonnement</span>
                <span className="analytics-stat__value analytics-stat__value--primary">{analytics.users.withSubscription}</span>
              </div>
              <div className="analytics-stat">
                <span className="analytics-stat__label">Nouveaux ce mois</span>
                <span className="analytics-stat__value analytics-stat__value--accent">{analytics.users.newThisMonth}</span>
              </div>
            </div>
          </div>

          <div className="analytics-card analytics-card--trainings">
            <div className="analytics-card__header">
              <div className="analytics-card__icon analytics-card__icon--trainings">
                <Icon name="document" size={24} />
              </div>
              <h2 className="analytics-card__title">Formations</h2>
            </div>
            <div className="analytics-card__stats">
              <div className="analytics-stat">
                <span className="analytics-stat__label">Total</span>
                <span className="analytics-stat__value">{analytics.trainings.total}</span>
              </div>
              <div className="analytics-stat">
                <span className="analytics-stat__label">Actives</span>
                <span className="analytics-stat__value analytics-stat__value--success">{analytics.trainings.active}</span>
              </div>
              <div className="analytics-stat">
                <span className="analytics-stat__label">Terminées</span>
                <span className="analytics-stat__value">{analytics.trainings.completed}</span>
              </div>
              <div className="analytics-stat">
                <span className="analytics-stat__label">À venir</span>
                <span className="analytics-stat__value analytics-stat__value--accent">{analytics.trainings.upcoming}</span>
              </div>
            </div>
          </div>

          <div className="analytics-card analytics-card--enrollments">
            <div className="analytics-card__header">
              <div className="analytics-card__icon analytics-card__icon--enrollments">
                <Icon name="calendar" size={24} />
              </div>
              <h2 className="analytics-card__title">Inscriptions</h2>
            </div>
            <div className="analytics-card__stats">
              <div className="analytics-stat">
                <span className="analytics-stat__label">Total</span>
                <span className="analytics-stat__value">{analytics.enrollments.total}</span>
              </div>
              <div className="analytics-stat">
                <span className="analytics-stat__label">Terminées</span>
                <span className="analytics-stat__value analytics-stat__value--success">{analytics.enrollments.completed}</span>
              </div>
              <div className="analytics-stat">
                <span className="analytics-stat__label">En cours</span>
                <span className="analytics-stat__value analytics-stat__value--primary">{analytics.enrollments.inProgress}</span>
              </div>
              <div className="analytics-stat">
                <span className="analytics-stat__label">À venir</span>
                <span className="analytics-stat__value analytics-stat__value--accent">{analytics.enrollments.upcoming}</span>
              </div>
            </div>
          </div>

          <div className="analytics-card analytics-card--revenue">
            <div className="analytics-card__header">
              <div className="analytics-card__icon analytics-card__icon--revenue">
                <Icon name="star" size={24} />
              </div>
              <h2 className="analytics-card__title">Revenus</h2>
            </div>
            <div className="analytics-card__stats">
              <div className="analytics-stat">
                <span className="analytics-stat__label">Mensuel</span>
                <span className="analytics-stat__value analytics-stat__value--revenue">{analytics.revenue.monthly.toFixed(2)} €</span>
              </div>
              <div className="analytics-stat">
                <span className="analytics-stat__label">Annuel</span>
                <span className="analytics-stat__value analytics-stat__value--revenue">{analytics.revenue.yearly.toFixed(2)} €</span>
              </div>
              <div className="analytics-stat analytics-stat--highlight">
                <span className="analytics-stat__label">Total estimé</span>
                <span className="analytics-stat__value analytics-stat__value--revenue analytics-stat__value--large">{analytics.revenue.total.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-chart-card">
          <div className="analytics-chart-card__header">
            <div>
              <h2 className="analytics-chart-card__title">Taux de complétion par formation</h2>
              <p className="analytics-chart-card__subtitle">Moyenne: <strong>{Math.round(analytics.completionRates.average)}%</strong></p>
            </div>
            <div className="analytics-chart-card__badge">
              <Icon name="document" size={20} />
            </div>
          </div>
          <div className="analytics-chart-card__content">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={completionData} margin={{ bottom: 80, left: 20, right: 20, top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(77, 181, 166, 0.1)" />
                <XAxis 
                  dataKey="name" 
                  height={110}
                  interval={0}
                  tick={<CustomTick />}
                  stroke="var(--color-muted)"
                />
                <YAxis stroke="var(--color-muted)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-surface-elevated)', 
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }} 
                />
                <Bar 
                  dataKey="rate" 
                  fill="url(#completionGradient)" 
                  name="Taux de complétion (%)"
                  radius={[8, 8, 0, 0]}
                >
                  {completionData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${140 + index * 5}, 60%, ${50 + index * 2}%)`} />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4DB5A6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#2A6F6A" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-chart-card">
          <div className="analytics-chart-card__header">
            <div>
              <h2 className="analytics-chart-card__title">Formations populaires</h2>
              <p className="analytics-chart-card__subtitle">Analyse des inscriptions et taux de complétion</p>
            </div>
            <div className="analytics-chart-card__badge">
              <Icon name="star" size={20} />
            </div>
          </div>
          <div className="analytics-chart-card__content">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={popularData} margin={{ bottom: 80, left: 20, right: 20, top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(77, 181, 166, 0.1)" />
                <XAxis 
                  dataKey="name" 
                  height={110}
                  interval={0}
                  tick={<CustomTick />}
                  stroke="var(--color-muted)"
                />
                <YAxis yAxisId="left" stroke="var(--color-muted)" />
                <YAxis yAxisId="right" orientation="right" stroke="var(--color-muted)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-surface-elevated)', 
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }} 
                />
                <Legend 
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="circle"
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="enrollments" 
                  fill="url(#enrollmentsGradient)" 
                  name="Inscriptions"
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="completionRate" 
                  fill="url(#completionRateGradient)" 
                  name="Taux complétion (%)"
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="enrollmentsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4DB5A6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#2A6F6A" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="completionRateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FB923C" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#EA580C" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

