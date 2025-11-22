import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../services/api.js";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Icon } from "../components/Icon.js";
import { useAlert } from "../context/AlertContext.js";

export function LegalPage() {
  const { showAlert } = useAlert();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const faqQuery = useQuery({
    queryKey: ["faq", searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);
      const response = await api.get(`/faq?${params.toString()}`);
      return response.data;
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["faq-categories"],
    queryFn: async () => (await api.get("/faq/categories")).data,
  });

  const ticketMutation = useMutation({
    mutationFn: async (data: any) => {
      const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
      return api.post("/legal/ticket", { ...data, userId: userId || undefined });
    },
  });

  const { register, handleSubmit, reset } = useForm();

  const onSubmit = handleSubmit(async (values) => {
    await ticketMutation.mutateAsync(values);
    reset();
    showAlert("Votre demande a été envoyée. Vous recevrez une réponse sous 24h.", "success");
  });

  const handleFaqClick = async (faqId: string) => {
    await api.post(`/faq/${faqId}/view`);
  };

  const faqItems = Array.isArray(faqQuery.data) ? faqQuery.data : [];
  const categories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : [];

  return (
    <section className="page page--cinematic">
      <div className="container">
        <div className="page-shell legal-page">
          <header className="card card--gradient">
            <p className="eyebrow">Module juridique</p>
            <h1 className="title-lg">FAQ & accompagnement</h1>
            <p>
              Consultez les réponses du cabinet partenaire ou transmettez votre dossier pour un suivi prioritaire en moins
              de 24h.
            </p>
          </header>

          <div className="grid-2" style={{ marginTop: "2rem" }}>
            <div className="stack">
              <div className="card">
                <div className="home-panel-header" style={{ marginBottom: "1rem" }}>
                  <h2 className="title-md">Rechercher dans la FAQ</h2>
                </div>
                <input
                  className="input"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ marginBottom: "1rem" }}
                />
                {categories.length > 0 && (
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                    <button
                      type="button"
                      className={`btn ${selectedCategory === "" ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => setSelectedCategory("")}
                      style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                    >
                      Toutes
                    </button>
                    {categories.map((cat: string) => (
                      <button
                        key={cat}
                        type="button"
                        className={`btn ${selectedCategory === cat ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setSelectedCategory(cat)}
                        style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {faqQuery.isLoading ? (
                <p className="muted">Chargement...</p>
              ) : faqItems.length === 0 ? (
                <div className="card">
                  <p className="muted text-center">Aucune question trouvée.</p>
                </div>
              ) : (
                faqItems.map((item: any) => (
                  <article
                    key={item.id}
                    className="card"
                    onClick={() => handleFaqClick(item.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="home-panel-header">
                      <div>
                        <p className="eyebrow">{item.category}</p>
                        <h2 className="title-md">{item.question}</h2>
                        <p className="muted">{item.answer}</p>
                      </div>
                      {item.views > 0 && (
                        <span className="badge badge-new" style={{ fontSize: "0.75rem" }}>
                          {item.views} vue{item.views !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>

            <form onSubmit={onSubmit} className="form-card">
              <h2 className="title-md">Poser une question</h2>
              <p className="muted" style={{ marginBottom: "1rem" }}>
                Votre demande sera traitée par notre cabinet partenaire sous 24h.
              </p>
              <input className="input" placeholder="Nom complet" {...register("name")} required />
              <input className="input" placeholder="Email" type="email" {...register("email")} required />
              <input className="input" placeholder="Téléphone (optionnel)" {...register("phone")} />
              <input className="input" placeholder="Sujet" {...register("subject")} required />
              <textarea
                className="input"
                placeholder="Votre question ou demande"
                rows={6}
                {...register("message")}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={ticketMutation.isPending}>
                {ticketMutation.isPending ? "Envoi..." : "Envoyer au support juridique"}
              </button>
              {ticketMutation.isSuccess && (
                <p className="muted" style={{ marginTop: "1rem", color: "var(--success-500)" }}>
                  ✓ Votre demande a été envoyée avec succès.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

