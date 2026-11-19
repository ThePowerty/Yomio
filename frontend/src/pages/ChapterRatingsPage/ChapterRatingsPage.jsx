import { ArrowLeft, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { ChapterRatingPanel } from "../../components/ChapterRatingPanel/ChapterRatingPanel";
import { useAuth } from "../../context/AuthContext";
import { useTracker } from "../../context/TrackerContext";
import { apiRequest } from "../../services/api";
import "./ChapterRatingsPage.css";

export function ChapterRatingsPage() {
  const { t } = useTranslation();
  const { mediaId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { items } = useTracker();
  const [media, setMedia] = useState(null);
  const track = items.find((item) => String(item.catalogMediaId) === String(mediaId));
  const [unit, setUnit] = useState(1);

  useEffect(() => {
    apiRequest(`/api/catalog/${mediaId}`, {}, token).then(setMedia).catch(() => setMedia(null));
  }, [mediaId, token]);

  useEffect(() => {
    if (track) setUnit(Math.max(1, Number(track.currentChapter) || 1));
  }, [track?.id]);

  if (!track) {
    return <div className="empty"><Star size={34} /><p>{t("chapterRatings.trackingRequired")}</p></div>;
  }
  const isVideo = track.type === "ANIME" || track.type === "MOVIE";

  return (
    <div className="chapter-ratings-page page-stack">
      <button className="ghost detail-back" type="button" onClick={() => navigate("/tracking")}>
        <ArrowLeft size={18} /> {t("chapterRatings.back")}
      </button>
      <section className="chapter-ratings-hero panel">
        <span className="chapter-ratings-hero-icon"><Star size={22} /></span>
        <div>
          <span className="eyebrow">{t(isVideo ? "chapterRatings.eyebrowEpisodes" : "chapterRatings.eyebrowChapters")}</span>
          <h2>{media?.titleLocalized || track.title}</h2>
          <p>{t(isVideo ? "chapterRatings.descriptionEpisodes" : "chapterRatings.descriptionChapters")}</p>
        </div>
      </section>
      <section className="panel">
        <ChapterRatingPanel track={track} unit={unit} onUnitChange={setUnit} showUnitSelector />
      </section>
    </div>
  );
}
