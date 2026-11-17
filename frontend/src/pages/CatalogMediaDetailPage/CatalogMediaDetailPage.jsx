import { ArrowLeft, BookMarked, BookOpen, CheckCircle2, Minus, PauseCircle, Plus, Save, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTracker } from "../../context/TrackerContext";
import { Notice } from "../../components/Notice/Notice";
import { apiRequest } from "../../services/api";
import "./CatalogMediaDetailPage.css";

export function CatalogMediaDetailPage() {
  const { t } = useTranslation();
  const { id, type } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { form, setForm, saveItem, status, clearStatus, loading } = useTracker();
  const [media, setMedia] = useState(location.state?.media ?? null);
  const [detailLoading, setDetailLoading] = useState(!location.state?.media);

  useEffect(() => {
    let active = true;
    apiRequest(`/api/catalog/${id}`, {}, token)
      .then((data) => active && setMedia(data))
      .catch(() => active && setMedia(location.state?.media ?? null))
      .finally(() => active && setDetailLoading(false));
    return () => { active = false; };
  }, [id, token]);

  useEffect(() => {
    if (!media) return;
    setForm({
      title: media.titleLocalized || media.title,
      type: media.type,
      currentChapter: 0,
      totalChapters: media.type === "ANIME" || media.type === "MOVIE" ? media.episodes ?? "" : media.chapters ?? "",
      readingStatus: "PLAN_TO_READ",
      score: "",
      finished: false,
      notes: ""
    });
  }, [media]);

  const progress = useMemo(() => {
    const current = Number(form.currentChapter) || 0;
    const total = Number(form.totalChapters) || 0;
    return total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  }, [form.currentChapter, form.totalChapters]);

  function changeReadingStatus(readingStatus) {
    const completed = readingStatus === "COMPLETED";
    setForm({
      ...form,
      readingStatus,
      finished: completed,
      currentChapter: completed && form.totalChapters !== "" ? form.totalChapters : form.currentChapter,
      score: completed ? form.score : ""
    });
  }

  function changeChapter(rawValue) {
    const total = Number(form.totalChapters) || 0;
    const parsed = Number(rawValue);
    const nextChapter = Math.max(0, total > 0 ? Math.min(parsed, total) : parsed);
    const completed = total > 0 && nextChapter >= total;
    let readingStatus = form.readingStatus;
    if (completed) readingStatus = "COMPLETED";
    else if (readingStatus === "COMPLETED" || (readingStatus === "PLAN_TO_READ" && nextChapter > 0)) readingStatus = "READING";
    setForm({ ...form, currentChapter: nextChapter, readingStatus, finished: completed });
  }

  function adjustChapter(amount) {
    changeChapter((Number(form.currentChapter) || 0) + amount);
  }

  async function submit(event) {
    const saved = await saveItem(event);
    if (saved) navigate("/tracking");
  }

  if (detailLoading) return <div className="panel">{t("common.loading")}</div>;
  if (!media) return <div className="empty"><BookOpen size={34} /><p>{t("detail.notFound")}</p></div>;

  return (
    <div className="media-detail-page page-stack">
      <button className="ghost detail-back" type="button" onClick={() => navigate(`/catalog/${type}`)}>
        <ArrowLeft size={18} /> {t("detail.backToCatalog")}
      </button>

      <section className="media-detail-hero panel">
        {media.coverImage && <img className="media-detail-cover" src={media.coverImage} alt="" />}
        <div className="media-detail-copy">
          <span className="pill">{mediaTypeLabel(media.type, t)}</span>
          <h2>{media.titleLocalized || media.title}</h2>
          {media.titleLocalized && media.titleLocalized !== media.title && <p className="media-detail-original-title">{media.title}</p>}
          <p className="media-detail-meta">{buildMetadata(media, t)}</p>
          {media.genres?.length > 0 && <p className="media-detail-genres">{media.genres.join(" · ")}</p>}
          {media.description && <p className="media-detail-description">{media.description}</p>}
        </div>
      </section>

      <form className="panel tracking-detail-form stack" onSubmit={submit}>
        <header>
          <span className="eyebrow">{t("detail.step")}</span>
          <h2>{t("detail.registerProgress")}</h2>
          <p className="tracking-form-hint">{t("detail.trackingHint")}</p>
        </header>

        <fieldset className="status-fieldset">
          <legend>{t("modal.readingStatus")}</legend>
          <div className="status-options">
            {STATUS_OPTIONS.map(({ value, Icon }) => (
              <button type="button" key={value} className={form.readingStatus === value ? "active" : ""}
                onClick={() => changeReadingStatus(value)}>
                <Icon size={17} /> {t(`readingStatus.${value}`)}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="tracking-quick-grid">
          <label className="chapter-control-field">
            {t("modal.currentChapter")}
            <div className="chapter-stepper">
              <button type="button" onClick={() => adjustChapter(-1)} disabled={Number(form.currentChapter) <= 0}
                aria-label={t("detail.decrementChapter")}><Minus size={18} /></button>
              <input type="number" min="0" max={form.totalChapters || undefined} value={form.currentChapter}
                onChange={(event) => changeChapter(event.target.value)} required />
              <button type="button" onClick={() => adjustChapter(1)}
                disabled={Boolean(form.totalChapters) && Number(form.currentChapter) >= Number(form.totalChapters)}
                aria-label={t("detail.incrementChapter")}><Plus size={18} /></button>
            </div>
          </label>
          <div className="progress-field" aria-label={t("modal.progress") }>
            <span>{t("modal.progress")}</span>
            <strong>{progress}%</strong>
            <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
          </div>
          <div className="total-chapters-summary">
            <span>{t("modal.totalChapters")}</span>
            <strong>{form.totalChapters || t("common.noData")}</strong>
          </div>
        </div>

        <fieldset className="rating-fieldset" disabled={form.readingStatus !== "COMPLETED"}>
          <legend>{t("modal.score")}</legend>
          <div className="rating-options">
            {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
              <button type="button" key={value} className={Number(form.score) === value ? "active" : ""}
                onClick={() => setForm({ ...form, score: value })}>{value}</button>
            ))}
          </div>
          {form.readingStatus !== "COMPLETED" && <small>{t("modal.scoreDisabledPlaceholder")}</small>}
        </fieldset>

        <label>
          {t("modal.notes")}
          <textarea rows="3" maxLength="1000" value={form.notes}
            placeholder={t("modal.reviewPlaceholder")}
            onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </label>
        <Notice message={status} onClose={clearStatus} />
        <button className="primary detail-save" disabled={loading}>
          <Save size={18} /> {t("detail.addTracking")}
        </button>
      </form>
    </div>
  );
}

const STATUS_OPTIONS = [
  { value: "PLAN_TO_READ", Icon: BookMarked },
  { value: "READING", Icon: BookOpen },
  { value: "PAUSED", Icon: PauseCircle },
  { value: "COMPLETED", Icon: CheckCircle2 },
  { value: "DROPPED", Icon: XCircle }
];

function mediaTypeLabel(type, t) {
  if (type === "ANIME") return t("common.anime");
  if (type === "MOVIE") return t("common.movie");
  if (type === "MANHWA") return t("common.manhwa");
  return t("common.manga");
}

function buildMetadata(media, t) {
  const video = media.type === "ANIME" || media.type === "MOVIE";
  const total = video ? media.episodes : media.chapters;
  return [media.startYear || media.seasonYear, total ? `${total} ${video ? t("common.episodesShort") : t("common.chaptersShort")}` : null, media.status, media.averageScore ? `${media.averageScore}/100` : null]
    .filter(Boolean).join(" · ");
}
