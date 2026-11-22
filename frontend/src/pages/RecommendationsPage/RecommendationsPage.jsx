import { Plus, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { RecommendationList } from "../../components/RecommendationList/RecommendationList";
import { Notice } from "../../components/Notice/Notice";
import { CatalogPagination } from "../../components/CatalogPagination/CatalogPagination";
import { LoadingSkeleton } from "../../components/LoadingSkeleton/LoadingSkeleton";
import { useTracker } from "../../context/TrackerContext";
import { useAuth } from "../../context/AuthContext";
import "./RecommendationsPage.css";

export function RecommendationsPage() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const { recommendations, refreshCatalog, openNewTracking, loadRecommendations, dismissRecommendation, loadRecommendationPreferences, saveRecommendationPreferences, status, clearStatus, loading } = useTracker();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [columns, setColumns] = useState(0);
  const [typeFilter, setTypeFilter] = useState("ANIME");
  const [genre, setGenre] = useState("");
  const [publicationStatus, setPublicationStatus] = useState("");
  const [maxLength, setMaxLength] = useState("");
  const [includeFinished, setIncludeFinished] = useState(false);
  const [tasteGenres, setTasteGenres] = useState("");
  const [tasteFormats, setTasteFormats] = useState(["ANIME", "MANGA", "MANHWA"]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const gridRef = useRef(null);

  useEffect(() => {
    let active = true;
    setRecommendationsLoading(true);
    loadRecommendations({ type: typeFilter, genre, status: publicationStatus, maxLength, includeFinished })
      .finally(() => { if (active) setRecommendationsLoading(false); });
    return () => { active = false; };
  }, [typeFilter, genre, publicationStatus, maxLength, includeFinished]);

  useEffect(() => { loadRecommendationPreferences().then((value)=>{setTasteGenres((value.genres||[]).join(", "));if(value.formats?.length)setTasteFormats(value.formats);}); }, []);

  async function saveTastes(){await saveRecommendationPreferences({genres:tasteGenres.split(",").map(value=>value.trim()).filter(Boolean),formats:tasteFormats});}

  useEffect(() => {
    if (!gridRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const nextColumns = Math.max(1, Math.floor((entry.contentRect.width + 12) / 182));
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
        </div>
        <div className="recommendations-actions">
          {isAdmin && (
            <button className="ghost" onClick={refreshCatalog} disabled={loading}>
              <RefreshCw size={18} /> {t("recommendations.refreshAnilist")}
            </button>
          )}
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
      <details className="taste-selector"><summary>Ajustar mis gustos</summary><p>Útil si todavía no tienes historial suficiente.</p><div><label>Géneros preferidos<input value={tasteGenres} onChange={(event)=>setTasteGenres(event.target.value)} placeholder="Fantasy, Romance, Action" /></label><fieldset><legend>Formatos</legend>{["ANIME","MANGA","MANHWA"].map(value=><label key={value}><input type="checkbox" checked={tasteFormats.includes(value)} onChange={(event)=>setTasteFormats((current)=>event.target.checked?[...current,value]:current.filter(item=>item!==value))}/>{value}</label>)}</fieldset><button className="primary" type="button" onClick={saveTastes}>Guardar gustos</button></div></details>
      <div className="recommendation-advanced-filters">
        <label>Género<input value={genre} onChange={(event)=>setGenre(event.target.value)} placeholder="Fantasy, Action…" /></label>
        <label>Publicación<select value={publicationStatus} onChange={(event)=>setPublicationStatus(event.target.value)}><option value="">Cualquier estado</option><option value="RELEASING">En emisión</option><option value="FINISHED">Finalizada</option><option value="NOT_YET_RELEASED">Próximamente</option></select></label>
        <label>Extensión máxima<input type="number" min="1" value={maxLength} onChange={(event)=>setMaxLength(event.target.value)} placeholder="Sin límite" /></label>
        <label className="recommendation-check"><input type="checkbox" checked={includeFinished} onChange={(event)=>setIncludeFinished(event.target.checked)} /> Incluir completadas o descartadas</label>
      </div>
      {recommendationsLoading && visibleRecommendations.length === 0
        ? <LoadingSkeleton variant="media-grid" count={size} label={t("common.loading")} />
        : <RecommendationList recommendations={visibleRecommendations} onSelect={useRecommendation} onDismiss={dismissRecommendation} containerRef={gridRef} />}
      <CatalogPagination page={page} size={size} sizeOptions={sizeOptions} totalItems={filteredRecommendations.length}
        totalPages={totalPages} disabled={loading} onPageChange={setPage} onSizeChange={(nextSize) => {
          setSize(nextSize);
          setPage(0);
        }} />
      <Notice message={status} onClose={clearStatus} />
    </div>
  );
}
