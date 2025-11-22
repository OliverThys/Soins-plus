import clsx from "clsx";
import { Link } from "react-router-dom";
import { Icon } from "./Icon.js";

type Training = {
  id: string;
  title: string;
  theme: string;
  type: string;
  startDate?: string;
  isNew?: boolean;
  thumbnailUrl?: string;
  trainer?: { user?: { firstName: string; lastName: string } };
  maxParticipants?: number;
  enrollments?: Array<{ id: string }>;
  location?: string;
  durationMinutes?: number;
  accreditation?: boolean;
};

export function TrainingCardLocked({ training, isAuthenticated = false }: { training: Training; isAuthenticated?: boolean }) {
  const typeLabel = training.type === "VIDEO" ? "Parcours vidéo" : training.type;
  const pillClass = clsx("pill pill-icon", training.type === "VIDEO" ? "pill-video" : "pill-presential");
  const typeIcon = training.type === "VIDEO" ? "video" : training.type === "PRESENTIEL" ? "onsite" : "remote";

  return (
    <article className={clsx("training-card", "training-card--locked", training.type === "VIDEO" && "training-card--premium")}>
      <div 
        className="training-card__media training-card__media--locked" 
        aria-hidden
        style={training.thumbnailUrl ? {
          backgroundImage: `url(${training.thumbnailUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        {training.isNew && (
          <span className="badge badge-new training-card__badge" aria-label="Nouveau">
            Nouveau
          </span>
        )}
        <span className="training-card__logo">SOINS+</span>
        <div className="training-card__lock-overlay">
          <div className="training-card__lock-icon">
            <Icon name="lock" size={48} />
          </div>
          <p className="training-card__lock-text">Contenu verrouillé</p>
          <p className="training-card__lock-subtext">Abonnez-vous pour accéder à cette formation</p>
        </div>
      </div>
      <div className="training-card__body training-card__body--locked">
        <div className="training-meta">
          <span className="chip chip--active">{training.theme}</span>
          <span className={pillClass}>
            <Icon name={typeIcon} size={16} aria-hidden /> {typeLabel}
          </span>
        </div>
        <h3 className="title-md">{training.title}</h3>
        <p className="muted">
          {training.trainer?.user
            ? `${training.trainer.user.firstName} ${training.trainer.user.lastName}`
            : "Formateur à confirmer"}
        </p>
        <div className="training-meta__row">
          <span>
            <Icon name="calendar" size={16} aria-hidden />{" "}
            {training.startDate ? new Date(training.startDate).toLocaleDateString("fr-BE") : "À la demande"}
          </span>
          <span>
            <Icon name="location" size={16} aria-hidden /> {training.location ?? "Présentiel / Distanciel"}
          </span>
        </div>
        <div className="training-meta__row">
          <span>
            <Icon name="users" size={16} aria-hidden />{" "}
            {training.maxParticipants ? `${training.enrollments?.length ?? 0}/${training.maxParticipants} places` : "Capacité flexible"}
          </span>
          <span>
            <Icon name="document" size={16} aria-hidden /> {training.durationMinutes ?? 90} min
          </span>
        </div>
        <div className="training-meta__row">
          <span>
            <Icon name="shield" size={16} aria-hidden /> {training.accreditation ? "Accréditée" : "Non accréditée"}
          </span>
        </div>
        <div className="training-card__icons">
          <Icon name="headphones" size={16} aria-label="Audio" />
          <Icon name="lab" size={16} aria-label="Atelier" />
          <Icon name="document" size={16} aria-label="Supports" />
          <Icon name="star" size={16} aria-label="Évaluation" />
        </div>
        <div className="training-card__cta">
          <Link to={!isAuthenticated ? "/login" : "/app/abonnement"} className="btn btn-primary">
            Débloquer l'accès
          </Link>
        </div>
      </div>
    </article>
  );
}

