import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api.js";
import { Icon } from "../components/Icon.js";
import { useAlert } from "../context/AlertContext.js";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function NewsDetailPage() {
  const { showAlert } = useAlert();
  const { id } = useParams();
  const newsQuery = useQuery({
    queryKey: ["news", id],
    queryFn: async () => (await api.get(`/news/${id}`)).data,
    enabled: Boolean(id),
  });

  if (newsQuery.isLoading) {
    return <p className="muted">Chargement...</p>;
  }

  const article = newsQuery.data;
  if (!article) {
    return (
      <section className="page page--cinematic">
        <div className="container">
          <div className="card text-center">
            <h1 className="title-lg">Article introuvable</h1>
            <p className="muted">L'article que vous recherchez n'existe pas ou a été supprimé.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = encodeURIComponent(`${article.title} - SOINS+`);
  const shareUrlEncoded = encodeURIComponent(shareUrl);

  const handleShare = async (platform: string) => {
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrlEncoded}`,
      twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrlEncoded}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrlEncoded}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showAlert("Lien copié dans le presse-papiers !", "success");
    } catch (err) {
      console.error("Erreur lors de la copie:", err);
      showAlert("Erreur lors de la copie du lien", "error");
    }
  };

  return (
    <section className="page page--cinematic">
      <div className="container">
        <div className="page-shell">
          <Link to="/" className="btn btn-ghost" style={{ marginBottom: "2rem" }}>
            <Icon name="arrowLeft" size={16} aria-hidden /> Retour à l'accueil
          </Link>

          <article className="card">
            {article.imageUrl && (
              <img
                src={article.imageUrl}
                alt={article.title}
                style={{
                  width: "100%",
                  maxHeight: "400px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  marginBottom: "2rem",
                }}
              />
            )}

            <header style={{ marginBottom: "2rem" }}>
              {article.category && (
                <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>
                  {article.category}
                </p>
              )}
              <h1 className="title-lg">{article.title}</h1>
              <div className="home-panel-header" style={{ marginTop: "1rem" }}>
                <div>
                  <p className="muted">
                    Par {article.author} · {format(new Date(article.publishedAt), "dd MMMM yyyy", { locale: fr })}
                  </p>
                  {article.views > 0 && (
                    <p className="muted" style={{ fontSize: "0.85rem" }}>
                      {article.views} vue{article.views !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                {article.tags && article.tags.length > 0 && (
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {article.tags.map((tag: string) => (
                      <span key={tag} className="badge badge-new" style={{ fontSize: "0.75rem" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </header>

            {article.excerpt && (
              <div
                className="card card--gradient"
                style={{ marginBottom: "2rem", padding: "1.5rem", backgroundColor: "var(--color-surface)" }}
              >
                <p className="title-md" style={{ fontStyle: "italic", color: "var(--color-muted)" }}>
                  {article.excerpt}
                </p>
              </div>
            )}

            <div
              className="news-content"
              style={{
                lineHeight: "1.8",
                fontSize: "1.1rem",
              }}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <div className="card" style={{ marginTop: "3rem", padding: "1.5rem" }}>
              <div className="home-panel-header">
                <h3 className="title-md">Partager cet article</h3>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleShare("facebook")}
                  style={{ fontSize: "0.9rem" }}
                >
                  <Icon name="share" size={16} aria-hidden /> Facebook
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleShare("twitter")}
                  style={{ fontSize: "0.9rem" }}
                >
                  <Icon name="share" size={16} aria-hidden /> Twitter
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleShare("linkedin")}
                  style={{ fontSize: "0.9rem" }}
                >
                  <Icon name="share" size={16} aria-hidden /> LinkedIn
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={copyToClipboard}
                  style={{ fontSize: "0.9rem" }}
                >
                  <Icon name="share" size={16} aria-hidden /> Copier le lien
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

