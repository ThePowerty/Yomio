import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { RecommendationList } from "../RecommendationList/RecommendationList";
import "./RecommendationCarousel.css";

const ITEMS_PER_PAGE = 2;
const AUTOPLAY_MS = 5000;

export function RecommendationCarousel({ recommendations, onSelect }) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const pages = useMemo(() => Array.from(
    { length: Math.ceil(recommendations.length / ITEMS_PER_PAGE) },
    (_, index) => recommendations.slice(index * ITEMS_PER_PAGE, (index + 1) * ITEMS_PER_PAGE)
  ), [recommendations]);

  useEffect(() => {
    if (page >= pages.length) setPage(0);
  }, [page, pages.length]);

  useEffect(() => {
    if (paused || pages.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = window.setInterval(() => setPage((current) => (current + 1) % pages.length), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, pages.length]);

  function changePage(nextPage) {
    setPage((nextPage + pages.length) % pages.length);
  }

  const visibleRecommendations = pages[page] ?? [];
  return (
    <section className="home-recommendation-carousel" aria-label={t("home.recommendationCarousel")}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}>
      <div className="home-carousel-viewport" aria-live="polite">
        <div className="home-carousel-slide" key={page}>
          <RecommendationList recommendations={visibleRecommendations} onSelect={onSelect} />
        </div>
      </div>

      {pages.length > 1 && (
        <div className="home-carousel-controls">
          <button type="button" onClick={() => changePage(page - 1)} aria-label={t("home.previousRecommendations")}>
            <ChevronLeft size={18} />
          </button>
          <div className="home-carousel-dots">
            {pages.map((_, index) => (
              <button type="button" key={index} className={page === index ? "active" : ""}
                onClick={() => changePage(index)} aria-label={t("home.goToRecommendationPage", { page: index + 1 })}
                aria-current={page === index ? "true" : undefined} />
            ))}
          </div>
          <button type="button" onClick={() => changePage(page + 1)} aria-label={t("home.nextRecommendations")}>
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </section>
  );
}
