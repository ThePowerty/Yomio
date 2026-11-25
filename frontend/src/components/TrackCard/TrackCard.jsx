import { BookOpen, Check, Heart, Pencil, Star, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function TrackCard({ item, onEdit, onDelete }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isMovie = item.type === "MOVIE";
  const statusKey = item.readingStatus ?? (item.finished ? "COMPLETED" : "READING");

  return (
    <article className="track-card">
      <div className="track-main">
        <div>
          <span className="pill">{item.type === "ANIME" ? t("common.anime") : item.type === "MOVIE" ? t("common.movie") : item.type === "MANHWA" ? t("common.manhwa") : t("common.manga")}</span>
          <h3>{item.title}</h3>
        </div>
        <div className="track-meta">
          {!isMovie && <span>{item.totalChapters
            ? t("tracking.chaptersReadWithTotal", { current: item.currentChapter, total: item.totalChapters })
            : t("tracking.chaptersRead", { current: item.currentChapter })}</span>}
          {!isMovie && <span>{t("tracking.progress", { value: item.progress ?? 0 })}</span>}
          <span>{t("tracking.readingStatus", { value: t(`${isMovie ? "movieStatus" : "readingStatus"}.${statusKey}`) })}</span>
          <span>{t("tracking.rating", { value: item.score ?? "-" })}</span>
          {item.finished && !isMovie && <span className="done"><Check size={14} /> {t("tracking.completed")}</span>}
          {item.favorite && <span className="pill"><Heart size={14}/> Favorita</span>}
        </div>
        {item.notes && <p><strong>{t("tracking.review")}:</strong> {item.notes}</p>}
      </div>
      <div className="track-actions">
        {item.catalogMediaId && <button className="ghost track-rating-action" type="button" onClick={() => navigate(`/ratings/${item.catalogMediaId}`)}><Star size={17} aria-hidden="true" /> {t(isMovie ? "tracking.rateMovie" : item.type === "ANIME" ? "tracking.rateEpisodes" : "tracking.rateChapters")}</button>}
        {item.catalogMediaId && <button className="icon-button" type="button" onClick={() => navigate(`/stories/${item.catalogMediaId}`)} title={t("tracking.openStoryTools")} aria-label={t("tracking.openStoryTools")}><BookOpen size={18}/></button>}
        {onEdit && <button className="icon-button" type="button" onClick={() => onEdit(item)} title={t("tracking.editProgress")} aria-label={t("tracking.editProgress")}><Pencil size={18}/></button>}
        {onDelete && !confirmDelete && <button className="icon-button danger" type="button" onClick={() => setConfirmDelete(true)} title={t("common.delete")} aria-label={t("common.delete")}><Trash2 size={18} aria-hidden="true" /></button>}
      </div>
      {confirmDelete && <div className="track-delete-confirm" role="alertdialog" aria-label={`Eliminar ${item.title}`}><p>¿Eliminar “{item.title}” y su progreso?</p><div><button className="ghost" type="button" onClick={()=>setConfirmDelete(false)}>Cancelar</button><button className="danger-action" type="button" onClick={()=>onDelete(item.id)}>Eliminar</button></div></div>}
    </article>
  );
}
