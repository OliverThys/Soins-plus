import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../services/api.js";
import { Icon } from "../components/Icon.js";
import { useState } from "react";

export function SubscriptionPage() {
  const subscriptionQuery = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      try {
        return (await api.get("/billing/subscription")).data;
      } catch (error: any) {
        return { active: false };
      }
    },
  });

  const userQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        return (await api.get("/me")).data;
      } catch (error: any) {
        return null;
      }
    },
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/billing/portal");
      return response.data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  const subscription = subscriptionQuery.data;

  if (subscriptionQuery.isLoading) {
    return (
      <section className="page">
        <div className="container">
          <div className="card">
            <p className="muted">Chargement...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="container">
        {(subscription?.active || userQuery.data?.subscriptionActive) ? (
          <ActiveSubscriptionView subscription={subscription} portalMutation={portalMutation} />
        ) : (
          <SubscribeView />
        )}
      </div>
    </section>
  );
}

function SubscribeView() {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");

  const pricesQuery = useQuery({
    queryKey: ["billing-prices"],
    queryFn: async () => {
      try {
        const response = await api.get("/billing/prices");
        console.log("📊 Prix récupérés depuis l'API:", response.data);
        return response.data;
      } catch (error: any) {
        console.error("❌ Erreur récupération prix:", error);
        throw error;
      }
    },
    retry: 2,
  });

  const checkoutMutation = useMutation({
    mutationFn: async (planType: "monthly" | "yearly") => {
      const response = await api.post("/billing/checkout", { planType });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  const handleSubscribe = () => {
    checkoutMutation.mutate(selectedPlan);
  };

  const features = [
    { icon: "catalog", title: "Catalogue complet", description: "Accès illimité à toutes les formations continues" },
    { icon: "video", title: "Capsules vidéo", description: "Formations en ligne disponibles 24/7" },
    { icon: "learning", title: "Sessions présentiel", description: "Formations pratiques avec experts" },
    { icon: "document", title: "Certificats automatiques", description: "Attestations INAMI générées automatiquement" },
    { icon: "legal", title: "Assistance juridique", description: "Support dédié pour vos questions" },
    { icon: "clock", title: "Accès permanent", description: "Consultez vos formations à tout moment" },
  ];

  return (
    <div className="subscription-page">
      {/* Hero Section */}
      <div className="subscription-hero">
        <div className="subscription-hero__content">
          <p className="eyebrow">Abonnement SOINS+</p>
          <h1 className="title-xl">Développez vos compétences professionnelles</h1>
          <p className="subscription-hero__description">
            Accédez à un catalogue complet de formations continues accréditées INAMI. 
            Formations vidéo, sessions présentiel et assistance juridique inclus.
          </p>
        </div>
      </div>

      {/* Plans Section */}
      <div className="subscription-plans">
        <div className="subscription-plans__toggle">
          <button
            type="button"
            className={`subscription-toggle__button ${selectedPlan === "monthly" ? "subscription-toggle__button--active" : ""}`}
            onClick={() => setSelectedPlan("monthly")}
          >
            Mensuel
          </button>
          <button
            type="button"
            className={`subscription-toggle__button ${selectedPlan === "yearly" ? "subscription-toggle__button--active" : ""}`}
            onClick={() => setSelectedPlan("yearly")}
          >
            Annuel
            <span className="subscription-badge">Économisez 20%</span>
          </button>
        </div>

        <div className="subscription-plans__grid">
          <div className={`subscription-plan-card ${selectedPlan === "monthly" ? "subscription-plan-card--selected" : ""}`}>
            <div className="subscription-plan-card__header">
              <h3 className="title-md">Plan mensuel</h3>
              <div className="subscription-plan-card__price">
                {pricesQuery.isLoading ? (
                  <span className="muted">Chargement...</span>
                ) : pricesQuery.data?.monthly !== null && pricesQuery.data?.monthly !== undefined ? (
                  <>
                    <span className="subscription-plan-card__amount">{pricesQuery.data.monthly.amount}</span>
                    <span className="subscription-plan-card__currency">€</span>
                    <span className="subscription-plan-card__period">/mois</span>
                  </>
                ) : (
                  <span className="muted">Non disponible</span>
                )}
              </div>
            </div>
            <ul className="subscription-plan-card__features">
              <li>
                <Icon name="check-circle" size={20} />
                <span>Toutes les formations</span>
              </li>
              <li>
                <Icon name="check-circle" size={20} />
                <span>Accès illimité 24/7</span>
              </li>
              <li>
                <Icon name="check-circle" size={20} />
                <span>Certificats automatiques</span>
              </li>
              <li>
                <Icon name="check-circle" size={20} />
                <span>Assistance juridique</span>
              </li>
            </ul>
            <button
              type="button"
              className={`btn ${selectedPlan === "monthly" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setSelectedPlan("monthly")}
            >
              {selectedPlan === "monthly" ? "Sélectionné" : "Sélectionner"}
            </button>
          </div>

          <div className={`subscription-plan-card subscription-plan-card--featured ${selectedPlan === "yearly" ? "subscription-plan-card--selected" : ""}`}>
            <div className="subscription-plan-card__badge">Recommandé</div>
            <div className="subscription-plan-card__header">
              <h3 className="title-md">Plan annuel</h3>
              <div className="subscription-plan-card__price">
                {pricesQuery.isLoading ? (
                  <span className="muted">Chargement...</span>
                ) : pricesQuery.data?.yearly !== null && pricesQuery.data?.yearly !== undefined ? (
                  <>
                    <span className="subscription-plan-card__amount">{pricesQuery.data.yearly.amount}</span>
                    <span className="subscription-plan-card__currency">€</span>
                    <span className="subscription-plan-card__period">/mois</span>
                  </>
                ) : (
                  <span className="muted">Non disponible</span>
                )}
              </div>
              {pricesQuery.data?.monthly && pricesQuery.data?.yearly && (
                <p className="subscription-plan-card__savings">
                  Économisez {((pricesQuery.data.monthly.amount * 12) - (pricesQuery.data.yearly.amount * 12)).toFixed(0)}€ par an
                </p>
              )}
            </div>
            <ul className="subscription-plan-card__features">
              <li>
                <Icon name="check-circle" size={20} />
                <span>Toutes les formations</span>
              </li>
              <li>
                <Icon name="check-circle" size={20} />
                <span>Accès illimité 24/7</span>
              </li>
              <li>
                <Icon name="check-circle" size={20} />
                <span>Certificats automatiques</span>
              </li>
              <li>
                <Icon name="check-circle" size={20} />
                <span>Assistance juridique</span>
              </li>
              <li>
                <Icon name="check-circle" size={20} />
                <span>Paiement unique annuel</span>
              </li>
            </ul>
            <button
              type="button"
              className={`btn ${selectedPlan === "yearly" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setSelectedPlan("yearly")}
            >
              {selectedPlan === "yearly" ? "Sélectionné" : "Sélectionner"}
            </button>
          </div>
        </div>

        <div className="subscription-cta">
          <button
            className="btn btn-primary btn-large"
            onClick={handleSubscribe}
            disabled={checkoutMutation.isPending}
          >
            {checkoutMutation.isPending ? "Redirection..." : "Souscrire maintenant"}
          </button>
          <p className="subscription-cta__guarantee">
            <Icon name="shield" size={18} />
            Paiement sécurisé par Stripe • Annulation à tout moment
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="subscription-features">
        <h2 className="title-lg" style={{ textAlign: "center", marginBottom: "3rem" }}>
          Tout ce dont vous avez besoin pour votre développement professionnel
        </h2>
        <div className="subscription-features__grid">
          {features.map((feature, index) => (
            <div key={index} className="subscription-feature-card">
              <div className="subscription-feature-card__icon">
                <Icon name={feature.icon as any} size={32} />
              </div>
              <h3 className="title-sm">{feature.title}</h3>
              <p className="muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActiveSubscriptionView({ subscription, portalMutation }: { subscription: any; portalMutation: any }) {
  return (
    <div className="page-shell">
      <header className="card card--gradient">
        <p className="eyebrow">Gestion d'abonnement</p>
        <h1 className="title-lg">Mon abonnement SOINS+</h1>
        <p>Gérez votre abonnement, consultez votre historique de paiement et modifiez votre plan.</p>
      </header>

      <div className="grid-2">
        <article className="card">
          <div className="stack">
            <div className="home-panel-header">
              <div>
                <p className="muted">Statut</p>
                <h2 className="title-md">Abonnement actif</h2>
              </div>
              <span className="badge badge-new">Actif</span>
            </div>

            {subscription.plan && (
              <div className="training-meta">
                <div className="training-meta__row">
                  <span>
                    <Icon name="calendar" size={16} aria-hidden /> Plan
                  </span>
                  <span>
                    {subscription.plan.recurring?.interval === "month" ? "Mensuel" : "Annuel"}
                  </span>
                </div>
                {subscription.plan.unit_amount && (
                  <div className="training-meta__row">
                    <span>
                      <Icon name="euro" size={16} aria-hidden /> Montant
                    </span>
                    <span>{(subscription.plan.unit_amount / 100).toFixed(2)} €</span>
                  </div>
                )}
                {subscription.currentPeriodEnd && (
                  <div className="training-meta__row">
                    <span>
                      <Icon name="clock" size={16} aria-hidden /> Prochain paiement
                    </span>
                    <span>
                      {new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString("fr-BE")}
                    </span>
                  </div>
                )}
                {subscription.cancelAtPeriodEnd && (
                  <div className="training-meta__row">
                    <span className="muted">Annulation programmée</span>
                    <span className="badge badge-new">À la fin de la période</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </article>

        <article className="card">
          <div className="stack">
            <h2 className="title-md">Actions</h2>
            <p className="muted">
              Accédez au portail client Stripe pour gérer votre abonnement, modifier votre plan,
              mettre à jour votre méthode de paiement ou annuler votre abonnement.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => portalMutation.mutate()}
              disabled={portalMutation.isPending}
            >
              {portalMutation.isPending ? "Chargement..." : "Gérer mon abonnement"}
            </button>
          </div>
        </article>

        <PaymentHistoryCard />
      </div>
    </div>
  );
}

function PaymentHistoryCard() {
  const paymentsQuery = useQuery({
    queryKey: ["payments"],
    queryFn: async () => (await api.get("/billing/payments")).data,
  });

  const payments = paymentsQuery.data || [];

  return (
    <article className="card">
      <div className="stack">
        <h2 className="title-md">Historique des paiements</h2>
        {paymentsQuery.isLoading ? (
          <p className="muted">Chargement...</p>
        ) : payments.length === 0 ? (
          <p className="muted">Aucun paiement enregistré</p>
        ) : (
          <div className="stack--sm">
            {payments.map((payment: any) => (
              <div key={payment.id} className="training-meta__row" style={{ padding: "0.75rem", borderBottom: "1px solid var(--color-border)" }}>
                <div>
                  <strong>{new Date(payment.date).toLocaleDateString("fr-BE")}</strong>
                  <span className="muted" style={{ marginLeft: "0.5rem" }}>
                    {payment.amount.toFixed(2)} {payment.currency.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span className={`badge ${payment.status === "paid" ? "badge-new" : ""}`}>
                    {payment.status === "paid" ? "Payé" : payment.status}
                  </span>
                  {payment.hostedInvoiceUrl && (
                    <a
                      href={payment.hostedInvoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost"
                      style={{ fontSize: "0.85rem" }}
                    >
                      Voir facture
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
