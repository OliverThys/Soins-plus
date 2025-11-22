import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../services/api.js";
import { useState } from "react";
import { Icon } from "../../components/Icon.js";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function TrainerTrainingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedEnrollments, setSelectedEnrollments] = useState<Set<string>>(new Set());

  const trainingQuery = useQuery({
    queryKey: ["trainer-training", id],
    queryFn: async () => {
      const response = await api.get(`/trainer/trainings/${id}/participants`);
      return response.data;
    },
    enabled: Boolean(id),
  });

  const attendanceMutation = useMutation({
    mutationFn: async (data: { entries: Array<{ enrollmentId: string; present: boolean; comment?: string }> }) => {
      return api.post(`/trainer/trainings/${id}/attendance`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainer-training", id] });
      queryClient.invalidateQueries({ queryKey: ["trainer-trainings"] });
      queryClient.invalidateQueries({ queryKey: ["trainer-dashboard"] });
      setSelectedEnrollments(new Set());
    },
  });

  const bulkMutation = useMutation({
    mutationFn: async (allPresent: boolean) => {
      return api.post(`/trainer/trainings/${id}/attendance/bulk`, { allPresent });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainer-training", id] });
      queryClient.invalidateQueries({ queryKey: ["trainer-trainings"] });
      queryClient.invalidateQueries({ queryKey: ["trainer-dashboard"] });
    },
  });

  const data = trainingQuery.data || { participants: [], training: null };
  const participants = data.participants || [];
  const training = data.training;
  const allSelected = selectedEnrollments.size === participants.length && participants.length > 0;
  const someSelected = selectedEnrollments.size > 0 && selectedEnrollments.size < participants.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedEnrollments(new Set());
    } else {
      setSelectedEnrollments(new Set(participants.map((p: any) => p.id)));
    }
  };

  const handleSelect = (enrollmentId: string) => {
    const newSet = new Set(selectedEnrollments);
    if (newSet.has(enrollmentId)) {
      newSet.delete(enrollmentId);
    } else {
      newSet.add(enrollmentId);
    }
    setSelectedEnrollments(newSet);
  };

  const handleValidateSelected = async (present: boolean) => {
    const entries = Array.from(selectedEnrollments).map((enrollmentId) => ({
      enrollmentId,
      present,
    }));
    await attendanceMutation.mutateAsync({ entries });
  };

  const handleValidateAll = async (present: boolean) => {
    await bulkMutation.mutateAsync(present);
  };

  if (trainingQuery.isLoading) {
    return <p className="muted">Chargement...</p>;
  }

  return (
    <section className="page page--cinematic">
      <div className="container">
        <div className="page-shell trainer-page">
          <header className="card card--gradient">
            <div className="home-panel-header">
              <div>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => navigate("/formateur")}
                  style={{ marginBottom: "1rem" }}
                >
                  <Icon name="arrowLeft" size={16} aria-hidden /> Retour
                </button>
                <p className="eyebrow">Validation des présences</p>
                <h1 className="title-lg">{training?.title || "Formation"}</h1>
                <p className="muted">
                  {training?.startDate
                    ? format(new Date(training.startDate), "dd MMMM yyyy 'à' HH:mm", { locale: fr })
                    : "Date à définir"}
                  {" · "}
                  {participants.length} participant{participants.length !== 1 ? "s" : ""} inscrit{participants.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </header>

          <div className="admin-card" style={{ marginTop: "1.5rem" }}>
            <div className="home-panel-header" style={{ marginBottom: "1rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "1rem" }}>
              <h2 className="title-md">Actions rapides</h2>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleValidateAll(true)}
                  disabled={bulkMutation.isPending || participants.length === 0}
                >
                  <Icon name="check" size={16} aria-hidden /> Valider tous présents
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleValidateAll(false)}
                  disabled={bulkMutation.isPending || participants.length === 0}
                >
                  <Icon name="x" size={16} aria-hidden /> Marquer tous absents
                </button>
              </div>
            </div>

            {selectedEnrollments.size > 0 && (
              <div className="admin-card" style={{ marginBottom: "1rem", backgroundColor: "var(--color-surface)", padding: "1rem" }}>
                <div className="home-panel-header">
                  <span className="muted">{selectedEnrollments.size} participant{selectedEnrollments.size !== 1 ? "s" : ""} sélectionné{selectedEnrollments.size !== 1 ? "s" : ""}</span>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                      onClick={() => handleValidateSelected(true)}
                      disabled={attendanceMutation.isPending}
                    >
                      <Icon name="check" size={14} aria-hidden /> Valider sélection
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                      onClick={() => handleValidateSelected(false)}
                      disabled={attendanceMutation.isPending}
                    >
                      <Icon name="x" size={14} aria-hidden /> Marquer absents
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                      onClick={() => setSelectedEnrollments(new Set())}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

            {participants.length === 0 ? (
              <p className="muted text-center">Aucun participant inscrit à cette formation.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = someSelected;
                        }}
                        onChange={handleSelectAll}
                        aria-label="Sélectionner tous"
                      />
                    </th>
                    <th>Participant</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Statut</th>
                    <th>Présence</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((enrollment: any) => (
                    <tr key={enrollment.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedEnrollments.has(enrollment.id)}
                          onChange={() => handleSelect(enrollment.id)}
                          aria-label={`Sélectionner ${enrollment.user.firstName} ${enrollment.user.lastName}`}
                        />
                      </td>
                      <td>
                        <strong>
                          {enrollment.user.firstName} {enrollment.user.lastName}
                        </strong>
                      </td>
                      <td>{enrollment.user.email}</td>
                      <td>{enrollment.user.phone || "—"}</td>
                      <td>
                        <span className={`badge ${enrollment.status === "COMPLETED" ? "badge-new" : ""}`}>
                          {enrollment.status}
                        </span>
                      </td>
                      <td>
                        {enrollment.attendance ? (
                          <span className="badge badge-new">
                            <Icon name="check" size={14} aria-hidden /> Présent
                          </span>
                        ) : (
                          <span className="muted">À valider</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ fontSize: "0.85rem", padding: "0.25rem 0.5rem" }}
                            onClick={() =>
                              attendanceMutation.mutate({
                                entries: [{ enrollmentId: enrollment.id, present: !enrollment.attendance }],
                              })
                            }
                            disabled={attendanceMutation.isPending}
                          >
                            {enrollment.attendance ? (
                              <>
                                <Icon name="x" size={14} aria-hidden /> Absent
                              </>
                            ) : (
                              <>
                                <Icon name="check" size={14} aria-hidden /> Présent
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {(attendanceMutation.isPending || bulkMutation.isPending) && (
              <p className="muted text-center" style={{ marginTop: "1rem" }}>
                Traitement en cours...
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

