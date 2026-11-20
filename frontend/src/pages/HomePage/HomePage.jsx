import { ArrowRight, BarChart3, BookOpen, Check, Film, Plus, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { RecommendationCarousel } from "../../components/RecommendationCarousel/RecommendationCarousel";
import { StatCard } from "../../components/StatCard/StatCard";
import { TrackCard } from "../../components/TrackCard/TrackCard";
import { useTracker } from "../../context/TrackerContext";
import { ReleaseCalendarPage } from "../ReleaseCalendarPage/ReleaseCalendarPage";
import "./HomePage.css";

export function HomePage() {
  const { t } = useTranslation();
  const { stats, items, recommendations, editItem, openNewTracking } = useTracker();
  const navigate = useNavigate();
  const recentItems = items.slice(0, 4);
  const firstRecommendations = recommendations.slice(0, 4);

  function openEditor(item) {
    editItem(item);
    navigate("/tracking");
  }

  function useRecommendation(item) {
    navigate(`/catalog/${item.type.toLowerCase()}/${item.id}`, { state: { media: item } });
  }

  return (
    <div className="page-stack">
      <section className="stats-grid">
        <StatCard icon={BarChart3} label={t("home.stats.anime")} value={stats.anime} detail={t("home.stats.inProgress", { count: stats.inProgress })} />
        <StatCard icon={BookOpen} label={t("home.stats.manga")} value={stats.manga} detail={t("home.stats.finished", { count: stats.finished })} />
        <StatCard icon={BookOpen} label={t("home.stats.manhwa")} value={stats.manhwa} detail={t("home.stats.inProgress", { count: stats.inProgress })} />
        <StatCard icon={Film} label={t("home.stats.movies")} value={stats.movies} detail={t("home.stats.inProgress", { count: stats.inProgress })} />
        <StatCard icon={Check} label={t("home.stats.completed")} value={stats.finished} detail={t("home.stats.closedEntries")} />
        <StatCard icon={Sparkles} label={t("home.stats.averageScore")} value={stats.averageScore} detail={t("home.stats.outOfTen")} />
      </section>

      <section className="home-overview-grid">
        <section className="panel home-calendar-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">{t("home.calendarEyebrow")}</span>
              <h2>{t("home.calendarTitle")}</h2>
            </div>
            <button className="ghost home-calendar-link" type="button" onClick={() => navigate("/calendar")}>
              {t("home.viewCalendar")} <ArrowRight size={17} />
            </button>
          </div>
          <ReleaseCalendarPage compact />
        </section>

        <section className="home-content-grid">
          <div className="panel home-tracking-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">{t("home.trackingEyebrow")}</span>
              <h2>{t("home.recentActivity")}</h2>
            </div>
            <button className="primary" type="button" onClick={openNewTracking}>
              <Plus size={18} /> {t("home.new")}
            </button>
          </div>

          {recentItems.length === 0 ? (
            <div className="empty compact">
              <BookOpen size={30} />
              <p>{t("home.noTracking")}</p>
            </div>
          ) : (
            <div className="list home-tracking-list">
              {recentItems.map((item) => (
                <TrackCard key={item.id} item={item} onEdit={openEditor} />
              ))}
            </div>
          )}
          </div>

          <div className="panel home-recommendations-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">{t("home.ideas")}</span>
              <h2>{t("home.recommendations")}</h2>
            </div>
            <button className="ghost home-recommendations-link" type="button" onClick={() => navigate("/recommendations")}>
              {t("home.viewAllRecommendations")} <ArrowRight size={17} />
            </button>
          </div>
          <RecommendationCarousel recommendations={firstRecommendations} onSelect={useRecommendation} />
          </div>
        </section>
      </section>
    </div>
  );
}
