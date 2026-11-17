import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import "../CatalogMediaGrid/CatalogMediaGrid.css";

export function RecommendationList({ recommendations, onSelect, containerRef }) {
  const { t } = useTranslation();

  if (recommendations.length === 0) {
    return <p className="muted">{t("recommendations.empty")}</p>;
  }

  return (
    <div className="catalog-grid recommendations-catalog-grid" ref={containerRef}>
      {recommendations.map((item) => (
        <article className="catalog-card recommendation-card" key={item.anilistId ?? item.id ?? item.title}>
          {item.coverImage
            ? <img src={item.coverImage} alt={item.titleLocalized || item.title} />
            : <div className="catalog-card-placeholder" aria-hidden="true" />}
          <div className="catalog-card-body" tabIndex="0">
            <span className="pill">{mediaTypeLabel(item.type, t)}</span>
            <h3>{item.titleLocalized || item.title}</h3>
            {item.titleLocalized && item.titleLocalized !== item.title && <small>{item.title}</small>}
            <p>{buildDetail(item, t)}</p>
            {item.genres?.length > 0 && <small>{item.genres.slice(0, 3).join(" / ")}</small>}
            {onSelect && (
              <button className="primary catalog-detail-button" onClick={() => onSelect(item)}>
                <Plus size={14} /> {t("catalog.viewDetails")}
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function buildDetail(item, t) {
  const year = item.seasonYear || item.startYear;
  const video = item.type === "ANIME" || item.type === "MOVIE";
  const total = video ? item.episodes : item.chapters;
  const parts = [
    year,
    total ? `${total} ${video ? t("common.episodesShort") : t("common.chaptersShort")}` : null,
    item.averageScore ? `${item.averageScore}/100` : null
  ].filter(Boolean);
  return parts.length ? parts.join(" - ") : item.status || t("common.anilistCatalog");
}

function mediaTypeLabel(type, t) {
  if (type === "ANIME") return t("common.anime");
  if (type === "MOVIE") return t("common.movie");
  if (type === "MANHWA") return t("common.manhwa");
  return t("common.manga");
}
