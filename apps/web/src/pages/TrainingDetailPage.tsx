import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { QuizForm } from "../components/QuizForm.js";
import { VideoPlayer } from "../components/VideoPlayer.js";
import { Icon } from "../components/Icon.js";
import { api, enrollTraining, getTraining, trackChapterProgress } from "../services/api.js";

type TrainingDetail = {
  id: string;
  title: string;
  theme: string;
  type: string;
  summary: string;
  description: string;
  startDate?: string;
  location?: string;
  link?: string;
  durationMinutes?: number;
  accreditation?: boolean;
  maxParticipants?: number;
  enrollments?: Array<{ id: string }>;
  trainer?: { user?: { firstName: string; lastName: string } };
  videoUrl?: string;
  chapters?: Array<{
    id: string;
    title: string;
    order: number;
    duration?: number;
    videoUrl?: string;
  }>;
  quiz?: {
    passingScore: number;
    questions: Array<any>;
  };
  progress?: Array<{ chapterId: string }>;
};

export function TrainingDetailPage() {
  const { id } = useParams();
  const trainingQuery = useQuery<TrainingDetail>({
    queryKey: ["training", id],
    queryFn: () => getTraining(id!),
    enabled: Boolean(id),
  });

  const enrollMutation = useMutation({
    mutationFn: () => enrollTraining(id!),
  });

  const quizMutation = useMutation({
    mutationFn: (payload: Record<string, string[]>) =>
      api.post(`/trainings/${id}/quiz/submit`, {
        answers: Object.entries(payload).map(([questionId, answerIds]) => ({
          questionId,
          answerIds,
        })),
      }),
  });

  if (trainingQuery.isLoading) {
    return <p className="muted">Chargement…</p>;
  }

  const training = trainingQuery.data;
  const [activeChapterId, setActiveChapterId] = useState<string | null>(() => training?.chapters?.[0]?.id ?? null);

  if (!training) {
    return <p className="muted">Formation introuvable.</p>;
  }

  useEffect(() => {
    if (!training?.chapters?.length) return;
    const exists = training.chapters.some((chapter) => chapter.id === activeChapterId);
    if (!activeChapterId || !exists) {
      setActiveChapterId(training.chapters[0].id);
    }
  }, [training?.chapters, activeChapterId]);

  const chapters = training.chapters ?? [];
  const progressSet = useMemo(
    () => new Set((training.progress ?? []).map((entry) => entry.chapterId)),
    [training.progress]
  );
  const progressDetail = (training as any).progressDetail;
  const completedPercent = progressDetail?.percent ?? (chapters.length ? Math.round((progressSet.size / chapters.length) * 100) : 0);

  const currentChapter = chapters.find((chapter) => chapter.id === activeChapterId) ?? chapters[0];
  const currentVideoSrc = currentChapter?.videoUrl ?? training.videoUrl;

  const handleChapterPlay = async (chapterId?: string) => {
    if (!chapterId || !training?.id) return;
    await trackChapterProgress(training.id, chapterId);
    await trainingQuery.refetch();
  };

  return (
    <section className="page page--cinematic">
      <div className="container">
        <div className="page-shell training-detail">
          <header className="card card--gradient catalog-hero">
            <p className="eyebrow">{training.theme}</p>
            <h1 className="title-lg">{training.title}</h1>
            <div className="training-meta__row">
              <span>
                <Icon name="calendar" size={16} aria-hidden />{" "}
                {training.startDate ? new Date(training.startDate).toLocaleString("fr-BE") : "À la demande"}
              </span>
              <span>
                <Icon name="location" size={16} aria-hidden /> {training.location ?? "Présentiel / Distanciel"}
              </span>
              <span className="badge badge-new">{training.type}</span>
            </div>
            <div className="training-meta__row">
              <span>
                <Icon name="document" size={16} aria-hidden /> {training.durationMinutes ?? 90} min
              </span>
              <span>
                <Icon name="shield" size={16} aria-hidden /> {training.accreditation ? "Accréditée" : "Non accréditée"}
              </span>
              <span>
                <Icon name="users" size={16} aria-hidden /> {training.enrollments?.length ?? 0}/{training.maxParticipants ?? "∞"} inscrits
              </span>
            </div>
            <p>{training.description}</p>
          </header>

          <div className="training-layout">
            <div className="training-main">
              {currentVideoSrc && (
                <VideoPlayer
                  key={currentChapter?.id ?? training.id}
                  src={currentVideoSrc}
                  onStart={() => handleChapterPlay(currentChapter?.id)}
                  onProgress={(progress) => {
                    // Sauvegarde automatique de la progression (optionnel, peut être optimisé avec debounce)
                  }}
                />
              )}
              {chapters.length > 0 && (
                <section className="card">
                  <header className="home-panel-header">
                    <div>
                      <p className="muted">Progression</p>
                      <h2 className="title-md">{completedPercent}% des chapitres lancés</h2>
                    </div>
                    <div className="progress-card__bar progress-card__bar--sm">
                      <span style={{ width: `${completedPercent}%` }} />
                    </div>
                  </header>
                  <ol className="chapter-list">
                    {chapters.map((chapter) => {
                      const isActive = chapter.id === (currentChapter?.id ?? activeChapterId);
                      const isCompleted = progressSet.has(chapter.id);
                      return (
                        <li key={chapter.id}>
                          <button
                            type="button"
                            className={`chapter-chip ${isActive ? "chapter-chip--active" : ""}`}
                            onClick={() => setActiveChapterId(chapter.id)}
                          >
                            <div>
                              <strong>
                                {chapter.order}. {chapter.title}
                              </strong>
                              <span className="muted">
                                {chapter.duration ? `${chapter.duration} min` : training.durationMinutes ? `${training.durationMinutes} min` : "Libre"}
                              </span>
                            </div>
                            <span className={`badge ${isCompleted ? "badge-new" : ""}`}>
                              {isCompleted ? "Validé" : "À faire"}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              )}
              {training.quiz && (
                <section className="card">
                  <div>
                    <p className="eyebrow">QCM final</p>
                    <h2 className="title-md">Score requis {training.quiz.passingScore}%</h2>
                  </div>
                  <QuizForm
                    questions={training.quiz.questions}
                    onSubmit={(values: any) => quizMutation.mutate(values)}
                  />
                  {quizMutation.data && (
                    <p className="muted">
                      Résultat envoyé. Vérifiez vos attestations dans l'espace « Mes formations ».
                    </p>
                  )}
                </section>
              )}
            </div>
            <aside className="card training-aside">
              <div>
                <p className="muted">Formateur</p>
                <strong>
                  {training.trainer?.user
                    ? `${training.trainer.user.firstName} ${training.trainer.user.lastName}`
                    : "À confirmer"}
                </strong>
              </div>
              <div className="training-meta__row">
                <span className="muted">
                  <Icon name="users" size={16} aria-hidden /> {training.enrollments?.length ?? 0}/{training.maxParticipants ?? 0} inscrits
                </span>
              </div>
              <button className="btn btn-primary" onClick={() => enrollMutation.mutate()} disabled={enrollMutation.isPending}>
                {enrollMutation.isPending ? "Inscription…" : "S'inscrire"}
              </button>
              {enrollMutation.isSuccess && <span className="badge badge-new">Inscription confirmée</span>}
              {training.type === "DISTANCIEL" && training.link && (
                <a className="btn btn-secondary" href={training.link} target="_blank" rel="noreferrer">
                  Rejoindre la visio
                </a>
              )}
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

