import { useQuery } from "@tanstack/react-query";
import { NavLink, Link } from "react-router-dom";
import { Icon, type IconName } from "../components/Icon.js";
import { TrainingCard } from "../components/TrainingCard.js";
import { api } from "../services/api.js";
import { trackClarityEvent } from "../lib/clarity.js";

const features: Array<{ label: string; description: string; icon: IconName }> = [
  {
    label: "Formations accréditées",
    description: "Toutes nos formations sont reconnues et comptabilisées dans vos heures de formation continue obligatoire.",
    icon: "shield",
  },
  {
    label: "Apprentissage flexible",
    description: "Apprenez à votre rythme avec des capsules vidéo, des sessions live ou en présentiel selon vos préférences.",
    icon: "video",
  },
  {
    label: "Suivi automatique",
    description: "Vos attestations sont générées automatiquement et synchronisées avec votre espace professionnel.",
    icon: "document",
  },
];

const benefits: Array<{ icon: IconName; text: string }> = [
  { icon: "check", text: "Accès illimité au catalogue" },
  { icon: "check", text: "Attestations automatiques" },
  { icon: "check", text: "Support dédié" },
  { icon: "check", text: "Mises à jour régulières" },
];

export function HomePage() {
  const newsQuery = useQuery({
    queryKey: ["public-news"],
    queryFn: async () => (await api.get("/news")).data,
    retry: false, // Désactiver les retries pour éviter les boucles infinies
    refetchOnWindowFocus: false,
  });
  const trainingsQuery = useQuery({
    queryKey: ["public-trainings"],
    queryFn: async () => (await api.get("/trainings")).data,
    retry: false, // Désactiver les retries pour éviter les boucles infinies
    refetchOnWindowFocus: false,
  });

  const news = Array.isArray(newsQuery.data) ? newsQuery.data.slice(0, 3) : [];
  const trainings = Array.isArray(trainingsQuery.data) ? trainingsQuery.data : [];
  const featuredTrainings = trainings.slice(0, 6);
  const accreditedCount = trainings.filter((t: any) => t.accreditation).length;
  const videoCount = trainings.filter((t: any) => t.type === "VIDEO").length;
  const totalTrainings = trainings.length;

  return (
    <div className="home-page-new">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="container">
          <div className="home-hero__content">
            <h1 className="home-hero__title">
              Formez-vous en continu avec <span className="highlight">SOINS+</span>
            </h1>
            <p className="home-hero__subtitle">
              Plateforme de formation continue pour les professionnels de santé. Accédez à des formations accréditées,
              des capsules vidéo interactives et obtenez vos attestations automatiquement.
            </p>
            <div className="home-hero__actions">
              <NavLink
                to="/register"
                className="btn btn-primary btn-large"
                onClick={() => trackClarityEvent("cta_register_hero", { location: "hero" })}
              >
                Commencer gratuitement
              </NavLink>
              <NavLink
                to="/catalogue"
                className="btn btn-outline btn-large"
                onClick={() => trackClarityEvent("cta_catalogue_hero", { location: "hero" })}
              >
                Explorer le catalogue
              </NavLink>
            </div>
            <div className="home-hero__stats">
              <div className="stat-item">
                <strong>{totalTrainings}+</strong>
                <span>Formations disponibles</span>
              </div>
              <div className="stat-item">
                <strong>{accreditedCount}+</strong>
                <span>Formations accréditées</span>
              </div>
              <div className="stat-item">
                <strong>{videoCount}+</strong>
                <span>Capsules vidéo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="home-features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Pourquoi choisir SOINS+ ?</h2>
            <p className="section-subtitle">Une plateforme conçue pour les professionnels de santé</p>
          </div>
          <div className="features-grid">
            {features.map((feature) => (
              <div key={feature.label} className="feature-card">
                <div className="feature-card__icon">
                  <Icon name={feature.icon} size={24} aria-hidden />
                </div>
                <h3 className="feature-card__title">{feature.label}</h3>
                <p className="feature-card__description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Trainings */}
      {featuredTrainings.length > 0 && (
        <section className="home-trainings">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Formations populaires</h2>
              <p className="section-subtitle">Découvrez nos formations les plus suivies</p>
            </div>
            <div className="trainings-grid">
              {featuredTrainings.map((training: any) => (
                <TrainingCard key={training.id} training={training} />
              ))}
            </div>
            <div className="section-cta">
              <NavLink to="/catalogue" className="btn btn-secondary">
                Voir toutes les formations
              </NavLink>
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="home-how-it-works">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Comment ça fonctionne ?</h2>
            <p className="section-subtitle">Trois étapes simples pour commencer</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Choisissez votre formation</h3>
              <p className="step-description">
                Parcourez notre catalogue et sélectionnez les formations qui correspondent à vos besoins et à votre
                spécialité.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Suivez à votre rythme</h3>
              <p className="step-description">
                Accédez aux capsules vidéo, participez aux sessions live ou assistez aux formations en présentiel selon
                votre préférence.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Obtenez votre attestation</h3>
              <p className="step-description">
                Validez votre formation avec les QCM et recevez automatiquement votre attestation PDF pour vos heures
                de formation continue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits / CTA Section */}
      <section className="home-cta">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h2 className="cta-title">Prêt à commencer ?</h2>
              <p className="cta-subtitle">
                Rejoignez des milliers de professionnels de santé qui se forment avec SOINS+
              </p>
              <ul className="benefits-list">
                {benefits.map((benefit, index) => (
                  <li key={index} className="benefit-item">
                    <Icon name={benefit.icon} size={20} aria-hidden />
                    <span>{benefit.text}</span>
                  </li>
                ))}
              </ul>
              <NavLink
                to="/register"
                className="btn btn-primary btn-large"
                onClick={() => trackClarityEvent("cta_register_footer", { location: "footer_cta" })}
              >
                Démarrer maintenant
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      {news.length > 0 && (
        <section className="home-news">
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">Actualités</h2>
                <p className="section-subtitle">Restez informé des dernières nouveautés</p>
              </div>
              <NavLink to="/actualites" className="btn btn-secondary">
                Voir toutes les actualités
              </NavLink>
            </div>
            <div className="news-grid">
              {news.map((article: any) => (
                <Link key={article.id} to={`/actualites/${article.id}`} className="news-card" style={{ textDecoration: "none" }}>
                  {article.imageUrl && (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "12px 12px 0 0",
                      }}
                    />
                  )}
                  <div className="news-card__content">
                    {article.category && <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>{article.category}</p>}
                    <p className="news-card__author">{article.author ?? "SOINS+ Équipe"}</p>
                    <h3 className="news-card__title">{article.title}</h3>
                    {article.excerpt && (
                      <p className="muted" style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
                        {article.excerpt}
                      </p>
                    )}
                    <p className="news-card__date">
                      {new Date(article.publishedAt).toLocaleDateString("fr-BE", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="home-faq">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Questions fréquentes</h2>
            <p className="section-subtitle">Tout ce que vous devez savoir sur SOINS+</p>
          </div>
          <div className="faq-grid">
            <div className="faq-item">
              <h3 className="faq-question">Les formations sont-elles accréditées ?</h3>
              <p className="faq-answer">
                Oui, toutes nos formations sont reconnues et comptabilisées dans vos heures de formation continue obligatoire. 
                Les attestations sont conformes aux exigences du SPF Santé Publique.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Puis-je suivre les formations à mon rythme ?</h3>
              <p className="faq-answer">
                Absolument ! Les capsules vidéo sont disponibles 24/7. Vous pouvez les visionner quand vous le souhaitez 
                et reprendre où vous vous êtes arrêté.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Comment obtenir mon attestation ?</h3>
              <p className="faq-answer">
                Les attestations sont générées automatiquement après validation de la formation (QCM réussi). 
                Vous recevez un email avec le PDF téléchargeable dans votre espace personnel.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Puis-je annuler mon abonnement ?</h3>
              <p className="faq-answer">
                Oui, vous pouvez annuler votre abonnement à tout moment depuis votre espace personnel. 
                Vous conservez l'accès jusqu'à la fin de la période payée.
              </p>
            </div>
          </div>
          <div className="section-cta">
            <NavLink
              to="/legal"
              className="btn btn-secondary"
              onClick={() => trackClarityEvent("cta_faq_more", { location: "faq" })}
            >
              Voir toutes les questions
            </NavLink>
          </div>
        </div>
      </section>
    </div>
  );
}
