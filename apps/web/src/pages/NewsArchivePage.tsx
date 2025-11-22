import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";
import { useState } from "react";
import { Icon } from "../components/Icon.js";

export function NewsArchivePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  const newsQuery = useQuery({
    queryKey: ["news-archive", selectedCategory, selectedTag, searchQuery, selectedYear],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedTag) params.append("tag", selectedTag);
      if (searchQuery) params.append("search", searchQuery);
      const response = await api.get(`/news?${params.toString()}`);
      return response.data;
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["news-categories"],
    queryFn: async () => {
      const response = await api.get("/news/categories");
      return response.data || [];
    },
  });

  const tagsQuery = useQuery({
    queryKey: ["news-tags"],
    queryFn: async () => {
      const response = await api.get("/news/tags");
      return response.data || [];
    },
  });

  const articles = Array.isArray(newsQuery.data) ? newsQuery.data : [];
  const categories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : [];
  const tags = Array.isArray(tagsQuery.data) ? tagsQuery.data : [];

  // Grouper par année
  const articlesByYear = articles.reduce((acc: Record<string, any[]>, article: any) => {
    const year = new Date(article.publishedAt).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(article);
    return acc;
  }, {});

  const years = Object.keys(articlesByYear).sort((a, b) => Number(b) - Number(a));

  const filteredArticles = selectedYear
    ? articlesByYear[selectedYear] || []
    : articles;

  return (
    <section className="page page--cinematic">
      <div className="container">
        <div className="page-shell">
          <header className="card card--gradient">
            <p className="eyebrow">Archives</p>
            <h1 className="title-lg">Actualités SOINS+</h1>
            <p>Consultez toutes nos actualités et articles</p>
          </header>

          <div className="grid-2" style={{ marginTop: "2rem" }}>
            <aside className="card">
              <div className="stack">
                <h2 className="title-md">Filtres</h2>

                <div className="field">
                  <label className="muted" style={{ display: "block", marginBottom: "0.5rem" }}>
                    Recherche
                  </label>
                  <div style={{ position: "relative" }}>
                    <Icon name="search" size={18} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
                    <input
                      className="input"
                      type="text"
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ paddingLeft: "2.5rem" }}
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="muted" style={{ display: "block", marginBottom: "0.5rem" }}>
                    Catégorie
                  </label>
                  <select
                    className="input"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map((cat: string) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label className="muted" style={{ display: "block", marginBottom: "0.5rem" }}>
                    Tag
                  </label>
                  <select
                    className="input"
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                  >
                    <option value="">Tous les tags</option>
                    {tags.map((tag: string) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label className="muted" style={{ display: "block", marginBottom: "0.5rem" }}>
                    Année
                  </label>
                  <select
                    className="input"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    <option value="">Toutes les années</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {(selectedCategory || selectedTag || searchQuery || selectedYear) && (
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setSelectedCategory("");
                      setSelectedTag("");
                      setSearchQuery("");
                      setSelectedYear("");
                    }}
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            </aside>

            <div className="stack">
              {newsQuery.isLoading ? (
                <p className="muted">Chargement...</p>
              ) : filteredArticles.length === 0 ? (
                <div className="card">
                  <p className="muted">Aucun article trouvé</p>
                </div>
              ) : (
                <>
                  {selectedYear ? (
                    <div className="stack--sm">
                      <h2 className="title-md">Année {selectedYear}</h2>
                      {filteredArticles.map((article: any) => (
                        <NewsCard key={article.id} article={article} />
                      ))}
                    </div>
                  ) : (
                    years.map((year) => (
                      <div key={year} className="stack--sm" style={{ marginBottom: "2rem" }}>
                        <h2 className="title-md">{year}</h2>
                        <div className="stack--sm">
                          {articlesByYear[year].map((article: any) => (
                            <NewsCard key={article.id} article={article} />
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NewsCard({ article }: { article: any }) {
  return (
    <Link to={`/actualites/${article.id}`} className="card" style={{ textDecoration: "none", display: "block" }}>
      <div style={{ display: "flex", gap: "1rem" }}>
        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt={article.title}
            style={{
              width: "150px",
              height: "100px",
              objectFit: "cover",
              borderRadius: "8px",
              flexShrink: 0,
            }}
          />
        )}
        <div className="stack" style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            {article.category && (
              <span className="badge badge-new" style={{ fontSize: "0.75rem" }}>
                {article.category}
              </span>
            )}
            {article.tags?.map((tag: string) => (
              <span key={tag} className="muted" style={{ fontSize: "0.75rem" }}>
                #{tag}
              </span>
            ))}
          </div>
          <h3 className="title-sm">{article.title}</h3>
          {article.excerpt && (
            <p className="muted" style={{ fontSize: "0.9rem" }}>
              {article.excerpt}
            </p>
          )}
          <p className="muted" style={{ fontSize: "0.85rem" }}>
            {new Date(article.publishedAt).toLocaleDateString("fr-BE", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </Link>
  );
}

