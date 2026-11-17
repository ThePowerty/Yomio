import { BookOpen, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TrackCard } from "../../components/TrackCard/TrackCard";
import { Notice } from "../../components/Notice/Notice";
import { useTracker } from "../../context/TrackerContext";
import "./TrackingPage.css";

export function TrackingPage() {
  const { t } = useTranslation();
  const {
    status,
    clearStatus,
    items,
    deleteItem,
    editItem,
    openNewTracking
  } = useTracker();

  return (
    <section className="tracking-page page-stack">
      <div className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">{t("tracking.library")}</span>
            <h2>{t("tracking.title")}</h2>
          </div>
          <button type="button" className="primary" onClick={openNewTracking}>
            <Plus size={18} /> {t("tracking.newTracking")}
          </button>
        </div>
        <Notice message={status} onClose={clearStatus} />

        <section className="list">
          {items.length === 0 ? (
            <div className="empty">
              <BookOpen size={34} />
              <p>{t("tracking.empty")}</p>
            </div>
          ) : (
            items.map((item) => (
              <TrackCard key={item.id} item={item} onEdit={editItem} onDelete={deleteItem} />
            ))
          )}
        </section>
      </div>

    </section>
  );
}
