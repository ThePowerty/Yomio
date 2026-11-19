import { Plus, RefreshCw, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTracker } from "../../context/TrackerContext";
import { Notice } from "../Notice/Notice";
import { CatalogPagination } from "../CatalogPagination/CatalogPagination";
import "./CatalogMediaGrid.css";

export function CatalogMediaGrid({ type }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pageData, setPageData] = useState({ items: [], page: 0, size: 12, totalItems: 0, totalPages: 0 });
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [columns, setColumns] = useState(0);
  const gridRef = useRef(null);
  const { token, isAdmin } = useAuth();
  const { loadCatalogPage, refreshCatalog, status, clearStatus, loading } = useTracker();
  const navigate = useNavigate();
  const title = mediaTypeLabel(type, t).toLowerCase();

  useEffect(() => {
    if (token && columns > 0) {
      loadTypeCatalog(query.trim(), statusFilter, 0, Math.min(columns * 2, 50));
    }
  }, [type, token, columns]);

  useEffect(() => {
    if (!gridRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const nextColumns = Math.max(1, Math.floor((entry.contentRect.width + 12) / 162));
      setColumns((current) => current === nextColumns ? current : nextColumns);
    });
    observer.observe(gridRef.current);
    return () => observer.disconnect();
  }, []);

  const sizeOptions = useMemo(() => {
    const visibleColumns = Math.max(columns, 1);
    const options = [2, 3, 4].map((rows) => visibleColumns * rows).filter((value) => value <= 50);
    return options.length ? options : [50];
  }, [columns]);

  async function loadTypeCatalog(searchTerm, status = statusFilter, page = 0, size = pageData.size) {
    setCatalogLoading(true);
    const data = await loadCatalogPage(searchTerm, type, status, page, size);
    setPageData(data);
    setCatalogLoading(false);
  }

  async function submitSearch(event) {
    event.preventDefault();
    await loadTypeCatalog(query.trim(), statusFilter, 0);
  }

  async function refreshFromProvider() {
    await refreshCatalog(type);
    await loadTypeCatalog(query.trim(), statusFilter, 0);
  }

  function useMedia(media) {
    navigate(`/catalog/${type.toLowerCase()}/${media.id}`, { state: { media } });
  }

  return (
    <div className="catalog-page">
      <section className="panel catalog-toolbar">
        <form noValidate className="catalog-search" onSubmit={submitSearch}>
          <label>
            {t("catalog.search", { type: title })}
            <div className="catalog-search-row">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={type === "ANIME" ? t("catalog.animePlaceholder") : type === "MOVIE" ? t("catalog.moviePlaceholder") : type === "MANHWA" ? t("catalog.manhwaPlaceholder") : t("catalog.mangaPlaceholder")}
              />
              <button className="primary" disabled={catalogLoading}>
                <Search size={18} /> {t("common.search")}
              </button>
            </div>
          </label>
        </form>
        <label className="catalog-status-filter">
          {t("catalog.filterStatus")}
          <select value={statusFilter} onChange={(event) => {
            const nextStatus = event.target.value;
            setStatusFilter(nextStatus);
            loadTypeCatalog(query.trim(), nextStatus, 0);
          }} disabled={catalogLoading}>
            <option value="">{t("catalog.allStatuses")}</option>
            {["RELEASING", "FINISHED", "NOT_YET_RELEASED", "CANCELLED", "HIATUS"].map((value) => (
              <option key={value} value={value}>{t(`catalog.statuses.${value}`)}</option>
            ))}
          </select>
        </label>
        {isAdmin && (
          <button className="ghost" onClick={refreshFromProvider} disabled={loading || catalogLoading}>
            <RefreshCw size={18} /> {t("catalog.refreshAnilist")}
          </button>
        )}
      </section>

      <Notice message={status} onClose={clearStatus} />

      <section className="catalog-grid" ref={gridRef}>
        {pageData.items.length === 0 ? (
          <div className="empty">
            <Search size={34} />
            <p>{t("catalog.empty")}</p>
          </div>
        ) : (
          pageData.items.map((media) => (
            <article className="catalog-card" key={media.anilistId ?? media.id}>
              {media.coverImage
                ? <img src={media.coverImage} alt={media.titleLocalized || media.title} />
                : <div className="catalog-card-placeholder" aria-hidden="true" />}
              <div className="catalog-card-body" tabIndex="0">
                <span className="pill">{mediaTypeLabel(media.type, t)}</span>
                <h3>{media.titleLocalized || media.title}</h3>
                {media.titleLocalized && media.titleLocalized !== media.title && <small>{media.title}</small>}
                <p>{buildDetail(media, t)}</p>
                {media.genres?.length > 0 && <small>{media.genres.slice(0, 4).join(" / ")}</small>}
                <button className="primary catalog-detail-button" onClick={() => useMedia(media)}>
                  <Plus size={14} /> {t("catalog.viewDetails")}
                </button>
              </div>
            </article>
          ))
        )}
      </section>
      <CatalogPagination
        page={pageData.page}
        size={pageData.size}
        sizeOptions={sizeOptions}
        totalItems={pageData.totalItems}
        totalPages={pageData.totalPages}
        disabled={catalogLoading}
        onPageChange={(page) => loadTypeCatalog(query.trim(), statusFilter, page)}
        onSizeChange={(size) => loadTypeCatalog(query.trim(), statusFilter, 0, size)}
      />
    </div>
  );
}

function mediaTypeLabel(type, t) {
  if (type === "ANIME") return t("common.anime");
  if (type === "MOVIE") return t("common.movie");
  if (type === "MANHWA") return t("common.manhwa");
  return t("common.manga");
}

function buildDetail(media, t) {
  const year = media.seasonYear || media.startYear;
  const video = media.type === "ANIME" || media.type === "MOVIE";
  const total = video ? media.episodes : media.chapters;
  const latest = media.latestReleasedUnit;
  const parts = [
    year,
    total ? `${total} ${video ? t("common.episodesShort") : t("common.chaptersShort")}` : latest != null ? `Último publicado: ${latest}` : null,
    media.averageScore ? `${media.averageScore}/100` : null
  ].filter(Boolean);
  return parts.length ? parts.join(" - ") : media.status || t("common.anilistCatalog");
}
