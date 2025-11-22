import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api.js";
import { useState } from "react";
import { Icon } from "../../components/Icon.js";
import { useAlert } from "../../context/AlertContext.js";
import { Modal } from "../../components/Modal.js";
import { useForm } from "react-hook-form";

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { showConfirm, showAlert } = useAlert();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const createForm = useForm();

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => (await api.get("/admin/users")).data,
  });

  const createMutation = useMutation({
    mutationFn: (values: any) => api.post("/admin/users", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      createForm.reset();
      setIsCreateModalOpen(false);
      showAlert("Utilisateur créé avec succès", "success");
    },
    onError: (error: any) => {
      showAlert(error.response?.data?.message || "Erreur lors de la création de l'utilisateur", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: any }) => api.patch(`/admin/users/${id}`, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditingId(null);
    },
  });

  const handleUpdate = async (id: string, field: string, value: any) => {
    await updateMutation.mutateAsync({ id, values: { [field]: value } });
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm({
      title: "Supprimer l'utilisateur",
      message: "Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.",
      confirmText: "Supprimer",
      cancelText: "Annuler",
      type: "danger",
    });
    if (confirmed) {
      await updateMutation.mutateAsync({ id, values: { deleted: true } });
    }
  };

  return (
    <section className="page page--cinematic">
      <div className="page-shell admin-page">
        <header className="home-panel-header">
          <div>
            <p className="muted">Pilotage</p>
            <h1 className="title-lg">Utilisateurs</h1>
            <p className="muted">Gérez les comptes utilisateurs et leurs permissions.</p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              createForm.reset();
              setIsCreateModalOpen(true);
            }}
          >
            <Icon name="plus" size={16} aria-hidden /> Créer un utilisateur
          </button>
        </header>

        <div className="admin-card">
          <div className="home-panel-header" style={{ marginBottom: "1rem" }}>
            <h2 className="title-md">Liste des utilisateurs</h2>
            <span className="muted">{usersQuery.data?.length ?? 0} utilisateurs</span>
          </div>
          {usersQuery.isLoading ? (
            <p className="muted">Chargement...</p>
          ) : usersQuery.data?.length === 0 ? (
            <p className="muted text-center">Aucun utilisateur</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Abonnement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersQuery.data?.map((user: any) => (
                  <tr key={user.id}>
                    <td>
                      <strong>
                        {user.firstName} {user.lastName}
                      </strong>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdate(user.id, "role", e.target.value)}
                        className="input"
                        style={{ padding: "0.5rem", fontSize: "0.9rem" }}
                      >
                        <option value="user">Utilisateur</option>
                        <option value="admin">Admin</option>
                        <option value="trainer">Formateur</option>
                      </select>
                    </td>
                    <td>
                      <label className="field--checkbox" style={{ margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={user.subscriptionActive}
                          onChange={(e) => handleUpdate(user.id, "subscriptionActive", e.target.checked)}
                        />
                        <span>{user.subscriptionActive ? "Actif" : "Inactif"}</span>
                      </label>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem", color: "var(--error-500)" }}
                        onClick={() => handleDelete(user.id)}
                        disabled={updateMutation.isPending}
                      >
                        <Icon name="trash" size={14} aria-hidden /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            createForm.reset();
          }}
          title="Créer un utilisateur"
        >
          <form
            onSubmit={createForm.handleSubmit(async (values) => {
              await createMutation.mutateAsync({
                email: values.email,
                password: values.password,
                firstName: values.firstName,
                lastName: values.lastName,
                nationalRegistry: values.nationalRegistry || "",
                phone: values.phone || "",
                diplomaUrl: values.diplomaUrl || "",
                role: values.role || "user",
                subscriptionActive: values.subscriptionActive ?? false,
              });
            })}
            className="admin-form"
          >
            <input
              className="input admin-form__full"
              placeholder="Email *"
              type="email"
              {...createForm.register("email", { required: true })}
              required
            />
            <input
              className="input admin-form__full"
              placeholder="Mot de passe * (min. 8 caractères)"
              type="password"
              {...createForm.register("password", { required: true, minLength: 8 })}
              required
            />
            <input
              className="input admin-form__full"
              placeholder="Prénom *"
              {...createForm.register("firstName", { required: true })}
              required
            />
            <input
              className="input admin-form__full"
              placeholder="Nom *"
              {...createForm.register("lastName", { required: true })}
              required
            />
            <input
              className="input admin-form__full"
              placeholder="Numéro INAMI (optionnel)"
              {...createForm.register("nationalRegistry")}
            />
            <input
              className="input admin-form__full"
              placeholder="Téléphone (optionnel)"
              {...createForm.register("phone")}
            />
            <input
              className="input admin-form__full"
              placeholder="URL du diplôme (optionnel)"
              type="url"
              {...createForm.register("diplomaUrl")}
            />
            <select
              className="input admin-form__full"
              {...createForm.register("role")}
              defaultValue="user"
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Admin</option>
              <option value="trainer">Formateur</option>
            </select>
            <label className="field field--checkbox admin-form__full">
              <input type="checkbox" {...createForm.register("subscriptionActive")} />
              <span>Abonnement actif</span>
            </label>
            <button
              className="btn btn-primary admin-form__full"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Création..." : "Créer l'utilisateur"}
            </button>
          </form>
        </Modal>
      </div>
    </section>
  );
}

