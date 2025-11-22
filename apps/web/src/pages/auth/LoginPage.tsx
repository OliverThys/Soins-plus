import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api.js";
import { setSessionUser, setAccessToken } from "../../services/session.js";

type LoginForm = {
  email: string;
  password: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<LoginForm>();
  
  const onSubmit = handleSubmit(async (values) => {
    try {
      setError(null);
      console.log("🔐 Tentative de connexion pour:", values.email);
      const response = await api.post("/auth/login", values);
      console.log("✅ Réponse reçue:", {
        userId: response.data.user?.id,
        email: response.data.user?.email,
        role: response.data.user?.role,
        hasToken: !!response.data.accessToken,
      });
      
      setSessionUser(response.data.user.id);
      setAccessToken(response.data.accessToken);
      
      // Mettre à jour le cache React Query avec les données de l'utilisateur
      queryClient.setQueryData(["me"], response.data.user);
      
      // Redirection selon le rôle et l'abonnement
      const role = response.data.user.role;
      const subscriptionActive = response.data.user.subscriptionActive;
      
      if (role === "admin") {
        console.log("🔄 Redirection admin vers /admin/formations");
        navigate("/admin/formations");
      } else if (subscriptionActive) {
        console.log("🔄 Redirection utilisateur avec abonnement vers /app");
        navigate("/app");
      } else {
        console.log("🔄 Redirection utilisateur sans abonnement vers /");
        navigate("/");
      }
    } catch (err: any) {
      console.error("❌ Erreur de connexion:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        email: values.email,
      });
      if (err.response?.status === 401) {
        setError("Email ou mot de passe incorrect.");
      } else {
        setError(`Une erreur est survenue: ${err.response?.data?.message || err.message || "Erreur inconnue"}`);
      }
    }
  });

  return (
    <section className="page auth-page">
      <div className="container auth-grid">
        <article className="card card--gradient auth-side">
          <p className="eyebrow">Espace sécurisé</p>
          <h1 className="title-xl">Connexion SOINS+</h1>
          <p>Reprenez vos parcours vidéo, validez vos QCM et récupérez vos attestations en un geste.</p>
          <ul>
            <li>Authentification renforcée Stripe Identity</li>
            <li>Synchronisation automatique des attestations</li>
            <li>Assistance juridique incluse</li>
          </ul>
        </article>
        <form onSubmit={onSubmit} className="form-card">
          <div className="field">
            <input
              className="input input--floating"
              placeholder=" "
              type="email"
              {...register("email")}
              required
              autoComplete="email"
            />
            <label className="floating-label">Email professionnel</label>
          </div>
          <div className="field">
            <input
              className="input input--floating"
              placeholder=" "
              type="password"
              {...register("password")}
              required
              autoComplete="current-password"
            />
            <label className="floating-label">Mot de passe</label>
          </div>
          <button className="btn btn-primary" disabled={formState.isSubmitting} type="submit">
            {formState.isSubmitting ? "Connexion..." : "Se connecter"}
          </button>
          {error && <p className="error-text">{error}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
            <NavLink to="/mot-de-passe-oublie" className="btn btn-ghost" style={{ textAlign: "center" }}>
              Mot de passe oublié ?
            </NavLink>
            <small style={{ textAlign: "center" }}>Besoin d'aide ? Contactez support@soins.plus</small>
          </div>
        </form>
      </div>
    </section>
  );
}

