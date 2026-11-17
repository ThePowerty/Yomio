import { Plus, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { RecommendationList } from "../../components/RecommendationList/RecommendationList";
import { Notice } from "../../components/Notice/Notice";
import { CatalogPagination } from "../../components/CatalogPagination/CatalogPagination";
import { useTracker } from "../../context/TrackerContext";
import "./RecommendationsPage.css";

export function RecommendationsPage() {
  const { t } = useTranslation();
  const { recommendations, refreshCatalog, openNewTracking, status, clearStatus, loading } = useTracker();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [columns, setColumns] = useState(0);
  const [typeFilter, setTypeFilter] = useState("ANIME");
  const gridRef = useRef(null);

  useEffect(() => {
    if (!gridRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const nextColumns = Math.max(1, Math.floor((entry.contentRect.width + 12) / 162));
      setColumns((current) => current === nextColumns ? current : nextColumns);
    });
    observer.observe(gridRef.current);
    return () => observer.disconnect();
  }, [recommendations.length]);

  useEffect(() => {
    if (columns > 0) {
      setSize(Math.min(columns * 2, 50));
      setPage(0);
    }
  }, [columns]);

  const sizeOptions = useMemo(() => {
    const visibleColumns = Math.max(columns, 1);
    const options = [2, 3, 4].map((rows) => visibleColumns * rows).filter((value) => value <= 50);
    return options.length ? options : [50];
  }, [columns]);
  const filteredRecommendations = useMemo(() => recommendations.filter((item) => item.type === typeFilter), [recommendations, typeFilter]);
  const totalPages = Math.ceil(filteredRecommendations.length / size);
  const visibleRecommendations = filteredRecommendations.slice(page * size, (page + 1) * size);

  useEffect(() => {
    if (page > 0 && page >= totalPages) setPage(Math.max(totalPages - 1, 0));
  }, [page, totalPages]);

  function useRecommendation(item) {
    navigate(`/catalog/${item.type.toLowerCase()}/${item.id}`, { state: { media: item } });
  }

  return (
    <div className="panel recommendations-page">
      <div className="panel-header">
        <div>
          <span className="eyebrow">{t("recommendations.pending")}</span>
          <h2>{t("recommendations.title")}</h2>
        </div>
        <div className="recommendations-actions">
          <button className="ghost" onClick={refreshCatalog} disabled={loading}>
            <RefreshCw size={18} /> {t("recommendations.refreshAnilist")}
          </button>
          <button className="primary" onClick={openNewTracking}>
            <Plus size={18} /> {t("recommendations.createTracking")}
          </button>
        </div>
      </div>
      <div className="recommendation-filters" aria-label={t("recommendations.filterByType")}>
        {["ANIME", "MANGA", "MANHWA"].map((value) => (
          <button type="button" key={value} className={typeFilter === value ? "active" : ""}
            onClick={() => { setTypeFilter(value); setPage(0); }}>
            {t(`common.${value.toLowerCase()}`)}
          </button>
        ))}
      </div>
      <RecommendationList recommendations={visibleRecommendations} onSelect={useRecommendation} containerRef={gridRef} />
      <CatalogPagination page={page} size={size} sizeOptions={sizeOptions} totalItems={filteredRecommendations.length}
        totalPages={totalPages} disabled={loading} onPageChange={setPage} onSizeChange={(nextSize) => {
          setSize(nextSize);
          setPage(0);
        }} />
      <Notice message={status} onClose={clearStatus} />
    </div>
  );
}
