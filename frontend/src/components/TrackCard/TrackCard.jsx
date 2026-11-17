import { Check, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function TrackCard({ item, onEdit, onDelete }) {
  const { t } = useTranslation();

  return (
    <article className="track-card">
      <div className="track-main" onClick={() => onEdit(item)}>
        <div>
          <span className="pill">{item.type === "ANIME" ? t("common.anime") : item.type === "MOVIE" ? t("common.movie") : item.type === "MANHWA" ? t("common.manhwa") : t("common.manga")}</span>
          <h3>{item.title}</h3>
        </div>
        <div className="track-meta">
          <span>{item.totalChapters
            ? t("tracking.chaptersReadWithTotal", { current: item.currentChapter, total: item.totalChapters })
            : t("tracking.chaptersRead", { current: item.currentChapter })}</span>
          <span>{t("tracking.progress", { value: item.progress ?? 0 })}</span>
          <span>{t("tracking.readingStatus", { value: t(`readingStatus.${item.readingStatus ?? "READING"}`) })}</span>
          <span>{t("tracking.rating", { value: item.score ?? "-" })}</span>
          {item.finished && <span className="done"><Check size={14} /> {t("tracking.completed")}</span>}
        </div>
        {item.notes && <p><strong>{t("tracking.review")}:</strong> {item.notes}</p>}
      </div>
      {onDelete && (
        <button className="icon-button danger" onClick={() => onDelete(item.id)} title={t("common.delete")}>
          <Trash2 size={18} />
        </button>
      )}
    </article>
  );
}
