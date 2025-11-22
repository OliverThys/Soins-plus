import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api.js";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Icon } from "../../components/Icon.js";
import { useAlert } from "../../context/AlertContext.js";

interface ConfigSection {
  title: string;
  description: string;
  category: string;
  fields: Array<{
    key: string;
    label: string;
    type?: "text" | "password" | "url";
    placeholder?: string;
    description?: string;
  }>;
}

// Mapping des icônes et couleurs pour chaque service
const serviceConfig: Record<string, { icon: "euro" | "document" | "shield" | "star" | "users" | "clock" | "check"; color: string }> = {
  stripe: { icon: "euro", color: "#635BFF" },
  postmark: { icon: "document", color: "#FF6B35" },
  mailtrap: { icon: "document", color: "#10B981" },
  storage: { icon: "shield", color: "#0078D4" },
  sentry: { icon: "star", color: "#362D59" },
  clarity: { icon: "users", color: "#00A4EF" },
  redis: { icon: "clock", color: "#DC382D" },
  clamav: { icon: "check", color: "#00A859" },
};

const configSections: ConfigSection[] = [
  {
    title: "Stripe",
    description: "Configuration des paiements et abonnements",
    category: "stripe",
    fields: [
      {
        key: "STRIPE_SECRET_KEY",
        label: "Clé secrète API",
        type: "password",
        placeholder: "sk_test_...",
        description: "Clé secrète Stripe (mode test ou production)",
      },
      {
        key: "STRIPE_WEBHOOK_SECRET",
        label: "Secret Webhook",
        type: "password",
        placeholder: "whsec_...",
        description: "Secret pour valider les webhooks Stripe",
      },
      {
        key: "STRIPE_PRICE_ID_MONTHLY",
        label: "ID Prix Mensuel",
        type: "text",
        placeholder: "price_...",
        description: "ID du prix d'abonnement mensuel",
      },
      {
        key: "STRIPE_PRICE_ID_YEARLY",
        label: "ID Prix Annuel",
        type: "text",
        placeholder: "price_...",
        description: "ID du prix d'abonnement annuel",
      },
    ],
  },
  {
    title: "Postmark",
    description: "Configuration de l'envoi d'emails (production)",
    category: "postmark",
    fields: [
      {
        key: "POSTMARK_TOKEN",
        label: "Token API",
        type: "password",
        placeholder: "xxxx-xxxx-xxxx",
        description: "Token d'API Postmark pour l'envoi d'emails",
      },
    ],
  },
  {
    title: "Mailtrap",
    description: "Configuration de l'envoi d'emails (développement)",
    category: "mailtrap",
    fields: [
      {
        key: "MAILTRAP_USER",
        label: "Utilisateur Mailtrap",
        type: "text",
        placeholder: "votre-username",
        description: "Nom d'utilisateur Mailtrap (sandbox.smtp.mailtrap.io)",
      },
      {
        key: "MAILTRAP_PASS",
        label: "Mot de passe Mailtrap",
        type: "password",
        placeholder: "votre-password",
        description: "Mot de passe Mailtrap pour le développement",
      },
    ],
  },
  {
    title: "Azure Blob Storage",
    description: "Configuration du stockage de fichiers (diplômes, certificats)",
    category: "storage",
    fields: [
      {
        key: "STORAGE_URL",
        label: "URL du compte de stockage",
        type: "url",
        placeholder: "https://storageaccount.blob.core.windows.net/diplomes",
        description: "URL de base du compte Azure Blob Storage",
      },
      {
        key: "STORAGE_SAS",
        label: "Signature d'accès partagé (SAS)",
        type: "password",
        placeholder: "?sv=...&sig=...",
        description: "Token SAS pour l'accès au stockage",
      },
    ],
  },
  {
    title: "Sentry",
    description: "Configuration du monitoring d'erreurs",
    category: "sentry",
    fields: [
      {
        key: "SENTRY_DSN",
        label: "DSN Sentry",
        type: "text",
        placeholder: "https://xxx@xxx.ingest.sentry.io/xxx",
        description: "Data Source Name pour Sentry (backend)",
      },
    ],
  },
  {
    title: "Microsoft Clarity",
    description: "Configuration de l'analytics et heatmaps",
    category: "clarity",
    fields: [
      {
        key: "CLARITY_PROJECT_ID",
        label: "ID Projet Clarity",
        type: "text",
        placeholder: "xxxx",
        description: "ID du projet Microsoft Clarity",
      },
    ],
  },
  {
    title: "Redis",
    description: "Configuration du cache (optionnel)",
    category: "redis",
    fields: [
      {
        key: "REDIS_URL",
        label: "URL Redis",
        type: "url",
        placeholder: "redis://localhost:6379",
        description: "URL de connexion Redis pour le cache",
      },
    ],
  },
  {
    title: "ClamAV",
    description: "Configuration de l'antivirus (optionnel)",
    category: "clamav",
    fields: [
      {
        key: "CLAMAV_HOST",
        label: "Hôte ClamAV",
        type: "text",
        placeholder: "localhost",
        description: "Adresse du serveur ClamAV",
      },
      {
        key: "CLAMAV_PORT",
        label: "Port ClamAV",
        type: "text",
        placeholder: "3310",
        description: "Port du serveur ClamAV",
      },
    ],
  },
];

export function AdminConfigPage() {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const configQuery = useQuery({
    queryKey: ["admin-config"],
    queryFn: async () => (await api.get("/admin/config")).data,
  });

  const updateMutation = useMutation({
    mutationFn: (configs: Array<{ key: string; value?: string; category: string }>) =>
      api.patch("/admin/config/bulk", { configs }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-config"] });
      showAlert("Configuration mise à jour avec succès", "success");
    },
    onError: (error: any) => {
      showAlert(error.response?.data?.message || "Erreur lors de la mise à jour", "error");
    },
  });

  const toggleSection = (category: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedSections(newExpanded);
  };

  const handleSubmit = (section: ConfigSection, formData: Record<string, string>) => {
    const configs = section.fields.map((field) => ({
      key: field.key,
      value: formData[field.key] || "",
      category: section.category,
      description: field.description,
    }));

    updateMutation.mutate(configs);
  };

  if (configQuery.isLoading) {
    return (
      <section className="page page--cinematic">
        <div className="page-shell admin-page">
          <p className="muted">Chargement de la configuration...</p>
        </div>
      </section>
    );
  }

  const configData: Record<string, Array<{ key: string; value: string }>> = configQuery.data || {};

  return (
    <section className="page page--cinematic">
      <div className="page-shell admin-page">
        <header className="home-panel-header">
          <div>
            <h1 className="title-lg">Configuration</h1>
            <p className="muted">Gérez les services externes et les paramètres de l'application</p>
          </div>
        </header>

        <div className="config-sections-grid">
          {configSections.map((section) => {
            const isExpanded = expandedSections.has(section.category);
            const sectionConfig = configData[section.category] || [];
            const configMap = new Map(sectionConfig.map((c) => [c.key, c.value || ""]));

            return (
              <ConfigSectionForm
                key={section.category}
                section={section}
                isExpanded={isExpanded}
                onToggle={() => toggleSection(section.category)}
                initialValues={Object.fromEntries(
                  section.fields.map((field) => [field.key, configMap.get(field.key) || ""])
                )}
                onSubmit={(formData) => handleSubmit(section, formData)}
                isSubmitting={updateMutation.isPending}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ConfigSectionForm({
  section,
  isExpanded,
  onToggle,
  initialValues,
  onSubmit,
  isSubmitting,
}: {
  section: ConfigSection;
  isExpanded: boolean;
  onToggle: () => void;
  initialValues: Record<string, string>;
  onSubmit: (data: Record<string, string>) => void;
  isSubmitting: boolean;
}) {
  const form = useForm({ defaultValues: initialValues });
  const serviceInfo = serviceConfig[section.category] || { icon: "document" as const, color: "#4DB5A6" };

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <div className={`config-section-card ${isExpanded ? "config-section-card--expanded" : ""}`}>
      <div
        className="config-section-card__header"
        onClick={onToggle}
        style={{ "--service-color": serviceInfo.color } as React.CSSProperties}
      >
        <div className="config-section-card__header-content">
          <div className="config-section-card__icon" style={{ backgroundColor: `${serviceInfo.color}15`, color: serviceInfo.color }}>
            <Icon name={serviceInfo.icon} size={18} />
          </div>
          <div className="config-section-card__title-group">
            <h2 className="config-section-card__title">{section.title}</h2>
            <p className="config-section-card__description">{section.description}</p>
          </div>
        </div>
        <div className={`config-section-card__toggle ${isExpanded ? "config-section-card__toggle--expanded" : ""}`}>
          <Icon name={isExpanded ? "x" : "plus"} size={16} aria-hidden />
        </div>
      </div>

      {isExpanded && (
        <div className="config-section-card__content">
          <form onSubmit={handleSubmit} className="config-form">
            {section.fields.map((field) => (
              <div key={field.key} className="config-form__field">
                <label className="config-form__label">
                  <span className="config-form__label-text">{field.label}</span>
                  <input
                    className="config-form__input"
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    {...form.register(field.key)}
                  />
                  {field.description && (
                    <p className="config-form__help">{field.description}</p>
                  )}
                </label>
              </div>
            ))}
            <button
              type="submit"
              className="config-form__submit btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Icon name="clock" size={14} />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Icon name="check" size={14} />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

