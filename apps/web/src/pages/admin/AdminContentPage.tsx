import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api.js";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Icon } from "../../components/Icon.js";
import { RichTextEditor } from "../../components/RichTextEditor.js";
import { useAlert } from "../../context/AlertContext.js";
import { Modal } from "../../components/Modal.js";

export function AdminContentPage() {
  const queryClient = useQueryClient();
  const { showConfirm, showAlert } = useAlert();
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);

  const newsQuery = useQuery({
    queryKey: ["admin-news"],
    queryFn: async () => (await api.get("/admin/news")).data,
  });

  const faqQuery = useQuery({
    queryKey: ["admin-faq"],
    queryFn: async () => (await api.get("/admin/faq")).data,
  });

  const ticketsQuery = useQuery({
    queryKey: ["admin-legal-tickets"],
    queryFn: async () => (await api.get("/admin/legal/tickets")).data,
  });

  const newsCreateMutation = useMutation({
    mutationFn: (payload: any) => api.post("/admin/news", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });

  const newsUpdateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.patch(`/admin/news/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      queryClient.invalidateQueries({ queryKey: ["news"] });
      setEditingNewsId(null);
    },
  });

  const newsDeleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/news/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });

  const faqCreateMutation = useMutation({
    mutationFn: (payload: any) => api.post("/admin/faq", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faq"] });
      queryClient.invalidateQueries({ queryKey: ["faq"] });
    },
  });

  const faqUpdateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.patch(`/admin/faq/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faq"] });
      queryClient.invalidateQueries({ queryKey: ["faq"] });
      setEditingFaqId(null);
    },
  });

  const faqDeleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/faq/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faq"] });
      queryClient.invalidateQueries({ queryKey: ["faq"] });
    },
  });

  const ticketUpdateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.patch(`/admin/legal/tickets/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-legal-tickets"] });
    },
  });

  const newsForm = useForm();
  const faqForm = useForm();

  return (
    <section className="page page--cinematic">
      <div className="page-shell admin-page">
        <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "flex-start" }}>
          <section className="content-column">
            <div className="content-column__header">
              <div className="content-column__title-section">
                <h2 className="title-lg">Articles & actualités</h2>
                <p className="content-column__description">Diffusez les nouveautés du secteur.</p>
              </div>
              <button
                type="button"
                className="btn btn-primary content-column__create-btn"
                onClick={() => {
                  setEditingNewsId(null);
                  newsForm.reset();
                  setIsNewsModalOpen(true);
                }}
              >
                <Icon name="plus" size={16} aria-hidden /> Créer une actualité
              </button>
            </div>
            <div className="content-column__list">
              {newsQuery.isLoading ? (
                <p className="muted text-center" style={{ padding: "2rem" }}>Chargement...</p>
              ) : newsQuery.data?.length === 0 ? (
                <div className="content-column__empty">
                  <p className="muted text-center">Aucune actualité pour le moment</p>
                </div>
              ) : (
                newsQuery.data?.map((article: any) => (
                  <article key={article.id} className="content-item">
                    <div className="content-item__header">
                      <div className="content-item__meta">
                        <span className="content-item__date">{new Date(article.publishedAt).toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" })}</span>
                        {article.category && <span className="content-item__badge">{article.category}</span>}
                      </div>
                      <div className="content-item__actions">
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => {
                            setEditingNewsId(article.id);
                            newsForm.setValue("title", article.title);
                            newsForm.setValue("author", article.author);
                            newsForm.setValue("category", article.category || "");
                            newsForm.setValue("tags", article.tags?.join(", ") || "");
                            newsForm.setValue("imageUrl", article.imageUrl || "");
                            newsForm.setValue("excerpt", article.excerpt || "");
                            newsForm.setValue("content", article.content || "");
                            newsForm.setValue("isPublished", article.isPublished);
                            setIsNewsModalOpen(true);
                          }}
                          title="Modifier"
                        >
                          <Icon name="edit" size={16} aria-hidden />
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-icon--danger"
                          onClick={async () => {
                            const confirmed = await showConfirm({
                              title: "Supprimer l'actualité",
                              message: "Êtes-vous sûr de vouloir supprimer cette actualité ? Cette action est irréversible.",
                              confirmText: "Supprimer",
                              cancelText: "Annuler",
                              type: "danger",
                            });
                            if (confirmed) {
                              newsDeleteMutation.mutate(article.id);
                              showAlert("Actualité supprimée avec succès", "success");
                            }
                          }}
                          disabled={newsDeleteMutation.isPending}
                          title="Supprimer"
                        >
                          <Icon name="trash" size={16} aria-hidden />
                        </button>
                      </div>
                    </div>
                    <h3 className="content-item__title">{article.title}</h3>
                    {article.author && (
                      <p className="content-item__author">Par {article.author}</p>
                    )}
                    <div 
                      className="content-item__preview" 
                      dangerouslySetInnerHTML={{ 
                        __html: article.content?.substring(0, 150) + (article.content?.length > 150 ? "..." : "") || "" 
                      }}
                    />
                  </article>
                ))
              )}
            </div>
          <Modal
            isOpen={isNewsModalOpen}
            onClose={() => {
              setIsNewsModalOpen(false);
              setEditingNewsId(null);
              newsForm.reset();
            }}
            title={editingNewsId ? "Modifier l'actualité" : "Créer une actualité"}
          >
            <form
              onSubmit={newsForm.handleSubmit(async (values) => {
                const payload: any = {
                  title: values.title,
                  content: values.content,
                  author: values.author,
                  excerpt: values.excerpt,
                  category: values.category || undefined,
                  tags: values.tags ? values.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
                  imageUrl: values.imageUrl || undefined,
                  scheduledAt: values.scheduledAt || undefined,
                  isPublished: values.isPublished !== false,
                };

                if (editingNewsId) {
                  await newsUpdateMutation.mutateAsync({ id: editingNewsId, payload });
                  showAlert("Actualité modifiée avec succès", "success");
                } else {
                  await newsCreateMutation.mutateAsync(payload);
                  showAlert("Actualité créée avec succès", "success");
                }
                newsForm.reset();
                setEditingNewsId(null);
                setIsNewsModalOpen(false);
              })}
              className="admin-form"
            >
              <input className="input admin-form__full" placeholder="Titre" {...newsForm.register("title")} required />
              <input className="input admin-form__full" placeholder="Auteur" {...newsForm.register("author")} required />
              <input className="input admin-form__full" placeholder="Catégorie (optionnel)" {...newsForm.register("category")} />
              <input className="input admin-form__full" placeholder="Tags (séparés par des virgules)" {...newsForm.register("tags")} />
              <input className="input admin-form__full" placeholder="URL de l'image (optionnel)" type="url" {...newsForm.register("imageUrl")} />
              <input
                className="input admin-form__full"
                placeholder="Date de publication programmée (optionnel)"
                type="datetime-local"
                {...newsForm.register("scheduledAt")}
              />
              <textarea
                className="input admin-form__full"
                placeholder="Résumé (optionnel)"
                rows={2}
                {...newsForm.register("excerpt")}
              />
              <div className="admin-form__full">
                <span className="muted" style={{ display: "block", marginBottom: "0.5rem" }}>Contenu</span>
                <RichTextEditor
                  value={newsForm.watch("content") || ""}
                  onChange={(value) => newsForm.setValue("content", value)}
                  placeholder="Rédigez votre article..."
                />
              </div>
              <label className="field field--checkbox admin-form__full">
                <input type="checkbox" defaultChecked {...newsForm.register("isPublished")} />
                <span>Publier immédiatement</span>
              </label>
              <button
                className="btn btn-primary admin-form__full"
                disabled={newsCreateMutation.isPending || newsUpdateMutation.isPending}
              >
                {editingNewsId ? "Enregistrer" : "Publier"}
              </button>
            </form>
          </Modal>
          </section>
          <section className="content-column">
            <div className="content-column__header">
              <div className="content-column__title-section">
                <h2 className="title-lg">FAQ juridique</h2>
                <p className="content-column__description">Tenez à jour les réponses clés.</p>
              </div>
              <button
                type="button"
                className="btn btn-primary content-column__create-btn"
                onClick={() => {
                  setEditingFaqId(null);
                  faqForm.reset();
                  setIsFaqModalOpen(true);
                }}
              >
                <Icon name="plus" size={16} aria-hidden /> Créer une FAQ
              </button>
            </div>
            <div className="content-column__list">
              {faqQuery.isLoading ? (
                <p className="muted text-center" style={{ padding: "2rem" }}>Chargement...</p>
              ) : faqQuery.data?.length === 0 ? (
                <div className="content-column__empty">
                  <p className="muted text-center">Aucune FAQ pour le moment</p>
                </div>
              ) : (
                faqQuery.data?.map((item: any) => (
                  <article key={item.id} className="content-item">
                    <div className="content-item__header">
                      <div className="content-item__meta">
                        <span className="content-item__badge">{item.category}</span>
                        {item.views > 0 && (
                          <span className="content-item__views">{item.views} vue{item.views !== 1 ? "s" : ""}</span>
                        )}
                      </div>
                      <div className="content-item__actions">
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => {
                            setEditingFaqId(item.id);
                            faqForm.setValue("category", item.category);
                            faqForm.setValue("question", item.question);
                            faqForm.setValue("answer", item.answer);
                            setIsFaqModalOpen(true);
                          }}
                          title="Modifier"
                        >
                          <Icon name="edit" size={16} aria-hidden />
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-icon--danger"
                          onClick={async () => {
                            const confirmed = await showConfirm({
                              title: "Supprimer la FAQ",
                              message: "Êtes-vous sûr de vouloir supprimer cette FAQ ? Cette action est irréversible.",
                              confirmText: "Supprimer",
                              cancelText: "Annuler",
                              type: "danger",
                            });
                            if (confirmed) {
                              faqDeleteMutation.mutate(item.id);
                              showAlert("FAQ supprimée avec succès", "success");
                            }
                          }}
                          disabled={faqDeleteMutation.isPending}
                          title="Supprimer"
                        >
                          <Icon name="trash" size={16} aria-hidden />
                        </button>
                      </div>
                    </div>
                    <h3 className="content-item__title">{item.question}</h3>
                    <p className="content-item__answer">{item.answer}</p>
                  </article>
                ))
              )}
            </div>
          <Modal
            isOpen={isFaqModalOpen}
            onClose={() => {
              setIsFaqModalOpen(false);
              setEditingFaqId(null);
              faqForm.reset();
            }}
            title={editingFaqId ? "Modifier la FAQ" : "Créer une FAQ"}
          >
            <form
              onSubmit={faqForm.handleSubmit(async (values) => {
                if (editingFaqId) {
                  await faqUpdateMutation.mutateAsync({ id: editingFaqId, payload: values });
                  showAlert("FAQ modifiée avec succès", "success");
                } else {
                  await faqCreateMutation.mutateAsync(values);
                  showAlert("FAQ créée avec succès", "success");
                }
                faqForm.reset();
                setEditingFaqId(null);
                setIsFaqModalOpen(false);
              })}
              className="admin-form"
            >
              <input
                className="input admin-form__full"
                placeholder="Catégorie"
                {...faqForm.register("category")}
                required
              />
              <input
                className="input admin-form__full"
                placeholder="Question"
                {...faqForm.register("question")}
                required
              />
              <textarea
                className="input admin-form__full"
                placeholder="Réponse"
                rows={4}
                {...faqForm.register("answer")}
                required
              />
              <button className="btn btn-primary admin-form__full" disabled={faqCreateMutation.isPending || faqUpdateMutation.isPending}>
                {editingFaqId ? "Enregistrer" : "Ajouter"}
              </button>
            </form>
          </Modal>
          </section>
        </div>

        <section className="stack" style={{ marginTop: "2rem" }}>
        <header>
          <h2 className="title-md">Tickets juridiques</h2>
          <p className="muted">Gérez les demandes des utilisateurs.</p>
        </header>
        <div className="admin-card">
          {ticketsQuery.isLoading ? (
            <p className="muted">Chargement...</p>
          ) : ticketsQuery.data?.length === 0 ? (
            <p className="muted text-center">Aucun ticket</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Sujet</th>
                  <th>Statut</th>
                  <th>Priorité</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ticketsQuery.data?.map((ticket: any) => (
                  <tr key={ticket.id}>
                    <td>{new Date(ticket.createdAt).toLocaleDateString("fr-BE")}</td>
                    <td>{ticket.name}</td>
                    <td>{ticket.email}</td>
                    <td>{ticket.subject}</td>
                    <td>
                      <span className={`badge ${
                        ticket.status === "RESOLVED" ? "badge-new" :
                        ticket.status === "IN_PROGRESS" ? "badge-new" :
                        ""
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        ticket.priority === "URGENT" ? "badge-new" :
                        ticket.priority === "HIGH" ? "badge-new" :
                        ""
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: "0.85rem", padding: "0.25rem 0.5rem" }}
                          onClick={() => {
                            const newStatus = ticket.status === "OPEN" ? "IN_PROGRESS" : ticket.status === "IN_PROGRESS" ? "RESOLVED" : "CLOSED";
                            ticketUpdateMutation.mutate({ id: ticket.id, payload: { status: newStatus } });
                          }}
                          disabled={ticketUpdateMutation.isPending}
                        >
                          {ticket.status === "OPEN" ? "En cours" : ticket.status === "IN_PROGRESS" ? "Résolu" : "Fermer"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        </section>
      </div>
    </section>
  );
}

