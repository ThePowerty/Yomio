import { ArrowLeft, BookMarked, BookOpen, Eye, Save, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTracker } from "../../context/TrackerContext";
import { LoadingSkeleton } from "../../components/LoadingSkeleton/LoadingSkeleton";
import { Notice } from "../../components/Notice/Notice";
import { apiRequest } from "../../services/api";
import "./CatalogMediaDetailPage.css";

export function CatalogMediaDetailPage() {
  const { t } = useTranslation();
  const { id, type } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { form, setForm, saveItem, addToWishlist, status, clearStatus, loading } = useTracker();
  const [media, setMedia] = useState(location.state?.media ?? null);
  const [detailLoading, setDetailLoading] = useState(!location.state?.media);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const registerButtonRef = useRef(null);
  const dialogRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => {
    let active = true;
    apiRequest(`/api/catalog/${id}`, {}, token)
      .then((data) => active && setMedia(data))
      .catch(() => active && setMedia(location.state?.media ?? null))
      .finally(() => active && setDetailLoading(false));
    return () => { active = false; };
  }, [id, token]);

  useEffect(() => {
    if (media) setForm(createTrackForm(media));
  }, [media, setForm]);

  useEffect(() => {
    if (!registrationOpen) return undefined;
    const previousFocus = document.activeElement;
    statusRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!loading) setRegistrationOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), select:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      (previousFocus?.isConnected ? previousFocus : registerButtonRef.current)?.focus();
    };
  }, [registrationOpen, loading]);

  const isVideo = media?.type === "ANIME" || media?.type === "MOVIE";
  const isMovie = media?.type === "MOVIE";
  const isReleasing = media?.status?.toUpperCase() === "RELEASING";
  const knownTotal = isVideo ? media?.episodes : media?.chapters;
  const maximumUnit = Number((isReleasing ? media?.latestReleasedUnit : knownTotal || media?.latestReleasedUnit)) || 0;
  const limitKind = isReleasing && media?.latestReleasedUnit ? "latest" : knownTotal ? "total" : media?.latestReleasedUnit ? "latest" : "unknown";
  const progress = useMemo(() => {
    const current = Number(form.currentChapter) || 0;
    return maximumUnit > 0 ? Math.min(100, Math.round((current / maximumUnit) * 100)) : 0;
  }, [form.currentChapter, maximumUnit]);

  function openRegistration() {
    clearStatus();
    setFormError("");
    setForm(createTrackForm(media));
    setRegistrationOpen(true);
  }

  function closeRegistration() {
    if (loading) return;
    setRegistrationOpen(false);
    setFormError("");
    clearStatus();
  }

  function changeReadingStatus(readingStatus) {
    const completed = readingStatus === "COMPLETED";
    const atLatestRelease = readingStatus === "UP_TO_DATE";
    setForm({
      ...form,
      readingStatus,
      finished: completed,
      currentChapter: completed && isMovie ? maximumUnit || 1
        : (completed || atLatestRelease) && maximumUnit > 0 ? maximumUnit
        : isMovie ? 0 : form.currentChapter
    });
    setFormError("");
  }

  function changeChapter(rawValue) {
    const parsed = rawValue === "" ? "" : Math.max(0, Number(rawValue));
    const nextChapter = parsed === "" ? "" : maximumUnit > 0 ? Math.min(parsed, maximumUnit) : parsed;
    const noLongerAtEnd = ["COMPLETED", "UP_TO_DATE"].includes(form.readingStatus) && Number(nextChapter) < maximumUnit;
    setForm({
      ...form,
      currentChapter: nextChapter,
      readingStatus: noLongerAtEnd ? "READING" : form.readingStatus,
      finished: noLongerAtEnd ? false : form.finished
    });
    setFormError("");
  }

  async function submit(event) {
    event.preventDefault();
    const current = Number(form.currentChapter);
    if (!Number.isInteger(current) || current < 0 || (maximumUnit > 0 && current > maximumUnit)) {
      setFormError(t("detail.progressError", { max: maximumUnit }));
      return;
    }
    const saved = await saveItem(event);
    if (saved) {
      setRegistrationOpen(false);
      navigate("/tracking");
    }
  }

  async function savePending() {
    clearStatus();
    const saved = await addToWishlist(media.id, false);
    if (saved) navigate("/wishlist");
  }

  if (detailLoading) return <LoadingSkeleton variant="detail" label={t("common.loading")} />;
  if (!media) return <div className="empty"><BookOpen size={34} /><p>{t("detail.notFound")}</p></div>;

  const activeStatusLabel = isMovie ? t("movieStatus.READING") : isVideo ? t("detail.watching") : t("detail.reading");
  const unitLabel = isVideo ? t("detail.episode") : t("detail.chapter");

  return (
    <div className="media-detail-page page-stack">
      <button className="ghost detail-back" type="button" onClick={() => navigate(`/catalog/${type}`)}>
        <ArrowLeft size={18} /> {t("detail.backToCatalog")}
      </button>

      <section className="media-detail-hero panel">
        {media.coverImage && <img className="media-detail-cover" src={media.coverImage} alt={`Portada de ${media.titleLocalized || media.title}`} />}
        <div className="media-detail-copy">
          <span className="pill">{mediaTypeLabel(media.type, t)}</span>
          <h2>{media.titleLocalized || media.title}</h2>
          {media.titleLocalized && media.titleLocalized !== media.title && <p className="media-detail-original-title">{media.title}</p>}
          <p className="media-detail-meta">{buildMetadata(media, t)}</p>
          {media.genres?.length > 0 && <p className="media-detail-genres">{media.genres.join(" · ")}</p>}
          {media.description && <p className="media-detail-description">{media.description}</p>}
        </div>
      </section>

      <section className="detail-actions-panel panel" aria-labelledby="detail-actions-title">
        <div>
          <span className="eyebrow">{t("detail.yourLibrary")}</span>
          <h2 id="detail-actions-title">{t("detail.whatNext")}</h2>
          <p>{t("detail.actionHint")}</p>
        </div>
        <div className="detail-primary-actions">
          <button ref={registerButtonRef} className="primary" type="button" onClick={openRegistration}>
            {isVideo ? <Eye size={18} /> : <BookOpen size={18} />}
            {isVideo ? t("detail.registerViewing") : t("detail.registerReading")}
          </button>
          <button className="ghost" type="button" disabled={loading} onClick={savePending}>
            <BookMarked size={18} /> {t("detail.addWishlist")}
          </button>
        </div>
        {!registrationOpen && <Notice message={status} onClose={clearStatus} />}
      </section>

      {registrationOpen && (
        <div className="registration-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeRegistration();
        }}>
          <section ref={dialogRef} className="registration-modal" role="dialog" aria-modal="true"
            aria-labelledby="registration-title" aria-describedby="registration-description">
            <header className="registration-modal-header">
              <div>
                <span className="eyebrow">{mediaTypeLabel(media.type, t)}</span>
                <h2 id="registration-title">{isVideo ? t("detail.registerViewing") : t("detail.registerReading")}</h2>
                <p id="registration-description">{media.titleLocalized || media.title}</p>
              </div>
              <button className="icon-button" type="button" onClick={closeRegistration} disabled={loading}
                aria-label={t("common.close")}><X size={19} /></button>
            </header>

            <form noValidate className="registration-form" onSubmit={submit}>
              <label>
                {t("detail.status")}
                <select ref={statusRef} value={form.readingStatus} onChange={(event) => changeReadingStatus(event.target.value)}>
                  <option value="READING">{activeStatusLabel}</option>
                  {isReleasing
                    ? <option value="UP_TO_DATE" disabled={maximumUnit === 0}>{t(isMovie ? "movieStatus.UP_TO_DATE" : "detail.upToDate")}</option>
                    : <option value="COMPLETED">{t(isMovie ? "movieStatus.COMPLETED" : "detail.finished")}</option>}
                  <option value="DROPPED">{t(isMovie ? "movieStatus.DROPPED" : "detail.dropped")}</option>
                </select>
              </label>

              {!isMovie && <div className="registration-progress-grid">
                <div className="available-unit-card">
                  <span>{limitKind === "total" ? t("detail.totalAvailable", { unit: unitLabel }) : t("detail.latestAvailable", { unit: unitLabel })}</span>
                  <strong>{maximumUnit || "—"}</strong>
                  <small>{limitKind === "unknown" ? t("detail.limitUnknown") : limitKind === "total" ? t("detail.finishedWork") : t("detail.ongoingWork")}</small>
                </div>
                <label>
                  {t("detail.currentUnit", { unit: unitLabel })}
                  <input type="number" inputMode="numeric" min="0" max={maximumUnit || undefined}
                    value={form.currentChapter} onChange={(event) => changeChapter(event.target.value)}
                    aria-invalid={Boolean(formError)} aria-describedby={formError ? "registration-error" : "registration-progress-help"} />
                  <small id="registration-progress-help">{maximumUnit > 0 ? t("detail.progressLimit", { max: maximumUnit }) : t("detail.progressNoLimit")}</small>
                </label>
              </div>}

              {!isMovie && <div className="registration-progress" aria-label={t("modal.progress") }>
                <span>{t("modal.progress")}</span><strong>{progress}%</strong>
                <div><span style={{ width: `${progress}%` }} /></div>
              </div>}

              <label>
                {t("modal.notes")}
                <textarea rows="4" maxLength="1000" value={form.notes} placeholder={t("modal.reviewPlaceholder")}
                  onChange={(event) => setForm({ ...form, notes: event.target.value })} />
                <small>{t("detail.reviewOptional")}</small>
              </label>

              <fieldset className="rating-fieldset">
                <legend>{t("detail.overallRating")}</legend>
                <div className="rating-options" role="radiogroup" aria-label={t("detail.overallRating") }>
                  {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                    <button type="button" role="radio" aria-checked={Number(form.score) === value} key={value}
                      className={Number(form.score) === value ? "active" : ""}
                      onClick={() => setForm({ ...form, score: value })}>{value}</button>
                  ))}
                </div>
                <small>{t("detail.ratingOptional")}</small>
              </fieldset>

              {formError && <p className="registration-error" id="registration-error" role="alert">{formError}</p>}
              <Notice message={status} onClose={clearStatus} />
              <div className="registration-form-actions">
                <button className="ghost" type="button" disabled={loading} onClick={closeRegistration}>{t("common.cancel")}</button>
                <button className="primary" disabled={loading || form.currentChapter === ""}>
                  <Save size={18} /> {t("detail.saveRegistration")}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function createTrackForm(media) {
  const video = media.type === "ANIME" || media.type === "MOVIE";
  return {
    catalogMediaId: media.id,
    latestReleasedUnit: media.latestReleasedUnit ?? null,
    catalogStatus: media.status ?? null,
    title: media.titleLocalized || media.title,
    type: media.type,
    currentChapter: 0,
    totalChapters: (video ? media.episodes : media.chapters) ?? "",
    readingStatus: "READING",
    score: "",
    finished: false,
    notes: "",
    favorite: false
  };
}

function mediaTypeLabel(type, t) {
  if (type === "ANIME") return t("common.anime");
  if (type === "MOVIE") return t("common.movie");
  if (type === "MANHWA") return t("common.manhwa");
  return t("common.manga");
}

function buildMetadata(media, t) {
  const video = media.type === "ANIME" || media.type === "MOVIE";
  const total = video ? media.episodes : media.chapters;
  return [media.startYear || media.seasonYear, total && media.type !== "MOVIE" ? `${total} ${video ? t("common.episodesShort") : t("common.chaptersShort")}` : null, media.status, media.averageScore ? `${media.averageScore}/100` : null]
    .filter(Boolean).join(" · ");
}
