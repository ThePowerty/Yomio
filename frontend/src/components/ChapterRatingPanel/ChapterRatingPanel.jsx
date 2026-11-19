import { Star, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";
import { Notice } from "../Notice/Notice";
import "./ChapterRatingPanel.css";

export function ChapterRatingPanel({ track, unit, onUnitChange, showUnitSelector = false }) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [rating, setRating] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const isVideo = track.type === "ANIME" || track.type === "MOVIE";
  const unitName = isVideo ? t("chapterRatings.episode") : t("chapterRatings.chapter");
  const maxUnit = Math.max(1, Number(track.currentChapter) || 1);

  useEffect(() => {
    loadRatings();
  }, [track.catalogMediaId, track.currentChapter]);

  useEffect(() => {
    setRating("");
    setPendingDelete(null);
  }, [unit]);

  async function loadRatings() {
    setBusy(true);
    try {
      setRatings(await apiRequest(`/api/media/${track.catalogMediaId}/ratings`, {}, token));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  const currentRating = ratings.find((item) => item.unitNumber === unit);
  const selectedRating = rating === "" ? currentRating?.rating : Number(rating);
  const average = useMemo(() => {
    if (!ratings.length) return null;
    return (ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length).toFixed(1);
  }, [ratings]);

  function changeUnit(rawValue) {
    const parsed = Number(rawValue) || 1;
    onUnitChange(Math.min(maxUnit, Math.max(1, parsed)));
  }

  async function saveRating(event) {
    event.preventDefault();
    if (!selectedRating) return;
    setBusy(true);
    setMessage("");
    try {
      await apiRequest(`/api/media/${track.catalogMediaId}/ratings`, {
        method: "PUT",
        body: JSON.stringify({ unitNumber: unit, rating: Number(selectedRating) })
      }, token);
      setRating("");
      setMessage(t("chapterRatings.saved"));
      await loadRatings();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeRating(id) {
    setBusy(true);
    setMessage("");
    try {
      await apiRequest(`/api/media/${track.catalogMediaId}/ratings/${id}`, { method: "DELETE" }, token);
      setPendingDelete(null);
      setMessage(t("chapterRatings.deleted"));
      await loadRatings();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="chapter-rating-panel">
      <Notice message={message} onClose={() => setMessage("")} />

      <div className="chapter-rating-summary" aria-label={t("chapterRatings.summaryLabel") }>
        <div><span>{t("chapterRatings.ratedUnits")}</span><strong>{ratings.length}</strong></div>
        <div><span>{t("chapterRatings.average")}</span><strong>{average ?? "—"}</strong></div>
        <div><span>{t("chapterRatings.progressLimit")}</span><strong>{track.currentChapter}</strong></div>
      </div>

      <div className="chapter-rating-layout">
        <form noValidate className="chapter-rating-compose" onSubmit={saveRating}>
          <div className="chapter-rating-heading">
            <span className="story-icon"><Star size={20} /></span>
            <div>
              <h3>{t("chapterRatings.rateUnit", { unit: unitName, number: unit })}</h3>
              <p>{t("chapterRatings.independentHint")}</p>
            </div>
          </div>

          {showUnitSelector && (
            <label>
              {t("chapterRatings.chooseUnit", { unit: unitName })}
              <input type="number" inputMode="numeric" min="1" max={maxUnit} value={unit}
                onChange={(event) => changeUnit(event.target.value)} />
              <small>{t("chapterRatings.chooseUnitHint", { max: track.currentChapter })}</small>
            </label>
          )}

          <fieldset>
            <legend>{t("chapterRatings.ratingScale")}</legend>
            <div className="chapter-rating-options" role="radiogroup" aria-label={t("chapterRatings.ratingScale") }>
              {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                <button type="button" role="radio" aria-checked={Number(selectedRating) === value}
                  className={Number(selectedRating) === value ? "active" : ""} key={value}
                  onClick={() => setRating(value)}>{value}</button>
              ))}
            </div>
          </fieldset>

          <button className="primary" disabled={busy || !selectedRating}>
            {currentRating ? t("chapterRatings.update") : t("chapterRatings.save")}
          </button>
        </form>

        <section className="chapter-rating-history" aria-labelledby="chapter-rating-history-title">
          <header>
            <div><span className="eyebrow">{t("chapterRatings.historyEyebrow")}</span><h3 id="chapter-rating-history-title">{t("chapterRatings.history")}</h3></div>
            <small>{t("chapterRatings.historyCount", { count: ratings.length })}</small>
          </header>
          {busy && ratings.length === 0 ? (
            <p className="muted">{t("common.loading")}</p>
          ) : ratings.length === 0 ? (
            <div className="chapter-rating-empty"><Star size={26} /><p>{t("chapterRatings.empty")}</p></div>
          ) : ratings.map((item) => (
            <article className="chapter-rating-row" key={item.id}>
              {pendingDelete === item.id ? (
                <div className="chapter-rating-delete" role="alertdialog" aria-label={t("chapterRatings.deleteLabel", { number: item.unitNumber })}>
                  <p>{t("chapterRatings.deleteQuestion", { unit: unitName, number: item.unitNumber })}</p>
                  <div>
                    <button className="ghost" type="button" onClick={() => setPendingDelete(null)}>{t("common.cancel")}</button>
                    <button className="danger-action" type="button" disabled={busy} onClick={() => removeRating(item.id)}>{t("common.delete")}</button>
                  </div>
                </div>
              ) : (
                <>
                  <button className="chapter-rating-row-main" type="button" onClick={() => onUnitChange(item.unitNumber)}>
                    <span>{t("chapterRatings.unitLabel", { unit: unitName, number: item.unitNumber })}</span>
                    <strong>{item.rating}/10</strong>
                  </button>
                  <button className="icon-button danger" type="button" aria-label={t("chapterRatings.deleteLabel", { number: item.unitNumber })}
                    onClick={() => setPendingDelete(item.id)}><Trash2 size={16} /></button>
                </>
              )}
            </article>
          ))}
        </section>
      </div>
    </section>
  );
}
