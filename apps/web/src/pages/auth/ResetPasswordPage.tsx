import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { resetPassword } from "../../services/api.js";

type ResetForm = {
  token: string;
  password: string;
};

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<ResetForm>({
    defaultValues: {
      token: searchParams.get("token") ?? "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setError(null);
      await resetPassword(values.token, values.password);
      setDone(true);
    } catch (err) {
      setError("Lien invalide ou expiré. Demandez un nouveau courriel.");
    }
  });

  return (
    <section className="page auth-page">
      <div className="container auth-grid">
        <article className="card card--gradient auth-side">
          <p className="eyebrow">Nouveau mot de passe</p>
          <h1 className="title-xl">Sécurisez votre compte</h1>
          <p>Créez un mot de passe fort pour protéger vos données patients et vos attestations.</p>
          <ul>
            <li>• 10 caractères minimum</li>
            <li>• Mélangez lettres, chiffres et symboles</li>
            <li>• Ne réutilisez pas un ancien mot de passe</li>
          </ul>
        </article>
        <form onSubmit={onSubmit} className="form-card">
          <label className="field">
            <input
              className="input input--floating"
              placeholder=" "
              type="text"
              {...register("token")}
              required
            />
            <span className="floating-label">Code de sécurité</span>
          </label>
          <label className="field">
            <input
              className="input input--floating"
              placeholder=" "
              type="password"
              {...register("password")}
              required
              minLength={10}
              autoComplete="new-password"
            />
            <span className="floating-label">Nouveau mot de passe</span>
          </label>
          <button className="btn btn-primary" disabled={formState.isSubmitting} type="submit">
            {formState.isSubmitting ? "Mise à jour..." : "Enregistrer"}
          </button>
          {error && <p className="error-text">{error}</p>}
          {done && <p className="muted">Votre mot de passe est à jour. Vous pouvez vous connecter.</p>}
        </form>
      </div>
    </section>
  );
}

