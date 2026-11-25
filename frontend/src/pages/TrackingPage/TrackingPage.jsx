import { ArrowRight, BookOpen, Plus, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { RecommendationCarousel } from "../../components/RecommendationCarousel/RecommendationCarousel";
import { TrackCard } from "../../components/TrackCard/TrackCard";
import { Notice } from "../../components/Notice/Notice";
import { LoadingSkeleton } from "../../components/LoadingSkeleton/LoadingSkeleton";
import { useTracker } from "../../context/TrackerContext";
import "./TrackingPage.css";

export function TrackingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    status,
    clearStatus,
    items,
    recommendations,
    deleteItem,
    editItem,
    openNewTracking,
    initialLoading
  } = useTracker();
  const trackingRecommendations = recommendations.slice(0, 4);

  function openRecommendation(item) {
    navigate(`/catalog/${item.type.toLowerCase()}/${item.id}`, { state: { media: item } });
  }

  return (
    <section className="tracking-page page-stack">
      <div className="tracking-layout">
        <div className="panel tracking-library">
          <div className="panel-header">
            <span className="eyebrow">{t("tracking.library")}</span>
            <button type="button" className="primary" onClick={openNewTracking}>
              <Plus size={18} aria-hidden="true" /> {t("tracking.newTracking")}
            </button>
          </div>
          <Notice message={status} onClose={clearStatus} />

          <section className="list" aria-label={t("tracking.library")}>
            {initialLoading ? (
              <LoadingSkeleton variant="list" count={5} label={t("common.loading")} />
            ) : items.length === 0 ? (
              <div className="empty">
                <BookOpen size={34} aria-hidden="true" />
                <p>{t("tracking.empty")}</p>
              </div>
            ) : (
              items.map((item) => (
                <TrackCard key={item.id} item={item} onEdit={editItem} onDelete={deleteItem} />
              ))
            )}
          </section>
        </div>

        <aside className="panel tracking-recommendations-panel" aria-label={t("tracking.recommendationsTitle")}>
          <div className="panel-header">
            <div>
              <span className="eyebrow">{t("tracking.recommendationsEyebrow")}</span>
              <h2>{t("tracking.recommendationsTitle")}</h2>
            </div>
            <button className="ghost tracking-recommendations-link" type="button" onClick={() => navigate("/recommendations")}>
              {t("tracking.viewRecommendations")} <ArrowRight size={16} />
            </button>
          </div>
          {initialLoading ? (
            <LoadingSkeleton variant="list" count={3} label={t("common.loading")} />
          ) : trackingRecommendations.length === 0 ? (
            <div className="empty compact tracking-recommendations-empty">
              <Sparkles size={28} />
              <p>{t("recommendations.empty")}</p>
            </div>
          ) : (
            <RecommendationCarousel recommendations={trackingRecommendations} onSelect={openRecommendation} />
          )}
        </aside>
      </div>
    </section>
  );
}
