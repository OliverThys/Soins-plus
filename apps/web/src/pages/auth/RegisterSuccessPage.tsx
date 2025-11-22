import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../../services/api.js";
import { trackClarityEvent } from "../../lib/clarity.js";

export function RegisterSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"success" | "pending" | "error">("pending");

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setLoading(false);
      return;
    }

    // Vérifier le statut de la session Checkout
    const checkSession = async () => {
      try {
        const response = await api.get(`/billing/checkout/${sessionId}`);
        if (response.data.status === "complete" && response.data.paymentStatus === "paid") {
          setStatus("success");
          trackClarityEvent("subscription_completed", { sessionId });
        } else {
          setStatus("pending");
        }
      } catch (error) {
        setStatus("error");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [sessionId]);

  if (loading) {
    return (
      <section className="page auth-page">
        <div className="container">
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <h1 className="title-lg">Vérification en cours...</h1>
            <p className="muted">Veuillez patienter</p>
          </div>
        </div>
      </section>
    );
  }

  if (status === "success") {
    return (
      <section className="page auth-page">
        <div className="container">
          <div className="card card--gradient" style={{ textAlign: "center", padding: "3rem", maxWidth: "600px", margin: "0 auto" }}>
            <h1 className="title-lg">🎉 Inscription réussie !</h1>
            <p style={{ marginTop: "1rem", marginBottom: "2rem" }}>
              Votre abonnement est actif. Vous pouvez maintenant accéder à toutes les formations.
            </p>
            <button className="btn btn-primary btn-large" onClick={() => navigate("/app")}>
              Accéder à mon espace
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (status === "pending") {
    return (
      <section className="page auth-page">
        <div className="container">
          <div className="card" style={{ textAlign: "center", padding: "3rem", maxWidth: "600px", margin: "0 auto" }}>
            <h1 className="title-lg">Paiement en attente</h1>
            <p className="muted" style={{ marginTop: "1rem", marginBottom: "2rem" }}>
              Votre paiement est en cours de traitement. Vous recevrez un email de confirmation une fois le paiement validé.
            </p>
            <button className="btn btn-secondary" onClick={() => navigate("/app")}>
              Retour à l'accueil
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page auth-page">
      <div className="container">
        <div className="card" style={{ textAlign: "center", padding: "3rem", maxWidth: "600px", margin: "0 auto" }}>
          <h1 className="title-lg">Erreur</h1>
          <p className="muted" style={{ marginTop: "1rem", marginBottom: "2rem" }}>
            Une erreur est survenue lors de la vérification de votre paiement. 
            Veuillez contacter le support si le problème persiste.
          </p>
          <button className="btn btn-secondary" onClick={() => navigate("/app")}>
            Retour à l'accueil
          </button>
        </div>
      </div>
    </section>
  );
}

