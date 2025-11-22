import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../services/api.js";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Icon } from "../../components/Icon.js";
import { useAlert } from "../../context/AlertContext.js";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

export function AdminTrainingDetailPage() {
  const { showAlert } = useAlert();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"chapters" | "quiz" | "participants">("chapters");

  const trainingQuery = useQuery({
    queryKey: ["admin-training", id],
    queryFn: async () => (await api.get(`/trainings/${id}`)).data,
    enabled: Boolean(id),
  });

  const participantsQuery = useQuery({
    queryKey: ["admin-participants", id],
    queryFn: async () => (await api.get(`/admin/trainings/${id}/participants`)).data,
    enabled: Boolean(id),
  });

  const chapterMutation = useMutation({
    mutationFn: ({ trainingId, chapterData }: { trainingId: string; chapterData: any }) =>
      api.post(`/admin/trainings/${trainingId}/chapters`, chapterData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-training", id] });
    },
  });

  const quizMutation = useMutation({
    mutationFn: ({ trainingId, quizData }: { trainingId: string; quizData: any }) =>
      api.post(`/admin/trainings/${trainingId}/quiz`, quizData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-training", id] });
    },
  });

  const exportMutation = useMutation({
    mutationFn: async (format: "csv" | "pdf") => {
      const response = await api.get(`/admin/trainings/${id}/participants?format=${format}`, {
        responseType: format === "pdf" ? "blob" : "text",
      });
      const blob = new Blob([response.data], {
        type: format === "pdf" ? "application/pdf" : "text/csv",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `participants-${id}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });

  if (trainingQuery.isLoading) {
    return <p className="muted">Chargement...</p>;
  }

  const training = trainingQuery.data;
  if (!training) {
    return <p className="muted">Formation introuvable</p>;
  }

  return (
    <section className="page page--cinematic">
      <div className="container">
        <div className="page-shell admin-page">
          <header className="card card--gradient">
            <div className="home-panel-header">
              <div>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => navigate("/admin/formations")}
                  style={{ marginBottom: "1rem" }}
                >
                  <Icon name="arrowLeft" size={16} aria-hidden /> Retour
                </button>
                <p className="eyebrow">Administration</p>
                <h1 className="title-lg">{training.title}</h1>
                <p className="muted">{training.theme} · {training.type}</p>
              </div>
            </div>
          </header>

          <div className="admin-card">
            <div className="home-panel-header" style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "1rem" }}>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  type="button"
                  className={`btn ${activeTab === "chapters" ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setActiveTab("chapters")}
                >
                  Chapitres
                </button>
                <button
                  type="button"
                  className={`btn ${activeTab === "quiz" ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setActiveTab("quiz")}
                >
                  QCM
                </button>
                <button
                  type="button"
                  className={`btn ${activeTab === "participants" ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setActiveTab("participants")}
                >
                  Participants ({participantsQuery.data?.length ?? 0})
                </button>
              </div>
            </div>

            {activeTab === "chapters" && (
              <ChaptersTab training={training} onChapterAdd={chapterMutation.mutateAsync} />
            )}

            {activeTab === "quiz" && (
              <QuizTab training={training} onQuizSave={quizMutation.mutateAsync} />
            )}

            {activeTab === "participants" && (
              <ParticipantsTab
                participants={participantsQuery.data || []}
                onExportCSV={() => exportMutation.mutate("csv")}
                onExportPDF={() => exportMutation.mutate("pdf")}
                trainingId={id!}
                queryClient={queryClient}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ChaptersTab({ training, onChapterAdd }: { training: any; onChapterAdd: (data: any) => Promise<any> }) {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const { register, handleSubmit, reset } = useForm();
  const [chapters, setChapters] = useState(training.chapters || []);

  // Synchroniser avec les données du serveur
  useEffect(() => {
    if (training.chapters) {
      const sortedChapters = [...training.chapters].sort((a: any, b: any) => a.order - b.order);
      setChapters(sortedChapters);
    }
  }, [training.chapters]);

  const reorderMutation = useMutation({
    mutationFn: async (chapterOrders: Array<{ chapterId: string; order: number }>) => {
      return api.patch(`/admin/trainings/${training.id}/chapters/reorder`, { chapterOrders });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-training", training.id] });
      showAlert("Ordre des chapitres mis à jour", "success");
    },
    onError: () => {
      showAlert("Erreur lors de la réorganisation des chapitres", "error");
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const order = chapters.length + 1;
    await onChapterAdd({
      trainingId: training.id,
      chapterData: {
        ...values,
        order,
        duration: values.duration ? Number(values.duration) : null,
      },
    });
    reset();
    queryClient.invalidateQueries({ queryKey: ["admin-training", training.id] });
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(chapters);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Mettre à jour l'ordre localement
    const updatedChapters = items.map((chapter: any, index: number) => ({
      ...chapter,
      order: index + 1,
    }));
    setChapters(updatedChapters);

    // Envoyer la nouvelle ordre au serveur
    const chapterOrders = updatedChapters.map((chapter, index) => ({
      chapterId: chapter.id,
      order: index + 1,
    }));
    reorderMutation.mutate(chapterOrders);
  };

  return (
    <div className="stack" style={{ marginTop: "1.5rem" }}>
      <h3 className="title-md">Gestion des chapitres</h3>
      <form onSubmit={onSubmit} className="admin-form">
        <input className="input" placeholder="Titre du chapitre" {...register("title")} required />
        <input 
          className="input" 
          placeholder="URL de la vidéo (YouTube ou URL directe)" 
          type="url" 
          {...register("videoUrl")} 
        />
        <small className="muted" style={{ marginTop: "-0.5rem", marginBottom: "0.5rem", display: "block" }}>
          Exemples : https://www.youtube.com/watch?v=... ou https://example.com/video.mp4
        </small>
        <input className="input" placeholder="Durée (minutes)" type="number" {...register("duration")} />
        <button type="submit" className="btn btn-primary">
          Ajouter un chapitre
        </button>
      </form>

      <div className="stack--sm" style={{ marginTop: "1.5rem" }}>
        {chapters.length === 0 ? (
          <p className="muted">Aucun chapitre. Ajoutez-en un pour commencer.</p>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="chapters">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {chapters.map((chapter: any, index: number) => (
                    <Draggable key={chapter.id} draggableId={chapter.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="admin-card"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "0.5rem",
                            backgroundColor: snapshot.isDragging ? "var(--color-surface-hover)" : "var(--color-surface)",
                            transition: "background-color 0.2s",
                            ...provided.draggableProps.style,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                            <div
                              {...provided.dragHandleProps}
                              style={{
                                cursor: "grab",
                                display: "flex",
                                alignItems: "center",
                                color: "var(--color-muted)",
                                padding: "0.5rem",
                              }}
                              title="Glisser pour réorganiser"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="12" r="1" />
                                <circle cx="9" cy="5" r="1" />
                                <circle cx="9" cy="19" r="1" />
                                <circle cx="15" cy="12" r="1" />
                                <circle cx="15" cy="5" r="1" />
                                <circle cx="15" cy="19" r="1" />
                              </svg>
                            </div>
                            <div>
                              <strong>{chapter.order}. {chapter.title}</strong>
                              {chapter.duration && <span className="muted" style={{ marginLeft: "0.5rem" }}>{chapter.duration} min</span>}
                            </div>
                          </div>
                          <span className="badge badge-new">Chapitre {chapter.order}</span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}

function QuizTab({ training, onQuizSave }: { training: any; onQuizSave: (data: any) => Promise<any> }) {
  const { showAlert } = useAlert();
  const [questions, setQuestions] = useState<any[]>(
    training.quiz?.questions?.map((q: any) => ({
      id: q.id,
      label: q.label,
      multiple: q.multiple,
      answers: q.answers?.map((a: any) => ({
        id: a.id,
        label: a.label,
        isCorrect: a.isCorrect,
      })) || [],
    })) || []
  );
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      passingScore: training.quiz?.passingScore || 80,
    },
  });

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `temp-${Date.now()}`,
        label: "",
        multiple: false,
        answers: [{ label: "", isCorrect: false }],
      },
    ]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addAnswer = (questionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].answers.push({ label: "", isCorrect: false });
    setQuestions(updated);
  };

  const updateAnswer = (questionIndex: number, answerIndex: number, field: string, value: any) => {
    const updated = [...questions];
    updated[questionIndex].answers[answerIndex] = {
      ...updated[questionIndex].answers[answerIndex],
      [field]: value,
    };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].answers = updated[questionIndex].answers.filter((_: any, i: number) => i !== answerIndex);
    setQuestions(updated);
  };

  const onSubmit = handleSubmit(async (values) => {
    await onQuizSave({
      trainingId: training.id,
      quizData: {
        passingScore: Number(values.passingScore),
        questions: questions.map((q) => ({
          label: q.label,
          multiple: q.multiple,
          answers: q.answers.map((a: any) => ({
            label: a.label,
            isCorrect: a.isCorrect,
          })),
        })),
      },
    });
    showAlert("QCM enregistré avec succès !", "success");
  });

  return (
    <div className="stack" style={{ marginTop: "1.5rem" }}>
      <h3 className="title-md">Configuration du QCM</h3>
      <form onSubmit={onSubmit} className="admin-form">
        <label className="field">
          <span className="muted">Seuil de validation (%)</span>
          <input
            className="input"
            type="number"
            min="0"
            max="100"
            {...register("passingScore", { valueAsNumber: true })}
            required
          />
        </label>

        <div className="stack" style={{ marginTop: "1.5rem" }}>
          <div className="home-panel-header">
            <h4 className="title-sm">Questions</h4>
            <button type="button" className="btn btn-secondary" onClick={addQuestion}>
              <Icon name="plus" size={16} aria-hidden /> Ajouter une question
            </button>
          </div>

          {questions.map((question, qIndex) => (
            <div key={question.id || qIndex} className="admin-card" style={{ marginTop: "1rem" }}>
              <div className="home-panel-header">
                <h5 className="title-xs">Question {qIndex + 1}</h5>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ color: "var(--error-500)" }}
                  onClick={() => removeQuestion(qIndex)}
                >
                  <Icon name="trash" size={14} aria-hidden /> Supprimer
                </button>
              </div>
              <input
                className="input"
                placeholder="Libellé de la question"
                value={question.label}
                onChange={(e) => updateQuestion(qIndex, "label", e.target.value)}
                required
              />
              <label className="field field--checkbox" style={{ marginTop: "0.5rem" }}>
                <input
                  type="checkbox"
                  checked={question.multiple}
                  onChange={(e) => updateQuestion(qIndex, "multiple", e.target.checked)}
                />
                <span>Question à choix multiples</span>
              </label>

              <div className="stack--sm" style={{ marginTop: "1rem" }}>
                <div className="home-panel-header">
                  <span className="muted">Réponses</span>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: "0.85rem", padding: "0.25rem 0.5rem" }}
                    onClick={() => addAnswer(qIndex)}
                  >
                    <Icon name="plus" size={14} aria-hidden /> Ajouter
                  </button>
                </div>
                {question.answers.map((answer: any, aIndex: number) => (
                  <div key={aIndex} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                      className="input"
                      placeholder="Libellé de la réponse"
                      value={answer.label}
                      onChange={(e) => updateAnswer(qIndex, aIndex, "label", e.target.value)}
                      required
                    />
                    <label className="field field--checkbox">
                      <input
                        type="checkbox"
                        checked={answer.isCorrect}
                        onChange={(e) => updateAnswer(qIndex, aIndex, "isCorrect", e.target.checked)}
                      />
                      <span>Correcte</span>
                    </label>
                    {question.answers.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ color: "var(--error-500)" }}
                        onClick={() => removeAnswer(qIndex, aIndex)}
                      >
                        <Icon name="trash" size={14} aria-hidden />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
          Enregistrer le QCM
        </button>
      </form>
    </div>
  );
}

function ParticipantsTab({
  participants,
  onExportCSV,
  onExportPDF,
  trainingId,
  queryClient,
}: {
  participants: any[];
  onExportCSV: () => void;
  onExportPDF: () => void;
  trainingId: string;
  queryClient: any;
}) {
  const { showAlert } = useAlert();
  const attendanceMutation = useMutation({
    mutationFn: async ({ enrollmentId, attendance }: { enrollmentId: string; attendance: boolean }) => {
      // TODO: Créer endpoint pour mettre à jour la présence
      await api.patch(`/admin/enrollments/${enrollmentId}`, { attendance });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-participants", trainingId] });
    },
  });

  return (
    <div className="stack" style={{ marginTop: "1.5rem" }}>
      <div className="home-panel-header">
        <h3 className="title-md">Liste des participants</h3>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" className="btn btn-secondary" onClick={onExportCSV}>
            <Icon name="download" size={16} aria-hidden /> Export CSV
          </button>
          <button type="button" className="btn btn-secondary" onClick={onExportPDF}>
            <Icon name="download" size={16} aria-hidden /> Export PDF
          </button>
        </div>
      </div>

      {participants.length === 0 ? (
        <p className="muted">Aucun participant inscrit.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Statut</th>
              <th>Présence</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((enrollment: any) => (
              <tr key={enrollment.id}>
                <td>
                  {enrollment.user.firstName} {enrollment.user.lastName}
                </td>
                <td>{enrollment.user.email}</td>
                <td>
                  <span className="badge badge-new">{enrollment.status}</span>
                </td>
                <td>
                  <label className="field field--checkbox">
                    <input
                      type="checkbox"
                      checked={enrollment.attendance || false}
                      onChange={(e) =>
                        attendanceMutation.mutate({
                          enrollmentId: enrollment.id,
                          attendance: e.target.checked,
                        })
                      }
                    />
                    <span>Présent</span>
                  </label>
                </td>
                <td>
                  {enrollment.attendance && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: "0.85rem", padding: "0.25rem 0.5rem" }}
                      onClick={async () => {
                        try {
                          await api.post(`/admin/enrollments/${enrollment.id}/certificate`);
                          showAlert("Attestation générée et envoyée avec succès !", "success");
                          queryClient.invalidateQueries({ queryKey: ["admin-participants", trainingId] });
                        } catch (error: any) {
                          showAlert(error.response?.data?.message || "Erreur lors de la génération de l'attestation", "error");
                        }
                      }}
                    >
                      Envoyer attestation
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

