import { BookOpen, Search, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useTracker } from "../../context/TrackerContext";
import { Notice } from "../Notice/Notice";
import "./TrackingEditorModal.css";

export function TrackingEditorModal() {
  const { t } = useTranslation();
  const {
    form,
    setForm,
    editingId,
    editorOpen,
    closeEditor,
    loadCatalog,
    saveItem,
    status,
    clearStatus,
    loading
  } = useTracker();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [results, setResults] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  useEffect(() => {
    if (editorOpen && !editingId) {
      searchCatalog("", "");
    }
  }, [editorOpen, editingId]);

  if (!editorOpen) {
    return null;
  }

  async function searchCatalog(searchTerm = query.trim(), mediaType = type) {
    setCatalogLoading(true);
    const data = await loadCatalog(searchTerm, mediaType);
    setResults(data);
    setCatalogLoading(false);
  }

  async function submitSearch(event) {
    event.preventDefault();
    await searchCatalog();
  }

  async function changeType(nextType) {
    setType(nextType);
    await searchCatalog(query.trim(), nextType);
  }

  function selectMedia(media) {
    closeEditor();
    navigate(`/catalog/${media.type.toLowerCase()}/${media.id}`, { state: { media } });
  }

  function updateReadingStatus(readingStatus) {
    const completed = readingStatus === "COMPLETED";
    const atLatestRelease = readingStatus === "UP_TO_DATE";
    const releasing = form.catalogStatus?.toUpperCase() === "RELEASING";
    const maximumUnit = releasing ? form.latestReleasedUnit : form.totalChapters || form.latestReleasedUnit;
    setForm({
      ...form,
      readingStatus,
      finished: completed,
      currentChapter: (completed || atLatestRelease) && maximumUnit ? maximumUnit : form.currentChapter
    });
  }

  function updateProgress(currentChapter) {
    const releasing = form.catalogStatus?.toUpperCase() === "RELEASING";
    const maximumUnit = Number(releasing ? form.latestReleasedUnit : form.totalChapters || form.latestReleasedUnit) || 0;
    const belowEnd = ["COMPLETED", "UP_TO_DATE"].includes(form.readingStatus)
      && Number(currentChapter) < maximumUnit;
    setForm({
      ...form,
      currentChapter,
      readingStatus: belowEnd ? "READING" : form.readingStatus,
      finished: belowEnd ? false : form.finished
    });
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="tracking-modal" role="dialog" aria-modal="true" aria-labelledby="tracking-modal-title">
        <header className="tracking-modal-header">
          <div>
            <span className="eyebrow">{editingId ? t("modal.eyebrow") : t("modal.stepOne")}</span>
            <h2 id="tracking-modal-title">{editingId ? t("modal.editTitle") : t("modal.chooseTitle")}</h2>
            {!editingId && <p className="modal-hint">{t("modal.chooseHint")}</p>}
          </div>
          <button type="button" className="icon-button" onClick={closeEditor} title={t("common.close")}>
            <X size={18} />
          </button>
        </header>

        {!editingId && (
          <section className="catalog-picker">
            <form noValidate className="catalog-picker-search" onSubmit={submitSearch}>
              <label>
                {t("modal.searchCatalog")}
                <div className="catalog-picker-row">
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t("modal.searchPlaceholder")}
                  />
                  <button className="primary" disabled={catalogLoading}>
                    <Search size={18} /> {t("common.search")}
                  </button>
                </div>
              </label>
            </form>

            <div className="segmented-control" aria-label={t("modal.catalogType")}>
              <button type="button" className={type === "" ? "active" : ""} onClick={() => changeType("")}>
                {t("common.all")}
              </button>
              <button type="button" className={type === "ANIME" ? "active" : ""} onClick={() => changeType("ANIME")}>
                {t("common.anime")}
              </button>
              <button type="button" className={type === "MANGA" ? "active" : ""} onClick={() => changeType("MANGA")}>
                {t("common.manga")}
              </button>
              <button type="button" className={type === "MANHWA" ? "active" : ""} onClick={() => changeType("MANHWA")}>
                {t("common.manhwa")}
              </button>
              <button type="button" className={type === "MOVIE" ? "active" : ""} onClick={() => changeType("MOVIE")}>
                {t("common.movie")}
              </button>
            </div>

            <div className="catalog-picker-list">
              {results.length === 0 ? (
                <div className="empty compact">
                  <BookOpen size={28} />
                  <p>{t("modal.emptyCatalog")}</p>
                </div>
              ) : (
                results.map((media) => (
                  <button
                    type="button"
                    className={`catalog-picker-item ${form.title === (media.titleLocalized || media.title) ? "selected" : ""}`}
                    key={media.anilistId ?? media.id}
                    onClick={() => selectMedia(media)}
                  >
                    <span className="catalog-picker-cover">
                      {media.coverImage && <img src={media.coverImage} alt={`Portada de ${media.titleLocalized || media.title}`} />}
                    </span>
                    <span>
                      <strong>{media.titleLocalized || media.title}</strong>
                      <small>
                        {mediaTypeLabel(media.type, t)}
                        {buildTotal(media, t)}
                      </small>
                    </span>
                  </button>
                ))
              )}
            </div>
            <Notice message={status} onClose={clearStatus} />
          </section>
        )}

        {editingId && <form noValidate className="tracking-modal-form stack" onSubmit={saveItem}>
          <div className="grid-2">
            <label>
              {t("modal.title")}
              <input value={form.title} readOnly required />
            </label>

            <label>
              {t("modal.type")}
              <input value={mediaTypeLabel(form.type, t)} readOnly required />
            </label>
          </div>

          <div className="grid-2">
            <label>
              {t("modal.currentChapter")}
              <input
                type="number"
                min="0"
                max={(form.catalogStatus?.toUpperCase() === "RELEASING" ? form.latestReleasedUnit : form.totalChapters || form.latestReleasedUnit) || undefined}
                value={form.currentChapter}
                onChange={(event) => updateProgress(event.target.value)}
                required
              />
            </label>

            <label>
              {t("modal.totalChapters")}
              <input value={(form.catalogStatus?.toUpperCase() === "RELEASING" ? form.latestReleasedUnit : form.totalChapters || form.latestReleasedUnit) || t("common.noData")} readOnly />
            </label>
          </div>

          <div className="grid-2">
            <label>
              {t("modal.readingStatus")}
              <select value={form.readingStatus} onChange={(event) => updateReadingStatus(event.target.value)}>
                {Object.keys(t("readingStatus", { returnObjects: true })).filter((statusKey) => {
                  if (statusKey === "PLAN_TO_READ") return false;
                  const releasing = form.catalogStatus?.toUpperCase() === "RELEASING";
                  return releasing ? statusKey !== "COMPLETED" : statusKey !== "UP_TO_DATE";
                }).map((statusKey) => (
                  <option key={statusKey} value={statusKey}>{t(`readingStatus.${statusKey}`)}</option>
                ))}
              </select>
            </label>

            <label>
              {t("modal.score")}
              <input
                type="number"
                min="1"
                max="10"
                value={form.score}
                onChange={(event) => setForm({ ...form, score: event.target.value })}
                placeholder={t("modal.scoreEnabledPlaceholder")}
              />
            </label>
          </div>

          <label>
            {t("modal.notes")}
            <textarea
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              placeholder={t("modal.reviewPlaceholder")}
              maxLength={1000}
              rows={3}
            />
          </label>
          <label className="spoiler-check"><input type="checkbox" checked={form.favorite} onChange={(event)=>setForm({...form,favorite:event.target.checked})}/> Marcar como favorita</label>

          <Notice message={status} onClose={clearStatus} />

          <div className="tracking-form-actions">
            <button type="button" className="ghost" onClick={closeEditor}>
              {t("common.cancel")}
            </button>
            <button className="primary" disabled={loading || !form.title}>
              <Save size={18} /> {t("common.save")}
            </button>
          </div>
        </form>}
      </section>
    </div>
  );
}

function buildTotal(media, t) {
  const video = media.type === "ANIME" || media.type === "MOVIE";
  const total = video ? media.episodes : media.chapters;
  return total ? ` - ${total} ${video ? t("common.episodesShort") : t("common.chaptersShort")}` : "";
}

function mediaTypeLabel(type, t) {
  if (type === "ANIME") return t("common.anime");
  if (type === "MOVIE") return t("common.movie");
  if (type === "MANHWA") return t("common.manhwa");
  return t("common.manga");
}
