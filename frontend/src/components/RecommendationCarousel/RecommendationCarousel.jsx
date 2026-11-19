import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useTranslation } from "react-i18next";
import { RecommendationList } from "../RecommendationList/RecommendationList";
import "./RecommendationCarousel.css";

gsap.registerPlugin(useGSAP);

const ITEMS_PER_PAGE = 2;

export function RecommendationCarousel({ recommendations, onSelect, onDismiss }) {
  const { t } = useTranslation();
  const rootRef = useRef(null);
  const pageRef = useRef(0);
  const requestedPageRef = useRef(0);
  const transitionRef = useRef(null);
  const pendingNavigationRef = useRef(null);
  const transitionIdRef = useRef(0);
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [transition, setTransition] = useState(null);
  const reducedMotion = useReducedMotion();

  const pages = useMemo(() => {
    const result = [];
    for (let index = 0; index < recommendations.length; index += ITEMS_PER_PAGE) {
      result.push(recommendations.slice(index, index + ITEMS_PER_PAGE));
    }
    return result;
  }, [recommendations]);

  const normalizePage = (value) => {
    if (pages.length === 0) return 0;
    return (value + pages.length) % pages.length;
  };

  function navigateTo(targetPage, direction) {
    if (pages.length < 2) return;
    const normalizedTarget = normalizePage(targetPage);
    if (!transitionRef.current && normalizedTarget === requestedPageRef.current) return;
    requestedPageRef.current = normalizedTarget;

    if (transitionRef.current) {
      pendingNavigationRef.current = { targetPage: normalizedTarget, direction };
      return;
    }

    const nextTransition = {
      id: ++transitionIdRef.current,
      fromPage: pageRef.current,
      toPage: normalizedTarget,
      direction
    };
    transitionRef.current = nextTransition;
    setTransition(nextTransition);
  }

  function stepPage(direction) {
    navigateTo(requestedPageRef.current + direction, direction);
  }

  useEffect(() => {
    if (pages.length === 0) {
      pageRef.current = 0;
      requestedPageRef.current = 0;
      setPage(0);
      return;
    }

    const validPage = Math.min(pageRef.current, pages.length - 1);
    pageRef.current = validPage;
    requestedPageRef.current = validPage;
    setPage(validPage);
  }, [pages.length]);

  useEffect(() => {
    if (!transition && pendingNavigationRef.current) {
      const pending = pendingNavigationRef.current;
      pendingNavigationRef.current = null;
      const frame = requestAnimationFrame(() => navigateTo(pending.targetPage, pending.direction));
      return () => cancelAnimationFrame(frame);
    }
    return undefined;
  }, [transition]);

  useEffect(() => {
    if (paused || reducedMotion || pages.length < 2) return undefined;
    const interval = window.setInterval(() => stepPage(1), 5000);
    return () => window.clearInterval(interval);
  }, [paused, reducedMotion, pages.length]);

  useGSAP(() => {
    if (!transition) return undefined;

    const outgoingCards = gsap.utils.toArray("[data-carousel-layer='outgoing'] .recommendation-card");
    const incomingLayer = rootRef.current?.querySelector("[data-carousel-layer='incoming']");
    const incomingCards = gsap.utils.toArray("[data-carousel-layer='incoming'] .recommendation-card");
    const orderedOutgoing = transition.direction > 0 ? outgoingCards : [...outgoingCards].reverse();
    const orderedIncoming = transition.direction > 0 ? incomingCards : [...incomingCards].reverse();

    gsap.set(incomingLayer, { autoAlpha: 1 });
    gsap.set(orderedIncoming, reducedMotion
      ? { autoAlpha: 0 }
      : {
          autoAlpha: 0,
          xPercent: 46 * transition.direction,
          scale: 0.94
        });

    const timeline = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        pageRef.current = transition.toPage;
        setPage(transition.toPage);
        transitionRef.current = null;
        setTransition(null);
      }
    });

    if (reducedMotion) {
      timeline
        .to(orderedOutgoing, { autoAlpha: 0, duration: 0.14 }, 0)
        .to(orderedIncoming, {
          autoAlpha: 1,
          duration: 0.14,
          clearProps: "opacity,visibility"
        }, 0.04);
    } else {
      timeline
        .to(orderedOutgoing, {
          autoAlpha: 0,
          xPercent: -34 * transition.direction,
          scale: 0.96,
          duration: 0.28,
          stagger: 0.05
        }, 0)
        .to(orderedIncoming, {
          autoAlpha: 1,
          xPercent: 0,
          scale: 1,
          duration: 0.4,
          stagger: 0.07,
          clearProps: "transform,opacity,visibility"
        }, 0.1);
    }

    return () => timeline.kill();
  }, { scope: rootRef, dependencies: [transition, reducedMotion], revertOnUpdate: true });

  if (pages.length === 0) {
    return <RecommendationList recommendations={[]} />;
  }

  const visiblePage = pages[page] ?? pages[0];
  const outgoingPage = transition ? pages[transition.fromPage] : visiblePage;
  const incomingPage = transition ? pages[transition.toPage] : null;

  return (
    <div
      className="home-recommendation-carousel"
      ref={rootRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div className="home-carousel-viewport" aria-live="polite" aria-atomic="true">
        <div className="home-carousel-slide" data-carousel-layer="outgoing" aria-hidden={Boolean(transition)} inert={Boolean(transition)}>
          <RecommendationList recommendations={outgoingPage} onSelect={onSelect} onDismiss={onDismiss} />
        </div>
        {incomingPage && (
          <div className="home-carousel-slide home-carousel-slide-incoming" data-carousel-layer="incoming">
            <RecommendationList recommendations={incomingPage} onSelect={onSelect} onDismiss={onDismiss} />
          </div>
        )}
      </div>

      {pages.length > 1 && (
        <div className="home-carousel-controls" aria-label={t("recommendations.carouselControls", "Controles de recomendaciones")}>
          <button type="button" onClick={() => stepPage(-1)} aria-label={t("common.previous", "Anterior")}>
            <ChevronLeft size={18} />
          </button>
          <div className="home-carousel-dots">
            {pages.map((_, index) => (
              <button
                type="button"
                className={index === requestedPageRef.current ? "active" : ""}
                key={index}
                onClick={() => navigateTo(index, index >= requestedPageRef.current ? 1 : -1)}
                aria-label={t("recommendations.goToPage", { defaultValue: "Ir a la página {{page}}", page: index + 1 })}
                aria-current={index === requestedPageRef.current ? "page" : undefined}
              />
            ))}
          </div>
          <button type="button" onClick={() => stepPage(1)} aria-label={t("common.next", "Siguiente")}>
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = (event) => setReducedMotion(event.matches);
    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  return reducedMotion;
}
