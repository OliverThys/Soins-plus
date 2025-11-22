import { useState } from "react";
import { useForm } from "react-hook-form";
import { requestPasswordReset } from "../../services/api.js";

type ForgotForm = {
  email: string;
};

export function ForgotPasswordPage() {
  const { register, handleSubmit, formState } = useForm<ForgotForm>();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setError(null);
      await requestPasswordReset(values.email);
      setSubmitted(true);
    } catch (err) {
      setError("Impossible d'envoyer l'email pour le moment. Réessayez plus tard.");
    }
  });

  return (
    <section className="page auth-page">
      <div className="container auth-grid">
        <article className="card card--gradient auth-side">
          <p className="eyebrow">Sécurité des comptes</p>
          <h1 className="title-xl">Réinitialiser mon mot de passe</h1>
          <p>Recevez un lien sécurisé pour définir un nouveau mot de passe et reprendre vos parcours.</p>
          <ul>
            <li>• Lien valable 60 minutes</li>
            <li>• Vérification par email professionnel</li>
            <li>• Assistance prioritaire en cas de blocage</li>
          </ul>
        </article>
        <form onSubmit={onSubmit} className="form-card">
          <label className="field">
            <input
              className="input input--floating"
              placeholder=" "
              type="email"
              {...register("email")}
              required
              autoComplete="email"
            />
            <span className="floating-label">Email professionnel</span>
          </label>
          <button className="btn btn-primary" disabled={formState.isSubmitting || submitted} type="submit">
            {formState.isSubmitting ? "Envoi..." : "Recevoir le lien sécurisé"}
          </button>
          {error && <p className="error-text">{error}</p>}
          {submitted && <p className="muted">Un email vient d'être envoyé si ce compte existe.</p>}
        </form>
      </div>
    </section>
  );
}

