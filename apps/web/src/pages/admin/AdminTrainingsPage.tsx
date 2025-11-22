import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api.js";
import { useForm } from "react-hook-form";
import { useState, forwardRef } from "react";
import { Icon } from "../../components/Icon.js";
import { NavLink } from "react-router-dom";
import { Modal } from "../../components/Modal.js";
import { useAlert } from "../../context/AlertContext.js";
import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

export function AdminTrainingsPage() {
  const queryClient = useQueryClient();
  const { showAlert, showConfirm } = useAlert();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const trainingsQuery = useQuery({
    queryKey: ["admin-trainings"],
    queryFn: async () => (await api.get("/trainings")).data,
  });
  const trainersQuery = useQuery({
    queryKey: ["admin-trainers"],
    queryFn: async () => (await api.get("/admin/trainers")).data,
  });

  const createMutation = useMutation({
    mutationFn: (values: any) => api.post("/admin/trainings", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trainings"] });
      reset();
      setIsModalOpen(false);
      showAlert("Formation créée avec succès", "success");
    },
    onError: (error: any) => {
      console.error("Erreur lors de la création:", error);
      showAlert(error.response?.data?.message || "Erreur lors de la création de la formation", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: any }) => api.patch(`/admin/trainings/${id}`, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trainings"] });
      setEditingId(null);
      reset();
      setIsModalOpen(false);
      showAlert("Formation modifiée avec succès", "success");
    },
    onError: (error: any) => {
      console.error("Erreur lors de la modification:", error);
      showAlert(error.response?.data?.message || "Erreur lors de la modification de la formation", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/trainings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trainings"] });
    },
    onError: (error: any) => {
      console.error("Erreur lors de la suppression:", error);
      showAlert(error.response?.data?.message || "Erreur lors de la suppression de la formation", "error");
    },
  });

  const { register, handleSubmit, reset, setValue } = useForm();
  
  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      ...values,
      maxParticipants: Number(values.maxParticipants),
      durationMinutes: Number(values.durationMinutes),
      type: values.type ?? "VIDEO",
      accreditation: Boolean(values.accreditation),
    };

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, values: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  });

  const handleEdit = (training: any) => {
    setEditingId(training.id);
    setValue("title", training.title);
    setValue("summary", training.summary);
    setValue("description", training.description);
    setValue("theme", training.theme);
    setValue("trainerId", training.trainerId || "");
    setValue("type", training.type);
    setValue("durationMinutes", training.durationMinutes);
    setValue("maxParticipants", training.maxParticipants);
    setValue("startDate", training.startDate ? new Date(training.startDate).toISOString().slice(0, 16) : "");
    setValue("location", training.location || "");
    setValue("link", training.link || "");
    setValue("videoUrl", training.videoUrl || "");
    setValue("accreditation", training.accreditation);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    reset();
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm({
      title: "Supprimer la formation",
      message: "Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible.",
      confirmText: "Supprimer",
      cancelText: "Annuler",
      type: "danger",
    });
    if (confirmed) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    reset();
    setIsModalOpen(false);
  };

  return (
    <section className="page page--cinematic">
      <div className="page-shell admin-page">
        <header className="home-panel-header">
          <div>
            <p className="muted">Pilotage</p>
            <h1 className="title-lg">Formations</h1>
            <p className="muted">Créez et suivez les sessions utilisateurs.</p>
          </div>
          <button className="btn btn-primary" onClick={handleCreate} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Icon name="plus" size={18} aria-hidden />
            Créer une formation
          </button>
        </header>
        <div className="admin-card">
          <div className="home-panel-header" style={{ marginBottom: "1rem" }}>
            <h2 className="title-md">Liste des formations</h2>
            <span className="muted">{trainingsQuery.data?.length ?? 0} formations</span>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Type</th>
                <th>Durée</th>
                <th>Participants</th>
                <th>Accréditation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainingsQuery.isLoading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center" }}>
                    <p className="muted">Chargement...</p>
                  </td>
                </tr>
              )}
              {trainingsQuery.data?.length === 0 && !trainingsQuery.isLoading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center" }}>
                    <p className="muted">Aucune formation</p>
                  </td>
                </tr>
              )}
              {trainingsQuery.data?.map((training: any) => (
                <tr key={training.id}>
                  <td>
                    <strong>{training.title}</strong>
                    {training.isNew && <span className="badge badge-new" style={{ marginLeft: "0.5rem" }}>NOUVEAU</span>}
                  </td>
                  <td>{training.type}</td>
                  <td>{training.durationMinutes ?? 90} min</td>
                  <td>{training.enrollments?.length ?? 0}/{training.maxParticipants}</td>
                  <td>{training.accreditation ? "✅" : "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem" }}
                        onClick={() => handleEdit(training)}
                      >
                        <Icon name="edit" size={14} aria-hidden /> Modifier
                      </button>
                      <NavLink
                        to={`/admin/formations/${training.id}`}
                        className="btn btn-ghost"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem", textDecoration: "none" }}
                      >
                        <Icon name="eye" size={14} aria-hidden /> Détails
                      </NavLink>
                      <DuplicateTrainingButton trainingId={training.id} />
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem", color: "var(--error-500)" }}
                        onClick={() => handleDelete(training.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Icon name="trash" size={14} aria-hidden /> Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCancel}
        title={editingId ? "Modifier la formation" : "Créer une formation"}
      >
        <form onSubmit={onSubmit} className="admin-form">
          <Input label="Titre" {...register("title")} required />
          <Input label="Résumé" {...register("summary")} required />
          <Input label="Thème" {...register("theme")} required />
          <Select label="Formateur" {...register("trainerId")}>
            <option value="">Sélectionner un formateur</option>
            {trainersQuery.data?.map((trainer: any) => (
              <option key={trainer.id} value={trainer.id}>
                {trainer.user?.firstName} {trainer.user?.lastName}
              </option>
            ))}
          </Select>
          <Select label="Type" {...register("type")} required>
            <option value="VIDEO">Vidéo</option>
            <option value="PRESENTIEL">Présentiel</option>
            <option value="DISTANCIEL">Distanciel</option>
          </Select>
          <Input label="Durée (minutes)" type="number" {...register("durationMinutes", { valueAsNumber: true })} required />
          <Input label="Participants max" type="number" {...register("maxParticipants", { valueAsNumber: true })} required />
          <Input label="Date de début" type="datetime-local" {...register("startDate")} />
          <Input label="Adresse (présentiel)" {...register("location")} />
          <Input label="Lien visio" type="url" {...register("link")} />
          <div>
            <Input label="Vidéo principale (URL)" type="url" {...register("videoUrl")} />
            <small className="muted" style={{ marginTop: "-0.5rem", display: "block" }}>
              YouTube ou URL directe (ex: https://www.youtube.com/watch?v=... ou https://example.com/video.mp4)
            </small>
          </div>
          <label className="field field--checkbox">
            <input type="checkbox" {...register("accreditation")} />
            <span>Formation accréditée</span>
          </label>
          <label className="field admin-form__full">
            <span className="muted">Description</span>
            <textarea className="input" placeholder="Description complète" rows={4} {...register("description")} required />
          </label>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              style={{ flex: 1 }}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingId ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: string }>(
  ({ label, ...props }, ref) => (
    <label className="field">
      <span className="muted">{label}</span>
      <input className="input" ref={ref} {...props} />
    </label>
  )
);
Input.displayName = "Input";

const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { label: string }>(
  ({ label, children, ...props }, ref) => (
    <label className="field">
      <span className="muted">{label}</span>
      <select className="input" ref={ref} {...props}>
        {children}
      </select>
    </label>
  )
);
Select.displayName = "Select";

function DuplicateTrainingButton({ trainingId }: { trainingId: string }) {
  const queryClient = useQueryClient();
  const { showAlert, showConfirm } = useAlert();
  const duplicateMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/admin/trainings/${trainingId}/duplicate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trainings"] });
      showAlert("Formation dupliquée avec succès", "success");
    },
    onError: (error: any) => {
      console.error("Erreur lors de la duplication:", error);
      showAlert(error.response?.data?.message || "Erreur lors de la duplication de la formation", "error");
    },
  });

  return (
    <button
      type="button"
      className="btn btn-ghost"
      style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem" }}
      onClick={async () => {
        const confirmed = await showConfirm({
          title: "Dupliquer la formation",
          message: "Voulez-vous dupliquer cette formation ?",
          confirmText: "Dupliquer",
          cancelText: "Annuler",
        });
        if (confirmed) {
          duplicateMutation.mutate();
        }
      }}
      disabled={duplicateMutation.isPending}
      title="Dupliquer la formation"
    >
      <Icon name="copy" size={14} aria-hidden /> Dupliquer
    </button>
  );
}

