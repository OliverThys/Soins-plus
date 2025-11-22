import React, { type InputHTMLAttributes, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../services/api.js";
import { setSessionUser, setAccessToken } from "../../services/session.js";
import { FileUpload } from "../../components/FileUpload.js";
import { Icon } from "../../components/Icon.js";
import { useAlert } from "../../context/AlertContext.js";

type RegisterForm = {
  firstName: string;
  lastName: string;
  nickname?: string;
  inami: string;
  phone: string;
  email: string;
  password: string;
  diplomaUrl: string;
};

export function RegisterPage() {
  const { register, handleSubmit, formState, setValue } = useForm<RegisterForm>({
    mode: "onBlur",
  });
  const { errors } = formState;
  const [diplomaFile, setDiplomaFile] = useState<File | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly" | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isAccountCreated, setIsAccountCreated] = useState(false);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showAlert } = useAlert();

  // Vérifier si on revient d'un checkout annulé ou réussi
  const canceled = searchParams.get("canceled") === "true";
  const success = searchParams.get("success") === "true";
  const sessionId = searchParams.get("session_id");

  // Vérifier le statut de la session si on revient d'un checkout réussi
  useEffect(() => {
    if (success && sessionId) {
      const checkSession = async () => {
        try {
          const response = await api.get(`/billing/checkout/${sessionId}`);
          if (response.data.status === "complete" && response.data.paymentStatus === "paid") {
            showAlert("Abonnement activé avec succès !", "success");
            // Rediriger vers l'espace pro après un court délai
            setTimeout(() => {
              navigate("/app");
            }, 2000);
          }
        } catch (error) {
          console.error("Erreur vérification session:", error);
        }
      };
      checkSession();
    }
  }, [success, sessionId, navigate, showAlert]);

  const onSubmit = handleSubmit(async (values) => {
    if (!diplomaFile) {
      showAlert("Veuillez télécharger votre diplôme", "error");
      return;
    }

    console.log("📝 Soumission du formulaire:", { values, diplomaFile: diplomaFile.name });

    try {
      // Créer le compte sans abonnement
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && key !== "diplomaUrl") {
          formData.append(key, value as string);
        }
      });
      formData.append("file", diplomaFile);
      // Ne pas envoyer planType pour créer un compte sans abonnement

      const response = await api.post("/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSessionUser(response.data.user.id);
      if (response.data.accessToken) {
        setAccessToken(response.data.accessToken);
      }

      setIsAccountCreated(true);
      setCreatedUserId(response.data.user.id);

      showAlert("Compte créé avec succès !", "success");

      // Si l'utilisateur a sélectionné un plan, créer la session checkout
      if (selectedPlan) {
        await handleSubscribe(selectedPlan);
      }
    } catch (error: any) {
      showAlert(error.response?.data?.message || "Erreur lors de la création du compte", "error");
    }
  });

  const handleSubscribe = async (planType: "monthly" | "yearly") => {
    if (!createdUserId) {
      showAlert("Veuillez d'abord créer votre compte", "error");
      return;
    }

    setIsSubscribing(true);
    try {
      const response = await api.post("/billing/checkout", { planType });
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      showAlert(error.response?.data?.message || "Erreur lors de la création de la session de paiement", "error");
      setIsSubscribing(false);
    }
  };

  const handleDiplomaSelect = (file: File) => {
    setDiplomaFile(file);
    setValue("diplomaUrl", "file-selected", { shouldValidate: true });
  };

  // Si le compte est créé, afficher l'option de souscription
  if (isAccountCreated) {
    return (
      <section className="page auth-page">
        <div className="container">
          <div className="card card--gradient" style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center", padding: "3rem" }}>
            <div style={{ marginBottom: "2rem" }}>
              <Icon name="check-circle" size={48} style={{ color: "var(--success-500)", marginBottom: "1rem" }} />
              <h1 className="title-lg">Compte créé avec succès !</h1>
              <p className="muted" style={{ marginTop: "1rem" }}>
                Votre compte a été créé. Vous pouvez maintenant souscrire à un abonnement pour accéder à toutes les formations.
              </p>
            </div>

            <div className="stack" style={{ marginTop: "2rem", gap: "1.5rem" }}>
              <div>
                <h2 className="title-md" style={{ marginBottom: "1rem" }}>Choisissez votre abonnement</h2>
                <div className="stack--sm" style={{ marginBottom: "1.5rem" }}>
                  <label className="field field--radio" style={{ padding: "1rem", border: "1px solid var(--color-border)", borderRadius: "8px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="plan"
                      value="monthly"
                      checked={selectedPlan === "monthly"}
                      onChange={() => setSelectedPlan("monthly")}
                    />
                    <div style={{ marginLeft: "0.75rem", flex: 1 }}>
                      <strong>Plan mensuel</strong>
                      <p className="muted" style={{ marginTop: "0.25rem", fontSize: "0.9rem" }}>
                        Accès à toutes les formations, renouvellement mensuel
                      </p>
                    </div>
                  </label>
                  <label className="field field--radio" style={{ padding: "1rem", border: "1px solid var(--color-border)", borderRadius: "8px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="plan"
                      value="yearly"
                      checked={selectedPlan === "yearly"}
                      onChange={() => setSelectedPlan("yearly")}
                    />
                    <div style={{ marginLeft: "0.75rem", flex: 1 }}>
                      <strong>Plan annuel</strong>
                      <p className="muted" style={{ marginTop: "0.25rem", fontSize: "0.9rem" }}>
                        Accès à toutes les formations, économisez 20%
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                <button
                  className="btn btn-primary"
                  onClick={() => selectedPlan && handleSubscribe(selectedPlan)}
                  disabled={!selectedPlan || isSubscribing}
                >
                  {isSubscribing ? "Redirection..." : selectedPlan ? "Souscrire maintenant" : "Sélectionnez un plan"}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate("/catalogue")}
                  disabled={isSubscribing}
                >
                  Plus tard
                </button>
              </div>

              <p className="muted" style={{ fontSize: "0.85rem", marginTop: "1rem" }}>
                Vous pourrez souscrire à tout moment depuis votre compte.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page auth-page">
      <div className="container auth-grid">
        <article className="card card--gradient auth-side">
          <p className="eyebrow">Inscription</p>
          <h1 className="title-xl">Créer mon compte SOINS+</h1>
          <p>Créez votre compte pour accéder au catalogue de formations continues accréditées.</p>
          {canceled && (
            <div style={{ marginTop: "1rem", padding: "1rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
              <p style={{ color: "var(--error-500)", fontSize: "0.9rem" }}>
                Le paiement a été annulé. Vous pouvez créer votre compte et souscrire plus tard.
              </p>
            </div>
          )}
          <ul style={{ marginTop: "2rem" }}>
            <li>✅ Catalogue complet de formations</li>
            <li>✅ Capsules vidéo et sessions présentiel</li>
            <li>✅ Certificats automatiques</li>
            <li>✅ Assistance juridique dédiée</li>
          </ul>
        </article>

        <form onSubmit={onSubmit} className="form-card register-form">
          <h2 className="title-md" style={{ marginBottom: "1.5rem" }}>Informations personnelles</h2>
          
          <Input label="Prénom" {...register("firstName", { required: "Le prénom est requis" })} required />
          <Input label="Nom" {...register("lastName", { required: "Le nom est requis" })} required />
          <Input label="Pseudo (optionnel)" {...register("nickname")} />
          <Input label="Numéro INAMI" {...register("inami", { required: "Le numéro INAMI est requis" })} required />
          <Input label="Téléphone" type="tel" {...register("phone", { required: "Le téléphone est requis" })} required />
          <Input label="Email" type="email" {...register("email", { required: "L'email est requis" })} required />
          <Input label="Mot de passe" type="password" {...register("password", { required: "Le mot de passe est requis", minLength: { value: 8, message: "Le mot de passe doit contenir au moins 8 caractères" } })} required />
          
          <FileUpload
            label="Diplôme (upload sécurisé)"
            onFileSelect={handleDiplomaSelect}
            required
            autoUpload={false}
            name="file"
          />
          <input type="hidden" {...register("diplomaUrl", { required: false })} value={diplomaFile ? "file-selected" : ""} />

          <div style={{ marginTop: "2rem", padding: "1.5rem", background: "var(--color-surface-elevated)", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
            <h3 className="title-sm" style={{ marginBottom: "1rem" }}>Souhaitez-vous souscrire maintenant ?</h3>
            <p className="muted" style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
              Vous pouvez créer votre compte maintenant et souscrire à un abonnement après, ou choisir un plan directement.
            </p>
            <div className="stack--sm">
              <label className="field field--radio">
                <input
                  type="radio"
                  name="subscribe-now"
                  value="later"
                  checked={selectedPlan === null}
                  onChange={() => setSelectedPlan(null)}
                />
                <span>Créer mon compte seulement (souscrire plus tard)</span>
              </label>
              <label className="field field--radio">
                <input
                  type="radio"
                  name="subscribe-now"
                  value="monthly"
                  checked={selectedPlan === "monthly"}
                  onChange={() => setSelectedPlan("monthly")}
                />
                <span>Plan mensuel</span>
              </label>
              <label className="field field--radio">
                <input
                  type="radio"
                  name="subscribe-now"
                  value="yearly"
                  checked={selectedPlan === "yearly"}
                  onChange={() => setSelectedPlan("yearly")}
                />
                <span>Plan annuel (économisez 20%)</span>
              </label>
            </div>
          </div>

          {Object.keys(errors).length > 0 && (
            <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
              <p style={{ color: "var(--error-500)", fontSize: "0.9rem", margin: 0 }}>
                Veuillez corriger les erreurs dans le formulaire
              </p>
              {errors.firstName && <p style={{ color: "var(--error-500)", fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>{errors.firstName.message}</p>}
              {errors.lastName && <p style={{ color: "var(--error-500)", fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>{errors.lastName.message}</p>}
              {errors.email && <p style={{ color: "var(--error-500)", fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>{errors.email.message}</p>}
              {errors.password && <p style={{ color: "var(--error-500)", fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>{errors.password.message}</p>}
              {errors.inami && <p style={{ color: "var(--error-500)", fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>{errors.inami.message}</p>}
              {errors.phone && <p style={{ color: "var(--error-500)", fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>{errors.phone.message}</p>}
            </div>
          )}

          <button 
            type="submit"
            className="btn btn-primary" 
            disabled={formState.isSubmitting || !diplomaFile} 
            style={{ marginTop: "1.5rem" }}
          >
            {formState.isSubmitting ? "Création en cours..." : "Créer mon compte"}
          </button>

          <p className="muted" style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.85rem" }}>
            Déjà un compte ? <a href="/login" style={{ color: "var(--color-primary)" }}>Se connecter</a>
          </p>
        </form>
      </div>
    </section>
  );
}

const Input = React.forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: string }>(
  ({ label, ...props }, ref) => (
    <label className="field">
      <input ref={ref} className="input input--floating" placeholder=" " {...props} />
      <span className="floating-label">{label}</span>
    </label>
  )
);
Input.displayName = "RegisterInput";
